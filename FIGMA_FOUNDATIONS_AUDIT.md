# FC26 Transfer Tracker — Figma Foundations Audit

Audit date: 13 October 2026. This is a static, read-only audit of the current implementation. Only this report was created; application files and configurations were not changed. No Figma file was created. Recommendations below are proposals, not implemented tokens or components.

Sources inspected: `styles.css`, `theme.js`, `index.html`, `tracker.html`, `login.html`, `app.js`, `dashboard.js`, `login.js`, `formations.js`, and `awsClient.js` (data/auth layer; no component styling). Source references use selectors, IDs and function names so they remain useful as lines move. This is not a browser-rendered or authenticated-state validation. Native control rendering, actual font loading and device camera behaviour remain browser-dependent.

## 1. Implemented design tokens

Every declared custom property is listed below. All definitions are in `styles.css :root`; the Light column records `:root[data-theme="light"]` overrides. “Same declaration” means the expression is unchanged; aliases still resolve differently when their underlying palette changes. Usage lists refer to `styles.css` unless noted. The SVG token is described rather than reproducing its data URI.

| Variable | Dark/default declaration | Light override | Consumers / usage |
| --- | --- | --- | --- |
| `--on-accent` | `#04021e` | `#ffffff` | `.btn-primary`; `.seg-btn.active` |
| `--surface-hover` | `rgba(255,255,255,.06)` | `rgba(18,26,61,.06)` | `.app-header`; `.btn`; `.icon-btn`; `.seg-btn:hover`; `tbody tr:hover td`; `.suggestions button:hover` |
| `--border-hover` | `#7582ad` | `#414e70` | `.btn:hover`; `.icon-btn:hover` |
| `--row-border` | `#979cb45e` | `var(--border)` | `tbody td` |
| `--focus` | `#a9c7ff` | `#254ac5` | `input:focus, select:focus`; `:where(button, a, input, select):focus-visible` |
| `--control-border` | `var(--border)` | `var(--border)` | `input, select, .btn-secondary, .icon-btn, .segmented`; `.segmented-secondary .seg-btn` |
| `--danger-bg` | `rgba(255,107,107,.12)` | `#ffe7f0` | `.btn-danger`; `.icon-btn.danger`; `.badge.sell` |
| `--danger-border` | `#c06b85` | `#b50069` | `.btn-danger`; `.icon-btn.danger`; `.badge.sell` |
| `--pitch-panel` | `#050d20` | `#e6eaf4` | `.pitch-pos .head`; `.pitch-pos ul` |
| `--pitch-row` | `#13192c` | `#ffffff` | `.pitch-pos li:nth-child(odd)` |
| `--pitch-row-alt` | `#101626` | `#f0f3f8` | `.pitch-pos li:nth-child(even)` |
| `--pitch-bg` | `linear-gradient(180deg, #0b2630, #081e24)` | `linear-gradient(180deg, #e1f0e6, #d4e8dc)` | `.pitch` |
| `--pitch-line` | `#ffffff` | `#ffffff` | `.pitch::before`; `.pitch::after` |
| `--arrow` | SVG chevron; stroke #dfe9e9; full data URI in source | SVG chevron; stroke #171830; full data URI in source | `select` |
| `--white` | `#dfe9e9` | `#171830` | `:root`; `.edit-name`; `td .cell-contain.wide` |
| `--gray` | `#979CB4` | `#515970` | `:root` |
| `--black` | `#04021E` | `#f3f5fa` | `:root`; `.suggestions` |
| `--navy` | `#070729` | `#ffffff` | `:root` |
| `--blue` | `#121A3D` | `#e6eaf4` | `:root`; `.btn-secondary`; `.theme-switch-thumb` |
| `--green` | `#01ff49` | `#007b32` | `:root`; `.btn-primary`; `.seg-btn.active`; `.segmented-secondary .seg-btn.active`; `.auto-badge`; `input[type="checkbox"]` |
| `--red` | `#ff299e` | `#b50069` | `:root` |
| `--purple` | `#d751ff` | `#8230a6` | `:root` |
| `--teal` | `#47ffd9` | `#006c60` | `:root` |
| `--amber` | `#ff9f57` | `#875000` | `:root` |
| `--bg-primary` | `var(--black)` | Same declaration | `body`; `input, select`; `.total`; `table`; `th:first-child, td:first-child`; `.theme-switch` |
| `--bg-secondary` | `var(--navy)` | Same declaration | `.card`; `.badge.special`; `.badge.exciting`; `.badge.great`; `.modal-panel`; `.modal-foot` |
| `--text` | `var(--white)` | Same declaration | `body`; `.title-edit:hover`; `.btn`; `.icon-btn`; `.segmented-secondary .seg-btn:hover`; `.segmented-secondary .seg-btn.active`; `input, select`; `th.sortable.active-sort`; `th.sortable .arrow`; `.theme-switch[aria-checked="true"] .theme-switch-icon:last-child, .theme-switch[aria-checked="false"] .theme-switch-icon:nth-child(2)` |
| `--txt-secondary` | `var(--gray)` | Same declaration | `label` |
| `--muted` | `var(--gray)` | Same declaration | `.title-edit`; `.sub`; `.hint`; `.subtle`; `.val-muted`; `.seg-btn`; `input::placeholder`; `input::-webkit-input-placeholder`; `input:-ms-input-placeholder`; `.total .label`; `thead th`; `td .cell-contain`; `td:first-child .cell-contain span`; `.footer`; `.checkbox-label`; `tbody tr.inactive td .cell-contain`; `#save-rows td:not(:first-child):not(:last-child)`; `.theme-switch` |
| `--border` | `#283362` | `#dbdfe4` | `:root`; `:root[data-theme="light"]`; `.card`; `.btn-secondary`; `.icon-btn`; `.segmented`; `.segmented-secondary .seg-btn`; `input, select`; `.total`; `.table-wrap`; `thead th`; `.badge`; `.suggestions`; `.modal-panel`; `.modal-foot`; `.pitch`; `.theme-switch` |
| `--danger` | `var(--red)` | Same declaration | `.val-neg` |
| `--ok` | `var(--green)` | Same declaration | `.val-pos` |
| `--inactive` | `var(--blue)` | Same declaration | `.segmented` |
| `--special` | `var(--purple)` | Same declaration | `.badge.special` |
| `--exciting` | `var(--teal)` | Same declaration | `.card.editing`; `0%`; `.badge.exciting` |
| `--great` | `var(--amber)` | Same declaration | `.badge.great` |
| `--sell` | `var(--red)` | Same declaration | `.badge.sell` |
| `--radius-cell` | `2px` | Same declaration | `.btn`; `.icon-btn`; `.segmented`; `input, select`; `.total`; `.table-wrap`; `.badge`; `.suggestions`; `.pitch`; `.pitch-pos`; `.pitch-pos ul` |
| `--heading` | `"Special Gothic Expanded One", sans-serif` | Same declaration | `.font-head`; `h1, h2, h3, h4`; `.edit-name`; `.btn`; `button`; `label`; `.total`; `thead th`; `td:first-child .cell-contain` |
| `--body-font` | `"Rubik", sans-serif` | Same declaration | `body`; `p`; `input, select`; `tbody td`; `td:first-child .cell-contain span`; `#save-rows td` |
| `--type-h1` | `clamp(1.5rem, 4vw, 2rem)` | Same declaration | `h1` |
| `--type-h2` | `clamp(1.375rem, 3.2vw, 1.75rem)` | Same declaration | `h2`; `.total .value` |
| `--type-h3` | `clamp(1.25rem, 2.8vw, 1.5rem)` | Same declaration | `h3` |
| `--type-h4` | `clamp(1.125rem, 2.2vw, 1.25rem)` | Same declaration | `h4` |
| `--type-h5` | `1rem` | Same declaration | `h5` |
| `--type-h6` | `clamp(0.625rem, 1.2vw, 0.75rem)` | Same declaration | `h6` |
| `--type-body` | `clamp(0.875rem, 1.8vw, 1rem)` | Same declaration | `body` |
| `--type-label` | `clamp(0.625rem, 1.2vw, 0.75rem)` | Same declaration | `.title-edit`; `.btn`; `.icon-btn`; `label`; `.total .label` |
| `--type-input` | `clamp(0.75rem, 1.6vw, 0.875rem)` | Same declaration | `input, select` |
| `--type-toggle-label` | `clamp(0.5rem, 1vw, 0.625rem)` | Same declaration | `.seg-btn`; `.auto-badge`; `.checkbox-label` |
| `--type-table-head` | `clamp(0.5rem, 1vw, 0.875rem)` | Same declaration | `thead th` |
| `--type-table-data` | `clamp(0.625rem, 1.2vw, 0.875rem)` | Same declaration | `td .cell-contain`; `td:first-child .cell-contain span`; `#save-rows td` |
| `--space-0` | `0px` | Same declaration | No consumer in shared CSS |
| `--space-1` | `4px` | Same declaration | No consumer in shared CSS |
| `--space-2` | `8px` | Same declaration | `:root`; `.save-title-row`; `.header-utilities`; `thead th:first-child, tbody td:first-child`; `thead th:last-child, tbody td:last-child`; `td.num .cell-contain` |
| `--space-3` | `12px` | Same declaration | `.save-title-row` |
| `--space-4` | `16px` | Same declaration | `:root`; `.pitch-filters` |
| `--space-5` | `24px` | Same declaration | `:root` |
| `--space-6` | `32px` | Same declaration | No consumer in shared CSS |
| `--space-7` | `48px` | Same declaration | No consumer in shared CSS |
| `--space-8` | `64px` | Same declaration | No consumer in shared CSS |
| `--space-9` | `96px` | Same declaration | No consumer in shared CSS |
| `--space-10` | `128px` | Same declaration | `:root` |
| `--space-page-gutter` | `var(--space-2)` | Same declaration | `.container` |
| `--space-page-max-gutter` | `var(--space-10)` | Same declaration | `.container` |
| `--space-card-padding` | `clamp(var(--space-2), 2vw, var(--space-5))` | Same declaration | `.card` |
| `--space-card-items` | `var(--space-4)` | Same declaration | `.card` |
| `--space-form-fields` | `clamp(var(--space-2), 2vw, var(--space-4))` | Same declaration | `.actions`; `.grid` |

