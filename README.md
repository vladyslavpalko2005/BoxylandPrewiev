# Boxyland Lock

React + TypeScript + Vite frontend for the local Raspberry Pi lock controller. Includes Slovak and English, responsive desktop/mobile layouts. Branding follows the supplied mockups and the adjacent `boxyland-admin-client`; that project is not modified.

## Run locally

```sh
npm install
npm run dev
```

Open the local URL printed by Vite (normally http://127.0.0.1:5173). The application connects only to the real device. The Mac must have network access to the controller.

The development and preview servers proxy `/api/internal/*` to `http://10.42.0.1:5000`, avoiding browser CORS restrictions. To change the target, copy `.env.example` to `.env.local`, edit `LOCKER_API_TARGET` and restart Vite. Both development and production browsers use the website origin. No API address is embedded in the web build; native apps keep their separate address setting.

```sh
npm run build
npm run preview
```

For a phone on the same network: `npm run dev -- --host 0.0.0.0`, then use the Mac's IP and Vite port. Fonts and branding are served locally, without a CDN.

## Live device

- `GET /api/internal/states` is polled about every two seconds, with no overlapping polls.
- Actual response: an array of `{ address, active, locked, opened }`, with numeric addresses and a boolean `active` flag. Active ports require boolean `locked` and `opened`; inactive ports also permit `null` sensor values. Nullable `last_opened` / `last_closed` metadata does not invalidate a snapshot. The verified device returned **56 addresses**; the UI follows the response rather than truncating to the 48-port mockup.
- `active=false` is unavailable; null sensor values remain unknown rather than becoming false; otherwise `locked` determines the lock label. `opened` is preserved independently, including `locked=true, opened=true`; the compact detail panel omits raw flags.
- `POST /api/internal/{address}/open` is sent only after the user's explicit click for a currently locked, active port. OPTIONS on the device advertised GET and POST. No body is sent. There is no locking or bulk-lock API, so bulk controls are absent and the lock action is disabled.
- Opening remains pending until a later `/states` snapshot reports `active=true, locked=false`. A successful HTTP response alone never changes the displayed sensor state. Lack of confirmation after ten seconds is shown as a command error. Failed or timed-out commands are never automatically retried.
- Snapshots are validated atomically: malformed JSON, invalid flag types (including null sensors on active ports), duplicate or invalid addresses and empty responses are rejected. On failure, the latest valid snapshot stays visible, controls are disabled, and read-only reconnection continues automatically. There is no automatic fallback to synthetic data.
- Live history contains only lock-state changes observed during this browser session; no hardware history endpoint is available. Initial state does not invent an unlock time or old events.

## Interface

The supplied updated design uses All, Locked, Unlocked and Not connected filters with real counts. All is selected initially. Desktop uses a sidebar, compact grid and detail rail; phones use four-column tiles, a floating bottom filter dock and detail sheet. The grid toolbar contains only its heading and count; there is no search control. A shared solid cyan selection slides between filters, with reduced-motion support. On phones the connection badge refreshes states. The unlocked lock action remains disabled with an explanation because the API exposes opening only. The Wi-Fi provisioning banner from the mockup is not shown without a supported provisioning API.

## Language

The interface defaults to Slovak and retains English translations and any previously stored language preference. There is no visible language switch. Translation keys in `src/lib/i18n.tsx` are checked by TypeScript.

## Verification

`npm run build` checks TypeScript and produces `dist/`.

With the dev server on port 5173, Python `playwright` and Google Chrome installed:

```sh
python3 scripts/live-smoke.py
```

The browser checks intercept device requests and verify the 56-address contract, independent flags, POST commands, sensor confirmation, failures/timeouts, validation, stale snapshots, recovery, desktop/mobile layouts and keyboard operation. **Tests do not open physical locks.** Screenshots are saved under `.impeccable/review/`.

## Deploying on Raspberry

Serve `dist/` with an HTTP server and reverse-proxy `/api/internal/` to the device API, normally `http://127.0.0.1:5000`. Production static files require this same-origin API routing; Vite's proxy is only part of dev/preview. For example, an Nginx location:

```nginx
location /api/internal/ {
    proxy_pass http://127.0.0.1:5000;
}
```

The website does not configure USB networking or start the hardware API process.

## Offline Raspberry Pi frontend

The production frontend is self-contained: React, CSS, icons, logo and Inter WOFF2 font subsets are served from `dist/`. It makes no Internet/CDN requests, uses no cookies, and continues working when localStorage/sessionStorage are unavailable. The Raspberry's Wi-Fi must remain connected; “offline” means no Internet, not loss of the local server.

Open the local HTTP origin, for example `http://192.168.50.1`. API requests automatically use that same origin: `/api/internal/states` and `/api/internal/{address}/open`. The previous Cloudflare-specific `VITE_LOCKER_WEB_API_URL` setting has been removed. Native Capacitor apps retain `VITE_LOCKER_API_URL` unchanged.

Build with `npm ci` and `npm run build`, then transfer **all contents of `dist/`**, preserving `assets/`, to the future static server's document root. No Node.js runtime, `.env`, source code or `node_modules` is needed on the Raspberry. See [DEPLOYMENT.md](DEPLOYMENT.md) for the file list, browser requirements and verification limits. This work does not configure Raspberry Pi, Wi-Fi, DNS, Nginx or Captive Portal and does not implement an API.

The frontend requires JavaScript, ES modules, Fetch/AbortController and native `<dialog>` support (target: Safari/iOS 15.4+ and Chrome/Android WebView 100+). It avoids newer `AbortSignal.any/timeout` helpers and includes `vh` fallbacks for dynamic viewport units. When JavaScript is disabled, local instructions explain how to open the same address in Safari/Chrome. Browsers that disable essential JavaScript APIs cannot operate hardware through this React interface. Real iPhone/Android Captive Portal windows still need device acceptance testing.

Production verification with Python Playwright (Chromium and WebKit installed):

```sh
npm run build
python3 -m http.server 4174 --bind 127.0.0.1 --directory dist
# In another terminal:
python3 scripts/offline-smoke.py
```

This test serves production files over a simulated non-secure LAN HTTP origin, blocks all external requests, denies browser storage/cookies, removes newer AbortSignal helpers and exercises mobile/desktop layouts, filters, detail sheets, intercepted commands, sensor confirmation, failed API recovery and reload. Screenshots are saved to `.impeccable/review/offline/`. No physical open requests are sent. A service worker/PWA is not required for operation without Internet; assets come directly from the local server.

## Android and iOS applications

The `android/` and `ios/` projects wrap the bundled Vite interface in Capacitor 8 WebViews. They do not need a separately hosted website. The current application ID is `sk.boxyland.locks`; confirm the final ID before store distribution.

1. Copy `.env.example` to `.env.local` and set `VITE_LOCKER_API_URL` to the controller address reachable from the phone (default `http://10.42.0.1:5000`). This address is embedded during the web build. `LOCKER_API_TARGET` continues to configure the desktop development proxy only.
2. Connect the phone to the same network as the controller. On iOS, allow the local network permission prompt.
3. Run `npm run mobile:android` to sync assets and open Android Studio, or `npm run mobile:ios` to open Xcode. Choose a device or simulator and run the app.
4. After changing the web interface or API address, run `npm run mobile:sync` and rebuild the native application.

Android requires Android Studio, SDK 36 and Java 21; the minimum Android version is 7 (API 24). The iOS project targets iOS 16 or later and uses Swift Package Manager. Physical iPhone installation requires selecting your Apple development team in Xcode's Signing & Capabilities panel. Store archives need the corresponding signing accounts and release configuration.

`npm run android:debug` produces `android/app/build/outputs/apk/debug/app-debug.apk`. It is a debug-signed APK for local installation, not a Play Store release. On this Mac you can also check the iOS simulator build without signing:

```sh
xcodebuild -project ios/App/App.xcodeproj -scheme App \
  -configuration Debug -sdk iphonesimulator \
  -destination 'generic/platform=iOS Simulator' \
  -derivedDataPath /tmp/boxyland-ios-build CODE_SIGNING_ALLOWED=NO build
```

Native requests use `CapacitorHttp`, bypassing WebView CORS while preserving HTTP errors, schema validation and sensor-confirmed state. Android and iOS allow cleartext HTTP for the existing local controller. Native calls use 8-second connect/read timeouts. An in-flight native request cannot be recalled on unmount; late results are discarded, commands are never retried automatically, and stopping the UI cannot undo a command already received by the controller. Android Back dismisses an open lock sheet before exiting the app.

Run `node scripts/api-native-check.mjs` to verify the native HTTP adapter without accessing hardware. The browser integration checks remain `python3 scripts/live-smoke.py`.
