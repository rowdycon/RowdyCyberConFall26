#!/usr/bin/env python3
"""Turn a slide-deck PDF into the files the /presentations pages serve.

Usage (from the repo root):

    pip install pypdfium2 pillow
    python scripts/presentations/render_slides.py <slug> path/to/deck.pdf

Writes:
    apps/web/public/presentations/<slug>/slides.pdf      (copy of the PDF, for download)
    apps/web/public/presentations/<slug>/slides/N.webp   (1600px-wide slide images)
    apps/web/public/presentations/<slug>/thumbs/N.webp   (320px-wide thumbnails)
    apps/web/public/presentations/<slug>/cover.webp      (960px-wide card image)
and records the slide count, aspect ratio and per-slide text in
    apps/web/src/lib/presentations/manifests.json

Export the deck to PDF first (PowerPoint / Google Slides / Keynote: File > Export > PDF).
Then add an entry for <slug> in apps/web/src/lib/presentations/data.ts.
"""

from __future__ import annotations

import argparse
import json
import math
import os
import re
import shutil
import statistics
import sys
import tempfile
from pathlib import Path

try:
    import pypdfium2 as pdfium
    import pypdfium2.raw as pdfium_c
    from PIL import Image
except ImportError:  # pragma: no cover - friendly message for first-time users
    sys.exit("Missing dependencies. Run: pip install pypdfium2 pillow")

REPO_ROOT = Path(__file__).resolve().parents[2]
PUBLIC_DIR = REPO_ROOT / "apps" / "web" / "public" / "presentations"
MANIFESTS = REPO_ROOT / "apps" / "web" / "src" / "lib" / "presentations" / "manifests.json"