`login.html` also consumes `--space-form-fields` (`.login-wrap .row`), `--space-card-items` (`#confirm-block`), `--muted` (`.muted`), `--danger` (`.error`) and `--ok` (`.ok`). `--mono` is referenced by `.mono` but **never declared**: it is not an existing token. `--type-h6` has an extra trailing semicolon, which does not create another value.

### Theme behaviour (implemented)

`theme.js` defaults to Dark, accepts only the saved string `light` as Light, writes `document.documentElement.dataset.theme`, and uses localStorage key `fc26-theme`. It does not consult system colour preference. `[data-theme-toggle]` receives `aria-checked=true` for Dark. Click toggles and persists the theme; storage events synchronize other tabs. Storage failures are tolerated. The script loads in all three HTML heads before the stylesheet. `styles.css` declares `color-scheme: dark` / `light`, affecting native controls, and `input[type="number"]` inherits it.

## 2. Typography (implemented)

All three pages request Google Fonts Rubik, upright and italic weights 300–900, and Special Gothic Expanded One. Availability of a downloaded weight does not imply a designed variant. The following sizes assume a 16px root solely for rem conversion; no root font-size is set. Line-height is generally browser `normal`, not a declared token.

| Role | Family / weight / size | Source and effective treatment |
| --- | --- | --- |
| H1 | Heading / 400 / 24–32px, fluid 4vw | `styles.css h1`; margin bottom 8px, overridden to 0 in `.save-title-row h1`; all page titles |
| H2 | Heading / 400 / 22–28px, fluid 3.2vw | `h2`, `.card h2`: zero margin and uppercase; dashboard/tracker card titles |
| H3 | Heading / 400 / 20–24px, fluid 2.8vw | `h3`; scan title has inline margin 0 in `tracker.html` |
| H4 | Heading / 400 / 18–20px, fluid 2.2vw | `h4`; defined, no current HTML instance |
| H5 / H6 | Inherited body family; browser heading bold / 16px; 10–12px fluid 1.2vw | `h5`, `h6`; outside the `h1,h2,h3,h4` family/weight rule; no current instances |
| Body and paragraphs | Rubik / normal (normally 400) / 14–16px, fluid 1.8vw | `body`, `p`; `.sub`, `.hint`, `.subtle` use muted colour |
| Field label | Heading / inherited normal / 10–12px, fluid 1.2vw | `label`: uppercase, .05em tracking, 7px label-to-control gap |
| Input/select | Rubik / 400 / 12–14px, fluid 1.6vw | `input, select`; zero tracking; `login.html .login-wrap input` overrides to 16px |
| Standard button | Heading / 400 / 10–12px | `.btn`: uppercase, .02em tracking |
| Row action | Heading / 700 / 10–12px | `.icon-btn`, global `button`: uppercase, .05em tracking |
| Segment/filter label | Heading / browser button weight; 8–10px fluid 1vw | `.seg-btn`, `.checkbox-label`; segment uppercase; checkbox inherits label tracking |
| Auto-detected annotation | Heading inherited from label / 400 / 8–10px | `.auto-badge`: green, no box treatment |
| Table header | Heading / browser `th` bold, normally 700 / 8–14px fluid 1vw | `thead th`; uppercase, nowrap, muted; first column bold |
| Player table data | Rubik / 500 / 10–14px fluid 1.2vw | `td .cell-contain`: .02em tracking, muted; `.wide` uses main text; first column heading family |
| Player metadata | Rubik / inherited 500 / 10–14px | `td:first-child .cell-contain span`; muted, including status badge text |
| Career table data | Rubik / body or 500 / 10–14px | `#save-rows td`; middle cells muted/500/.02em; first cell `.cell-contain` heading/500 |
| Summary label/value | Heading / inherited normal / label 10–12px; value 22–28px | `.total .label`, `.total .value`; label uppercase/.05em |
| Generic badge | Inherited / inherited / 12px | `.badge`; table-specific span rule replaces font size and colour |
| Suggestion primary/meta | Heading via `button` / 600 primary / 10px primary, 8px meta | `.suggestions button`, `.s-main`, `.s-meta`; meta .75 opacity |
| Pitch position/player | Rubik inherited / 700 / 9px | `.pos-code`, final `.pitch-pos li`; name truncates at max-width 48px |
| Footer | Rubik / inherited normal / 13px | `.footer` |
| Edit title | Heading via `button` / browser default / label size | `.title-edit`: underlined, underline offset 3px |

