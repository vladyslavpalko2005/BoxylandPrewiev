---
name: Boxyland Lock
description: Compact live lock dashboard following the supplied desktop and mobile Boxyland designs.
colors:
  primary: '#00b2ee'
  primary-light: '#9ddbf4'
  blue-wash: '#e1f4fe'
  blue-text: '#007399'
  green: '#16a34a'
  green-text: '#137536'
  green-wash: '#dcfce7'
  yellow: '#f3d03e'
  yellow-wash: '#fff9df'
  orange: '#b64d08'
  canvas: '#f9fdff'
  surface: '#ffffff'
  ink: '#111111'
  muted: '#666666'
  border: '#c9c9c9'
typography:
  title:
    fontFamily: 'Inter, sans-serif'
    fontSize: '20px'
    fontWeight: 700
    lineHeight: '26px'
  body:
    fontFamily: 'Inter, sans-serif'
    fontSize: '13px'
    lineHeight: '18px'
  label:
    fontFamily: 'Inter, sans-serif'
    fontSize: '11px'
    lineHeight: '14px'
  button:
    fontFamily: 'Inter, sans-serif'
    fontSize: '14px'
    fontWeight: 500
    lineHeight: '18px'
rounded:
  button: '8px'
  metadata: '12px'
  surface: '14px'
  sheet: '20px 20px 0 0'
  pill: '999px'
spacing:
  compact: '8px'
  item: '10px'
  group: '12px'
  section: '16px'
  workspace: '20px'
  page: '24px'
components:
  button-primary:
    backgroundColor: '{colors.primary}'
    textColor: '#063145'
    rounded: '{rounded.button}'
    padding: '8px 14px'
  button-outline:
    backgroundColor: '{colors.surface}'
    textColor: '{colors.ink}'
    rounded: '{rounded.button}'
    padding: '8px 14px'
  filter-active:
    backgroundColor: '{colors.primary}'
    textColor: '#063145'
    rounded: '{rounded.pill}'
    padding: '8px 6px'
  lock-tile:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.surface}'
    padding: '10px 10px 12px'
  panel:
    backgroundColor: '{colors.surface}'
    rounded: '{rounded.surface}'
    padding: '20px'
---

# Design System: Boxyland Lock

## Overview

**Creative North Star: "Boxyland control panel"**

The supplied desktop and mobile designs define a compact operating dashboard: white surfaces on an ice-blue canvas, cyan controls, circular lock imagery and explicit localized states. Keep the real `public/boxyland-logo.png` and locally bundled Inter fonts. This records the implementation in `src/App.tsx`, `src/styles.css` and `src/components/LockDetail.tsx`; `PRODUCT.md` owns the device contract.

**Key Characteristics:**

- State filters, dense lock grid and selected-lock details.
- Cyan identity with green, yellow and neutral state treatments.
- Desktop detail rail and mobile bottom sheet.
- Flat ordinary surfaces, with elevation on the mobile dock and circular action.

## Colors

Primary cyan identifies actions, selected filters, selected tile outlines and locked-state dots. Pale blue supports lock icon circles and state tags; blue text provides legible labels and focus outlines. Green identifies unlocked locks and connected status. Yellow identifies pending commands; orange identifies connection warnings. Neutral dashed tiles identify unavailable ports. Pair color with a localized label and icon or border treatment; preserve the semantic fill when selection adds a cyan outline.

The canvas is `canvas`, white panels use `surface`, and compact copy uses `ink` or `muted`. The frontmatter owns exact palette values.

## Typography

Use bundled Inter with sans-serif fallback throughout. Detail titles are 20px/26px, weight 700; grid headings are 15px/20px on mobile and 18px/22px from 768px. Tile identifiers are 15px/18px, weight 600; labels are 11px/14px. Detail supporting copy is 13px/18px; buttons are 14px/18px, weight 500. Counts and identifiers use tabular numerals. At widths through 360px, tile identifiers reduce to 13px and labels to 9px.

## Layout

