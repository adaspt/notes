# Make the Notes app installable on mobile (PWA)

## Context

The `notes` app is a React 19 + TanStack Router SPA built with Vite+ (`vp`), deployed
to Azure Static Web Apps, and already offline-capable via Dexie. It currently ships a
bare `index.html` (no manifest, no icons, no theme-color) so it cannot be installed as a
PWA on mobile.

Goal: make it installable on Android and iOS by adding a web manifest, an app icon set
derived from the **Lucide `Notebook`** glyph, the required `<meta>`/`<link>` tags, and a
service worker (Android's install prompt requires one). Icons should be **transparent**
where that looks good; **no maskable icon**; the iOS apple-touch icon gets an opaque
white background (iOS renders transparency as black — unavoidable). A legacy
`favicon.ico` is included for free but is not strictly required.

We use **`vite-plugin-pwa`** (manifest + Workbox service worker + tag injection) plus its
**`@vite-pwa/assets-generator`** integration, which generates all icon PNGs from one
source SVG at build/dev time — so no binary icon files need to be committed, only the
source SVG.

## Changes

### 1. Add dependencies

Dev deps via Vite+: `vite-plugin-pwa` and `@vite-pwa/assets-generator`.

```
vp add -D vite-plugin-pwa @vite-pwa/assets-generator
vp add workbox-window   # runtime dep — see note below
```

> **Implementation note:** the manual `registerSW()` import (`virtual:pwa-register`) pulls
> in `workbox-window`, which pnpm does not hoist to the top-level `node_modules`, so
> Rolldown can't resolve it. Add `workbox-window` as a direct (runtime) dependency.
> Also approve `sharp`'s build script once (`@vite-pwa/assets-generator` renders icons with
> `sharp`, and pnpm ignores its postinstall by default): `pnpm approve-builds sharp`. This
> persists as `allowBuilds: { sharp: true }` in `pnpm-workspace.yaml` — commit that change
> so fresh installs (CI, other machines) generate icons without manual intervention.

### 2. Source icon SVG — `public/notebook.svg` (committed source)

- 512×512 viewBox, transparent background.
- The official Lucide **`Notebook`** path data (pull exact paths from
  `node_modules/lucide-react` / lucide static assets — do not hand-draw), black stroke
  (`#000`), centered with ~15–20% padding so it isn't full-bleed-thin.
- This single file is the source for every generated icon.

> **Implementation note:** the source **must** live under `public/`. The integration
> computes each icon's output dir as `relative(publicDir, image)` resolved against `dist`;
> a source outside `public/` (e.g. `assets/`) makes that path escape and the icons get
> written next to the source instead of into `dist/`. Keeping it in `public/` also makes
> `public/notebook.svg` double as the SVG favicon referenced from `index.html`.

### 3. PWA asset preset — `pwa-assets.config.ts` (repo root)

Base on `minimal2023Preset` but **drop `maskable`** so only transparent + apple icons are
produced:

```ts
import { defineConfig, minimal2023Preset } from "@vite-pwa/assets-generator/config";

export default defineConfig({
  // `maskable: { sizes: [] }` keeps the Preset type complete while emitting no maskable
  // icon (the `Preset` type makes `maskable` required, so `delete` doesn't type-check).
  preset: { ...minimal2023Preset, maskable: { sizes: [] } },
  images: ["public/notebook.svg"],
});
```

Result: transparent `pwa-192x192.png` / `pwa-512x512.png` / `pwa-64x64.png`, transparent
`favicon.ico`, and an **opaque-white** `apple-touch-icon-180x180.png` — exactly the
agreed set, no maskable.

### 4. `vite.config.ts` — register `VitePWA`

Add to the `plugins` array (after `react()`):