`styles.css .font-head`, `.hint`, `.save-name-input` and several heading levels have definitions but no current rendered instance in the audited markup/generated templates. `index.html .mono` inherits in practice because its custom property is missing. Hidden `tracker.html #scan-debug` is a native `pre` with inline pre-wrap, not a custom typography style.

## 3. Colours and interactive treatments (implemented)

The token table contains exact colours and aliases. Effective semantic uses:

- Page/control/table background: `--bg-primary` → `--black`; card/modal surfaces: `--bg-secondary` → `--navy` (`body`, `input, select`, `table`, `.card`, `.modal-panel`). Primary text: `--text` / `--white`; secondary text: `--muted` / `--txt-secondary` → `--gray`.
- Accent and selected segments: `--green` / `--ok`; on-accent text `--on-accent` (`.btn-primary`, `.seg-btn.active`). Secondary controls use `--blue`; segmented background uses `--inactive` → blue.
- Borders: `--border`; table rows `--row-border`. A late rule binds inputs/selects/secondary buttons/icon buttons/segmented frames to `--control-border` (currently aliases border in both themes).
- Negative/spend/error: `--danger` → red; positive/sales/success: `--ok` → green (`.val-neg`, `.val-pos`, login `.error/.ok`). Zero profit/ROI is positive. Missing ROI is an em dash; missing sale uses muted `N/A` (`app.js render`, `renderTotals`).
- Potential statuses: Special purple, Exciting teal, Great amber, Sell red (`.badge.special/.exciting/.great/.sell`, `app.js statusFromAvg`, `badgeClass`). Thresholds from mean potential: ≥90 Special, ≥85 Exciting, ≥80 Great, otherwise Sell; non-finite mean → N/A/base badge.
- Generic badge fills mix status with secondary surface at 12% Special, 10% Exciting/Great; Sell uses danger fill/border. **Current player-name badge spans override these fills, borders, padding and colours** to transparent/unbordered/muted text (`td:first-child .cell-contain span.badge`, broader span colour rule). Do not recreate these as colourful boxed chips in the current table baseline.
- Hover: `.btn:hover`, `.icon-btn:hover` declare border-hover; `.seg-btn:hover`, `.suggestions button:hover`, `tbody tr:hover td` use surface-hover. Hover selectors have higher specificity than the later shared border-colour rule, so secondary and neutral icon buttons retain border-hover. `.icon-btn.danger` has equal specificity to `.icon-btn:hover` and occurs later, so danger icon buttons retain danger-border on hover.
- Active press: `.btn:active` translates down 1px. Filled selected segment is green; secondary segment selection is text plus green underline. Title edit hover changes muted to text.
- Focus: inputs/selects change border to focus; `:where(button,a,input,select):focus-visible` draws 3px focus outline, offset 3px. Later input border rule does not override higher specificity `input:focus`.
- Disabled input: .55 opacity and not-allowed cursor. Loading suggestion button: .75 opacity and default cursor. No general designed disabled button/select variant exists.
- Editing card: exciting border and two exciting 18% mixed shadows (`.card.editing`). Flash row: exciting 22% to transparent over 1.3s (`@keyframes flashRow`, `.flash`); JS clears marker after 1400ms.
- Pitch uses themed gradient and panel/alternating row tokens; white line remains white in both themes (`.pitch::before/after`).
- Hardcoded non-theme colours: header gradient ends `rgba(255,255,255,0)`; suggestion shadow black .35; modal backdrop black .6 and shadow black .55; video black `#000`; scan border `rgba(57,255,20,.95)` and glow .55/.35/.22 with black .35 outside mask. These do not adapt to Light (`.app-header`, `.suggestions`, `.modal-backdrop`, `.modal-panel`, `#scan-video`, `.scan-box`).

