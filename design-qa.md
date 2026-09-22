# Design QA — dark home transfer

- Source visual truth: `qa/home-dark-source.png`, captured from the completed redesign in `/Users/toffunya/Documents/New project/calorie-app`.
- Implementation screenshot: `qa/home-dark-implementation.png`, captured from `http://127.0.0.1:5577/?date=2026-09-18`.
- Screenshot pixels: source 559 × 768; implementation 559 × 768.
- App CSS width: source design target 393 px; implementation home route 393 px. Browser capture density: 1×.
- Normalization: both screenshots were captured in the same Codex in-app browser at the same outer viewport. The source is shown inside its phone-frame preview and scales vertically to fit; comparison therefore used the 393 px app-owned content region and matching component proportions rather than the source's surrounding device chrome.
- State: dark home screen. The source contains four prototype foods; the implementation uses real IndexedDB data and contains one saved food on September 18. The differing calorie numbers and list length are expected data differences.

## Findings

No actionable P0, P1, or P2 findings remain.

## Required fidelity surfaces

- Fonts and typography: the month heading, 46 px remaining-calorie number, status copy, food title, metadata, and time badge preserve the source hierarchy and remain legible without clipping.
- Spacing and layout rhythm: the implementation keeps the same month → week → calorie summary → food-card sequence, 16 px page gutters, 24 px summary radius, compact 18 px food-card radius, and independent bottom-right add action.
- Colors and visual tokens: near-black page background, charcoal surfaces, soft white borders, white primary text, muted gray secondary text, cobalt actions/progress, orange calorie values, and green positive status match the source direction.
- Image quality and asset fidelity: food cards render the app's real catalog photos with the same left-aligned crop and rounded mask. The empty state retains the existing project-local plate asset instead of introducing a placeholder.
- Copy and content: the home route uses `September`, `Daily calories`, an explicit `kcal left` statement, `Eaten`, `Daily goal`, and only actual food entries. Navigation reads `Today`, `Recipes`, `Insights`, and `Profile` on the home route.

## Full-view comparison evidence

The source and implementation screenshots were emitted together in one comparison pass. Overall hierarchy, density, dark palette, calorie-summary anatomy, food-card anatomy, compact four-item navigation, and separate plus button align. Other routes keep their existing light presentation because this milestone intentionally changes only the home screen.

## Focused region comparison evidence

- Calorie summary: both views lead with the remaining amount, use a plain horizontal progress bar, and show eaten versus goal beneath it.
- Food card: both views place a real food crop left, title and orange calories centrally, and the time badge at the top-right.
- Bottom actions: both views reserve a compact dock for four destinations and keep the primary add button in its own circular bottom-right slot.

## Comparison history

1. [P1] The first implementation used the previous light home redesign instead of the selected dark source.
   - Fix: transferred the dark palette, typography, calorie summary, week selector, food cards, navigation labels/icons, and independent add action onto the real Vue data model.
   - Post-fix evidence: `qa/home-dark-implementation.png` shows the dark home at the same 393 px app width.
2. [P2] The initial bottom dock consumed layout height and obscured the first populated food card at 768 px browser height.
   - Fix: changed the home dock to a bottom overlay and added scroll-safe bottom padding to the home feed.
   - Post-fix evidence: the implementation screenshot shows the complete `Angus kebab` card with clear space above the dock.
3. [P2] The home route initially expanded to 448 px in the desktop browser, making the transferred design visibly looser than the 393 px source.
   - Fix: scoped the home route to a 393 px maximum width while preserving the existing width of all other routes.
   - Post-fix evidence: browser measurements report a 393 px root and main content width; the final screenshot confirms the corrected composition.

## Interaction and console checks

- Day selection updates the route and live diary data.
- The floating add action opens `/add` and preserves a selected date in the query string.
- Adding a real catalog food returns to home, updates calories from live data, and renders the redesigned card.
- The clean final browser tab reported no console warnings or errors.
- Related home tests: 30 passed.
- Production build: passed.

## Mobile prototype frame update

