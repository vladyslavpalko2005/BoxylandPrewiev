# Boxyland Lock

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

React + TypeScript + Vite, confirmed by the user. Capacitor 8 bundles the same interface into Android and iOS WebViews (`android/`, `ios/`). Standalone local application in open-locker; boxyland-admin-client is a read-only brand and implementation reference.

## Users

People operating the Boxyland Raspberry Pi lock controller from a phone or desktop browser.

## Product Purpose

Show all addresses reported by the controller, inspect lock state and observed history, and open a selected lock. The supplied design has 48 ports; the verified device reports 56.

## Operating Context

The user confirmed the local hardware API at http://10.42.0.1:5000, its existing states/open contract, and no authentication on 2026-10-19. The Raspberry Pi 5 will host an offline Wi-Fi network and Captive Portal; the website will use a local IP, with its final URL and port still to be confirmed. The browser connects to the device via same-origin API routing; the future server must route these paths to the controller API. Development/preview use Vite's proxy. There is no runtime demo mode, mock controller, mode switch or mode footer. Current scope is frontend only, without Raspberry, Wi-Fi, Nginx, DNS or Captive Portal configuration. Aim for broad mobile browser coverage; the current build targets Safari/iOS 15.4+ and Chrome/Android WebView 100+, with actual Captive Portal device testing still required.

## Capabilities and Constraints

Slovak and English translations, with no visible language switch; desktop side detail and mobile bottom sheet. GET /api/internal/states returns an array of address:number, active:boolean, locked:boolean|null and opened:boolean|null. Null sensor values are valid for inactive ports only; display them as unknown. Nullable last_opened/last_closed metadata is permitted. All 56 returned addresses are displayed. The user confirmed locked=true/opened=true is normal; preserve these independent flags. The interface maps active=false to unavailable and otherwise uses locked for the state label.

OPTIONS /api/internal/1/open advertised GET, POST, OPTIONS and HEAD. Live UI sends POST /api/internal/{address}/open on an explicit click for a locked active port, then confirms through subsequent state polling. No locking or bulk operation endpoint is known; bulk actions are absent and unsupported locking stays disabled. No physical open command was sent during implementation verification. Live history contains observed session changes only. Invalid snapshots preserve the last valid state and disable control. Failed commands are not automatically retried.

## Current interface

The user's revised desktop/mobile designs replace the earlier metric overview with All/Locked/Unlocked/Not connected filters. All is selected initially. Desktop uses sidebar/grid/detail columns; mobile uses four-column tiles and a floating bottom filter dock. The user removed search: the grid header contains only the title and count. Filter selection uses a sliding solid cyan pill with no glass effects and respects reduced motion. Backend operations and state validation remain unchanged; unavailable locking is visibly explained and no Wi-Fi setup flow is invented.

## Brand Commitments

Follow the supplied component, mobile and desktop mockups. Use the real Boxyland logo and cyan/yellow brand tokens from ../boxyland-admin-client. Preserve the existing admin project.

## Evidence on Hand

Three supplied screenshots and Figma-style CSS exports; adjacent admin source including logo.png, theme.scss and appTheme.ts; actual 56-address states response and OPTIONS Allow header; read-only live-device browser check and intercepted-command integration tests.

## Product Principles

Display only state received from the physical device. Disable disconnected controls. Keep every reported port discoverable. Confirm action outcomes from device state rather than HTTP success. Do not claim automatic USB networking.

## Native applications

Android targets SDK 36 with minimum API 24. iOS targets 16 and later. App ID: sk.boxyland.locks (confirm before store release). Native API defaults to http://10.42.0.1:5000 and is configurable at build time with VITE_LOCKER_API_URL. Use native CapacitorHttp for LAN requests; no Vite proxy exists inside a bundled WebView. iOS declares local-network usage and both platforms permit the existing cleartext LAN API. Browser mode keeps same-origin fetch and proxy routing. Native HTTP has connect/read timeouts and ignores results after cancellation; it cannot recall a delivered command. Android Back dismisses an open sheet before exiting. Signing and store distribution are separate from debug builds.