## 4. Spacing, dimensions and responsive rules (implemented)

No global dimension, border, elevation or radius scale exists beyond `--radius-cell` and the spacing variables already listed.

| Element | Actual geometry | Source |
| --- | --- | --- |
| Page container | max 1440px; auto horizontal margin; 1rem padding; horizontal clamp(8px,6vw,128px) | `styles.css .container` |
| Page/title header | wrapped flex, first child flex 1/min-width 0; title gap 12px/bottom 8px | `.page-header`, `.save-title-row` |
| Header utilities | nowrap/gap 8px; buttons 36px high/flex none; dashboard anchor 36px wide, padding 0; SVG 18px | `.header-utilities`, `#back-to-dashboard`; `tracker.html` |
| Card | 2px border; radius 8px; padding clamp(8px,2vw,24px); gap 16px; margin 16px 0 | `.card`; transition .2s shadow/border |
| Card heading/actions | heading flex gap 12px; actions gap clamp(8px,2vw,16px), wraps | `.card-head`, `.actions` |
| Button | padding 9px 12px; 1px transparent border; radius 2px; flex 1; height content-dependent | `.btn` (no universal fixed button height) |
| Row actions | gap 4px, end aligned; padding 4px 6px, border 1px/radius 2px/min-height 32px | `.row-actions`, `.icon-btn`, late shared minimum |
| Title edit | padding 4px 0; no border/background; min-height 24px | `.title-edit` |
| Segment | frame border 1px/radius 2px/overflow hidden; button padding 6px 8px/min-height 32px | `.segmented`, `.seg-btn` |
| Secondary segment | no frame border/radius; button bottom border 2px | `.segmented-secondary .seg-btn` |
| Field grid | 4 equal minmax(0,1fr) columns; gap clamp(8px,2vw,16px); labels min-width 0 | `.grid`; lookup spans whole grid inline in `tracker.html` |
| Field | 40px high/full width; padding 8px; border 1px/radius 2px | `input, select`; player form bottom margin 10px |
| Select arrow | 36px right padding; 16px image positioned 12px from right | `select` |
| Checkbox | form 20×20px, no margin, start aligned; inline filter auto/native size, centred, gap 6px | `input[type=checkbox]`, `.checkbox-label` overrides |
| Search/filter select | minimum 260px / 160px | `.search`, `.select`; active select currently display none |
| Summary grid/tile | 4 columns/gap 12px; padding 10px 12px; border 1px/radius 2px; value top margin 4px | `.totals`, `.total` |
| Table | full width/min 440px; dashboard min 640px inline; collapse borders; wrapper scroll/border 1px/radius 2px | `table`, `.table-wrap`, `index.html` |
| Header/cell | header padding 5px; body padding 8px 0, min 36px, width clamp(2rem,20vw,10rem); outer side padding 8px | `thead th`, `tbody td`, first/last selectors |
| Cell content | standard 32px; wide clamp(6.5rem,25vw,12rem); numeric auto/min 9ch/padding inline 8px/no ellipsis | `.cell-contain`, `.wide`, `td.num .cell-contain` |
| Player name stack | gap 4px; no padding/margin; wide overflow ellipsis declaration | `td:first-child .cell-contain` |
| Badge | padding 4px 8px/border 1px/radius 2px/gap 6px; table override removes box | `.badge`, table span override |
| Suggestions | full field width; top 100%+4px; max-height 320px/scroll; z-index 50; shadow 0 10px 30px | `.suggestions`; rows padding 8px/gap 10px |
| Scanner modal | fixed inset 0/z9999; width min(720px,100vw−24px); height 100dvh−20px; margin 10px auto; radius 16px/padding 14px/border 1px; shadow 0 20px 60px | `.modal`, `.modal-panel` |
| Scanner sections | head gap 12px; body flexible/scroll/bottom padding 10px; foot gap 10px/top padding 10px/top border 1px/sticky bottom 0 | `.modal-head/body/foot` |
| Camera | video full width/auto height/max 55dvh/radius 12px/object-fit cover; zoom width 160px (generic input height 40px) | `#scan-video`, `#scan-zoom` |
| Scan guide | left/top 6%; width 88%/height 30%; radius 14px/border 2px; outside-mask spread 9999px | `.scan-box` |
| Pitch | full width/scroll/grid/content-sized rows; gap 12px 10px/padding 20px 4px; border 1px/radius 2px; centred | `.pitch`, `.pitch-wrap`; runtime grid areas in `app.js applyFormation` |
| Pitch markings | midfield line 1px at 50%; centre circle width 28%, square aspect, radius 999px/border 1px | `.pitch::before/after` |
| Position panel | effective width 64px (overrides 100% in same rule); radius 2px/blur 6px/overflow hidden/z1 | `.pitch-pos` |
| Position header/list | header padding 4px/gap 8px; list zero padding/gap; row final padding 4px 2px/gap 0/centred | `.pitch-pos .head`, `ul`, final `li` |
| Theme switch | 56×28px/padding 2px/border 1px/radius 999px; thumb 22×22 at top/left 2px, translates 28px for Dark; icons 16×16 | `.theme-switch`, thumb/icon rules; transition .2s |
| Footer | margin 18px 0 30px; flex wrap/gap 16px; main footer auto top margin/padding top 18px | `.footer`, `main > .footer`; theme control auto left margin/order 1 |
| Login | max-width 520px/margin 64px auto/padding 0 16px; rows flex-wrap/children flex 1/min-width min(180px,100%) | `login.html .login-wrap` and `.row` |

