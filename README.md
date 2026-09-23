# Pace Pal

A frontend and data architecture for a cricket bowling analysis platform — pace,
swing, line, length, pitch mapping, umpire-style perspective view, and 3D
trajectory reconstruction, built around one rule: **every measurement carries
a value, a likely range, a confidence score, and a plain-language reason.**

## What's actually in this build

This is the **frontend and pipeline architecture**, not a working computer-vision
backend. Real ball tracking (object detection, optical flow, trajectory fitting)
needs a backend with persistent compute — that's a separate service you'd deploy
to something like Railway or Render, not a static Netlify site.

Every screen that shows delivery results is populated with clearly labelled
**sample data** (see the banner on each page) so the full UI can be reviewed
end to end. The data model (`src/types/index.ts`) is the API contract a real
backend should return — wire a real endpoint in and swap out `src/data/mockData.ts`.

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

Outputs to `dist/`.

## Deploy to Netlify

**Option A — connect a Git repo (recommended, gives you auto-deploys):**
1. Push this project to a GitHub repo.
2. On netlify.com, click **Add new site → Import an existing project**.
3. Pick the repo. Netlify reads `netlify.toml` automatically (build command
   `npm run build`, publish directory `dist`).
4. Deploy. You'll get a live `*.netlify.app` URL.

**Option B — drag and drop, no Git:**
1. Run `npm install && npm run build` locally.
2. Go to your Netlify dashboard and drag the generated `dist` folder onto it.
3. Done — instant deploy, though you'll need to repeat this manually for future changes.

The app uses a hash-based router (`/#/record`, `/#/sessions/...`), so it needs
no special redirect rules on static hosting.

## Project structure

```
src/
  types/        Data model (the contract a real backend should implement)
  data/         Sample/placeholder data, clearly flagged as such
  components/   Shared UI: measurement readouts, pitch map, trajectory viewer, umpire view
  pages/        Route-level screens
  lib/          Small helpers (isometric projection for the 3D view)
```

## Wiring up a real backend later

Replace the sample data source in `src/data/mockData.ts` with real API calls
matching the `Session` / `Delivery` / `CalibrationState` shapes in
`src/types/index.ts`. The UI already handles the honesty rules end to end:
null/low-confidence values render as "insufficient tracking confidence" or a
widened range rather than a fake precise number, and the fastest-ball logic
already distinguishes the raw highest reading from the most reliable one.
