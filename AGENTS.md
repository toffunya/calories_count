# Calorie tracker

## UI preferences — 2026-10-09
Latest user preference: preserve the Apple iOS-style dark app palette; do not restyle the app around the poster cards. Recipe cards repeat two small cards then one wide card with minimal text. Product cards show only a photo and kcal; names and portions remain accessible. Keep centered 18px page titles. Catalog and Profile have no back arrow. Catalog has Recipes and Products sections. Profile order is daily goal, weight goal, steps. Keep accessible Vue controls and real diary data; do not claim native UIKit or Apple Health integration. Semantic palette lives in src/assets/css/ios.css. Stats opens the Weight view first, with current weight, adult BMI range by height, user-defined goal, editable measurements and history. BMI range is a broad adult screening reference, not a personal ideal weight. Preserve existing user changes.

Latest product-card preference: adapt the soft reference with pale compact cards, complete product photographs, calories and a plus control; retain the dark app palette. Selected quantities can be reduced and committed to the diary on the main screen. Do not copy the full reference UI or add verbose product copy.

Latest catalogue preference (2026-10-10): product cards are dark, exactly two per row, with genuine transparent product cutouts, calories per displayed gram portion and inline minus/quantity/plus after selection. Search is pill-shaped with focus/input/illustrated empty states and locally stored recent queries that can be replayed or cleared. This supersedes the earlier pale product-card preference.

Latest search preference (2026-10-10): focus history overlays the catalogue without shifting layout, dims only the app screen, uses the heading История, icon-only clear-all and wrapping query chips with individual removal. Search has barcode action for Products and food-photo/manual entry for Recipes. Recipe filters include Мои; product filters include Молочные продукты, Протеиновое and ПП. Catalogue sections use icon/text tabs with a blue underline.

Latest scrolling preference: shared page titles stay at the top; downward scrolling smoothly moves the centered title to the left, upward scrolling restores its centered position. Back-button titles keep clearance. Catalogue search, section tabs, categories and cards share one vertical scroll area. Respect reduced motion. Home already-left month title stays pinned.

Latest onboarding preference (2026-10-13): new users get four screens accompanied by a fluffy ginger fold-eared cat: welcome; name and age; height, current weight and desired weight; activity and goal. Preserve the dark app palette, keep entered values when going back, and save onboarding data to the real profile.

Latest onboarding visual preference (2026-10-13): use a fluffy 3D ginger Scottish Fold cat with clearly folded ears and a different pose on each of the four screens. Add meaningful icons to onboarding fields. On the name/age screen, the sex selector is the first form row. Back control is an icon without a circular background.

Latest onboarding refinements (2026-10-13): remove cat caption badges and sex-selection checkmarks. Female selected state is pink; male remains blue. Name placeholder is «Введи имя». Replace age entry with a birth-date calendar (year/month/day), calculate age for the existing calorie calculation, and remove the visible age-range hint. Cat cutouts must not contain fragments of neighboring poses.

Latest welcome-screen preference (2026-10-13): a close-up cat face and waving paw is sufficient; remove stray neighboring-pose fragments. Keep welcome copy short. Move sex selection to the welcome screen, replacing its bottom CTA and slogan; choosing a sex advances to the name/birth-date screen.

Latest birth-date picker preference (2026-10-13): use a dark bottom sheet with three separately scrolling day/month/year wheels, a shared selected-row highlight, and «Отмена»/«Готово», following the supplied iOS-style wheel reference. Do not use the browser's native date calendar. Cancel preserves the saved value; Done commits the selected date; handle month lengths and leap years.

Latest onboarding structure (2026-10-13): sex selection now has its own second screen. Five steps: welcome, sex, name/birth date, measurements, activity/goal. Center the content vertically in available space on all screens, with header above and continuation button below. Preserve data on back navigation. Measurement cat has complete head and padding around the cutout.

Latest visual and measurement preference (2026-10-13): primary app accent is warm orange (`--ios-accent`), preserving dark surfaces. Male selection stays blue and female selection pink. Enlarge the cat on the measurements screen. Current and target weight open separate bottom sheets with a horizontally scrollable scale, 0.1 kg precision, and Cancel/Done semantics.

Latest welcome copy (2026-10-13): «Я твой виртуальный помощник, который улучшит:», two features «Твоё питание» and «Твою активность», with goal moved below as «И твоя цель будет достигнута со мной».

Latest onboarding refinement (2026-10-13): sex screen has a thinking face/paw cat and explicit «Далее», with no automatic advance when a sex is selected. Enlarge the cat on the name/birth-date screen. Remove measurements range/footer hint. Activity and goal use custom dark bottom-sheet option rows with icons and short hints. Final cat is an upper-body celebration portrait with complete head and raised paw. Remove the large calorie result card and its captions; keep a compact flame/kcal badge at the upper right of the final screen.

Latest final-step correction (2026-10-13): remove the calorie badge from the header; the earlier corner placement applied only to the flame icon inside the result container, not to the entire container. Keep calorie captions and numeric copy removed. Enlarge the final cat, label the final button «Начать», and move the activity/goal description below the goal control.

Latest welcome card preference (2026-10-13): combine each feature icon and its text into one card, using the previous icon background across the full card (orange nutrition, green activity). The goal icon and sentence share a full-width orange-tinted card below. Primary onboarding buttons are fully pill-shaped.

Latest welcome goal-card preference (2026-10-13): use a muted violet background and lavender target icon, with a slightly taller frame (minimum 72px).

Latest welcome typography/color correction (2026-10-13): place «который улучшит:» together on the second line; avoid orphaned words and balance text wrapping. Goal card uses warm graphite with orange icon rather than violet, retaining its taller height.

Latest sex-screen preference (2026-10-13): replace male/female symbols in selection cards with native accessible radio buttons, retaining blue/pink selected states and explicit «Далее». Add small 3D male/female portraits above the thinking ginger cat.

Latest sex-screen correction (2026-10-13): above the thinking cat use the original male/female symbols (blue Mars, pink Venus), not human portraits. Keep native radio selection controls below.

Latest onboarding preference (2026-10-14): six steps, shared mascot-led dark styling with warm orange accents and soft direction-aware transitions. Welcome uses compact floating nutrition/activity labels. Final screen has celebration cat with both paws raised, party hat and confetti, centered congratulations, large white calculated kcal value, orange flame/kcal-per-day line and secondary daily-norm caption. Profile saves only on final Начать. Target-weight sheet starts at 65 kg until user confirms a value, independent of current weight. Field colors and focus/open/error states are consistent; respect reduced motion.
