---
name: BOXYLOCK 2026
description: Responsive interface for the Boxyland network lock controller.
colors:
  petrol: "#003742"
  stormy: "#016c68"
  surface: "#f9fdff"
  white: "#ffffff"
  text: "#191919"
  muted: "#666666"
  inactive: "#6b6b6b"
  border: "#d3dde2"
  primary-light: "#b5ceeb"
  blue-wash: "#e8f3f7"
  green-wash: "#dbeaea"
  pending-wash: "#eef4fb"
  pending-text: "#555555"
  error: "#a84810"
  error-wash: "rgb(232 119 34 / 12%)"
typography:
  title:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "20px"
    fontWeight: 500
    lineHeight: "26px"
  label:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: "18px"
  caption:
    fontFamily: "Instrument Sans, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: "14px"
rounded:
  button: "8px"
  panel: "14px"
  sheet: "20px"
  pill: "999px"
spacing:
  compact: "8px"
  control: "12px"
  section: "16px"
  panel: "20px"
  desktop: "24px"
components:
  button-primary:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.white}"
    rounded: "{rounded.button}"
    padding: "8px 14px"
  lock-tile:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.panel}"
    padding: "10px 10px 12px"
  filter-selected:
    backgroundColor: "{colors.petrol}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
---

# Design System: BOXYLOCK 2026

## Overview

Compact, calm hardware controls: a readable lock inventory, clear sensor states and a focused detail view. Preserve the supplied BOXYLOCK wordmark and bundled SVG artwork.

Reference: Figma file `pIs2lxrmYUa7fjYmeOZfkc`, BOXYLOCK 2026 canvas `178:96`; mobile inventory `178:6263`, mobile detail `178:6391`, desktop `178:8684`. This document records the shipped interface; `src/styles.css` defines its exact styling, and `README.md` defines supported behavior.

## Colors

Petrol anchors controls, selection and locked states. Stormy teal identifies unlocked states. White panels sit on the icy surface with quiet borders; pale blue and green washes reinforce state without dominating the grid. Pending uses pale blue with dark neutral text. The combined unlocked/not connected state uses diagonally split teal and neutral styling.

The shipped contrast adaptations are `--inactive: #6b6b6b` and error `--orange: #a84810`. Preserve these darker foregrounds when matching the reference. Pair status color with text and icon shapes.

## Typography

Use locally bundled Instrument Sans, weights 400 and 500, with a sans-serif fallback. Keep headings modest: the mobile grid heading is 15/18px; desktop is 18/22px; detail titles are 20/26px. Tile numbers are 15/18px at weight 500, and state captions are 11/14px. Counts and addresses use tabular numerals. Avoid adding heavy weights or decorative type.

## Layout

The shell centers within 1600px and respects device safe areas. Phones use four equal grid columns, 8px gaps and tiles at least 107px tall. The mobile header is at least 52px tall; dashboard horizontal padding is 12px. On phones, keep the header in a viewport-height shell and scroll the inventory inside the remaining area. Float the filter capsule over the grid, filling the available mobile width with 12px side gutters and a fully transparent wrapper; do not add a full-width footer backdrop. Measure the controls with ResizeObserver and add that height plus 16px as inventory scroll clearance. Connection and loading screens use viewport-height flex layout at every width, with ordinary 20px content padding and the retry action in its own footer row. Do not subtract a guessed header height or create outer-page scrolling. Keep horizontal inventory gutters at 12px even on small phones. Under 360px, the four filters use equal-width buttons with the active label below the icon/count. On very short mobile screens, keep the icon/count controls compact and retain full accessible names.

At 768px, use a white bordered inventory panel and a sticky right sidebar containing filters and detail. The intermediate sidebar is 300px wide with a four-column inventory. At 1180px, use eight inventory columns and a 360px sidebar, with a 20px workspace gap. Desktop header/dashboard horizontal padding is 24px. Below 361px, compact margins and gaps accommodate 320px screens.

On phones, detail opens in a bottom sheet with rounded top corners and a maximum height of 90dvh (90vh fallback). On desktop, detail stays in the sidebar. The grid toolbar contains a heading and count.