```ts
VitePWA({
  registerType: "autoUpdate",
  injectRegister: false, // register manually from src/main.tsx (see below) — avoids
  // auto-injecting a register script into BOTH HTML outputs
  pwaAssets: { config: true, injectThemeColor: true }, // uses pwa-assets.config.ts; injects icon <link>s AND populates manifest.icons
  manifest: {
    name: "Notes",
    short_name: "Notes",
    description: "Personal notes & tasks",
    id: "/",
    start_url: "/",
    display: "standalone",
    theme_color: "#ffffff", // matches the light theme (--background: oklch(1 0 0))
    background_color: "#ffffff", // splash background
    // icons: pwaAssets populates these from the generated 192/512 PNGs. If the built
    // dist/manifest.webmanifest ends up WITHOUT icons (see Verification #2b), add them
    // explicitly here: [{ src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
    //                    { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" }]
  },
  workbox: {
    // Default globs are js,css,html,ico,png,svg — they omit fonts. Add woff/woff2 so the
    // bundled Inter variable fonts are precached (otherwise offline text falls back to a
    // system font).
    globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2}"],
    navigateFallback: "/index.html",
    // Keep the SW clear of the MSAL redirect bridge entry so it never serves index.html there
    navigateFallbackDenylist: [/redirect\.html$/],
  },
  filename: "sw.js",
});
```

Notes:

- **Manual SW registration (concrete fix for the two-HTML-entry build).** With `redirect.html`
  as a second build input (`vite.config.ts` `rolldownOptions.input`), `injectRegister: "auto"`
  could inject a registration `<script>` into _both_ HTML outputs, which would register the SW
  from the MSAL bridge page too. Instead set `injectRegister: false` and register once from
  `src/main.tsx` (loaded only by `index.html`, so `redirect.html` stays inert):
  ```ts
  // src/main.tsx
  import { registerSW } from "virtual:pwa-register";
  registerSW({ immediate: true });
  ```
  Add `"vite-plugin-pwa/client"` to `compilerOptions.types` in `tsconfig` for the virtual
  module types. Verify `dist/redirect.html` contains no manifest link and no SW registration.
- **Strip injected head links from `redirect.html`.** `injectRegister: false` keeps the SW
  registration off the bridge page (the important part), but vite-plugin-pwa's
  `transformIndexHtml` still injects the `manifest`/icon/`theme-color` `<link>`s into _every_
  HTML entry. These are inert on the bridge page but unwanted, so a tiny local plugin
  (`stripPwaTagsFromRedirect` in `vite.config.ts`) removes them from `redirect.html` in a
  `generateBundle` hook ordered `post` (a `post` `transformIndexHtml` runs too early — the
  links are injected during bundle generation, not transform). The plugin's `Plugin` type
  must be imported from `"vite-plus"`, not `"vite"` — the repo's `prefer-vite-plus-imports`
  lint rule auto-rewrites it, and `vp check` fails otherwise.

### 5. `index.html` — add the iOS/Apple meta tags the manifest can't cover

`pwaAssets` injects `theme-color` and the icon `<link>`s, but iOS standalone behavior needs
explicit tags in `<head>`:

```html
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="default" />
<meta name="apple-mobile-web-app-title" content="Notes" />
<meta name="description" content="Personal notes & tasks" />
```

> **Implementation notes:**
>
> - Include **both** `mobile-web-app-capable` (the current standard) and
>   `apple-mobile-web-app-capable`. Chrome logs a deprecation warning if the standard tag
>   is missing, but older iOS Safari still requires the `apple-` variant — so keep both.
> - `theme-color` is **not** duplicated in practice: `injectThemeColor: true` emits a single
>   `<meta name="theme-color">` from the manifest's `theme_color`, so we do not add one by
>   hand in `index.html`.

### 6. Azure Static Web Apps — `public/staticwebapp.config.json`

`navigationFallback.rewrite: /index.html` is already present; real files (`sw.js`,
`manifest.webmanifest`, icon PNGs, `favicon.ico`) are served directly and are **not**
rewritten, so navigation handling needs no change.

**Required:** add no-cache headers so clients always re-fetch the service worker and
manifest (stale SWs are a common PWA failure mode):

```jsonc
"routes": [
  { "route": "/.auth/login", "statusCode": 404 },        // existing — SWA auth intentionally disabled
  { "route": "/sw.js", "headers": { "Cache-Control": "no-cache" } },
  { "route": "/manifest.webmanifest", "headers": { "Cache-Control": "no-cache" } }
]
```