`styles.css` breakpoints: **≤900px** field and totals grids become two columns; **≤768px** page horizontal padding becomes 8px; **≥1200px** pitch lists receive max-height 220px (no list overflow rule, so overflow may be clipped by parent). There is no one-column mobile grid rule. Fluid typography and spacing continue between breakpoints. Login wraps by its 180px child minimum, not an explicit media query.

`body` ends as min-height 100dvh, height auto, column flex; main flexes to fill available space. HTML/body hide horizontal overflow, while tables and pitch scroll internally. `tracker.html` viewport additionally sets maximum-scale=1. Reduced-motion media query disables CSS transitions/animations universally; explicit JS `scrollIntoView({behavior:"smooth"})` is not altered by that CSS. Forced-colours media query restores native select appearance/removes SVG and uses a 3px Highlight underline on selected secondary segments.

## 5. Reusable component inventory and existing variants

Every row identifies both styling and actual instances or generating code. States listed are implemented; do not assume extra sizes, validation decorations or interactions.

| Component | Existing variants/states/behaviour | Source |
| --- | --- | --- |
| Page header/navigation | Dashboard text title + Sign out; Tracker save title + Edit title + dashboard SVG anchor + Sign out; optional Seed Player DB | `styles.css .app-header/.page-header/.header-utilities`; `index.html`, `tracker.html`; `app.js` title/seed listeners |
| Card/header/actions | Default card; player Editing card with exciting border/glow; uppercase title plus controls; wrapped action groups | `.card/.editing/.card-head/.actions`; all pages; `app.js loadIntoForm/clearForm` |
| Button | Base CSS treatment; actual primary and secondary buttons, danger Reset markup hidden; standard, utility 36px, row action min32px, underlined title edit | `.btn/.btn-primary/.btn-secondary/.btn-danger/.icon-btn/.danger/.title-edit`; HTML, `dashboard.js render`, `app.js render` |
| File trigger | Secondary label trigger Import JSON hidden; hidden JSON and CSV native inputs | `.file-btn`, `.hidden`; `tracker.html #import-file/#master-file`; `app.js` import/seed handlers |
| Text/number input | Text, lookup, search, money text with numeric inputmode, overall/potential numbers; email/password/code on login; normal/placeholder/focus/disabled | `styles.css input`; `tracker.html #player-form/#search`; `login.html`; `app.js applySeniorityToForm` |
| Select | Position placeholder disabled option, seniority, foot, current status, formation; active-player filter hidden | `select`, `.select`, `#filter-active`; `tracker.html`; `app.js applyFormation` |
| Checkbox | Large form Homegrown; native compact Show ex-players/Include shortlist; checked/unchecked with green accent | `input[type=checkbox]`, `.checkbox-label`; `tracker.html` |
| Theme switch | Light/Dark, focus; sun/moon SVG, sliding thumb; persists and synchronizes tabs | `.theme-switch*`; all HTML footers; `theme.js apply` |
| Segmented selection | Filled currency and seniority/pitch sort groups; underline pitch seniority group; inactive/hover/active | `.segmented/.seg-btn/.segmented-secondary`; `tracker.html`; `app.js setCurrency/setSeniorityFilter/setPitchSeniorityFilter` |
| Table/wrapper | Career saves vs player table; sticky first column/header; nowrap/scroll; row hover; player inactive italic/flash; player sortable ascending/descending header arrows | `.table-wrap`, `table`, `.cell-contain`, `.sortable`, `.inactive`, `.flash`; `dashboard.js render`, `app.js render/updateSortIndicators` |
| Row action group | Career Open/Edit/Delete; player Edit/Delete; delete danger treatment | `.row-actions/.icon-btn`; respective render functions |
| Status annotation | Base/N/A, Special, Exciting, Great, Sell class variants; current table renders plain muted text; auto-detected separate green small text | `.badge*`, table span override, `.auto-badge`; `app.js badgeClass/render/applyScanToForm`; `tracker.html` auto IDs |
| Autocomplete | Hidden/results/loading disabled/error; two text columns; hover; scrolling; choosing fills player fields; Escape dismisses | `.suggest-box/.suggestions/.s-main/.s-meta`, `#lookup-suggestions button.is-loading`; `app.js renderLookup/runLookup/hideLookup`; `.s-err` generated but has no CSS rule |
| Financial tile/grid | Spend negative, sales positive, profit/ROI positive or negative, missing ROI neutral dash | `.totals/.total/.label/.value/.val-*`; `tracker.html`; `app.js renderTotals` |
| Camera dialog | Hidden/open; camera requesting/ready/error and capture/OCR status; supported/disabled native zoom range; Close/backdrop close; auto-apply sufficient scan then close | `.modal*`, `.scan-*`; `tracker.html #scan-modal`; `app.js openScanModal/closeScanModal/startScanCamera`, Capture handler |
| Login panel/messages | Email/password actions; confirmation code block hidden/shown; status/muted/error/success text; empty message nodes hidden | `login.html .login-wrap` styles/IDs; `login.js showConfirmUI/setError/setOk/setStatus` |
| Empty/count/helper text | Dashboard no-saves message display toggle; player count; pitch empty “No players”; generic muted descriptions | `.sub/.subtle`, `index.html #empty-state`, `tracker.html #players-count`; `dashboard.js setEmpty`, `app.js render/renderPitch` |
| Pitch/position panel | Formation composition; populated/empty; alternating name rows; hidden count and OVR/POT metadata; no interactive player card | `.pitch/.pitch-pos`; `app.js renderPitch`; `formations.js FORMATIONS` |
| Footer | Shared theme switch; tracker/dashboard tip paragraph; login switch only | `.footer/.theme-control/.theme-footer`; all HTML |
| Native browser dialogs | Career create/rename prompts, tracker rename prompt, delete/reset/sign-out confirmations, validation/error alerts | `dashboard.js` event handlers; `app.js` listeners/readForm; browser-controlled appearance, no app modal styles |