- Source frame evidence: `qa/mobile-frame-source.png`.
- Implementation frame evidence: `qa/mobile-frame-implementation.png`.
- Capture pixels: source 559 × 768; implementation 559 × 768 at 1× browser density.
- Device geometry: 511 × 968 frame with a 393 × 852 app screen positioned at x=59, y=58 and scaled uniformly to fit the browser.
- Full-view comparison: source and implementation were emitted together in one visual comparison. The same real iPhone bezel asset, screen crop, corner radius, centered stage, status-bar geometry, and responsive device scale are present.
- Focused comparison: the live time clears the Dynamic Island, the iOS status indicators align to the right safe area, the app content stays inside the 393 × 852 screen opening, and every visible action remains clickable through the frame.
- Responsive check: at a 480 × 900 viewport the bezel is removed and the app returns to a full-width mobile layout; no device chrome consumes phone screen space.
- Interaction check: the floating add action navigated to `/add?date=2026-09-16` inside the framed viewport and browser back restored the home state.
- Console check: no new warnings or errors were emitted in the final frame session.

No actionable P0, P1, or P2 frame findings remain.

## Follow-up polish

- P3: the empty-state illustration was not present in the selected populated source; it is intentionally retained from the existing application and styled for the dark surface.
- P3: the source runtime includes an iOS home-indicator line; the real bezel, status bar, safe-area spacing, and interactive screen are present, so this decorative device-chrome detail does not block the requested mobile-prototype presentation.

final result: passed

---

# Design QA — hold-and-slide add menu

- Source visual truth: `/Users/toffunya/Desktop/Screenshot 2026-09-22 at 12.39.18.png` and `/Users/toffunya/Desktop/Screenshot 2026-09-22 at 12.42.00.png`.
- Selected direction: the second radial arrangement, rotated upward-left to keep all three targets inside the existing bottom-right add-button geometry.
- Implementation screenshot: unavailable because browser capture permission for the local preview was denied.
- Intended CSS viewport: 393 × 852 px at 1× density.
- State: add button held for 360 ms, radial actions visible, pointer sliding across a target.

## Findings

- [P1] Browser-rendered visual comparison is blocked.
  - Location: home-screen floating add action.
  - Evidence: the source screenshots are available, but an implementation capture of the same held state could not be produced.
  - Impact: target spacing, label overlap, and visual balance cannot be accepted from code and unit tests alone.
  - Fix: inspect the open local preview, capture the held state, and compare it with the two source layouts before final acceptance.

## Required fidelity surfaces

- Fonts and typography: labels use the existing app typography at 11 px/700; browser confirmation is pending.
- Spacing and layout rhythm: the three 58 px targets form an upward-left arc around the 56 px trigger; browser confirmation is pending.
- Colors and visual tokens: the menu reuses the current charcoal surfaces, cobalt selection state, white text, and dark scrim.
- Image quality and asset fidelity: no new raster assets are required; the implementation uses the project's existing Lucide icon system.
- Copy and content: actions are `Add food`, `Scan food`, and `Barcode`.

## Interaction and build checks

- Short tap emits the regular add action.
- A 360 ms hold reveals all three targets.
- Sliding onto a target highlights it and releasing selects it.
- Barcode selection opens the existing barcode scanner through `/add?scan=barcode`.
- Food scan selection opens the custom-food camera-first flow.
- Unit tests: 423 passed, 31 todo.
- Lint and production build: passed.

final result: blocked

## Design QA — Profile and Settings redesign

- Source visual truth: browser annotation screenshots supplied for `/settings` on 2026-09-22 (393 × 852 app screen inside the iPhone frame).
- Implementation target: `http://127.0.0.1:5173/settings` and `http://127.0.0.1:5173/settings/preferences`.
- Intended viewport: 393 × 852 CSS px, deviceScaleFactor 1, dark theme, saved-profile state.
- Source pixels: annotation evidence is a scaled framed capture; app-owned screen target is 393 × 852 CSS px.
- Implementation pixels: unavailable because Codex Browser access was denied by the admin-enforced policy check.
- Density normalization: not performed because implementation capture was blocked.
- State: saved local profile; Russian locale; Profile overview and collapsed Settings sections.

**Full-view comparison evidence**