The shell centers at a maximum 1600px and respects device safe areas. Mobile uses a four-column grid with 8px gaps, 12px page gutters and 107px minimum tile height; through 360px, gutters are 10px and gaps 6px. Keep space below content for the fixed floating filter dock. The dock is at most 336px wide, centered at least 24px above the bottom safe area; the active filter expands to expose its label.

At 768px, use 24px page gutters and a 20px workspace gap. Filters become a full-width horizontal row above the grid and a 300px sticky detail rail. At 1180px the workspace becomes three columns: 232px filter sidebar, flexible grid and 360px detail rail; filters stack vertically and the grid uses six columns. At 1380px the grid uses eight columns. Tablet grids retain four columns. Panels use 20px padding; desktop tile gaps are 10px.

Below 768px, details open in a full-width modal bottom sheet with 20px top corners, 16px side padding, a grabber and a scrollable maximum height of 90dvh. The same detail content appears in the desktop rail. There are no statistics or device-information cards.

## Elevation & Depth

Ordinary panels and tiles are flat, separated by borders and state washes. The floating mobile dock uses `0 8px 24px #0033592e`; the circular action's inner disc uses `0 6px 16px #1217262e`. Toasts use `0 6px 22px #11283220`. Modal depth comes from a `#00000066` backdrop. Tile state transitions last 150ms; the sheet enters over 220ms with `cubic-bezier(0.16, 1, 0.3, 1)`. The filter switch uses one opaque cyan selection that translates and resizes over 360ms with `cubic-bezier(0.22, 1, 0.36, 1)`; labels and segment widths settle over 280ms. No blur, transparency, refraction or glass treatment. Interrupted selections retarget smoothly; geometry tracks resizing and count updates. Respect reduced-motion preferences.

## Shapes

Panels and tiles use 14px corners, buttons 8px, metadata blocks 12px. Mobile filters and state tags are pills; desktop filter rows use 10px corners. Icon containers and the action disc are circles. The main action is 132px with a 100px inner disc on mobile, and 140px with a 106px inner disc from 768px. Unavailable actions use a smaller neutral circle.

## Components

- **Header:** Real logo, product name and subtitle, connection badge. The badge also refreshes device state; desktop adds a refresh button. Stored Slovak/English preference is respected without a visible language switch.
- **Filters:** All, locked, unlocked and offline, each with an icon and count. All is selected initially. Use pressed states and accessible labels; mobile shows only the active filter's name. These controls filter the grid.
- **Grid:** Show every reported address, with no fixed 48-port limit. Only the grid heading and result count sit above the tiles; search is absent by user request.
- **Tiles:** Number, state dot where available, circular icon and localized state label. Locked is white with blue icon wash; unlocked uses green wash; pending uses yellow wash; offline is neutral with dashed pale-blue border. Selection adds an inset cyan outline. Disconnected snapshots remain visible with disabled controls.
- **Detail:** Title, state pill, close control, circular action, guidance, full-width action and gray metadata block. Metadata shows connection, port and observed state timestamp; unavailable ports show port and unknown last-seen value plus retry. History is not displayed. Only supported open actions can run. The cyan Lock action remains disabled for already-unlocked locks, with a visible explanation that locking is unavailable. Pending, offline and disconnected conditions disable operation. Command errors expand the content.
- **Buttons and focus:** Primary cyan uses dark text; outline buttons use pale-blue borders. General disabled buttons are gray, with the unsupported cyan Lock action retaining its design. Visible keyboard focus uses a 2px blue-text outline with 3px offset. Touch buttons and filters reach at least 44px. The mobile close control is 44px.
- **Feedback:** Native modal dismissal restores focus. Empty, loading, connection-error and no-results states explain their condition and expose relevant retry or clear actions. No Wi-Fi setup control appears without a backend capability.

## Do's and Don'ts

- **Do** follow the supplied Boxyland composition and preserve local brand/font assets for offline use.
- **Do** retain all reported device addresses, localized labels and explicit state feedback.
- **Do** confirm command outcomes from device polling and explain unsupported locking.
- **Don't** restore statistics/device panels, bulk actions, demo modes or simulated production states.
- **Don't** use green, yellow or offline styling as unrelated decoration.
- **Don't** imply Wi-Fi setup, automatic USB networking or a locking API that the controller does not provide.
