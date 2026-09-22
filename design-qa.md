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