- Source screenshot was available in the annotation context and shows the previous long settings form.
- Browser-rendered implementation evidence could not be captured. The in-app Browser matched the local tabs, but access to `127.0.0.1:5173` was denied because the admin-enforced browser policy could not be verified.

**Focused region comparison evidence**

- Not available. Profile summary, language switcher, disclosure rows, expanded target form, and bottom-dock clearance require a browser-rendered capture.

**Findings**

- [P1] Visual verification is blocked.
  - Location: `/settings` and `/settings/preferences`.
  - Evidence: source annotations are available; implementation screenshot is unavailable.
  - Impact: typography, vertical density, dock clearance, and expanded-form overflow cannot be accepted visually.
  - Fix: capture both routes at 393 × 852 after Browser policy access is restored, compare the app-owned screen, and fix any P0/P1/P2 drift.

**Interaction checks completed outside visual QA**

- 413 unit tests passed, including profile summary, language switching, disclosure behavior, and manual calorie target changes.
- ESLint, production build, typed route generation, and `git diff --check` passed.
- Browser interaction and console inspection remain blocked by the same policy check.

**Implementation checklist**

- Capture Profile at `/settings` in Russian and English.
- Capture Settings collapsed and with Personal data expanded.
- Verify persistent bottom navigation clearance and scroll reachability.
- Check console errors while switching language and saving profile changes.

final result: blocked

---

# Design QA — Insights weekly dashboard redesign

- Source visual truth: five browser annotations captured from `http://127.0.0.1:5173/stats` on 2026-09-22.
- Implementation screenshot: unavailable because the admin-enforced browser security policy could not be verified for the local preview.
- Intended CSS viewport: 393 × 852 px at 1× density inside the existing iPhone frame.
- State: current week, one tracked day, target 2,100 kcal.

## Changes made from the annotated evidence

- Replaced the sparse page with a structured weekly dashboard using the established near-black, charcoal, cobalt, and orange visual language.
- Added previous/next week controls, an exact date range, and disabled future navigation from the current week.
- Rebuilt the graph with a labeled daily target line, calorie labels, calendar dates, and tap-through to each day.
- Replaced the ambiguous weight conversion with explicit average, percentage of daily target, total calories, and tracked-day count.
- Added a clear explanation that averages exclude empty days, plus a day-by-day ledger that exposes every input to the summary.

## Required fidelity surfaces

- Fonts and typography: hierarchy follows the existing Today and Recipes screens, with 24 px display text, 16 px section titles, and tabular numeric metrics.
- Spacing and layout rhythm: content uses 16 px screen gutters, 24 px primary cards, 18–20 px secondary cards, and bottom padding above the persistent dock.
- Colors and visual tokens: the current dark palette is preserved; blue marks in-target consumption and orange marks amounts above the daily target.
- Image quality and asset fidelity: no raster imagery is required on this analytical screen; interface icons come from the project's existing Lucide dependency.
- Copy and content: all calculations are explicitly named, the date range is visible, and the unsupported kcal-to-kilogram estimate was removed.

## Interaction and build checks

- Previous-week navigation changes the seven-day query window; next-week navigation is disabled on the current week.
- Graph bars and daily rows open the corresponding Today date; future days are disabled.
- Unit tests: 421 passed, 31 todo.
- Lint, production build, and `git diff --check`: passed.
- Browser-rendered comparison and console inspection: blocked by the browser security-policy failure.

## Finding

- [P1] Post-build visual comparison is blocked.
  - Evidence: annotated source captures are available, but the browser denied the same-viewport implementation capture.
  - Impact: final acceptance of information density, graph-label legibility, and scroll clearance requires user inspection.
  - Fix: inspect the live `/stats` preview in the existing in-app browser and compare it with the five annotations.

final result: blocked

---

# Design QA — recipe catalog and recipe detail

- Source visual truth: ten browser annotations captured from `http://127.0.0.1:5173/add` on 2026-09-22, covering the search header, tabs, recipe grid, card content, empty personal state, and requested recipe-detail experience.
- Implementation screenshot: unavailable because the in-app browser's admin-enforced security-policy check could not be verified after selecting the local tab.
- Intended CSS viewport: 393 × 852 px at 1× density inside the existing iPhone frame.
- State: Recipes catalog with all recipes selected; recipe detail route available from every catalog card.

