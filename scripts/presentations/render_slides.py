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
import os
import re
import shutil
import sys
import tempfile
from pathlib import Path

try:
    import pypdfium2 as pdfium
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
                texts.append(clean_text(textpage.get_text_range()))
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