SLUG_RE = re.compile(r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
NBSP = chr(0xA0)
# PDFium reports a hyphen that ends a line as U+FFFE. Slide tools don't auto-hyphenate,
# so these are real hyphens (Invoke-WebRequest, post-quantum, ...).
LINE_END_HYPHEN = chr(0xFFFE)


def page_text(textpage: pdfium.PdfTextPage) -> str:
    """The page's text, with letter-spaced (tracked) headings joined back into words.

    PDFium puts a generated space between every glyph of tracked text, so a label
    like "AUDIENCE VOTE" comes out as "A U D I E N C E V O T E", which screen
    readers spell out. In each run of three or more lone glyphs separated by
    generated spaces, the median gap between glyphs is the letter spacing; a space
    is kept only where the gap is clearly wider than that.

    Still ambiguous: a row of single characters in separate boxes spaced like
    tracked letters (table cells holding one digit each) gets joined, and so does a
    tracked heading made mostly of one- and two-letter words ("UP & UP"), where
    the median gap is no longer a letter gap.
    """
    n = pdfium_c.FPDFText_CountChars(textpage)
    codes = [pdfium_c.FPDFText_GetUnicode(textpage, i) for i in range(n)]

    def is_glyph(i: int) -> bool:
        return 0 <= i < n and codes[i] > 32 and codes[i] not in (0xA0, 0x2028, 0x2029, 0xFFFE)

    def is_generated_space(i: int) -> bool:
        return 0 <= i < n and codes[i] == 32 and pdfium_c.FPDFText_IsGenerated(textpage, i) == 1

    def font_size(i: int) -> float:
        # The Tf size alone ignores the text matrix and CTM, which some producers use
        # to set the size (e.g. "1 Tf" plus a scaled Tm); scale it by the glyph's matrix.
        m = pdfium_c.FS_MATRIX()
        if not pdfium_c.FPDFText_GetMatrix(textpage, i, m):
            return 0.0
        return pdfium_c.FPDFText_GetFontSize(textpage, i) * math.sqrt(abs(m.a * m.d - m.b * m.c))

    runs: list[list[int]] = []
    run: list[int] = []
    for i in range(n):
        if not is_glyph(i):
            continue
        alone = not is_glyph(i - 1) and not is_glyph(i + 1)
        if alone and run and run[-1] == i - 2 and is_generated_space(i - 1):
            run.append(i)
            continue
        if len(run) >= 3:
            runs.append(run)
        run = [i] if alone else []
    if len(run) >= 3:
        runs.append(run)

    drop: set[int] = set()
    for run in runs:
        size = statistics.median(font_size(i) for i in run)
        boxes = [textpage.get_charbox(i) for i in run]
        gaps = [boxes[k + 1][0] - boxes[k][2] for k in range(len(run) - 1)]
        letter = statistics.median(gaps)
        # Glyphs far apart for their size are separate items (a row of numbers, say), not tracking.
        if size <= 0 or min(gaps) < -0.1 * size or letter > 0.8 * size:
            continue
        word_gap = max(1.5 * letter, letter + 0.15 * size)
        # A multi-glyph word just one word space away means these are one-letter words
        # in a sentence whose producer emits no space glyphs ("Choose A B C or D").
        first, last = run[0], run[-1]
        if (
            is_generated_space(first - 1)
            and is_glyph(first - 2)
            and is_glyph(first - 3)
            and boxes[0][0] - textpage.get_charbox(first - 2)[2] <= word_gap
        ) or (
            is_generated_space(last + 1)
            and is_glyph(last + 2)
            and is_glyph(last + 3)
            and textpage.get_charbox(last + 2)[0] - boxes[-1][2] <= word_gap
        ):
            continue
        drop.update(run[k] + 1 for k, gap in enumerate(gaps) if gap <= word_gap)

    if not drop:
        return textpage.get_text_range()
    parts: list[str] = []
    start = 0
    for i in sorted(drop):
        if i > start:
            parts.append(textpage.get_text_range(start, i - start))
        start = i + 1
    if start < n:
        parts.append(textpage.get_text_range(start, n - start))
    return "".join(parts)


def clean_text(raw: str) -> str:
    """Collapse PDF text-layer noise into readable lines."""
    raw = raw.replace("\r", "\n").replace(NBSP, " ").replace(LINE_END_HYPHEN, "-")
    lines = [re.sub(r"[ \t\f\v]+", " ", ln).strip() for ln in raw.split("\n")]
    out: list[str] = []
    for ln in lines:
        if not ln:
            continue
        if out and out[-1] == ln:
            continue
        out.append(ln)
    return "\n".join(out)


def save_webp(img: Image.Image, path: Path, width: int, quality: int) -> None:
    if img.width > width:
        height = round(img.height * width / img.width)
        img = img.resize((width, height), Image.LANCZOS)
    img.save(path, "WEBP", quality=quality, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("slug", help="URL slug, e.g. git-for-dummies")
    parser.add_argument("pdf", type=Path, help="the deck exported as PDF")
    parser.add_argument("--width", type=int, default=1600, help="slide image width (default 1600)")
    parser.add_argument("--thumb-width", type=int, default=320, help="thumbnail width (default 320)")
    parser.add_argument("--cover-width", type=int, default=960, help="cover image width (default 960)")
    parser.add_argument("--quality", type=int, default=80, help="WebP quality 1-100 (default 80)")
    parser.add_argument("--cover-slide", type=int, default=1, help="slide number used for the card cover (default 1)")
    args = parser.parse_args()

    if not SLUG_RE.match(args.slug):
        sys.exit(f"Slug must be lowercase-kebab-case, got {args.slug!r}")
    if not args.pdf.is_file():
        sys.exit(f"PDF not found: {args.pdf}")

    out_dir = PUBLIC_DIR / args.slug
    PUBLIC_DIR.mkdir(parents=True, exist_ok=True)

    # Build everything in a scratch folder first; the published files are only
    # replaced once the PDF has opened and every slide has rendered.
    with tempfile.TemporaryDirectory(prefix=f".render-{args.slug}-", dir=PUBLIC_DIR) as tmp:
        stage = Path(tmp)
        (stage / "slides").mkdir()
        (stage / "thumbs").mkdir()
        staged_pdf = stage / "slides.pdf"
        shutil.copyfile(args.pdf, staged_pdf)

        try:
            doc = pdfium.PdfDocument(str(staged_pdf))
        except pdfium.PdfiumError as exc:
            sys.exit(f"Could not open {args.pdf} as a PDF ({exc}). Export the deck to PDF first.")

        texts: list[str] = []
        try:
            count = len(doc)
            if count == 0:
                sys.exit(f"{args.pdf} has no pages")
            if not 1 <= args.cover_slide <= count:
                sys.exit(f"--cover-slide must be between 1 and {count}")
            w_pt, h_pt = doc[0].get_size()
            size = (args.width, round(args.width * h_pt / w_pt))
            for i in range(count):
                n = i + 1
                page = doc[i]
                # Render 1.5x larger than the target width, then downsample for crisp text.
                img = page.render(scale=(args.width * 1.5) / page.get_size()[0]).to_pil().convert("RGB")
                save_webp(img, stage / "slides" / f"{n}.webp", args.width, args.quality)
                save_webp(img, stage / "thumbs" / f"{n}.webp", args.thumb_width, args.quality)
                if n == args.cover_slide:
                    save_webp(img, stage / "cover.webp", args.cover_width, args.quality)
                textpage = page.get_textpage()
                texts.append(clean_text(page_text(textpage)))
                textpage.close()
                page.close()
        finally:
            doc.close()

        image_bytes = sum(f.stat().st_size for f in (stage / "slides").iterdir())
        pdf_bytes = staged_pdf.stat().st_size

        # Swap the new files in.
        out_dir.mkdir(parents=True, exist_ok=True)
        for name in ("slides", "thumbs"):
            if (out_dir / name).exists():
                shutil.rmtree(out_dir / name)
            shutil.move(str(stage / name), str(out_dir / name))
        for name in ("cover.webp", "slides.pdf"):
            os.replace(stage / name, out_dir / name)

    manifests = {}
    if MANIFESTS.exists():
        manifests = json.loads(MANIFESTS.read_text(encoding="utf-8"))
    manifests[args.slug] = {
        "slideCount": count,
        "width": size[0],
        "height": size[1],
        "pdfBytes": pdf_bytes,
        "text": texts,
    }
    MANIFESTS.parent.mkdir(parents=True, exist_ok=True)
    MANIFESTS.write_text(
        json.dumps(dict(sorted(manifests.items())), ensure_ascii=False, indent="\t") + "\n",
        encoding="utf-8",
        newline="\n",
    )
    print(
        f"{args.slug}: {count} slides, {size[0]}x{size[1]}, "
        f"images {image_bytes / 1e6:.1f} MB, pdf {pdf_bytes / 1e6:.1f} MB"
    )


if __name__ == "__main__":
    main()
