# Design QA — Progress / Statistics

- Source visual truth: `qa/stats-reference.png`
- Implementation screenshot: `qa/stats-implementation.png`
- Side-by-side comparison: `qa/stats-comparison.png`
- Route and state: `/stats`, Calories tab, October 2026, four tracked days, current day selected
- Browser viewport: 1400 × 1200 CSS px, deviceScaleFactor 1
- App screen: 393 × 852 CSS px inside the existing iPhone preview runtime
- Source pixels: 591 × 1280, normalized to 393 × 852 for comparison
- Implementation pixels: 1400 × 1200 full capture, cropped to the 393 × 852 app screen

**Findings**

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: hierarchy, sizes, weights, numeric emphasis, and compact labels match the reference closely. The project keeps its existing system-font stack.
- Spacing and layout rhythm: title, segmented control, month controls, seven-column calendar, five calendar rows, and monthly summary align with the reference proportions.
- Colors and visual tokens: the final charcoal background, dark segmented control, blue tracked-day cells, subdued empty/future dates, and pale selected-day outline match the reference direction.
- Image quality and asset fidelity: this screen contains no app-owned raster imagery. Chevron and navigation icons remain library/runtime icons; no visible asset was replaced with CSS or handcrafted SVG art.
- Copy and content: the Russian title, tabs, month label, weekday labels, calorie values, monthly average, monthly total, and tracked-day count match the reference. Values remain connected to real app data.

**Comparison History**

1. First pass found three P2 differences: the screen background was too black, the month label included the locale suffix “г.”, and an extra daily-target line was present. The background and cell tokens were raised to charcoal, the suffix was removed, and the extra line was deleted.
2. Post-fix evidence in `qa/stats-comparison.png` shows the calendar geometry, information hierarchy, density, and palette aligned with the source. No P0/P1/P2 items remain.

**Focused Region Comparison**

No separate crop was needed: the normalized 393 × 852 side-by-side image keeps the title, control, calendar labels and values, summary typography, and navigation legible at 1:1 CSS scale.

**Expected Differences / P3**

- The existing iPhone runtime chrome is intentionally preserved instead of recreating the Android status and home bars shown in the reference.
- The product’s established bottom-navigation labels and icons are preserved while the central add action remains functional.

**Interaction Checks**

- Calories / Weight tabs switch correctly.
- Previous-month navigation works; future-month navigation is disabled on the current month.
- Selecting a calendar day moves the outline state.
- Monthly totals and average use persisted entries rather than hard-coded display values.

**Verification**

- Stats unit tests: 5/5 passed.
- ESLint: passed.
- TypeScript and production Vite build: passed.

final result: passed


## Recipe cards — 2026-10-09

Source visual truth: /var/folders/5l/sm5nr7pd727_080593w_pc3w0000gn/T/codex-clipboard-c465b649-1cfa-479b-981e-8f7a8a24779d.png (736×736, two mobile examples).
Scope: adapt recipe card art direction, preserving existing food photos, app navigation, search, and actual nutrition data. No commerce copy or reference portrait assets are required by this scope.
Implementation: http://127.0.0.1:5577/add. Browser-rendered screenshot captured inline in this conversation, temporary QA tab 8; no filesystem screenshot path returned. Viewport 1280×720, existing 393 px mobile screen scaled by its device frame. Visual comparison is of card proportions and hierarchy rather than a literal whole-screen clone.
State: All recipes, first featured card plus two-column supporting cards.
Typography: bold condensed uppercase display headings, small system UI captions; all six titles wrap without overflow. Color: yellow featured card, sage and powder-pink supporting cards, dark readable ink. Layout: full-width first card, paired small cards, photo focus and rounded frames. Assets: existing loaded recipe photographs, no invented dish images. Copy: real recipe names, kcal and preparation times.
Full view and card-focused evidence: the browser capture shows the yellow poster and supporting colored cards within the existing phone frame. Intentional differences: food photos retain their original backgrounds; existing app navigation and filter controls remain.
Primary interaction: opened the salmon recipe and verified ingredients, preparation steps and Add action are present. Did not submit Add to alter the user's diary. Console errors: none. Build and ESLint passed.
Comparison history: initial adaptation reviewed; no actionable P0/P1/P2 layout or interaction findings within the requested card scope. P3: optional future cutout photography could bring image treatment closer to the reference.
final result: passed