## Changes made from the annotated evidence

- Removed the two starter catalog foods (`Spoon of sugar` and `Angus kebab`). New users' personal collection remains empty until they add their own food.
- Replaced the header actions with a single recipe search field.
- Removed the grid/list view selector.
- Replaced generic food categories with recipe-use filters: all, high-protein, under 400 kcal, up to 20 minutes, balanced, and personal foods.
- Added six sourced recipe cards in a fixed two-column grid with real food photography, calories, time, difficulty, and protein/fat/carbohydrate values.
- Added a dedicated recipe route with a photo hero, scannable nutrition cards, ingredient rows, three short cooking steps, source attribution, and a working add-to-diary action.

## Findings

- [P1] Post-build browser-rendered visual comparison is blocked.
  - Location: `/add` and `/add/recipe/:id`.
  - Evidence: the annotated source views are available and the app builds successfully, but the browser security gate blocks capture of the rendered implementation.
  - Impact: final acceptance of card density, text wrapping, image crops, scrolling, and CTA clearance requires user inspection in the already-running preview.
  - Fix: compare the live catalog and one opened recipe at the same 393 × 852 screen state, then address any new annotations.

## Required fidelity surfaces

- Fonts and typography: card titles use a two-line clamp with compact 14 px hierarchy; nutrition labels use 9–11 px tabular values; the detail title uses 24 px display type.
- Spacing and layout rhythm: catalog cards are two equal columns with 12 px gaps; details use 16 px page gutters and 20–28 px radii consistent with the existing dark UI.
- Colors and visual tokens: near-black background, charcoal surfaces, cobalt actions, white hierarchy, and blue/orange/green macro accents follow the existing design direction.
- Image quality and asset fidelity: six recipe photos were normalized to 720 × 720 WebP assets and use cover crops in the catalog and hero view.
- Copy and content: Russian recipe names, short descriptions, compact ingredients, three-step methods, and per-serving nutrition replace the old placeholder food names.

## Verification

- Production build: passed.
- Lint: passed.
- Unit tests: 423 passed, 31 todo; the outdated catalog-photo fixture now points to the new salmon recipe.
- Browser interaction and console inspection: blocked by the same admin-enforced security-policy failure.

final result: blocked

---

# Design QA — compact empty state and hold-only add trigger

- Source visual truth: four browser annotations captured from `http://127.0.0.1:5173/` on 2026-09-22.
- Implementation screenshot: unavailable because browser automation remains blocked by the admin-enforced security-policy check.
- Intended CSS viewport: 393 × 852 px at 1× density inside the existing iPhone frame.
- State: empty Today screen with the add menu closed, plus the trigger's held state.

## Changes made from the annotated evidence

- Removed the empty card's 240 px minimum height and the 16 px downward content offset.
- Reduced the empty illustration from 144 px to 112 px and set equal 20 px top and bottom padding.
- Centered the trigger glow by removing its downward shadow offset.
- Added a smooth, centered light expansion while the trigger is held.
- Removed the short-tap add action. The trigger now opens and selects actions only through hold-and-slide; keyboard users can still open the menu with Arrow Down.

## Findings

- [P1] Post-fix browser-rendered comparison is blocked.
  - Location: empty-state card and central add trigger.
  - Evidence: annotated source captures are available, but the browser policy prevents a fresh same-viewport implementation capture.
  - Impact: final visual acceptance of the compact card rhythm and held glow requires user inspection.
  - Fix: inspect the live preview in the existing in-app browser and compare it against the four annotations.

## Required fidelity surfaces

- Fonts and typography: existing type scale and copy remain unchanged.
- Spacing and layout rhythm: the card now sizes to its content with equal 20 px vertical padding and no optical translation.
- Colors and visual tokens: the trigger retains the established cobalt token; its glow is centered and animates only during a hold.
- Image quality and asset fidelity: the existing empty-state raster is preserved and displayed at 112 × 112 CSS px.
- Copy and content: the empty-state copy remains `You haven’t added anything yet` and `Tap + to add your first meal`.

## Verification