No custom textarea, tooltip surface, toast, loading spinner, pagination, drawer, avatar, drag-and-drop pitch card or general validation/error-field component was found. HTML `title` attributes use native browser tooltips. Segmented groups declare `role=tablist`, but their buttons lack tab roles, aria-selected and a complete tabs keyboard pattern; these are selection/filter controls rather than implemented tab panels. Camera modal has dialog semantics but no explicit focus trap or Escape close handler in the audited code.

## 6. Application-specific compositions and behaviour

### Player form

`tracker.html #edit-card/#player-form`: full-width player-database lookup; Forename, Surname, Seniority (Senior/Youth/Shortlist), Homegrown checkbox, Position (GK/RB/CB/LB/CDM/CM/CAM/LM/RM/ST), Strong foot (Right/Left), Overall, Potential Min/Max, Current player (Yes/No sold), Cost and Sale. Overall/potential fields declare min1/max99/step1 and required; names/position/foot also have required attributes. Cost/sale are numeric-inputmode text fields, not number controls. `app.js readForm` uses alert validation; the required attributes alone do not establish a designed inline validation state because action buttons sit outside the form and use JS handlers.

Currency £/€/$ selection uses GBP/EUR/USD and rerenders formatted values (`app.js setCurrency`). Youth forces cost to zero and disables it (`applySeniorityToForm`). New state shows Add player/Clear; Editing shows Cancel/Update player/Clear, title changes and scrolls the card into view (`loadIntoForm/clearForm`). Scan auto-detection reveals small annotation spans (`applyScanToForm`); Rescan header becomes visible after scan application and hides on exit. Do not assume a separate “Apply scan” button: JS references `#btn-scan-apply`, but no such element exists in current HTML.

### Financial summary

`tracker.html .totals` has four tiles: Total spend, Total sales, Total profit and Average ROI. `app.js renderTotals` filters only by the shared seniority choice, not player text search or ex-player visibility. Profit is sale minus cost. ROI is `(sale-cost)/cost` for cost >0, and average includes finite ROI even if sale is zero. The displayed helper text says “non-zero cost and a sale value”; it is not an accurate condition description. Monetary amounts abbreviate K/M/B. The dashboard profit uses its own calculation (`dashboard.js getProfitGBP`, `fmtMoneyAbbrevGBP`) and appears muted without sign-dependent colour; this is a distinct current presentation.

### Career save controls

`index.html` exposes Add new career save; `dashboard.js render` produces Save/Created/Players/Profit/actions. Save IDs exist in generated `.subtle` spans but `#save-rows span.subtle` hides them. Create/rename use browser prompts; Delete uses a browser confirmation. `.save-name-input` is styled but unused: no inline save-name editor is currently generated. Tracker title edit also uses a prompt (`app.js` `#edit-save-title` handler). Open navigates to `tracker.html?save=…`. Seed Player DB is only revealed for localhost/127.0.0.1 or `?seed=1`; export/import/reset remain hidden markup despite their event handlers.