Note: this app uses **MSAL directly** (not SWA's built-in auth), and the existing
`/.auth/login → 404` rule confirms SWA auth is deliberately off. The MSAL redirect flows
through `redirect.html` (the `broadcastResponseToMainFrame` bridge), **not** `/.auth/*` —
so there is no `/.auth` reachability requirement, and the workbox denylist only needs to
cover `redirect.html`.

## Critical files

- `vite.config.ts` — register `VitePWA` + the `stripPwaTagsFromRedirect` plugin.
- `pwa-assets.config.ts` — **new**, icon preset (no maskable).
- `public/notebook.svg` — **new**, Lucide `Notebook` source glyph (also the SVG favicon).
- `src/main.tsx` — manual `registerSW()` call.
- `tsconfig` — add `vite-plugin-pwa/client` to `types`.
- `index.html` — apple/description meta tags.
- `public/staticwebapp.config.json` — **required** no-cache headers for `/sw.js` + `/manifest.webmanifest`.

## Verification

1. `vp install` (pick up new deps), then `vp build`.
2. Inspect `dist/`: confirm presence of `manifest.webmanifest`, `sw.js`,
   `pwa-192x192.png`, `pwa-512x512.png`, `apple-touch-icon-180x180.png`, `favicon.ico`.
   Confirm `dist/index.html` has `<link rel="manifest">`, icon links, and apple meta tags;
   confirm `dist/redirect.html` has **no** PWA tags **and no SW registration script**.
   2b. **Open `dist/manifest.webmanifest` and confirm it contains an `icons` array with valid
   192×192 and 512×512 PNG entries.** This is the actual Android-installability gate — the
   PNG files and HTML `<link>`s alone are not sufficient. If `pwaAssets` did not populate
   them, add `manifest.icons` explicitly (see the snippet in §4) and rebuild.
   2c. **Confirm the bundled fonts are precached:** `grep woff2 dist/sw.js` should list the
   Inter `*.woff2` files. If empty, `globPatterns` is missing the font extensions (§4).
3. `vp preview` and load in Chrome DevTools → Application → Manifest: no errors, icons
   resolve, "Installability" shows the app is installable (manifest + SW + icons all green).
4. Verify the apple-touch icon has a white (not transparent/black) background; verify the
   192/512 icons are transparent.
5. `vp check` and `vp test` pass.
6. Offline check — use **`vp preview`, not `vp dev`** (the SW is not registered in dev unless
   `devOptions.enabled`). Load once so the SW installs, then DevTools → Network → **Offline**
   → refresh: the app loads and text keeps the Inter font (not a system fallback). Note SW
   updates take effect after the new worker installs — you may need one online reload (or
   DevTools → Application → Service Workers → Update) before a precache change is live.
7. Manual on-device install (left to the user): Android Chrome shows "Install app"; iOS
   Safari → Share → Add to Home Screen shows the notebook icon on a clean background.
8. Sanity-check auth still works (MSAL login + the `redirect.html` bridge) with the SW
   active — the denylist should prevent interference.

---

# Offline hardening

## Context

The data layer is already **local-first**: reads use `useLiveQuery` over Dexie and
mutations write to IndexedDB immediately with `syncStatus: "dirty"`, so viewing and
editing notes/tasks already work with no network. Once the service worker above
precaches the app shell, the app also _loads_ offline. Two rough edges remain that would
break a returning user while offline:

- **Auth redirect on expired token.** `Session.getToken()` calls
  `acquireTokenRedirect()` when `acquireTokenSilent()` throws `InteractionRequiredAuthError`
  (`src/features/auth/session.ts:57-59`). Offline (or with an expired token) this
  **navigates the app away** mid-sync. Note: a previously-signed-in user is still
  `"signedIn"` offline because `initialize()` reads accounts from localStorage with no
  network (`session.ts:37-44`), so the UI itself is not gated for returning users — only
  first-ever login needs the network, which is unavoidable.
- **Sync not offline-aware.** `Sync.syncNow()` (`src/features/sync/sync.ts:49`) fires on
  visibility + a 5-min interval and attempts Graph `fetch`es regardless of connectivity;
  a network failure throws out of `pull` and the user gets no signal.

## Changes

### 1. Stop the offline redirect — `src/features/auth/session.ts`

In `getToken()`, do **not** redirect when offline; defer instead so callers can skip and
retry later:

```ts
async getToken() {
  try {
    const result = await this.#msal.acquireTokenSilent({ scopes: this.#scopes });
    return result.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      if (!navigator.onLine) {
        // Offline: don't navigate away — let sync back off and retry on reconnect.
        throw new AuthDeferredError("Token unavailable offline", { cause: error });
      }
      await this.#msal.acquireTokenRedirect({ scopes: this.#scopes });
      throw new Error("Token acquisition redirected", { cause: error });
    }
    throw error;
  }
}
```

Add a small `AuthDeferredError` class (same file) so sync can recognize and swallow it.

### 2. Make sync offline-aware — `src/features/sync/sync.ts`

- **Skip when offline:** early-return at the top of `syncNow()` when `!navigator.onLine`.
- **Sync on reconnect:** in `initialize()`, also add `window.addEventListener("online", ...)`
  that calls `void this.syncNow()`, and remove it in the returned cleanup (alongside the
  existing `visibilitychange` listener / `#stopInterval()`).
- **Degrade quietly — but narrowly.** The `navigator.onLine` pre-check handles the common
  offline case before any `fetch`. For the residual case (connection drops mid-sync, or a
  token expires), catch **only expected transient failures** around the `taskSync`/`noteSync`
  calls via an `isTransientSyncError(error)` helper that matches `AuthDeferredError`,
  `GraphNetworkError`, and `GraphApiError` with status `401`/`429`/`>= 500`. Do **not** wrap
  them in a blanket `catch (e) {}` — that would swallow schema/data/programming errors from
  the delta pulls in `note-sync.ts` / `task-sync.ts`; re-throw anything unrecognized so real
  bugs still surface. The existing per-record `try/catch` in those files already keeps dirty
  push records queued.
- **Type network failures at the source — `src/lib/graph/graph-client.ts`.** Don't detect
  network failures by `error instanceof TypeError` in the sync layer: `fetch()` rejects with
  a `TypeError`, but so do ordinary bugs (e.g. reading a property off `undefined`), and that
  catch wraps all of `taskSync`/`noteSync` — it would hide real sync bugs indefinitely.
  Instead wrap only the `fetch()` call in `GraphClient.#request`: on a `TypeError`, rethrow a
  dedicated `GraphNetworkError`; let everything else propagate. Sync then matches the precise
  `GraphNetworkError`, so a `TypeError` thrown anywhere else still surfaces as a real error.

### 3. (Optional) Offline indicator + pending-changes badge

- A tiny `useOnlineStatus()` hook (subscribes to `online`/`offline` events, seeds from
  `navigator.onLine`) — colocate under `src/features/sync/` or `src/hooks/`.
- A `useLiveQuery` count of dirty records
  (`db.notes.where("syncStatus").equals("dirty").count()` + tasks) surfaced near
  `SyncControls` (`src/features/sync/sync-controls.tsx`) so the user sees "N changes
  pending" and an offline state instead of a silently-failing sync button.

## Verification (offline hardening)

1. With the app loaded and signed in, open DevTools → Network → **Offline**.
2. Create/edit/delete a note and a task — confirm they persist and the UI updates (Dexie).
3. Confirm **no redirect/navigation** occurs and no uncaught errors in the console when the
   sync interval fires or you switch tabs (it should skip while offline).
4. Toggle back **Online** — confirm a sync runs automatically (the `online` listener) and
   the dirty records flush to Graph (`syncStatus` flips to `"synced"`).
5. (If implemented) Confirm the offline indicator and pending-count reflect state changes.
6. `vp check` and `vp test` pass.