- Add-trigger component tests: 3 passed, including no emission on a short tap and hold-and-slide selection.
- Full unit suite: 423 passed, 31 todo.
- Lint, production build, and `git diff --check`: passed.
- Console and visual comparison: blocked with browser capture by the same security-policy failure.

final result: blocked

---

# Design QA — navigation position and vertical rhythm follow-up

- Source visual truth: four browser annotations captured from `http://127.0.0.1:5173/` on 2026-09-22.
- Implementation screenshot: unavailable because browser automation remains blocked by the admin-enforced security-policy check.
- Intended CSS viewport: 393 × 852 px at 1× density.
- State: empty Today screen and Recipes navigation transition.

## Fixes applied

- The bottom dock now uses the same absolute positioning on every non-onboarding route, removing the vertical jump between Today and Recipes.
- The dock and central add trigger were raised by 10 px to clear the phone's bottom corner radius.
- The home header top/bottom padding was reduced from 28/12 px to 12/4 px.
- The empty-state content group was shifted down 16 px to visually equalize the space above the illustration and below the helper text.
- The held add-action arc was raised with the trigger so its thumb geometry stays unchanged.

## Findings

- [P1] Post-fix browser-rendered comparison is blocked.
  - Evidence: annotated source captures are available, but the browser policy prevents a fresh same-viewport implementation capture.
  - Impact: final visual acceptance of the phone-corner clearance and empty-card optical centering requires user inspection.
  - Fix: compare the live preview against the four new annotation screenshots.

## Verification

- Route-level dock positioning is now shared rather than conditional on the home route.
- Lint, unit tests, production build, and `git diff --check` are required after this edit.
- Console inspection remains blocked with browser capture.

final result: blocked

---

# Design QA — annotated home and shared navigation iteration

- Source visual truth: six browser annotations captured from `http://127.0.0.1:5173/` on 2026-09-22, covering the bottom navigation, add trigger, empty-state copy, calorie card, month heading, and calendar affordance.
- Implementation screenshot: unavailable because the admin-enforced browser security policy could not be verified for the local preview.
- Intended CSS viewport: 393 × 852 px at 1× density inside the existing iPhone frame.
- State: empty Today screen, current date selected, add menu closed.

## Changes made from the annotated evidence

- The shared navigation now uses one dark five-slot dock on every non-onboarding route: Today and Recipes sit left of the central add trigger; Insights and Profile sit right of it.
- The add trigger is centered and available with the shared dock. Its held state opens a symmetric upward arc for Add food, Scan food, and Barcode.
- The orphaned empty-state line was replaced with the shorter `Tap + to add your first meal`.
- The calorie summary gained a compact blue flame icon beside `Daily calories`.
- The month heading is 18 px.
- A real calendar icon and native date input were added to the right side of the header.

## Findings

- [P1] Browser-rendered visual comparison remains blocked.
  - Location: Today screen and shared bottom dock.
  - Evidence: all six source annotations are available, but the browser denied access before a same-viewport post-change screenshot could be captured.
  - Impact: the final dock balance, central-button overlap, text wrapping, and header alignment cannot be accepted from source code alone.
  - Fix: inspect or capture the already-running local preview at the same empty Today state and compare it against the annotation images.

## Required fidelity surfaces

- Fonts and typography: the annotated month heading is exactly 18 px; the shorter empty-state message is designed to remain on one line at 393 px.
- Spacing and layout rhythm: navigation uses a 64 px center slot around the 56 px add trigger, with two equal destinations on each side.
- Colors and visual tokens: the shared dock preserves the established near-black, charcoal, cobalt, muted-gray, and white home palette.
- Image quality and asset fidelity: the existing empty-state artwork is unchanged; calendar, flame, navigation, and add-action controls use the project's established icon library.
- Copy and content: shared destination names are consistently `Today`, `Recipes`, `Insights`, and `Profile`.

## Interaction and build checks

- The date control is a labeled native date input and updates the existing date route state.
- Short tap and hold-and-slide behavior of the add trigger remain covered by unit tests.
- Nested `/add` routes now retain the Recipes active state through non-exact route matching.
- Unit tests: 423 passed, 31 todo.
- Lint, production build, and `git diff --check`: passed.
- Console inspection: blocked with browser capture by the same security-policy failure.

final result: blocked