### Player table

`tracker.html` and `app.js render`: visible columns Player, Pos, Ovr, Pot, Cost, Sale and actions. Name includes status • seniority • foot metadata. Potential displays truncated mean potential, not the entered range. Foot/status/rank/homegrown/profit/ROI standalone columns are commented out in both header/template: do not inventory them as current columns. Search matches name/position; shared Senior/Youth/Shortlist/All controls synchronize Totals and Players. Show ex-players reveals sold rows, which are italic/muted. Sortable headers change active text and append ▲/▼ (`updateSortIndicators`). There is a player count but no dedicated table empty placeholder row.

### Squad pitch

`tracker.html #pitch-card`, `app.js applyFormation/renderPitch`, `formations.js FORMATIONS`: formation select plus Overall/Potential sort, independent Senior/Youth/Senior+Youth/Homegrown underline filter and Include shortlist checkbox. Only current/active players appear; text search also affects pitch. Players group by resolved position, sort descending with name tie-break, and alternate across repeated position slots. All matching names are rendered, not a limited starting eleven. Counts and rating metadata exist in DOM but are hidden by CSS. Empty panels show “No players”. There is no selection, editing or drag interaction on the panels.

Implemented formation options: 3-4-2-1, 3-5-2, 4-1-2-1-2, 4-1-3-2, 4-1-4-1, 4-2-1-3, 4-2-2-2, 4-2-3-1, 4-3-1-2, 4-3-3, 4-4-1-1, 4-4-2, 4-5-1, 5-3-2, 5-4-1. Default is 4-2-3-1; a valid saved preferredFormation overrides it and changes persist (`app.js` boot/formation listener). **3-4-2-1 currently declares only 10 position slots** (`formations.js FORMATIONS["3-4-2-1"].layout`); reproduce that baseline rather than silently adding a player.

## 7. Inconsistencies and baseline caveats

These are observations, not changes made:

1. `styles.css` duplicates `.hidden` (earlier !important wins), `.pitch-pos li/.name/.meta/.empty ul`, `.footer`, and `body` across the file. Pitch final rows are 9px centred/bold/gap0 rather than the earlier 12px/space-between/gap10; metadata/count are hidden. Empty list blocks contain comments only. `.num{}` is empty.
2. Border rules are split between base controls, hover selectors, danger variants and a late shared normalization rule. Specificity preserves hover-border on neutral/secondary controls and danger-border on danger icon buttons. Danger icon hover remains danger-border, while `.btn-danger:hover` changes to border-hover: similar destructive actions have different hover behaviour.
3. `--white`, `--black`, `--green`, etc. are theme-dependent role-like palette names (Light white is dark text; black is a light page). Alias semantics are useful, names are misleading for cross-theme primitive swatches.
4. `.mono` references missing `--mono`; `.save-name-input` is unused; `.player-meta` and generated `.s-err` have no direct style definitions. No line-height, shadow, dimension or border-width token system exists. Several spacing scale entries have no active consumers.
5. Hardcoded 7/10/14/18/20/30px spacing and 8/12/14/16/999px radii coexist with the spacing scale and 2px cell radius (`label`, helper text, footer, scanner, cards). Font exceptions include login16, suggestion10/8, pitch9, generic badge12 and footer13.
6. Table status classes imply colourful chips, but contextual span rules render them muted/unboxed. Inactive row colour also overrides numeric descendant text because `.cell-contain` is muted but nested `.val-pos/.val-neg` can retain their own colour; do not assume the whole sold row becomes a single muted colour.
7. Typography is fluid and often tiny at narrow widths, especially segments/table headings; h5/h6 use different family/weight defaults from h1–h4. Generic button sizing is content-based, while utilities/row actions have separate heights. Form checkbox and filter checkbox sizes differ.
8. Card headings generally do not wrap explicitly (`.card-head`); page/pitch headers do. Grids stop at two columns, search has a 260px minimum and pitch panels are 64px; overflow handling differs by region. Desktop pitch max-height does not provide its own scroll area.
9. Native prompts/alerts handle most errors and destructive workflows while only camera has a styled dialog. Login has text status/error/success; autocomplete errors have an unstyled div. There is no shared notification component.
10. Semantic tab/sort/dialog behaviours are incomplete as described above. Tracker viewport restricts zoom relative to other pages. Reduced motion disables CSS effects but leaves JS smooth scroll. These are audit findings; accessibility improvements are not existing variants.
11. Dashboard profit presentation and data-field calculation differ from tracker (`dashboard.js getProfitGBP` uses `cost/sale`; tracker `profitGBP` uses `cost_gbp/sale_gbp`). Summary ROI helper copy differs from implemented inclusion. Both deserve review before future visual/data changes.

## 8. Proposed Figma structure — recommendations only

The following organizes the existing implementation; these names are proposed mappings, not additional implemented CSS variables. No missing colours, sizes or component states should be created as if they were current.

### Pages and collections

Use pages `00 Audit & Source Map`, `01 Foundations`, `02 Components`, `03 Application Compositions`, `04 Screens`. Show Login, Dashboard and Tracker in both themes, plus Player Editing and Scanner Open as existing states. Record source selectors/functions on component descriptions.

