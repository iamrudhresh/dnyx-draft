# Install Dnyx Draft: Browser, Docker, and Cloudflare

Dnyx Draft is a browser-based Markdown editor and viewer that can run as a static web application, a self-hosted Docker site, or a Cloudflare deployment with optional sharing features. Choose the setup that matches how you want to open, read, edit, preview, and export Markdown files.

## Requirements

| Target | Requirements |
| :--- | :--- |
| Local web | Modern browser and a local HTTP server. |
| PWA/offline web | HTTPS or localhost for Service Worker support. |
| Docker | Docker Engine and port access to the container. |
| Cloudflare sharing/media/live | Cloudflare Pages, `SHARE_KV`, and `LIVE_ROOMS` Durable Object bindings. |

Do not rely on `file://` for normal use. Web Workers and Service Workers can be blocked from local files.

## Quick Local Web Run

From the repository root:

```bash
python -m http.server 8080
```

or:

```bash
npx serve . -p 8080
```

Open `http://localhost:8080`.

This runs the Editor, Split view, live Preview, sync scrolling, local storage, local `.md` file imports, exports, PWA registration, and CDN-loaded renderers. The default local client sends consented managed-media uploads to the production image/media API. Other Cloudflare-only features such as stored Share Snapshot and Live Share require their matching deployed endpoints.

An individual local Markdown import is limited to 10 MB. See [Features: Known Technical Limits](Features.md#known-technical-limits) for the other enforced limits.

## Install as a PWA

1. Open the application over HTTPS or `localhost`.
2. Wait for the first page load and Service Worker registration.
3. Use the browser's **Install** or **Add to Home Screen** action.
4. Launch the installed application once while online and open any renderer you expect to use offline so its CDN libraries can be cached.

The PWA is offline-capable, not fully offline on first use. Network-backed sharing, import, media, remote diagrams, external assets, and map tiles always need connectivity.

## Docker

Using the published image:

```bash
docker run -d \
  --name dnyx-draft \
  -p 8080:80 \
  --restart unless-stopped \
  ghcr.io/dnyxtech/dnyx-draft:latest
```

Open `http://localhost:8080`.

Using Compose from the repository root:

```bash
docker compose up -d
```

To rebuild from local source:

```bash
docker compose up -d --build
```

The Docker image serves static files with Nginx. It does not magically provide Cloudflare KV or Durable Objects; deploy those separately if you want stored Share Snapshot or Live Share.

> **Known limitation:** The checked-in root `Dockerfile` does not copy `preview-worker.js` or `sample.md`, while `sw.js` expects both during critical precache. The stock image can use main-thread Preview fallback, but large-Document Worker rendering and PWA/offline installation are incomplete. This documentation audit does not change Docker behavior. See [Docker Deployment](Docker-Deployment.md#known-stock-image-limitation).

## Static Hosting

Serve at least these root files:

- `index.html`
- `workspace-storage.js`
- `script.js`
- `styles.css`
- `preview-worker.js`
- `sw.js`
- `sample.md`
- `manifest.json`
- `assets/`

For Cloudflare Pages with managed media, stored Share Snapshot, and Live Share, also deploy:

- `functions/api/image/[[id]].js`
- `functions/api/media/[[id]].js`
- `functions/api/share/[[id]].js`
- `functions/live-room/[[room]].js`
- `workers/live-room-worker.js`
- `wrangler.toml`
- `wrangler.live-room.toml`

If you host under a sub-path, test worker, service-worker, manifest, and dynamic library paths carefully.

## Cloudflare Setup

Managed media and Share Snapshot storage need a KV namespace bound as `SHARE_KV`. Their records use separate key prefixes.

Live Share needs a Durable Object binding named `LIVE_ROOMS` using the `LiveRoom` class from `workers/live-room-worker.js`.

Deploy the live room worker with:

```bash
wrangler deploy -c wrangler.live-room.toml
```

Then deploy the Pages project with `wrangler.toml` or your Cloudflare Pages configuration. See [Live Share](Live-Share-Cloudflare.md) and [Configuration](Configuration.md).

## Offline Use

Web/PWA:

- First load requires the app shell and any needed CDN libraries.
- After caching, the app shell and previously fetched CDN libraries can work offline.
- Features that require live network access still need it: managed media upload, GitHub import, stored Share Snapshot, Live Share, remote diagram rendering, external images, and map tiles.

## Official Platform Documentation

- [Docker documentation](https://docs.docker.com/)
- [Cloudflare Pages Functions](https://developers.cloudflare.com/pages/functions/)
- [Cloudflare Workers KV](https://developers.cloudflare.com/kv/)
- [Cloudflare Durable Objects](https://developers.cloudflare.com/durable-objects/)

These upstream pages describe their platforms. Dnyx Draft-specific commands, bindings, and limitations remain documented in this Wiki.

## Validate an Installation

- Open a local `.md` file smaller than 10 MB.
- Switch among Editor, Split view, and Preview.
- Render one client-side fence such as `mermaid` and one remote fence such as `graphviz` if remote rendering is intended.
- Export Markdown and HTML.
- Confirm Service Worker registration only on HTTPS or localhost.
- For Cloudflare, create a stored Share Snapshot and test a Live Share room from a second browser profile.

If a check fails, use [Troubleshooting](Troubleshooting.md).
