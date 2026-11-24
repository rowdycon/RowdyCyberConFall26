# Presentations

Slides from the talks live at `/presentations` (directory) and
`/presentations/<slug>` (one page per session). Everything is static: no
database, no uploads. Slide files are served from `apps/web/public/` and the
list of sessions is a TypeScript file, so adding a deck is a normal commit.

## Adding a deck

1. **Export the deck to PDF.** PowerPoint: _File > Export > PDF_. Google
   Slides: _File > Download > PDF_. Keynote: _File > Export To > PDF_. Use
   the PDF rather than the `.pptx`: it never includes speaker notes, and it
   opens everywhere.

2. **Render it.** From the repo root (Python 3.9+):

    ```sh
    pip install pypdfium2 pillow
    python scripts/presentations/render_slides.py <slug> path/to/deck.pdf
    ```

    `<slug>` is the URL segment, e.g. `git-for-dummies`. This writes the PDF,
    slide images, thumbnails and a cover to
    `apps/web/public/presentations/<slug>/`, and records the slide count and
    slide text in `apps/web/src/lib/presentations/manifests.json`.

    If the first slide isn't a good card image, pick another one with
    `--cover-slide 2`.

    Before publishing, skim the slides (and the extracted text in
    `manifests.json`) for personal details that weren't meant as contact
    info, like a personal email in a screenshot. Everything in this folder
    is public and stays in the git history.

3. **Add the session** to `presentationEntries` in
   `apps/web/src/lib/presentations/data.ts`: title, speakers, the schedule
   event id (the number in `/schedule/<id>`), time, room, a one-line summary,
   the abstract, and topics. Sessions without slides can set `externalLink`
   instead (see `web-application-exploitation`).

4. Commit and push. The new page appears at `/presentations/<slug>`, and the
   matching schedule event gets a "View the slides" button.

## Removing a deck

Delete its entry from `data.ts`, its key from `manifests.json`, and the
`apps/web/public/presentations/<slug>/` folder.