## Elevation & Depth

Panels and tiles use borders and tonal surfaces. Reserve depth for floating controls and overlays: the mobile filter dock uses `0 8px 24px #0033592e`; the detail action's circular center uses `0 6px 16px #1217262e`. Keep resting inventory tiles flat.

## Shapes

Use 14px radii for tiles and desktop panels, 8px for standard buttons and 20px top corners for the mobile sheet. Status badges and the mobile filter dock are pills. Lock illustrations sit in circular fields; retain the supplied icon geometry and custom wordmark treatment.

## Components

- **Lock tiles:** address above a circular state icon, status text below. Unlocked tiles use the green wash and stormy border. Pending tiles use the pending wash and light blue border. Combined unlocked/not connected tiles use a pale teal upper-left triangle with an unlocked icon and solid teal border, a neutral grey lower-right triangle with an unplugged icon and dashed border, and a white diagonal separator. Keep the address at the top left; expose the complete status in the accessible name, tooltip and detail. Selection uses a 2px petrol outline; on combined tiles it replaces both decorative border halves. Hover must not add a full outer border to a combined tile. Keyboard focus uses a separate outline with a 3px offset.
- **Filters:** four choices — All, Locked, Unlocked and Unlocked/Not connected, each with a separate count and matching inventory. A shared solid petrol indicator slides between selections; active content is white. Mobile expands the active label inside a floating horizontal dock; shorten the combined label to “Odomk./Neprip.” while keeping its complete accessible name. Desktop retains the complete wording. Desktop shows all labels in vertical rows.
- **Connection badge:** compact pill in the header, with state icon and text. Disconnected uses the neutral wash `#edf0f1` and text `#5b6466`. On mobile it also refreshes states.
- **Connection screen:** for an unavailable network/controller, use the supplied 180px concentric Wi-Fi artwork, “Pripojte sa k ovládaču”, the short supplied hint and a white floating “Pripojiť” retry pill. Hide inventory and sheets during transport failures; retain the snapshot internally and restore it after API verification. Never add the cable fallback link. After “Pripojiť”, replace the radar with three concise manual Wi-Fi steps, keep the same background and footer action (“Skúsiť znova”), and retain full heading/step semantics. Resume read-only API checks on foreground return; dismiss the guide after connection succeeds. Invalid snapshot errors after connection retain the disabled inventory.
- **Detail:** title and status badge, circular lock action, compact metadata and timestamps observed during the current session. Keep existing command availability and sensor-confirmation behavior intact.
- **Feedback:** inline warm error alerts, neutral empty states, and a short status toast above the mobile dock. Preserve loading and pending states.
- **Interaction:** retain a 2px petrol focus outline with 3px offset, accessible button names, dialog focus handling and reduced-motion support. The filter indicator normally transitions over 360ms; reduced motion suppresses animation.

## Do's and Don'ts

- **Do** retain Slovak and English text support and allow labels to fit their available space.
- **Do** derive inventory size, counts and states from the actual controller response.
- **Do** keep fonts, icons and branding local for operation without Internet.
- **Don't** add USB/cable connection screens or cable fallback links.
- **Don't** introduce search, bulk controls, provisioning banners or unsupported locking actions from adjacent mockups.
- **Don't** replace unavailable sensor data with invented states or history. Visual changes must preserve the existing API state and command flow.

## Naming and approved copy

Use BOXYLOCK for the wordmark and BOXYLOCK DEMO for the demo product name. Slovak product copy uses “zámok”, never “box”. The approved introduction is: “BOXYLOCK DEMO zobrazuje stav všetkých 48 zámkov v reálnom čase. Zámok odomknete jedným ťuknutím priamo v telefóne bez inštalácie aplikácie a bez registrácie.” Do not add the removed fault-overview claim or the Raspberry Pi BL48 product tagline. Internal application identifiers and stored preference keys retain their existing values for compatibility.

The frontend renders the combined state from the current API mapping (`active=false`). Previous-lock memory and initial state classification belong to the backend. Do not add frontend persistence, infer success from a click, or invent a backend response shape.