Use a native Variables collection `FC26 / Theme` with **Dark** and **Light** modes. Preserve the exact audited palette values as `palette/white`, `palette/gray`, etc., with explicit descriptions of their inverted Light roles. Create semantic aliases from the actual variables: `color/background/primary` → black, `color/background/secondary` → navy, `color/text/primary` → white, `color/text/secondary` and `color/text/muted` → gray, `color/status/danger` and `color/status/sell` → red, `color/status/positive` → green, `color/status/special` → purple, `color/status/exciting` → teal, `color/status/great` → amber. Map remaining existing border/focus/hover/danger/pitch tokens directly with slash names. Keep existing aliases rather than inventing distinct values where the code shares one.

Use `FC26 / Metrics` for numeric `space/0` through `space/10` and `radius/cell=2`. Bind page-gutter aliases to 8 and 128 as the implementation does. Clamp expressions are not a single numeric Figma variable: document min/preferred/max formula and apply explicit measured viewport values in screen frames. If documenting hardcoded dimensions/radii in Figma variables for reuse, label them **proposed extraction of existing literals**, with their source selector; they are not current CSS tokens.

Represent `--pitch-bg` using theme-specific gradient paint styles and mixed badge fills/elevations using paint/effect styles or explicit fills. Document formulas and alpha percentages. Represent `--arrow` as a chevron asset with theme-bound stroke, not as a colour variable. `--heading` and `--body-font` define font family mappings. Do not add a monospace family until the missing implementation token is intentionally resolved.

### Text styles

Proposed names: `Heading/H1`, `Heading/H2 Card`, `Heading/H3 Scanner`, `Body/Default`, `Label/Field`, `Label/Segment`, `Action/Button`, `Action/Row`, `Input/Default`, `Input/Login`, `Table/Header`, `Table/Data`, `Table/Player Name`, `Table/Metadata`, `Summary/Label`, `Summary/Value`, `Autocomplete/Name`, `Autocomplete/Metadata`, `Pitch/Position`, `Pitch/Player`, `Footer/Default`, `Annotation/Auto Detected`.

For fluid roles, document the actual clamp and store viewport-specific style examples using the sampled app viewport, rather than claiming a universal fixed pixel size. Do not invent line-height values: measure rendered fonts when building the library, record measurements as measured values, and keep distinct from explicit CSS. Keep H4–H6 as defined-but-unused documentation rather than showing them as used screen typography.

### Components and properties

| Proposed native Figma component | Properties reflecting existing implementation | Source basis |
| --- | --- | --- |
| `Action/Button` | Appearance=Primary/Secondary/Danger; default/hover/pressed/focus only where visually defined; content text; Utility geometry as separate context | `.btn*`, `.header-utilities` |
| `Action/Row Button`, `Action/Title Edit` | Row neutral/danger; title default/hover/focus | `.icon-btn*`, `.title-edit`; preserve effective border cascade |
| `Field/Input`, `Field/Select` | Text/Number/Email/Password presentation where present; Default/Focus/Disabled input; placeholder/value; Login input typography override | `input/select`, `login.html` |
| `Field/Checkbox` | Form/Inline geometry; Checked boolean; label text | checkbox rules and markup |
| `Control/Theme Switch` | Dark boolean | `.theme-switch*`, `theme.js` |
| `Control/Segment`, `Control/Segment Group` | Filled/Underline; Selected boolean; text and group composition | `.segmented*`; do not add tab-panel components |
| `Surface/Card` | Default/Editing; heading/actions/content slots | `.card*` |
| `Table/Header Cell`, `Table/Data Cell`, `Table/Action Cell` | first/middle/last context, standard/wide/numeric, sortable active/direction where applicable | table selectors/render functions |
| `Player/Row`, `Career/Row` | Player current/sold/flash; Career text/actions; nested cells | `app.js render`, `dashboard.js render` |
| `Status/Player Text`, `Annotation/Auto Detected` | Special/Exciting/Great/Sell/N/A text; detected visibility | effective table badge and auto-badge rules |
| `Lookup/Popover`, `Lookup/Option` | results/loading/error, primary/meta text | `.suggestions*`, `renderLookup` |
| `Finance/Tile`, `Finance/Summary` | positive/negative/neutral value; four-tile composition | `.total*`, `renderTotals` |
| `Player/Form`, `Career/Header`, `Career/Save List` | New/Editing; existing content/visibility controls | tracker/index markup and JS |
| `Pitch/Position Panel`, `Pitch/Player Row`, `Pitch/Squad` | Empty/Populated; odd/even rows; existing formation compositions | `.pitch*`, `renderPitch`, `FORMATIONS` |
| `Dialog/Scanner` | open composition, status text, zoom enabled/disabled | modal markup and camera handlers |
| `Auth/Panel`, `Feedback/Auth Message`, `Layout/Footer` | confirmation visibility; status/error/success text; tip visibility | login markup/logic and shared footers |

Generic boxed `.badge` styles can be catalogued as **defined styling, not current boxed instances**, separately from the actually rendered player status text. Likewise hidden Import/Export/Reset and conditional Seed controls need a source-backed hidden/conditional annotation, not placement in the default screen. Native browser prompts/alerts should be documented as external browser UI, not recreated as an app dialog component.

### Future improvement proposals (not baseline)

After the baseline is reproduced and reviewed, consider extracting existing hardcoded metrics/effects into semantic tokens, clarifying palette names, consolidating duplicate CSS, harmonizing destructive-action hover states, defining missing monospace intent, reconciling badge contextual overrides, harmonizing repeated field/action typography and improving keyboard/focus/zoom behaviour. Review formation slot count and financial copy/data mapping independently. Any new responsive layout, new state, token value or component would be a later design change and must be labelled as such.