## Product cards — 2026-10-10

Result: passed for the requested adaptation. Reference: /var/folders/5l/sm5nr7pd727_080593w_pc3w0000gn/T/codex-clipboard-a086d3d5-9ae8-410e-b3e7-724ca94565ad.png (736 × 920). Implementation inspected in the in-app browser at /add → Продукты, 1280 × 720 viewport, existing 393px phone screen scaled by the prototype frame. Screenshot inspected inline; browser API supplied image bytes, not a saved screenshot path.

Soft pale cards, three-column compact grid, contained product photographs, calories and plus controls adapt the reference. The surrounding dark iOS palette and blue controls intentionally follow the user’s latest preference. No decorative labels or product descriptions were added. Six product photos loaded correctly. Almond and chocolate photographs were replaced with lighter compositions; asset credits are in public/foods/product-photo-sources.md.

Browser checks: selecting a banana displays one portion and 107 kcal with the В дневник action; decrementing clears the selection and hides the cart. No browser console errors. Plus/minus targets are 44px. The grid uses an automatic 104px minimum track width to reduce columns on narrower screens. Catalogue tests: 4 passed, including diary persistence on the selected date and navigation to the main screen. Production build/type check and targeted ESLint passed. No actionable visual issues found for this scoped adaptation.


## Dark products and complete search — 2026-10-10

Result: passed. Product cards now follow the requested dark theme, two equal columns, transparent WebP photographs (all six verified with alpha min 0), kcal per gram portion and inline minus/quantity/plus controls. Sources and CC BY-NC attribution recorded in public/foods/product-photo-sources.md. Visual inspection at 1280×720 in the existing phone prototype confirmed no white image backgrounds and no cropped food subjects.

Search inspected in idle, focused empty, typed matching, history, and illustrated no-match states. History is local, separate for recipes/products, deduplicated and limited to six queries; replay/clear paths tested. Inline SVG basket/magnifier is a native UI illustration. Keyboard focus remains within history controls. Browser selection and quantity decrement verified without adding QA entries to the diary; console error list empty. Six catalogue integration tests passed, including diary write/date, quantities, history persistence/replay/clear, and illustrated empty-result reset. ESLint, Vue type checking and production build passed. Screenshots inspected inline through the browser tool; no saved screenshot filename was supplied by that tool.


## Catalogue history overlay and categories — 2026-10-10

Result: passed for this requested iteration. Browser inspection at /add, 1280×720 viewport in the existing phone frame confirmed history chips with separate remove icons, icon-only clear-all and История heading. Search history is positioned above catalogue content; tab Y coordinate remained 187.1405029296875 before and after focus. Backdrop is teleported into the clipped app screen, so desktop surroundings are unaffected. Clicking the backdrop closes history. Idle catalogue shows flatter icon/text section tabs with an underline. Dark two-column transparent product cards remain intact. Screenshots inspected inline; browser tool did not supply a saved screenshot path. Console error list empty.

Recipe categories restored with Мои. Products include Молочные продукты, Протеиновое (protein >=10g/100g) and ПП (current dairy/fruit selection). Scanner buttons dispatch to the existing barcode scanner or food-photo/manual-composition form while preserving requested date; actual camera/barcode decoding was not exercised and food recognition is not implemented. Ten catalogue tests passed including individual query deletion/persistence, category filters, scanner dispatch/date and previous diary/quantity/search scenarios. Targeted ESLint and production build with Vue type checking passed. No QA diary entries or user history were deleted.


## Shared scrolling headers — 2026-10-10

Catalogue uses one vertical scroll area, including search, section tabs, filter chips and cards. Shared PageHeader is sticky; down-scroll animates title left in 280ms and up-scroll restores center, with back-button clearance and reduced-motion support. Home month header stays pinned in its existing left alignment. Browser screenshots inspected inline for catalogue down/up and profile down; catalogue controls scroll away, cards pass below the opaque header, and title returns to center on upward movement before reaching page top. No console errors. No saved screenshot path was supplied. Thirty-one tests across the shared header, catalogue, home, profile and statistics passed; targeted ESLint, Vue type checking and production build passed.
