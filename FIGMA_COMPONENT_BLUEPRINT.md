# FC26 Transfer Tracker — Native Figma Component Blueprint

Audit date: 13 October 2026. Deliverable: a source-backed blueprint, not a library build. Application code, CSS, configuration, AWS resources, deployed functionality and Figma were not modified. `FIGMA_FOUNDATIONS_AUDIT.md` was used as the starting point and checked against all nine requested source files.

## 1. Evidence, scope and reading conventions

**Evidence is static unless explicitly marked otherwise. No browser-computed measurements were collected.** No callable browser inspection tool or installed Playwright/Puppeteer automation dependency was found in this session. A local Chrome application exists, but it was not launched or automated. Authenticated screens, downloaded font metrics, native controls, camera streams and browser dialogs were not visually verified. This report does not claim that static arithmetic is rendered evidence.

The existing Figma Foundations file was described by the user but no file key, URL, variable export or connected file context was provided. Its actual variable names, IDs, published libraries, numeric values and line-height values have **not been inspected**. `_primitives`, `Colour Modes`, `Sizes`, and the Tailwind Sizing, Spacing and Type libraries are the target collections/libraries supplied by the user. Mapping below is a binding plan, not an assertion that particular variable paths already exist. The earlier audit's proposed `FC26 / Theme` and `FC26 / Metrics` collections must not replace the user's existing foundations.

Evidence codes:

- **S**: declaration, markup or JavaScript verified in the listed source files.
- **I**: static inference/arithmetic, with assumptions stated; not computed CSS or a measured bounding box.
- **B**: browser measurement. There are **zero B records** in this audit.
- **P**: proposed native Figma architecture/build procedure; not an implemented application behaviour.
- **U**: unresolved browser or Figma evidence. Preserve the source expression and resolve before claiming visual sign-off.

Dimensions below are CSS pixels; global `box-sizing:border-box` applies to every element. A literal without `var(...)` is a hardcoded implementation value even if an existing library might contain the same number. Default line-height is inherited/browser `normal` everywhere: no application line-height declaration exists. Do not turn `normal` into a guessed pixel or percentage value. Borders/radii/padding/gaps omitted by a child inherit only where CSS actually inherits; use the shared specification and exact rule ledger in Appendix A for cascade context. Transparent/no border/no padding on an ordinary div is distinct from browser default button/list/heading styling.

Source anchors are selectors, IDs and function names, supplemented by the complete ordered CSS ledger, DOM trees, generated templates and formation layouts in the appendices. These appendices are part of the specification, not optional background. Every node in a DOM tree inherits its typography/colour/layout context unless an ordered CSS rule or inline style overrides it.

## 2. Complete inventory and reuse boundaries

Page abbreviations: **D** Dashboard (`index.html`/`dashboard.js`), **T** Tracker (`tracker.html`/`app.js`/`formations.js`), **L** Login (`login.html`/`login.js`). “Conditional” means source logic reveals it; “hidden only” means implemented markup has no current reveal path. Proposed names are component identities, not new CSS selectors.

### 2.1 Base components

| ID / proposed master | Pages | Source / rendered content | Current variants and visibility |
| --- | --- | --- | --- |
| B01 `Action/Button` | D T L | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`; button text or dashboard SVG | Primary/Secondary; Danger only hidden Reset; default/hover/pressed/focus. Utility geometry differs. No general disabled/loading design |
| B02 `Action/Row` | D T | `.icon-btn`, `.icon-btn.danger`; text, despite name | Neutral/Danger; hover/focus; min-height32. No inherited `.btn:active` transform |
| B03 `Action/TitleEdit` | T | `.title-edit`, `#edit-save-title` | Default/hover/focus; text underline; launches native prompt |
| B04 `Field/Input` | D* T L | `input`, text/numeric-inputmode/number/email/password; *D has unused `.save-name-input` only | Placeholder/Value/Focus; Disabled input (Youth cost, scanner zoom); Tracker/Login typography contexts |
| B05 `Field/Select` | T | `select`, themed CSS chevron | Default/Focus; native menu; position placeholder; five select roles including hidden active filter |
| B06 `Field/Checkbox` | T | `input[type=checkbox]` | Form20px/Inline native geometry; checked/unchecked/focus |
| B07 `Control/ThemeSwitch` | D T L | `.theme-switch`, thumb, sun and moon SVG | Light/Dark via `aria-checked`; focus; .2s thumb transition |
| B08 `Control/Segment` | T | `.seg-btn` in `.segmented` or `.segmented-secondary` | Filled/Underline × Selected/Unselected; hover/focus; no designed disabled state |
| B09 `Text/Role` styles, not separate master per string | D T L | h1/h2/h3/body/label/helper/value/count/footer/error | Roles detailed in §3; h4–h6/`.hint`/`.font-head` defined but unused |
| B10 `Annotation/AutoDetected` | T | `.auto-badge`, seven `#auto-*` spans | Text only, conditional visibility; cleared individually on manual edits |
| B11 `Status/PlayerText` | T | `.badge` inside first-cell spans | Special/Exciting/Great/Sell/N/A; contextual muted unboxed styling. Generic boxed badge CSS is defined, not currently rendered standalone |
| B12 `Table/HeaderCell` | D T | `thead th`, `.sortable`, `.arrow` | First/Middle/Last; Tracker unsorted/ascending/descending; Dashboard static |
| B13 `Table/DataCell` | D T | `tbody td`, `.cell-contain`, `.wide`, `.num` | Name/Compact/Numeric/RawDashboard/Actions; sign/missing text treatments and current/sold context |
| B14 `Lookup/Option` | T | `.suggestions button`, `.s-main`, `.s-meta` | Result/Disabled loading; default/hover/focus; name+metadata |
| B15 `Feedback/Text` | L T D | `.muted/.error/.ok` in Login; `.s-err` in lookup; `.sub/.subtle` helpers | Auth status/error/success; lookup error has inherited field-label treatment, no dedicated error CSS |
| B16 `Finance/Value` | T | `.val-neg/.val-pos/.val-muted`, summary `.value` | Negative/Positive/Neutral/Missing; zero counts as positive when class chosen by JS |
| B17 `Pitch/PlayerRow` | T | `.pitch-pos li`, `.name`, hidden `.meta` | Odd/Even; name/empty text; 9px bold, max48px name; no interaction |
| B18 `Camera/Zoom` | T | `#scan-zoom` range input | Supported/Disabled; native track/thumb, not custom styled slider |
| B19 `Icon/*` assets | D T L | inline SVG sun/moon all pages; dashboard grid T; CSS chevron T | CurrentColor icons; swap asset instances, not icon-name variants on buttons |
| B20 `Camera/Guide` | T | `.scan-overlay/.scan-box` | Fixed visual guide, neon border/glow/outside mask; not theme accent |

### 2.2 Composed components

| ID / proposed master | Pages | Structure / nested base instances | Variants / source |
| --- | --- | --- | --- |
| C01 `Surface/Card` | D T L | content frame with exposed nested composition instance | Default/Editing (T only); `.card/.card.editing` |
| C02 `Layout/CardHeader` | D T | h2 + action frame | Standard nowrap/Pitch wrap; `.card-head/.pitch-header` |
| C03 `Layout/Actions` | D T L | button/control instances | Wrapping actions / nowrap header utilities / row actions / Login row; separate geometry presets |
| C04 `Field/Labeled` | T L | label + control + optional auto annotation | Tracker label wraps control; Login label and input siblings inside field div; preserve 7px spacing and Login margin |
| C05 `Field/Lookup` | T | full-span labeled input + overlay popover instance | Closed/Results/Loading/Error; `renderLookup/runLookup/hideLookup` |
| C06 `Lookup/Popover` | T | option list or error text | Height hugs up to320; source no-results closes popover; no “No results” row |
| C07 `Control/SegmentGroup` | T | nested B08s | Currency3, Seniority4, PitchSort2, PitchSeniority4; filled/underline; selected index |
| C08 `Control/CheckboxLabel` | T | inline checkbox + label text | Show ex-players/Include shortlist; checked boolean |
| C09 `Table/Frame` | D T | scrolling viewport + header row + repeated domain rows | Career min640 / Player min440; sticky first column and headers |
| C10 `Player/NameCell` | T | surname + metadata line(status • seniority • foot) | Current/Sold; status text; surname-only display |
| C11 `Player/Row` | T | seven data cells, Edit/Delete actions | Current/Sold; default/hover/flash; sale amount or N/A; potential mean or dash |
| C12 `Career/Row` | D | Save/Created/Players/Profit/three action cells | Default/hover; hidden save-ID span; muted profit regardless of sign |
| C13 `Finance/Tile` | T | label + value instance | Four label roles; Positive/Negative/Neutral/Missing |
| C14 `Pitch/PositionPanel` | T | head(pos code + hidden count) + list of B17 | Empty/Populated; fixed64px width; variable row count |
| C15 `Pitch/Field` | T | themed field, line/circle layers, position-panel instances | Fifteen formation layouts; scroll; content-driven height |
| C16 `Camera/Frame` | T | video preview + guide overlay | Camera pending/stream/failed content; full width, intrinsic video height |
| C17 `Dialog/Panel` | T | head + body viewport + foot | Scanner only current composition; don't invent general app dialog family |
| C18 `Layout/Footer` | D T L | tip paragraph optional + ThemeSwitch instance | D/T main footer; L standalone `.footer.container.theme-footer` |
| C19 `Layout/PageHeader` | D T | title stack + utility actions | Dashboard/Tracker; Tracker edit title/dashboard link/conditional seed |
| C20 `Auth/Confirmation` | L | helper + wrapping code/confirm/resend row | Hidden/Shown; no new screen route |
| C21 `Auth/MessageStack` | L | status + error + success text instances | Empty nodes hidden; error/success mutually cleared, status separate |
| C22 `Maintenance/FileTrigger` | T | secondary label or button + hidden native file input | Import hidden-only; Seed conditional; file picker is external native UI |

### 2.3 Full application components

| ID / proposed master | Pages | Nested compositions and rendered states |
| --- | --- | --- |
| A01 `Career/SaveList` | D | Card → CardHeader(Add new career save) → CareerTable → empty message. Empty/populated; initial tbody blank while data loads, no loader |
| A02 `Player/Editor` | T | Card → header/currency → Scan → optional Rescan → display name → form grid/lookup/12 fields → actions. New/Editing, Youth disabled cost, auto annotations, lookup overlay |
| A03 `Finance/Summary` | T | Card → header/shared seniority → four FinanceTiles → helper. Empty/positive/negative/missing ROI |
| A04 `Player/List` | T | Card → header/shared seniority + hidden active filter → search → ex-player checkbox → count → PlayerTable. Populated/zero-match/sold-visible/sorted/flashed |
| A05 `Pitch/Squad` | T | Card → header/sort → formation select → helper → independent filters → PitchField. Empty/populated/mixed; fifteen formations |
| A06 `Camera/Scanner` | T | full-screen overlay → backdrop + DialogPanel(header Close/body helper+CameraFrame/footer Capture+Zoom+Status). Hidden/open and status stages |
| A07 `Auth/Panel` | L | Card → email/password row → sign-in/signup row → conditional Confirmation → MessageStack. Idle/working/error/success/confirmation |
| A08 `Layout/AppShell` | D T | PageHeader + main container + full components + Footer; Dashboard/Tracker composition, Login uses different shell |
| A09 `Layout/AuthShell` | L | Login wrap(title/helper/AuthPanel) + footer container; narrow content, vertical flow, no app header |

### 2.4 Complete screens

| ID / screen | Required evidence-backed compositions |
| --- | --- |
| S01 `Screen/Dashboard` | AppShell + SaveList, populated and no-saves; Dark/Light; desktop/tablet/mobile |
| S02 `Screen/Tracker` | AppShell + Editor + Summary + List + Squad in that order; New and Editing; Dark/Light; desktop/tablet/mobile |
| S03 `Screen/Login` | AuthShell + AuthPanel; Idle/Confirmation/Working/Error/Success; Dark/Light; desktop/tablet/mobile |
| S04 `Screen/TrackerScanner` | S02 instance with A06 overlay; camera ready/unavailable/low-confidence/OCR progress examples; zoom supported/unsupported |

Screen variants are exemplars of existing conditional UI, not separate implemented routes. Do not multiply every possible form field/filter/value into a screen variant. Show state specimens as nested-instance overrides.

Shared across **all three**: button family, input family (Login override), fonts/text roles, card surface, focus styling, theme assets/switch, footer foundation and theme variables. Shared **D/T**: app header shell, card header, action layouts, table primitives/wrapper, row action buttons, name-cell outer geometry, empty/helper text. **Tracker-only**: segment groups, select/checkbox usage, lookup, financial tiles, scanner, player rows/editor and pitch. **Login-only**: auth field row wrapping, verification composition, status/error/success stack and narrow shell. Reuse styles rather than making every heading or helper a component master.

## 3. Exact shared specifications

These are **S** CSS specifications, not browser measurements. Appendix A preserves every declaration, including pseudo-elements, media queries, theme values and later overrides. Per-component tables below inherit this section explicitly.

### 3.1 Typography and colour inheritance

`H` = `var(--heading)` = Special Gothic Expanded One, sans-serif. `R` = `var(--body-font)` = Rubik, sans-serif. All pages request Rubik upright/italic weights300–900 and Special Gothic Expanded One through Google Fonts. Loaded fonts and actual font metrics remain U. Weight “normal” is normally400; UA-dependent values are labeled rather than certified. All line heights below are **normal/inherited, unresolved numeric height**.

| Role / consumers | Family / size / weight | Tracking, transform, colour and geometry |
| --- | --- | --- |
| Body / p / helpers / auth messages | R / `--type-body` / normal | `--text`; helpers `--muted`; `.sub` margin0 0 14; `.subtle` margin10 0 0 |
| h1 / titles | H / `--type-h1` /400 | text; margin0 0 8; title-row h1 margin0; overflow-wrap:anywhere |
| h2 / CardHeader | H / `--type-h2` /400 | card uppercase; margin0 |
| h3 / Scanner | H / `--type-h3` /400 | inline margin0; no uppercase rule |
| Player form display name | H / inherited body size /normal | `--white`; .02em; margin8px 0 |
| Field label | H / `--type-label` /normal | `--txt-secondary`; uppercase; .05em; flex column gap7 |
| Input/select | R / `--type-input` /400 | text; 0em; placeholder muted/opacity1; Login input16px |
| Button | H / `--type-label` /400 | uppercase/.02em; text or on-accent |
| Row action | H / `--type-label` /700 | uppercase/.05em; text |
| Title edit | H / `--type-label` /UA button normal | muted → text hover; underline offset3; no uppercase declaration |
| Segment | H / `--type-toggle-label` /UA button normal | uppercase; muted, selected on-accent; Underline selected text |
| Inline checkbox label | H / `--type-toggle-label` /normal | muted; inherits uppercase/.05em from label |
| Auto annotation | H / `--type-toggle-label` /400 | green; inherits label uppercase/.05em; no box |
| Table header | H / `--type-table-head` /UA th bold | uppercase; muted; active sort text; nowrap |
| Compact/numeric cell content | R / `--type-table-data` /500 | .02em; muted container; nested amount classes override |
| Name cell | H / `--type-table-data` /500 | .02em; white; strong inherits500; sold italic/muted |
| Name metadata / status | R / `--type-table-data` /inherited500 | muted; .02em inherited; table overrides generic badge12px/colours |
| Dashboard raw middle td | R / `--type-table-data` /500 | muted/.02em; raw numeric text centered, no9ch child |
| Financial label/value | H / `--type-label` and `--type-h2` /normal | label muted/uppercase/.05em; value margin-top4; value colour per role |
| Lookup option | H /10px /UA button normal; main600 | inherits label colour `--txt-secondary`; uppercase from parent label; no button uppercase declaration needed |
| Lookup metadata | H /8px /UA button normal | .75 opacity; nowrap; same inherited label context |
| Lookup error | H /inherited `--type-label` /normal | inherits label uppercase/.05em/secondary colour; no `.s-err` rule or inset padding |
| Pitch position / player row | R /9px /700 | position .02em; player inherited normal tracking; text; name truncates48px |
| Footer | R /13px /normal | muted; paragraph margin0 in D/T footer |
| Scanner status | R /inherited body /normal | muted; `.subtle` margin-top10 plus margin-left:auto |
| Auth error/success | R /inherited body /normal | danger/ok; pre-wrap; status muted without pre-wrap |

Colour aliases: page/control/table=`--bg-primary`→`--black`; card/modal=`--bg-secondary`→`--navy`; text=`--text`→`--white`; secondary/muted=`--gray`; control stroke=`--control-border`→`--border`; selected/action accent=`--green`; on-accent=`--on-accent`; danger/negative=`--danger`→`--red`; positive=`--ok`→`--green`. Exact Dark/Light definitions are in Appendix A and the starting audit §1. Themes change `color-scheme` as well as custom properties, so native widgets may change too.

### 3.2 Layout shells, surfaces and text

| Component IDs / source | Exact HTML structure (see Appendix B) | Dimensions, spacing, borders, alignment and responsive behaviour |
| --- | --- | --- |
| A08/S01/S02; `.container`, `body>main` | body → header → container → PageHeader; main.container → cards + footer | Body margin0/background-primary/min-height100dvh/height:auto/flex column; html+body overflow-x:hidden. Main width100%, flex1, column. Container max1440, horizontal margin:auto, top/bottom1rem; inline clamp(8px,6vw,128px), overridden8 at≤768 |
| C19; `.app-header/.page-header` | `.card-head.page-header` → title stack + `.actions.header-utilities` | Header gradient surface-hover at top to transparent white at bottom; no active bottom border. Header flex row, align-start, space-between, gap12, wrap. First child flex1/min-width0. TitleRow row/center/wrap/gap12/bottom-margin8 |
| C03 utility; `.header-utilities` | dashboard link (T) + conditional Seed(T) + Sign out | nowrap/gap8. Buttons flex:none/inline-flex/center/height36. Dashboard link36×36/padding0/SVG18×18/stroke2/viewBox24. Secondary background/control stroke/radius2. Standard button text typography |
| C01; `.card` | section/div → content compositions | Width follows parent, height content-based; column/gap16, pad clamp(8px,2vw,24px), margin16px 0, 2px border/radius8/bg-secondary. Editing exciting stroke; shadows0 0 0 2px and0 0 28px with exciting18% transparent mix. .2s ease shadow/border transition |
| C02; `.card-head` | h2 + actions/control | Horizontal center/space-between/gap12; standard header has no wrap declaration; Pitch wraps, segment margin-left:auto. No own fill/stroke/padding; h2 role above |
| C03 actions; `.actions/.row-actions` | variable number buttons/segments | Actions row/center/wrap/gap clamp(8px,2vw,16px). `.btn flex:1` distributes within containing flex row; not universal hug sizing. Row-actions gap4/end alignment/no declared wrap |
| C18; `.footer/.theme-control` | theme-control + optional tip p | footer flex/align-end/space-between/gap16/wrap; font13/muted; margin18px 0 30px. D/T `main>.footer` margin-top:auto/padding-top18, p flex1/margin0; theme-control row/margin-left:auto/order1. L footer also container/theme-footer; margin-top:auto, no main-child padding rule |
| A09; `login.html .login-wrap` | title + intro p + auth card; sibling footer | max-width520/margin64px auto/pad0 16; **width not explicitly set**, so used width depends on body flex cross-axis sizing/intrinsic content; don't assert a fixed520 used width. Auth footer is not inside main. Heading h1 margin-bottom8; intro p uses UA paragraph margins plus muted colour |
| B09/B15; helpers | p/div/span according to trees | `.sub`0 0 14; `.subtle`10 0 0; player count inline8px 0 6; Dashboard empty inline margin-top12, other UA p margins remain; pitch hint margin0. Missing `--mono` means Dashboard empty-state span has no established monospace family |

Because main is flex column, sibling card vertical margins do not collapse. A Figma gap16 between cards would understate the CSS margin16+16 separation; retain explicit margins as wrapper spacing (32 between adjacent card border boxes, plus any other parent layout spacing). Card child margins are additional to gap16. Confirm used geometry in the browser rather than removing margins while translating to Auto layout.

### 3.3 Actions and selection controls

| Component | Box, typography and paints | Implemented interactions / variants |
| --- | --- | --- |
| B01 Button | pad9 vertical/12 horizontal; 1px transparent stroke; radius `--radius-cell`2; surface-hover/text; no fixed default height; flex1. Primary green/on-accent; Secondary blue/control-border; Danger danger-bg/danger-border/text | Hover border-hover; active translateY1px; keyboard outline3px focus offset3. Header36 high; standalone Scan/Rescan in card stretch cross-axis. Modal Close is `.btn flex:1` beside h3, not automatically compact |
| B02 RowAction | pad4/6; min-height32; 1px control-border/radius2; surface-hover/text; Danger danger-bg/danger-border | Neutral hover border-hover; Danger hover retains danger-border (later equal-specificity rule). Focus outline; no `.btn` press transform |
| B03 TitleEdit | pad4px 0; min-height24; border0; background:none; label font; underlined | Muted default/text hover; focus ring; prompt UI external |
| B08/C07 FilledSegment | frame inline-flex/stroke1 control-border/bg inactive/radius2/overflow:hidden; child pad6/8/min-height32/border0/transparent | Unselected muted; hover surface-hover. Active green/on-accent wins over hover by source order. Focus ring may be clipped by frame. Child widths follow content; no equal-width rule |
| B08/C07 UnderlineSegment | frame transparent/border0/radius0; each child bottom stroke2/control-border/pad6/8/min-height32 | Unselected muted; hover text/no fill; active text/green bottom stroke; filters wrapper permits segment wrapping. Forced-colors active stroke3px Highlight/native system colour |
| B07 ThemeSwitch |56×28/pad2/stroke1 border/radius999/bg-primary/muted; inline-flex center/space-around. Thumb22×22/left2/top2/radius999/blue; icons16×16/stroke1.8 | Dark aria-checked=true moves thumb28px right; last icon text. Light thumb at left, sun (second child) text. .2s ease; localStorage `fc26-theme`, default Dark; no OS preference selection. Global focus ring |
| B19 Icons | grid18×18 stroke2, sun/moon16×16 stroke1.8, chevron16 background asset stroke2 | Preserve SVG path data in Appendix B; no styled tooltips, HTML titles use native browser tooltip |
| C22 FileTrigger | hidden secondary label, inline-flex/center via `.file-btn` but inherits label7px gap/.05em unless overridden by `.btn` typography; CSV Seed uses actual button | JSON import/export/reset remain hidden; file inputs invisible; no upload drop zone/progress UI |

All keyboard-focusable button/a/input/select elements receive `:focus-visible`3px focus outline with offset3. Input/select focus also changes border. No generic disabled button opacity, spinner, loading indicator, selected navigation state or bespoke link style is implemented. Native disabled LoadingLookup is a specific case, not a new Button state for every button.

### 3.4 Fields, lookup and auth feedback

| Component | Structure and exact geometry | Content / implemented states |
| --- | --- | --- |
| B04 Input | input height40/width100%/max-width100%/pad8/stroke1 control-border/radius2/bg-primary/text; R/input size/400/0em | Placeholder muted; focus border focus; disabled opacity.55/cursor not-allowed. Number colour-scheme inherit; native spin controls. Login font16, unchanged height40 |
| B05 Select | same box; appearance:none; right-pad36; chevron16 at right12 center | Native options; forced-colors appearance:auto/no image. No app-designed option menu. `.select` min160 hidden active filter only |
| B06 FormCheckbox |20×20/margin0/align-self:start; generic input styles still cascade; native appearance; green accent | Checked/unchecked/focus; exact native glyph geometry U |
| C08 InlineCheckbox | label row/inline-flex/center/gap6/zero pad/border/no bg | checkbox width:auto/height:auto/max-width:none/flex:none/align-self:center; not20px. Native used size U |
| C04 LabeledField | T label flex-column/gap7/min-width0, wraps control and optional annotation | No filled error-field component; required attributes plus JS alerts. Lookup label grid-column1/-1. Login field div contains separate label/input; label margin-bottom7 |
| B10 AutoDetected | inline-block/no bg/no border/no shadow/radius0/pad0/margin-top0 | “Auto-detected”; seven fields only. Source layout still label gap7 from control to span |
| C05/C06 Lookup | label relative; popover absolute left0/right0/top calc(100%+4px)/z50/bg black/stroke1 border/radius2/max-height320/scroll-y/shadow0 10 30 black.35 | min3 search chars or initial `j.`; debounce220ms; loading polling300ms; max50 result request. Results show name and pos • overall/potential • L/R. Empty results hide; Escape hides; blur hides after150ms |
| B14 LookupOption | full width/button transparent/no border/pad8/row gap10/space-between/baseline/font10; main600/meta8/.75/nowrap | Loading button disabled/.75 opacity/default cursor with progress metadata. Hover surface-hover. Fields auto-fill on click; lookup clears and closes |
| B15 LookupError | unstyled div `.s-err` inside popover; inherited label typography/colour/uppercase; no own padding | Lookup errors and **Add-player failure** both inject “Lookup error: …”; preserve unusual implemented path rather than invent a toast |
| C20 AuthConfirmation | column gap16; helper p margin0 0 8; wrapping row gap form-fields | Code input + Confirm primary + Resend secondary; whole block hidden until required, or unconfirmed sign-in |
| C21 AuthMessages | three div siblings in auth card, each has no own box/pad/stroke/radius | `:empty` hidden; status muted; error danger/pre-wrap; success ok/pre-wrap. setError clears success; setOk clears error; status separately updated |

Login `.row` flex/wrap/gap form-fields; **every direct child** flex1/min-width:min(180px,100%), including buttons and verification input. This controls wrapping by available width, not the900px grid breakpoint. Row control height can depend on wrapped button text. `.login-wrap` content width and resulting wraps need a rendered measurement before final screen sign-off.

### 3.5 Tables, badges and finance

| Component / selectors | Exact box/layout and children | Effective typography/paints/states |
| --- | --- | --- |
| C09 TableFrame | wrapper overflow:auto/stroke1 border/radius2 → table width100/min440/bg-primary/border-collapse:collapse; Career inline min640 | Scroll viewport hugs content height; no fixed height. Native table column sizing, not seven equal Figma columns |
| B12 HeaderCell | th sticky top0/pad5/bottom stroke1 border/center/nowrap; first left-pad8/left; last right-pad8/right | H/table-head/UA bold/muted; first-column sticky left0/z2/bg-primary. Other headers have no explicit background, preserve until measured |
| B12 SortIndicator | active header text; span arrow absolute/font6/weight900/margin2px 0 0 3px | ▲ asc/▼ desc; active Ovr desc default; no fixed arrow container width in source |
| B13 DataCell outer | td pad8px 0/bottom stroke1 row-border/vertical-align:middle/center/nowrap/min-width36/width clamp(2rem,20vw,10rem) | First/last side-pad8. Actual used column widths table/content-dependent U; first sticky left0/z2/bg-primary/bold outer |
| B13 compact content | `.cell-contain`32px wide/margin0 auto/overflow:hidden/ellipsis/center | R/data/500/.02em/muted; width means short columns can clip despite wide td |
| C10 name content | `.wide` clamp(6.5rem,25vw,12rem); first-cell flex-column/gap4/pad0/margin0/left/overflow:hidden | H/data/500/.02em/white; T surname then nested metadata div/span/status; D strong name then hidden ID span |
| B13 Numeric content T | width:auto/min-width9ch/inline-pad8/overflow:visible/text-overflow:clip | Cost span danger; sale>0 span ok, otherwise muted N/A. `9ch` depends on font; no guessed px substitute |
| B13 Raw dashboard | td text directly for date/count/profit, no content wrapper | R/data/500/muted/.02em; numeric class alone does not right-align because `.num{}` empty |
| C11 PlayerRow | Player/Pos/Ovr/Pot/Cost/Sale/actions; Edit neutral/Delete danger | Hover td fill surface-hover. Sold `.inactive .cell-contain` italic/muted; descendant coloured cost/sale can retain colours. Flash background exciting22% → transparent1.3s ease-out; marker clears1400ms |
| C12 CareerRow | Save/Created/Players/Profit/actions; Open/Edit neutral/Delete danger | Hover td fill; no sorting/flash/sold variant; name default Untitled save; locale-formatted created date; profit abbreviated GBP/muted, not green/red |
| B11 contextual status | inline-flex badge nested inside metadata span; effective pad0/border:none/background:transparent/radius2/gap6 | Parent first-cell span rule wins status foreground: muted and data size. Don't build coloured pills for these instances |
| Generic boxed badge (unused) | inline-flex/center/gap6/pad4 8/stroke1 border/radius2/font12 | special12%/exciting10%/great10% mixed with bg-secondary, status border/text; sell danger-bg/border/sell. Catalog defined-but-unused, exclude default screen |
| C13 FinanceTile | border1 border/bg-primary/radius2/pad10 12 → label + value margin-top4 | H label/value; spend danger, sales ok, profit sign-based, ROI dash neutral or sign-based |
| A03 FinanceGrid | `.totals`4 equal minmax(0,1fr) columns/gap12;2 columns≤900 | No one-column mobile rule; value heights intrinsic; helper follows as separate card child |

Status thresholds: finite mean potential≥90 Special,≥85 Exciting,≥80 Great, else Sell; null/non-finite→N/A. Pot column shows truncated mean or “—”. Name uses surname only (`displayName`), with fullName fallback only in pitch. Standalone Foot/Status/Rank/Homegrown/Profit/ROI table columns are commented out in both HTML/template and are **not current rendered columns**.

Summary filters by shared Senior/Youth/Shortlist/All only; All excludes Shortlist. It ignores text search and ex-player checkbox; sold players can still contribute. ROI includes finite `(sale-cost)/cost` for cost>0 even when sale0; average helper copy is not fully accurate. Initial markup profit£0 has no sign class until render; render assigns positive for zero. Current empty summary after render: spend£0 negative, sales£0 positive, profit£0 positive, ROI—neutral. Keep dashboard profit presentation distinct.

### 3.6 Pitch and scanner

| Component / selectors | Structure, geometry and alignment | Paints, typography and states |
| --- | --- | --- |
| C15 PitchField | wrapper width100/overflow:auto/flex/center; pitch width100/grid/content rows `minmax(min-content,max-content)`/justify:center/align-content:start/overflow:scroll/isolation:isolate/pad20 4/gap12 vertical10 horizontal/stroke1 border/radius2 | Theme pitch gradient; runtime grid-area templates replace CSS fallback. Five columns declared by each template; no explicit grid-template-columns sizes |
| Pitch marks | before absolute left0/right0/top50%/height1/z0; after left50/top50/width28%/aspect1/radius999/translate(-50%,-50%)/stroke1/z0 | Both pitch-line white in both modes; pointer-events:none. Absolute layers outside Auto layout |
| C14 PositionPanel | div relative/z1/width64/radius2/backdrop-blur6/overflow:hidden → head + ul | Head row center/gap8/pad4/bg pitch-panel; code R9/700/.02em; count hidden. UL list-style:none/margin0/pad0/grid/gap0/pitch-panel/bottom-radius2 |
| B17 PitchRow | li row/baseline/center/gap0/nowrap/pad4 2 | R9/bold; odd pitch-row/even pitch-row-alt. Name max48/ellipsis/overflow-hidden; meta hidden. Empty list has one row “No players”, same styling |
| Pitch desktop cap |≥1200: ul max-height220; no ul overflow declaration | Parent panel overflow:hidden; list can clip, not its own scrolling list. No fixed pitch height; height depends on row content and formation tracks |
| A06/C17 modal | fixed inset0/z9999; absolute backdrop inset0; relative panel width min(720px,100vw−24px)/height100dvh−20px/margin10px auto/pad14/border1/radius16/flex-column | Backdrop black.6; panel bg-secondary/border/shadow0 20 60 black.55. Hidden display:none!important |
| Modal head/body/foot | Head row/center/space-between/gap12; body flex1/overflow:auto/bottom-pad10; foot row/center/wrap/gap10/top-pad10/top-border1/sticky bottom0 | Foot bg-secondary. h3 inline margin0. helper `.subtle` margin-top8; otherwise body role. Status margin-left:auto plus subtle10 top margin |
| C16 CameraFrame | relative width100 → video + absolute overlay inset0; video width100/height:auto/max-height55dvh/radius12/object-fit:cover | Video black#000; real used height depends on intrinsic stream dimensions. Video inline baseline behaviour also browser-dependent; no fabricated preview height |
| B20 Guide | absolute left6%/top6%/width88%/height30%;radius14/stroke2 rgba(57,255,20,.95) | Mask shadow0 0 0 9999 black.35; outer glow0 0 14 neon.55 and0 0 28 neon.35; inset0 0 12 neon.22. Not `--green` |
| B18 Zoom | input type range;width160 (max-width100 still applies), generic height40/pad8/stroke1/radius2 | Native track/thumb; camera caps supply min/max/step/value; disabled opacity.55 when unsupported |
| Hidden scanner nodes | canvas.hidden; pre.hidden with pre-wrap/margin-top10 | Debug text populated but never shown by code; `btn-scan-apply` referenced in JS but absent from HTML, so no Apply button master |

Scanner close is Close button/backdrop click; no modal-specific Escape handler/focus trap. Opening requests rear camera; status: “Requesting camera…”, “Camera ready”, “Camera error: …”; capture stages “Capturing…”, “Preparing image…”, “Starting OCR…”, “OCR n%”, low-confidence retry, “OCR error: …”. Successful extraction of≥2 fields applies and closes; no review/apply step. Closing resets “Camera idle”. Native alert accompanies camera/OCR failures. Capture button is not explicitly disabled during OCR. Visible guide height30% differs from OCR crop height42%: preserve current appearance and record discrepancy, do not correct it in Figma silently.

## 4. Application compositions and conditional state contracts

### 4.1 Player Editor field matrix

Source: `tracker.html #edit-card/#player-form`, `app.js applySeniorityToForm/loadIntoForm/clearForm/applyMasterToForm/applyScanToForm/readForm`.

Lookup precedes twelve fields. Grid4 columns above900px,2 at≤900, full-span lookup first. Grid gap form-fields; form margin-bottom10; card gap16; display-name margin8px 0. Field order is source order, not regrouped to improve layout.

| Order / ID | Control / visible values | Special states / annotation |
| --- | --- | --- |
| Lookup `#f-lookup` | Text; “Type a name… (e.g. Bellingham)” | Full span; conditional overlay |
|1 `#f-first` | Text required, placeholder New | `#auto-first` |
|2 `#f-surname` | Text required, placeholder Player | `#auto-surname`; single-name data permitted by JS despite required attributes |
|3 `#f-seniority` | Select Senior/Youth/Shortlist(`Watchlist`) | Youth zeroes and disables Cost |
|4 `#f-homegrown` | Form20px checkbox | No auto annotation |
|5 `#f-pos` | Select disabled empty “Select…”; GK/RB/CB/LB/CDM/CM/CAM/LM/RM/ST | Required; `#auto-pos` |
|6 `#f-foot` | Select Right(R)/Left(L), required | `#auto-foot` |
|7 `#f-intl` | Number1–99/step1/required/placeholder65 | Label Overall; `#auto-intl` |
|8 `#f-potmin` | Number1–99/step1/required/placeholder65 | `#auto-potmin` |
|9 `#f-potmax` | Number1–99/step1/required/placeholder90 | `#auto-potmax` |
|10 `#f-active` | Select Yes(Y)/No (Sold)(N) | Current player? |
|11 `#f-cost` | Text/numeric-inputmode/placeholder0 | Youth disabled/value0; money comma formatting |
|12 `#f-sale` | Text/numeric-inputmode/placeholder0 | Money comma formatting |

New: default card, name “New Player” until populated, Scan, Add player/Clear; Cancel/Update/Rescan hidden. Editing: exciting card, field values/name, Cancel/Update/Clear, Add hidden; original h2 remains “Add / Edit player”, not a new Edit heading. Lookup/scanning annotates only found fields. Manual change clears that field's annotation. `clearForm` exits editing and hides Rescan/annotations. **Clear button** resets fields/annotations but does not call `clearForm`, so it can retain Editing/Update/Cancel and Rescan visibility. `loadIntoForm` does not explicitly clear existing auto badges. These are state combinations to preserve as evidence, not new polished states to invent.

Currency3 uses GBP/EUR/USD display symbols and rerenders money; selected group is shared editor context. Form Enter dispatches Add/Update. Validation uses native alerts for missing surname/position, not inline error text. There is no designed loading overlay while Add/Update persists.

### 4.2 Dashboard and shared headers

Dashboard header title “Dashboard”, helper “Create, open and delete career mode trackers. Data is saved to AWS (your account).”; Sign out. SaveList title “Career saves”, Add new career save button,5-column table, no-saves helper shown only after empty result. Initial empty tbody while requests run has no dedicated loading state. Create/rename/delete use native prompt/confirm; action failures alert. Save rows sorted newest-created first. There is no inline editor despite `.save-name-input` CSS.

Tracker header starts with hardcoded “FC26 Transfer Tracker Test” until save title loads; afterwards title or name or “Untitled”. Edit title remains visible. Helper text is static, including “your account name here”; JS does not replace it with session identity. Dashboard icon anchor, Sign out; Seed Player DB reveals on localhost/127.0.0.1 or `?seed=1`. Default production examples must omit Seed; a local fixture can accidentally reveal it. Tracker without save redirects Dashboard; unsigned users redirect Login. Redirects are navigation conditions, not extra error screens.

### 4.3 List, totals and pitch filtering

Totals and Players duplicate the same4-button SeniorityGroup and stay synchronized. Players controls also contain CSS-hidden All/Active/Sold select; no current reveal path. Search min-width260 affects surname/position matches in Players and Pitch, not totals. Show ex-players default off; on allows sold rows and then respects the hidden active select. Count uses singular/plural; zero matches gives blank tbody, not a new empty row/message. Default sortable header is Ovr descending; switching name/position starts ascending, numeric columns descending. Only six current header keys are exposed.

Pitch filters are independent of shared seniority: Senior/Youth/Senior + Youth/Homegrown; Include shortlist toggles Watchlist inclusion except Homegrown branch checks homegrown directly first. Only active players appear. Pitch sort Overall/Potential descending with name tie-break. Repeated position slots receive alternating ranked players (round-robin), not first-team/substitute semantics. All matching names render, no top-N cut-off. `resolvePitchPos` has side-specific fallback logic, but current layout `pos` values are ordinary ST/CAM/CM/CB, so grid-area names such as cml/cmr do not imply implemented foot-based left/right assignment. Formation selects all15 options in source insertion order; default4-2-3-1, persisted preference when valid. Appendix D records exact layout grids, including empty tracks.

### 4.4 Login state matrix

| Trigger / `login.js` handler | Visible UI changes |
| --- | --- |
| Idle / boot unsigned | Email, Password, Sign in/Create account; confirmation hidden, empty messages hidden |
| Sign up request | Status “Creating account...”; previous error/success cleared; buttons remain enabled |
| Sign up needs confirmation | Confirmation shown; success “Account created. Please confirm with the code sent to your email.” |
| Sign up auto-confirmed | Confirmation hidden; success “Account created. You can now sign in.” |
| Confirm request/success | Status “Confirming...” → success “Confirmed. You can now sign in.”; hide confirmation |
| Resend request/success | Status “Resending code...” → success “Code resent. Check your inbox (and spam).” |
| Sign in request/success | Status “Signing in...” → transient “Signed in.” then navigate Dashboard |
| Unconfirmed sign-in error | Error message, confirmation shown |
| Validation/service error | Status cleared, error populated, success cleared; no control error border |
| Already signed-in boot | Redirect Dashboard; no additional designed screen |

Messages can wrap or use preserved line breaks in error/success. Password bullets are native input display; placeholder is literal “••••••••”. Do not make disabled action variants or a password-visibility icon that does not exist.

### 4.5 External/native and non-rendered inventory

External browser-owned surfaces: career name/rename/title prompts; sign-out/player-delete/save-delete/reset confirmations; validation/AWS/import/seed/camera/OCR alerts; file pickers; camera permission sheet; native select menu; input number spinners; native tooltips; native scrollbar/range/checkbox appearances. Record them as external dependencies, not app-native Figma masters with invented metrics.

Hidden-only application nodes: Export JSON, Import JSON/file input, Reset all, active-player select, scanner canvas/debug; career save ID span; pitch count/meta. Conditional nodes: cancel/update, rescan, auto annotations, suggestions, verification block, messages, scanner, local Seed. JS-export download anchor is transient/nonvisual. Defined-but-unused selectors include `.save-name-input`, `.hint`, `.font-head`, generic standalone boxed badges, h4–h6. `.player-meta` and `.s-err` have no direct rules. No toast, spinner, pagination, avatar, drawer, drag-and-drop pitch interaction, custom tooltip, text area or generic validation component was found.

## 5. Rendered-measurement status and responsive arithmetic

### 5.1 Browser evidence register

| Planned viewport | Planned context/state | Browser evidence collected | Limitation |
| --- | --- | --- | --- |
| Desktop1440×1000 | D populated; T New/Editing/default formation, L idle/confirmation; both themes | **None (U)** | Browser inspection unavailable in this session |
| Tablet834×1112 | Same component/state set | **None (U)** | Native font/control/layout values unmeasured |
| Mobile390×844 | Same + Scanner overlay/zero-match tables | **None (U)** | Dynamic visual viewport/camera/native states unmeasured |

These are representative **planned** viewports, not visited browser sessions. Dimensions of scanner use dynamic viewport units; static formula evaluation below assumes dvh equals the supplied layout height, which real mobile toolbars may invalidate.

### 5.2 Static formula evaluations (I, not computed CSS)

Assumptions: root16px; requested viewport width; no scrollbar width adjustment; fonts not measured; regular `.container` and full-width card. Values are formula substitutions before intrinsic layout/flex/table/grid sizing. “Card inner” excludes its two2px strokes and two paddings. Widths do not certify actual rendered bounding boxes.

| Property / formula |1440×1000|834×1112|390×844|
| --- | --- | --- | --- |
| Container border-box upper width min(W,1440) |1440|834|390|
| Container inline pad (≤768 forces8) |86.4|50.04|8|
| Available card outer width |1267.2|733.92|374|
| Card padding clamp(8,.02W,24) |24|16.68|8|
| Card inner width |1215.2|696.56|354|
| Form/action gap clamp(8,.02W,16) |16|16|8|
| Form column count |4|2|2|
| Form column width (inner−gaps)/N |291.8|340.28|173|
| Finance column count / gap |4 /12|2 /12|2 /12|
| Finance tile width |294.8|342.28|171|
| H1 clamp(24,.04W,32) |32|32|24|
| H2/value clamp(22,.032W,28) |28|26.688|22|
| H3 clamp(20,.028W,24) |24|23.352|20|
| Body clamp(14,.018W,16) |16|15.012|14|
| Label/button clamp(10,.012W,12) |12|10.008|10|
| Input clamp(12,.016W,14) |14|13.344|12|
| Segment/annotation clamp(8,.01W,10) |10|8.34|8|
| Table header clamp(8,.01W,14) |14|8.34|8|
| Table data clamp(10,.012W,14) |14|10.008|10|
| Wide name wrapper clamp(104,.25W,192) |192|192|104|
| td preferred width clamp(32,.20W,160), NOT used column width |160|160|78|
| Input height / row-action minimum / utilities |40 /32 /36|40 /32 /36|40 /32 /36|
| Modal width min(720,W−24) |720|720|366|
| Modal height assuming dvh=H, H−20 |980|1092|824|
| Video maximum height .55H, not actual height |550|611.6|464.2|

At mobile390 the player min440 and career min640 exceed table viewport; expect horizontal scroll, not card-to-list conversion. Form/totals never become one column. At834 the≤900 grid rule applies, but≤768 gutter rule does not. At1440 the≥1200 pitch list cap applies. Empty pitch templates still contain empty grid tracks: their min-content size and gap impact cannot be inferred as equal row heights.

Additional planned breakpoint probes: widths767/768/769 (gutter discontinuity),899/900/901 (grid/totals columns),1199/1200/1201 (pitch list cap), >1440 (container cap but vw-based padding still uses viewport width),320 (search min260 and pitch overflow). At wider screens container pad continues to grow with viewport until128px, even after its1440px maximum width is reached. Figma Desktop mode must not treat86.4px as universal desktop padding.

### 5.3 Required future capture protocol

Before a later Figma build claims exact rendered fidelity, use a read-only browser session or isolated visual fixture with representative data and imports/network mutations suppressed. Do not execute AWS write handlers to obtain examples. Record fixture vs real authenticated provenance, theme, URL/seed condition, viewport width/height and device pixel ratio, visualViewport height, root font size, browser/version, font-load results, form/filter/formation state and row data. A fixture is not proof of live authenticated functionality.

For each representative element record `getBoundingClientRect()`, computed width/height/min/max, display/layout/alignment/wrap/grid tracks/gaps, padding/margins, stroke/radius, font family/size/weight/line-height/letter-spacing, colours/images/shadows, overflow and scroll/client dimensions. Include hover/focus/disabled/editing/sold/flash specimens and pseudo-elements. Native controls need screenshots as well as computed outer CSS. When computed line-height is still `normal`, measure text/line boxes and document the font metric method; do not relabel it as an authored line-height. Capture screenshots in both modes after fonts settle. This is an outstanding validation task, not performed evidence.

## 6. Native Figma hierarchy and component contracts (P)

Use existing file conventions; proposed library pages: Base, Composed, Application, Screens, with source/measurement notes beside review instances. Masters live outside final screen frames. The source maps in §2 define the master inventory. A primitive text layer is not automatically a nested component. Use reusable text/effect styles for typography/elevation, nested instances for actual UI boundaries, boolean/text/instance-swap properties for content and visibility.

### 6.1 Tree notation and complete screen composition

`[M]` master or set, `[I]` nested instance, `[F]` layout frame, `[T]` text, `[A]` absolute visual layer. Each screen uses existing masters, not redrawn replicas.

```text
[M] Screen/Dashboard
  [I] Layout/AppShell
    [I] Layout/PageHeader Context=Dashboard
      [F] TitleStack → [T] H1 + [T] helper
      [I] Layout/Actions Context=Utility → [I] Action/Button Sign out
    [F] MainContainer (vertical/fill width/fill remaining height)
      [I] Career/SaveList
        [I] Surface/Card
          [I] Layout/CardHeader → [T] H2 + [I] Action/Button Add new career save
          [I] Table/Frame Context=Career
            [F] HeaderRow → [I] Table/HeaderCell ×5
            [I] Career/Row × row count
              [I] Table/DataCell Context=Name → [T] name
              [I] Table/DataCell Context=RawDashboard ×3
              [F] ActionsCell → [I] Action/Row ×3
          [I] Feedback/Text no-saves (boolean)
      [I] Layout/Footer Context=Main / Tip=true
        [T] tip + [I] Control/ThemeSwitch

[M] Screen/Tracker
  [I] Layout/AppShell
    [I] Layout/PageHeader Context=Tracker
      [F] TitleStack
        [F] TitleRow → [T] H1 + [I] Action/TitleEdit
        [T] helper
      [I] Layout/Actions Context=Utility
        [I] Action/Button → [I] Icon/Dashboard
        [I] Action/Button Seed (conditional boolean)
        [I] Action/Button Sign out
    [F] MainContainer
      [I] Player/Editor
        [I] Surface/Card State=Default|Editing
          [I] Layout/CardHeader → [T] H2 + [I] Control/SegmentGroup Currency
          [I] Action/Button Scan
          [I] Action/Button Rescan (boolean)
          [T] display name
          [F] FormGrid (4|2 columns, lookup full span)
            [I] Field/Lookup
              [I] Field/Labeled → [I] Field/Input
              [I] Lookup/Popover (absolute, visible boolean)
                [I] Lookup/Option ×n OR [I] Feedback/Text Error
            [I] Field/Labeled ×12 in source order
              [T] label + [I] Field/Input|Select|Checkbox
              [I] Annotation/AutoDetected (boolean on 7 eligible fields)
          [I] Layout/Actions
            [I] Action/Button Cancel (editing)
            [I] Action/Button Add|Update + [I] Action/Button Clear
      [I] Finance/Summary
        [I] Surface/Card
          [I] Layout/CardHeader → [T] H2 + [I] Control/SegmentGroup Seniority
          [F] TotalsGrid → [I] Finance/Tile ×4
            [T] label + [I] Finance/Value
          [T] helper
      [I] Player/List
        [I] Surface/Card
          [I] Layout/CardHeader → [T] H2 + [I] Control/SegmentGroup Seniority
          [I] Field/Input Search
          [I] Control/CheckboxLabel Ex players
          [T] count
          [I] Table/Frame Context=Player
            [F] HeaderRow → [I] Table/HeaderCell ×7
            [I] Player/Row ×n
              [I] Player/NameCell → [T] surname + metadata with [I] Status/PlayerText
              [I] Table/DataCell Compact ×3
              [I] Table/DataCell Numeric ×2 → [I] Finance/Value
              [F] ActionsCell → [I] Action/Row ×2
      [I] Pitch/Squad
        [I] Surface/Card
          [I] Layout/CardHeader Context=Pitch → [T] H2 + [I] Control/SegmentGroup PitchSort
          [I] Field/Select Formation
          [T] helper
          [F] PitchFilters → [I] Control/SegmentGroup PitchSeniority + [I] Control/CheckboxLabel
          [I] Pitch/Field Formation=<15 source layouts>
            [A] midfield line + circle
            [F] FormationGrid
              [I] Pitch/PositionPanel ×10|11
                [F] Head → [T] position
                [F] List → [I] Pitch/PlayerRow ×n (or one empty row)
      [I] Layout/Footer Context=Main / Tip=true
  [I] Camera/Scanner (overlay visibility)
    [A] Backdrop
    [I] Dialog/Panel
      [F] Head → [T] H3 + [I] Action/Button Close
      [F] BodyViewport → [T] helper + [I] Camera/Frame
        [A] Video content + [I] Camera/Guide
      [F] Foot → [I] Action/Button Capture + [I] Camera/Zoom + [T] Status

[M] Screen/Login
  [I] Layout/AuthShell
    [F] LoginWrap → [T] H1 + [T] intro
      [I] Auth/Panel
        [I] Surface/Card
          [F] AuthRow → [I] Field/Labeled Context=Login ×2
          [F] AuthRow → [I] Action/Button Sign in/Create account
          [I] Auth/Confirmation (boolean)
            [T] helper
            [F] AuthRow → [I] Field/Input Code + [I] Action/Button Confirm/Resend
          [I] Auth/MessageStack
            [I] Feedback/Text Status/Error/Success (independent text, empty hides)
    [I] Layout/Footer Context=Auth / Tip=false
```

The hidden maintenance controls, hidden active select/count/meta/debug/ID span are recorded in the source tree and optional audit specimens; they do not need invisible layer replicas in every Figma instance. If represented, expose clearly labeled source visibility booleans default false, not fabricated user flows.

### 6.2 Master properties and responsive Auto layout

| Master/set boundary | Exposed properties | Auto layout / sizing / responsive translation |
| --- | --- | --- |
| Action/Button | Appearance=Primary/Secondary/Danger; Geometry=Standard/Utility; State=Default/Hover/Pressed/Focus; Label text; Icon swap/visibility | Standard pad9/12; horizontal centered; height Hug content, width Fill in source flex1 contexts. Utility height36/Hug width; grid utility36 square. Geometry wrapper can avoid oversized state matrix |
| Action/Row, TitleEdit | Neutral/Danger for Row; State only implemented; label text | Row Hug width/min-height32/pad4/6. TitleEdit Hug/min24/pad4/0 |
| Field/Input | Context=Tracker/Login; State=Default/Focus/Disabled; Placeholder boolean; Value text; presentation text/password/number as needed | Fill width/fixed40; pad8/stroke1/radius2. Browser native glyphs unresolved; don't assume email needs another visual master |
| Field/Select | Value text; Context/hidden-state annotation; State=Default/Focus | Fill width/fixed40; pad8 right36; chevron absolute16/right12. Native menu external |
| Field/Checkbox | Context=Form/Inline; Checked boolean; Focus | Form fixed20; Inline native size U, capture required before choosing fixed Figma geometry |
| Field/Labeled | Context=Tracker/Login; Label text; Control swap; AutoDetected boolean | Column/gap7; width Fill/min0. Login annotation absent; tracker height Hug and annotations add height |
| ThemeSwitch | Dark boolean; focus state | Fixed56×28, absolute22px thumb and16px SVG instances; theme mode inherited from screen |
| Segment / SegmentGroup | Appearance=Filled/Underline; Selected boolean; state; label; group preset and selected index | Segment Hug/min32; frame horizontal Hug; group exact count/labels. Pitch filter group wraps when source does. Expose nested selections instead of full selection permutations |
| Surface/Card | State=Default/Editing; Content instance swap | Vertical/Fill width/Hug height; pad viewport-derived; gap16; stroke2/radius8. Content slots implemented through nested instances, not arbitrary detached layers |
| CardHeader / Actions | Context presets; Title text; Actions swap | Headers row/center/space-between/gap12, Standard no wrap; page/pitch wrap; actions wrap and gap form-fields. Preserve flex distribution, don't globally Hug buttons |
| Table primitives | Context=First/Middle/Last; CellKind=Name/Compact/Numeric/RawDashboard/Actions; Sort=None/Asc/Desc (headers only) | Native table layout translated to shared aligned column frames. Use one column-width contract across header/all rows, capture-derived; don't independently Hug each row. Outer viewport horizontal scroll/clip, inner table min440/640 |
| PlayerRow / CareerRow | Player Sold boolean/Flash sample; name/meta/value texts; nested action instances | Horizontal cell row/Hug height; per-cell padding/bottom strokes; hover overlay. Shared primitives, separate domain rows. Sticky first column can be separate pinned layer in prototype; ordinary Auto layout cannot reproduce CSS sticky alone |
| FinanceTile | Label text; Value text; Tone=Positive/Negative/Neutral | Vertical/pad10/12/label-value gap4; width Fill/grid equal; Hug height |
| LookupPopover | State=Results/Loading/Error; option content swaps/text | Vertical Fill field width/Hug height/max320/clipped vertical scroll; absolute below field4; shadow exact; Option row pad8/gap10/baseline/space-between |
| PositionPanel | Position text; Content=Empty/Populated; list swap | Vertical/fixed64/Hug height; head pad4/center/gap8; list0gap; row pad4/2; clip. Desktop list max220 needs responsive wrapper/cap, not unconditional220 frame |
| PitchField | Formation=<15 keys>; content instances; Mode inherited | Grid5 tracks, gap12/10/pad20/4; content rows. Prefer native grid layout if available; otherwise coordinated row/column wrappers preserving equal track alignment, including empty tracks. Do not replace with independent space-between rows or delete blank tracks |
| Scanner | Open boolean; Status text; ZoomEnabled boolean; Preview content swap | Fixed overlay size matches viewport; panel Fill available height/Hug? **fixed calculated height**, width min720/W−24; vertical pad14; body Fill/scroll; foot Hug/wrap. Video preview intrinsic ratio must be provided/recorded; mask absolute |
| AuthPanel / Confirmation / Messages | ConfirmVisible boolean; text properties for status/error/success; code/value; no invented disabled actions | Vertical16 card gap; Login rows wrap with min180 per child, widths Fill equal within each row; Confirmation gap16/helper bottom8 |
| PageHeader/Footer/Shell | Context=Dashboard/Tracker/Auth where relevant; title/helper/tip texts; optional Seed; nested content swap | Max1440 containers, fluid gutters, body min-height viewport. Footer pushed to bottom using remaining-space layout; retain source margins/padding. Login shell independent narrow wrapper |

Figma wrap cannot automatically express CSS `minmax(0,1fr)`, `clamp`, min-content table algorithm, `9ch`, pseudo-element percentage-circle, CSS `position:sticky`, native widgets, runtime video intrinsic dimensions or browser `normal` line-height. Use measured size modes/constraints/wrappers and documented prototype limitations. “Responsive” means source configurations represented accurately, not a claim of full CSS execution inside Figma.

Use viewport configuration properties for Layout=Wide(>900)/Narrow(≤900), Gutter=Fluid(>768)/Compact(≤768), PitchCap=On(≥1200)/Off independently; do not merge all three into a single inaccurate Mobile/Desktop breakpoint. Screen specimens may use Desktop/Tablet/Mobile labels, but preserve numeric viewport in description and use the independent rules. Avoid full cross-product variants; put responsive metrics in existing Sizes modes where appropriate and component visibility/layout variants only where needed.

## 7. Design-system mapping and drift register

### 7.1 Binding policy

Use the existing foundations first. At the later build's read-only discovery, record collection/variable/style IDs, mode names, remote-library provenance and exact values. Match both numeric values **and meaning**. Imported library variables remain library references; do not duplicate them locally. Keep semantic colour aliases to `_primitives`; use `Colour Modes` for actual theme roles. `Sizes` resolves responsive application metrics; Tailwind libraries provide existing numeric/family/type foundations where exact. A component property may bind directly to an existing size/spacing token; it does not need a new `button/padding-left` semantic variable.

| CSS property/role | Target mapping plan | Required exact value / constraints |
| --- | --- | --- |
| Palette literals in `:root`/Light | `_primitives` immutable swatches; existing `Colour Modes` theme aliases | Do not make primitive “white” change to dark text. Bind semantic text/page roles to correct theme swatches; code's palette names are theme-dependent |
| `--bg-primary/secondary`, `--text`, `--muted/--txt-secondary` | Existing Colour Modes page/surface/text/muted roles | Values must match Appendix A Dark/Light; shared aliases for identical roles, no per-component copies |
| `--green/--ok/--on-accent` | Existing accent/positive/on-accent semantics → primitives | Keep green primary+positive reuse; on-accent dark#04021e/light#fff |
| `--border/--control-border/--row-border` | Existing border roles, alias control to border | Preserve row dark alpha#979cb45e vs light border; not one opaque stroke |
| `--surface-hover/--border-hover/--focus` | Existing interaction roles | Exact alpha/theme colours; focus outline3/offset3 numeric separately |
| `--danger-bg/--danger-border/--danger`, potential status roles | Existing danger/status semantic aliases | Potential plain table text still binds muted; defined generic status styles are optional unused specimens |
| Pitch panel/row/row-alt/line | Existing Colour Modes pitch roles if already present | Gradient needs paint styles/layers with theme-bound stops; white pitch-line both modes |
| Header gradient / badge mixes / editing glow | Existing compatible paint/effect styles, or literal documented formulas | Evaluate theme-dependent mix accurately later; not a STRING variable pretending to be a fill |
| `--space-0…10` | Existing Tailwind Spacing or Sizes aliases where exact | Code sequence0/4/8/12/16/24/32/48/64/96/128. Under a4px unit these correspond numerically to0/1/2/3/4/6/8/12/16/24/32; verify actual library names/units, not assumed paths |
| Page/card/form fluid spacing | Existing Sizes responsive application metrics | Preserve full clamp and≤768 override; Figma numeric modes cannot evaluate vw; bind recorded sampled values, document interpolation |
| Fixed widths/heights | Tailwind Sizing / Sizes exact match | E.g.20/22/28/32/36/40/48/56/64/160/320/440/520/640/720/1440. Some are max/min/context values, not fixed element sizes |
| Radius2 (`--radius-cell`) | Existing radius variable exact2 | Card8/video12/guide14/modal16/full999 are literals; exact existing library tokens or documented literal exceptions |
| Stroke1/2, focus3 | Existing Sizes/border-width metrics when available | Keep exact numeric stroke; inside/center/outside Figma stroke alignment must be visually verified against CSS box-sizing/collapsed tables |
| `--heading/--body-font` | Existing Type family variables + shared text styles | Exact families, weights and role tracking; Google-font availability ≠ installed Figma family availability |
| Fluid font roles | Existing Sizes responsive typography feeding shared text styles / Tailwind Type where exact | Resolve sizes per width from§5, do not substitute nearest Tailwind default. Pitch9/lookup10+8/footer13/Login16 preserve literal exceptions |
| Line-height | Existing Type/Sizes line-height foundations **only after match verified** | CSS authored value normal, Figma existing numeric value U. Any numeric binding is unverified parity until fonts/text boxes captured |
| Letter spacing | Existing exact Type tracking variable/style | .02em/.05em convert to2%/5% in Figma or font-size-dependent px; don't bind2px/5px |
| `9ch`, name ellipsis, percentage guide/circle | Constraint/layout documentation, measured width when necessary | Not a fixed spacing token; ch requires actual Rubik metrics, percentage guide depends on preview |
| Select chevron data URL | Icon component with theme text stroke | Never put SVG URL into colour variable |
| Scanner neon/mask/video blacks | `_primitives` existing exact swatches + paint/effect style or documented literal | Neon differs from green accent and stays constant across modes; no new semantic role per glow radius |

### 7.2 Known mismatch versus unknown parity

| Item | Current CSS | Figma evidence | Classification / build decision |
| --- | --- | --- | --- |
| Existing collection architecture | Earlier audit proposed FC26/Theme+Metrics | User says `_primitives`, Colour Modes, Sizes, Tailwind libraries exist | Intentional user-provided architecture; reuse it, don't implement old proposal |
| Line height | No declaration, browser normal/inherited | User says line-height foundations exist; numeric values not supplied | **Potential mismatch, unresolved; not evidence of intentional change**. Need font/text measurements before binding exact numerical height |
| Fluid metrics/fonts | vw clamps and thresholds in Appendix A | Responsive typography/sizing foundations exist, values U | Parity unknown; resolve values and mode thresholds. No silent snapping/rounding to token steps |
| Palette names | white/black/green change with theme | Primitive/semantic collections exist, values U | Architecture naming difference, not necessarily visual drift. Use semantics with immutable primitive swatches |
| Hardcoded field gap7, button pad9, typography9/13, guide radius14 | Exact literals | Tailwind tokens may have different step increments | Candidate literal/token gaps; preserve literal unless exact variable exists. Changing7→8/9→10/13→14 is a design change, intent not established |
| `.mono` | Refers to undefined variable | Figma monospace token U | Implementation gap; do not introduce monospace as baseline |
| Boxed badge vs current table badge | CSS contextual overrides remove box and recolour muted | Figma status components U | Confirmed source contextual difference; table uses plain annotation; not intentional token change evidence |
| Pitch slot count3-4-2-1 |10 slots | Desired “professional” library doesn't specify correcting it | Source irregularity; reproduce10, flag for later product review |
| Modal guide vs OCR crop |30% visual height vs42% crop | No Figma evidence | Implementation inconsistency; preserve30% visual guide |
| Buttons/title/form Clear/disabled native states | Specific cascade/state quirks | Figma state design U | Preserve actual combinations; new harmonized states would be intentional future changes requiring explicit scope |

No actual Figma-versus-CSS value difference can be certified without inspecting that file. No intentional visual design-system change has been established by this audit. Record a later discrepancy as `CSS value + source / Figma value + variable ID / evidence of intent / resolution`; unknown intent stays “unconfirmed”. Existing numeric tokens should not be repurposed to values that break other foundations. Missing literals can remain documented fixed exceptions pending review; don't mint semantic variables for each component property.

### 7.3 Hardcoded-value register

All exact hardcoded declarations appear in Appendix A; this grouping highlights active gaps beyond CSS variables. Numeric equivalence to a library token does not make the source tokenized.

| Domain | Hardcoded values / consumers |
| --- | --- |
| Shell |1440 max container;1rem block pad;6vw inline preference; header utility36/grid icon18; title pad4/min24/gap-related margins; footer18/30/16/13; Login520/64/16/180/16px font |
| Card/actions | Card stroke2/radius8/margin16; header gap12; button9/12/stroke1; row4/6/gap4/min32; segment6/8/min32/underline2; Editing shadows2/28/.18/.2s |
| Fields | label gap7; form bottom10; height40/pad8/stroke1; select right36/arrow16/right12; form checkbox20; inline checkbox gap6; search min260/filter min160 |
| Finance/table | tile pad10/12/gap12/value margin4; table min440/640; th5; td8/0/min36; clamp32/160 and104/192 endpoints; compact32; name gap4; numeric9ch; arrow6/900/margins2/3; flash1.3s/.22/1400ms |
| Lookup | offset4/z50/max320/shadow10/30/.35; option8/gap10/font10/meta8/.75/main600; loader.75; debounce220/poll300/blur150 (behaviour, not size tokens) |
| Pitch | gap12/10/pad20/4; line1/circle28%/999 radius; panel64/blur6/header4/gap8/code9/700/.02em; row9/700/pad4/2/name max48; desktop max220 |
| Scanner | z9999/panel720/W−24/H−20/margin10/pad14/stroke1/radius16/shadow20/60/.55; body-bottom10/foot-gap10/pad10; video55dvh/radius12/#000; guide6%/88%/30%/radius14/border2/neonrgba; zoom160; all mask/glow values§3.6 |
| Theme/focus | switch56/28/pad2/stroke1/radius999/thumb22/top2/left2/translation28/icon16/.2s; focus3/offset3; forced-colours underline3; header transparent-white end stop |
| Defined unused styles | boxed badge12px/pad4 8/gap6/12% or10% mixes; save-name-input bold; hidden count10/.75 and hidden metadata.8 |

## 8. Phased future implementation plan and acceptance criteria

This plan is **P**; no phase below has been executed in Figma. Completion of this audit does not equal completion of rendered validation or foundation parity discovery.

| Phase | Build order / prerequisite | Acceptance gate |
| --- | --- | --- |
|0 Evidence and foundation reconciliation | Read actual foundations and available libraries; export exact IDs/modes/values/styles; collect planned browser samples and fonts; settle drift decisions | Every required binding has a verified existing variable/style or documented literal exception. No invented line heights, native geometry, table widths or auth-wrap widths. Audit source irregularities remain baseline |
|1 Base components | Assets/text styles → Button/Row/TitleEdit → Input/Select/Checkbox/Zoom → ThemeSwitch/Segment → annotation/status/value/feedback → table cells → lookup option/pitch row/guide | Exact geometry/typography/paint/state specimens match evidence; source descriptions attached. No generic states added. Theme switch/thumb/icon geometry correct |
|2 Shared compositions | Card/header/action layouts/labeled fields/footer/page header → SegmentGroups/Lookup → table rows/frames → FinanceTile/PositionPanel/PitchField → CameraFrame/DialogPanel/AuthConfirmation/Messages | All repeated UI uses nested base instances; no detached copies. Layout contracts pass minimum/maximum widths; all15 pitch grids correct; row columns aligned; scoped selectors reflected |
|3 Application components | CareerSaveList → PlayerEditor → FinanceSummary → PlayerList → PitchSquad → Scanner → AuthPanel → shells | Exact source order, labels, visibility and filter relationships. New/Editing/Youth/AutoDetected/lookup states, zero matches, sold row, summary sign/ROI and confirmation/status states covered |
|4 Complete screens | Login → Dashboard → Tracker → TrackerScanner; both themes and3 planned sizes | Uses application instances with content overrides. Capture comparison passes; wrap/overflow/footer placement/source margins preserved. No fabricated mobile one-column grid or extra table columns |
|5 Library QA and handoff | Verify nested masters, variant APIs, bindings, font/style references, review instances and source metadata; record exceptions and actual measurements | Deliver editable native components, no rasterized whole screens. Audit all instances for detached layers and wrong mode bindings. Supply verification ledger and unresolved external/native limitations |

Detailed acceptance criteria for the future build:

- **Visual fidelity:** compare source and Figma at identical viewport, theme, data and state after fonts settle. Authored CSS dimensions, padding, strokes, radius and numeric font sizes match exact values; browser-captured outer boxes within1 CSS px (explicitly proposed QA tolerance, not source design). Record font-rendering differences separately; screenshots must not hide clipped or incorrectly wrapped content. Pixel-diff threshold must be agreed after controlling font rasterization, not fabricated now.
- **Component reuse:** one authoritative master per listed reusable family; domain rows and application compositions contain nested instances. Common Header/Footer/Button/Input/Card/table primitives shared where source supports reuse. Existing library assets used by reference. No detached duplicate components recreated on each screen, no master for every label string.
- **Responsive layout:** verify767/768/769,899/900/901,1199/1200/1201 and the3 representative viewports. Preserve min440/640 horizontal table scroll, two-column small form/totals, search min260, exact clamp values, conditional seed, pitch content height/list clipping and scanner dynamic viewport fit. Label Figma prototype limitations for sticky/native/runtime layouts.
- **Variable binding:** paints/strokes/numeric metrics bind to verified existing variables when supported; semantic theme aliases point to correct immutable primitives. Responsive values use documented Size modes; text styles use verified font/size/weight/tracking/line-height. Gradient stops/mixes/effects have verified source-consistent style or explicit documented construction. Every literal exception lists source and reason. No per-component semantic alias proliferation.
- **State completeness:** specimens cover primary/secondary/danger hover differences, press only on `.btn`, focus ring, disabled input/loading option, active segments, Light/Dark switch, Editing card, sold/hover/flash row, four money tones, suggestions results/loading/error/closed, auto annotation visibility, Login confirmation/message states, scanner status/zoom states, all formation grids. Native prompts/menus are documented external surfaces.
- **Traceability:** each master description references inventory ID + files/selectors/functions. Every future measured override records browser state and provenance. “U” items may remain as labeled limitations in a draft, but exact visual sign-off cannot pass while their required measurements/bindings are guessed.

## 9. Audit completion and remaining evidence

All nine requested files were inspected, including JavaScript-generated rows, lookup states, scanner stages, form states, auth feedback, theme behaviour and all formation presets. The complete source trees/rule ledger below allow subsequent builders to recover exact hierarchy and declarations without independently designing duplicates. This report is the only new deliverable from this task; the pre-existing foundations audit remains unchanged.

Outstanding evidence for a later build: actual Figma variable/library/style inventory; font availability/metrics; browser-computed boxes/line heights/table tracks/Login wrapping/native widgets; live-camera preview/dynamic viewport geometry. Static specifications are complete as source evidence; rendered fidelity is unverified. Do not claim those missing measurements or foundation value comparisons have already passed.


## Appendix A. Exact ordered CSS declaration ledger (S)

This is a comment-stripped, whitespace-compacted transcription in original cascade order. It retains duplicate selectors, custom properties, pseudo-elements and media conditions. Empty/comment-only rules are retained as `{}`. Inline HTML styles are recorded in Appendix B. Source line numbers refer to the inspected files. This ledger is declarations, **not browser-computed effective styles**; specificity, inheritance, native defaults and contextual overrides still apply as described above.

| Source | Condition | Selector | Exact declarations in source order |
| --- | --- | --- | --- |
| `styles.css:8` | `all` | `:root` | `color-scheme: dark; --on-accent: #04021e; --surface-hover: rgba(255,255,255,.06); --border-hover: #7582ad; --row-border: #979cb45e; --focus: #a9c7ff; --control-border: var(--border); --danger-bg: rgba(255,107,107,.12); --danger-border: #c06b85; --pitch-panel: #050d20; --pitch-row: #13192c; --pitch-row-alt: #101626; --pitch-bg: linear-gradient(180deg, #0b2630, #081e24); --pitch-line: #ffffff; --arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23dfe9e9' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); --white: #dfe9e9; --gray: #979CB4; --black: #04021E; --navy: #070729; --blue: #121A3D; --green: #01ff49; --red: #ff299e; --purple: #d751ff; --teal: #47ffd9; --amber: #ff9f57; --bg-primary: var(--black); --bg-secondary: var(--navy); --text: var(--white); --txt-secondary: var(--gray); --muted: var(--gray); --border:#283362; --danger: var(--red); --ok: var(--green); --inactive: var(--blue); --special: var(--purple); --exciting: var(--teal); --great: var(--amber); --sell: var(--red); --radius-cell: 2px; --heading: "Special Gothic Expanded One", sans-serif; --body-font: "Rubik", sans-serif; --type-h1: clamp(1.5rem, 4vw, 2rem); --type-h2: clamp(1.375rem, 3.2vw, 1.75rem); --type-h3: clamp(1.25rem, 2.8vw, 1.5rem); --type-h4: clamp(1.125rem, 2.2vw, 1.25rem); --type-h5: 1rem; --type-h6: clamp(0.625rem, 1.2vw, 0.75rem);; --type-body: clamp(0.875rem, 1.8vw, 1rem); --type-label: clamp(0.625rem, 1.2vw, 0.75rem); --type-input: clamp(0.75rem, 1.6vw, 0.875rem); --type-toggle-label: clamp(0.5rem, 1vw, 0.625rem); --type-table-head: clamp(0.5rem, 1vw, 0.875rem); --type-table-data: clamp(0.625rem, 1.2vw, 0.875rem); --space-0: 0px; --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px; --space-5: 24px; --space-6: 32px; --space-7: 48px; --space-8: 64px; --space-9: 96px; --space-10: 128px; --space-page-gutter: var(--space-2); --space-page-max-gutter: var(--space-10); --space-card-padding: clamp(var(--space-2), 2vw, var(--space-5)) ; --space-card-items: var(--space-4); --space-form-fields: clamp(var(--space-2), 2vw, var(--space-4)) ;` |
| `styles.css:88` | `all` | `:root[data-theme="light"]` | `color-scheme: light; --white: #171830; --gray: #515970; --black: #f3f5fa; --navy: #ffffff; --blue: #e6eaf4; --green: #007b32; --red: #b50069; --purple: #8230a6; --teal: #006c60; --amber: #875000; --border: #dbdfe4; --on-accent: #ffffff; --surface-hover: rgba(18,26,61,.06); --border-hover: #414e70; --row-border: var(--border); --focus: #254ac5; --control-border: var(--border); --danger-bg: #ffe7f0; --danger-border: #b50069; --pitch-panel: #e6eaf4; --pitch-row: #ffffff; --pitch-row-alt: #f0f3f8; --pitch-bg: linear-gradient(180deg, #e1f0e6, #d4e8dc); --pitch-line: #ffffff; --arrow: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23171830' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");` |
| `styles.css:117` | `all` | `.font-head` | `font-family:var(--heading);` |
| `styles.css:122` | `all` | `*` | `box-sizing:border-box;` |
| `styles.css:124` | `all` | `html,body` | `height:100%; overflow-x:hidden;` |
| `styles.css:126` | `all` | `body` | `margin:0; background-color: var(--bg-primary); color:var(--text); font-family: var(--body-font); font-size: var(--type-body); overflow-x:hidden;` |
| `styles.css:135` | `all` | `h1, h2, h3, h4` | `font-family:var(--heading); font-weight: 400; font-style: normal;` |
| `styles.css:137` | `all` | `p` | `font-family:var(--body-font);` |
| `styles.css:142` | `all` | `.container` | `max-width: 1440px; margin: 0 auto; padding: 1rem; padding-inline: clamp(var(--space-page-gutter), 6vw, var(--space-page-max-gutter));` |
| `styles.css:149` | `all` | `.app-header` | `background: linear-gradient(180deg, var(--surface-hover), rgba(255,255,255,0));` |
| `styles.css:154` | `all` | `.page-header` | `align-items:flex-start; flex-wrap:wrap;` |
| `styles.css:155` | `all` | `.page-header > :first-child` | `flex:1; min-width:0;` |
| `styles.css:156` | `all` | `.save-title-row` | `display:flex; align-items:center; gap:var(--space-3); flex-wrap:wrap; margin-bottom:var(--space-2);` |
| `styles.css:157` | `all` | `.save-title-row h1` | `margin:0; overflow-wrap:anywhere;` |
| `styles.css:158` | `all` | `.title-edit` | `background:none; border:0; padding:4px 0; color:var(--muted); font-size:var(--type-label); cursor:pointer; text-decoration:underline; text-underline-offset:3px;` |
| `styles.css:159` | `all` | `.title-edit:hover` | `color:var(--text);` |
| `styles.css:160` | `all` | `.header-utilities` | `flex-wrap:nowrap; gap:var(--space-2);` |
| `styles.css:161` | `all` | `.header-utilities .btn` | `display:inline-flex; align-items:center; justify-content:center; flex:none; height:36px; text-decoration:none; white-space:nowrap;` |
| `styles.css:162` | `all` | `.header-utilities #back-to-dashboard` | `width:36px; padding:0;` |
| `styles.css:163` | `all` | `.pitch-header` | `flex-wrap:wrap;` |
| `styles.css:164` | `all` | `.pitch-header .segmented` | `margin-left:auto;` |
| `styles.css:165` | `all` | `.pitch-filters` | `display:flex; align-items:center; flex-wrap:wrap; gap:var(--space-4);` |
| `styles.css:166` | `all` | `.pitch-filters .segmented` | `flex-wrap:wrap;` |
| `styles.css:167` | `all` | `.pitch-hint` | `margin:0;` |
| `styles.css:172` | `all` | `h1` | `font-size: var(--type-h1); margin:0 0 8px 0;` |
| `styles.css:173` | `all` | `h2` | `font-size: var(--type-h2);` |
| `styles.css:174` | `all` | `h3` | `font-size: var(--type-h3);` |
| `styles.css:175` | `all` | `h4` | `font-size: var(--type-h4);` |
| `styles.css:176` | `all` | `h5` | `font-size: var(--type-h5);` |
| `styles.css:177` | `all` | `h6` | `font-size: var(--type-h6);` |
| `styles.css:179` | `all` | `.sub` | `margin:0 0 14px; color:var(--muted);` |
| `styles.css:180` | `all` | `.hint` | `margin-top:10px; color:var(--muted);` |
| `styles.css:181` | `all` | `.subtle` | `margin:10px 0 0; color:var(--muted);` |
| `styles.css:182` | `all` | `.mono` | `font-family:var(--mono);` |
| `styles.css:184` | `all` | `.val-neg` | `color: var(--danger);` |
| `styles.css:185` | `all` | `.val-pos` | `color: var(--ok);` |
| `styles.css:186` | `all` | `.val-muted` | `color: var(--muted);` |
| `styles.css:189` | `all` | `.hidden` | `display:none !important;` |
| `styles.css:190` | `all` | `.hidden` | `display: none;` |
| `styles.css:195` | `all` | `.card` | `background-color: var(--bg-secondary); border: 2px solid var(--border); border-radius: 8px; padding: var(--space-card-padding); margin: 16px 0; transition: box-shadow .2s ease, border-color .2s ease; display: flex; flex-direction: column; gap: var(--space-card-items);` |
| `styles.css:206` | `all` | `.card.editing` | `border-color:var(--exciting); box-shadow: 0 0 0 2px color-mix(in srgb, var(--exciting) 18%, transparent), 0 0 28px color-mix(in srgb, var(--exciting) 18%, transparent);` |
| `styles.css:213` | `all` | `.card-head` | `display:flex; align-items:center; justify-content:space-between; gap:12px;` |
| `styles.css:220` | `all` | `.card h2` | `margin:0;text-transform: uppercase;` |
| `styles.css:222` | `all` | `.edit-name` | `margin: 8px 0; letter-spacing: 0.02em; font-family: var(--heading); color: var(--white);` |
| `styles.css:232` | `all` | `.actions` | `display:flex; gap: var(--space-form-fields); flex-wrap:wrap; align-items:center;` |
| `styles.css:239` | `all` | `.btn` | `border: 1px solid transparent; background:var(--surface-hover); color:var(--text); padding:9px 12px; border-radius: var(--radius-cell); cursor:pointer; font-weight: 400; font-family: var(--heading); text-transform: uppercase; font-size: var(--type-label); letter-spacing: 0.02em; flex: 1;` |
| `styles.css:254` | `all` | `button` | `font-family: var(--heading);` |
| `styles.css:256` | `all` | `.btn:hover` | `border-color:var(--border-hover);` |
| `styles.css:257` | `all` | `.btn:active` | `transform: translateY(1px);` |
| `styles.css:258` | `all` | `.btn-primary` | `background:var(--green);color: var(--on-accent);` |
| `styles.css:259` | `all` | `.btn-secondary` | `background: var(--blue);border: 1px solid var(--border);` |
| `styles.css:260` | `all` | `.btn-danger` | `background: var(--danger-bg); border-color: var(--danger-border);` |
| `styles.css:261` | `all` | `.file-btn` | `display:inline-flex; align-items:center;` |
| `styles.css:263` | `all` | `.row-actions` | `display:flex;gap: 4px;justify-content:flex-end;` |
| `styles.css:264` | `all` | `.icon-btn` | `border:1px solid var(--border); background: var(--surface-hover); color:var(--text); padding: 4px 6px; border-radius: var(--radius-cell); cursor:pointer; font-size: var(--type-label); font-weight:700; text-transform: uppercase; letter-spacing: 0.05em;` |
| `styles.css:276` | `all` | `.icon-btn:hover` | `border-color: var(--border-hover);` |
| `styles.css:277` | `all` | `.icon-btn.danger` | `border-color: var(--danger-border); background: var(--danger-bg);` |
| `styles.css:282` | `all` | `.segmented` | `display:inline-flex; border:1px solid var(--border); background: var(--inactive); border-radius: var(--radius-cell); overflow:hidden;` |
| `styles.css:289` | `all` | `.seg-btn` | `border:0; background: transparent; color: var(--muted); padding: 6px 8px; cursor:pointer; font-size: var(--type-toggle-label); text-transform: uppercase;` |
| `styles.css:298` | `all` | `.seg-btn:hover` | `background: var(--surface-hover);` |
| `styles.css:299` | `all` | `.seg-btn.active` | `color: var(--on-accent); background: var(--green);` |
| `styles.css:304` | `all` | `.segmented-secondary` | `background:transparent; border:0; border-radius:0;` |
| `styles.css:309` | `all` | `.segmented-secondary .seg-btn` | `background:transparent; border:0; border-bottom:2px solid var(--border);` |
| `styles.css:314` | `all` | `.segmented-secondary .seg-btn:hover` | `background:transparent; color:var(--text);` |
| `styles.css:318` | `all` | `.segmented-secondary .seg-btn.active` | `background:transparent; color:var(--text); border-bottom-color:var(--green);` |
| `styles.css:327` | `all` | `form#player-form` | `margin-bottom: 10px;` |
| `styles.css:331` | `all` | `label` | `display:flex;flex-direction:column;gap:7px;color: var(--txt-secondary);font-size: var(--type-label);font-family: var(--heading);text-transform: uppercase;letter-spacing: 0.05em;` |
| `styles.css:333` | `all` | `.grid` | `display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: var(--space-form-fields);` |
| `styles.css:338` | `all` | `.grid > label` | `min-width:0;` |
| `styles.css:340` | `all` | `#lookup-suggestions button.is-loading` | `opacity: 0.75; cursor: default;` |
| `styles.css:345` | `all` | `input, select` | `font-family:var(--body-font); background: var(--bg-primary); border:1px solid var(--border); color:var(--text); padding: 8px; border-radius: var(--radius-cell); font-size: var(--type-input); font-weight:400; letter-spacing: 0em; outline:none; height: 40px; width: 100%; max-width: 100%;` |
| `styles.css:361` | `all` | `select` | `appearance:none; -webkit-appearance:none; padding-right:36px; background-image:var(--arrow); background-repeat:no-repeat; background-position:right 12px center; background-size:16px;` |
| `styles.css:371` | `all` | `input[type=checkbox]` | `width: 20px; height: 20px; margin: 0; align-self: flex-start;` |
| `styles.css:378` | `all` | `input:focus, select:focus` | `border-color: var(--focus);` |
| `styles.css:379` | `all` | `input[type="number"]` | `color-scheme: inherit;` |
| `styles.css:380` | `all` | `input:disabled` | `opacity:.55; cursor:not-allowed;` |
| `styles.css:382` | `all` | `input::placeholder` | `color: var(--muted); opacity: 1;` |
| `styles.css:387` | `all` | `input::-webkit-input-placeholder` | `color: var(--muted);` |
| `styles.css:391` | `all` | `input:-ms-input-placeholder` | `color: var(--muted);` |
| `styles.css:398` | `all` | `.totals` | `display:grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap:12px;` |
| `styles.css:403` | `all` | `.total` | `border:1px solid var(--border); background: var(--bg-primary); border-radius:var(--radius-cell); padding:10px 12px; font-family:var(--heading);` |
| `styles.css:410` | `all` | `.total .label` | `color:var(--muted); font-size:var(--type-label); letter-spacing:0.05em; text-transform:uppercase;` |
| `styles.css:411` | `all` | `.total .value` | `font-size:var(--type-h2); margin-top:4px;` |
| `styles.css:413` | `all` | `.search` | `min-width:260px;` |
| `styles.css:414` | `all` | `.select` | `min-width:160px;` |
| `styles.css:419` | `all` | `.table-wrap` | `overflow:auto;border-radius: var(--radius-cell);border:1px solid var(--border);` |
| `styles.css:420` | `all` | `table` | `width:100%; border-collapse:collapse; background: var(--bg-primary); min-width: 440px;` |
| `styles.css:426` | `all` | `thead th` | `position:sticky; top:0; border-bottom:1px solid var(--border); text-align: center; padding: 5px; font-size: var(--type-table-head); text-transform: uppercase; color:var(--muted); white-space:nowrap; font-family: var(--heading);` |
| `styles.css:439` | `all` | `thead th:first-child, tbody td:first-child` | `text-align:left; padding-left: var(--space-2);` |
| `styles.css:444` | `all` | `thead th:last-child, tbody td:last-child` | `text-align:right; padding-right: var(--space-2);` |
| `styles.css:449` | `all` | `tbody td` | `font-family:var(--body-font); padding: 8px 0; border-bottom: 1px solid var(--row-border); vertical-align:middle; text-align:center; white-space:nowrap; min-width: 36px; width: clamp(2rem, 20vw, 10rem);` |
| `styles.css:459` | `all` | `tbody tr:hover td` | `background: var(--surface-hover);` |
| `styles.css:460` | `all` | `tbody tr.flash td` | `animation: flashRow 1.3s ease-out 1;` |
| `styles.css:464` | `all` | `th:first-child, td:first-child` | `position: sticky; left: 0; z-index: 2; background: var(--bg-primary); font-weight: bold;` |
| `styles.css:472` | `all` | `td .cell-contain` | `font-size: var(--type-table-data); width: 32px; margin: 0 auto; text-overflow: ellipsis; overflow: hidden; text-align: center; color: var(--muted); font-weight: 500; letter-spacing:0.02em;` |
| `styles.css:484` | `all` | `td .cell-contain.wide` | `width: clamp(6.5rem, 25vw,12rem); color: var(--white);` |
| `styles.css:489` | `all` | `td.num .cell-contain` | `width:auto; min-width:9ch; padding-inline:var(--space-2); overflow:visible; text-overflow:clip;` |
| `styles.css:496` | `all` | `td .cell-contain.hidden` | `display:none;` |
| `styles.css:500` | `all` | `td:first-child .cell-contain` | `text-align:left; font-family:var(--heading); display: flex; flex-direction: column; gap: 4px; padding: 0; margin: 0;` |
| `styles.css:510` | `all` | `td:first-child .cell-contain strong` | `font-family:inherit; font-weight:inherit;` |
| `styles.css:515` | `all` | `td:first-child .cell-contain span` | `font-family:var(--body-font); font-size: var(--type-table-data); color: var(--muted);` |
| `styles.css:521` | `all` | `td:first-child .cell-contain span.badge` | `padding:0; border:none; background:transparent;` |
| `styles.css:528` | `@keyframes flashRow` | `0%` | `background: color-mix(in srgb, var(--exciting) 22%, transparent);` |
| `styles.css:529` | `@keyframes flashRow` | `100%` | `background: rgba(255,255,255,0);` |
| `styles.css:531` | `all` | `.num` | `{}` |
| `styles.css:536` | `all` | `.badge` | `font-size:12px; padding:4px 8px; border-radius:var(--radius-cell); border:1px solid var(--border); display:inline-flex; gap:6px; align-items:center;` |
| `styles.css:545` | `all` | `.badge.special` | `border-color:var(--special);background:color-mix(in srgb, var(--special) 12%, var(--bg-secondary)); color: var(--special);` |
| `styles.css:546` | `all` | `.badge.exciting` | `border-color:var(--exciting); background:color-mix(in srgb, var(--exciting) 10%, var(--bg-secondary)); color: var(--exciting);` |
| `styles.css:547` | `all` | `.badge.great` | `border-color:var(--great); background:color-mix(in srgb, var(--great) 10%, var(--bg-secondary)); color: var(--great);` |
| `styles.css:548` | `all` | `.badge.sell` | `border-color:var(--danger-border); background: var(--danger-bg); color: var(--sell);` |
| `styles.css:551` | `all` | `.auto-badge` | `display:inline-block; margin-top:0; padding:0; font-size:var(--type-toggle-label); font-weight:400; border-radius:0; border:0; color:var(--green); background:none; box-shadow:none;` |
| `styles.css:567` | `all` | `.suggest-box` | `position: relative;` |
| `styles.css:570` | `all` | `.suggestions` | `position: absolute; left: 0; right: 0; top: calc(100% + 4px); z-index: 50; background: var(--black); border: 1px solid var(--border); border-radius: var(--radius-cell); max-height: 320px; overflow-y: auto; -webkit-overflow-scrolling: touch; box-shadow: 0 10px 30px rgba(0,0,0,0.35);` |
| `styles.css:586` | `all` | `.suggestions.hidden` | `display:none;` |
| `styles.css:587` | `all` | `.suggestions button` | `width: 100%; text-align: left; background: transparent; border: 0; color: inherit; padding: 8px 8px; cursor: pointer; display: flex; gap: 10px; font-size:10px; justify-content: space-between; align-items: baseline;` |
| `styles.css:601` | `all` | `.suggestions button:hover` | `background: var(--surface-hover);` |
| `styles.css:604` | `all` | `.s-main` | `font-weight: 600;` |
| `styles.css:605` | `all` | `.s-meta` | `opacity: 0.75; font-size: 8px; white-space: nowrap;` |
| `styles.css:610` | `all` | `.footer` | `margin:18px 0 30px; color:var(--muted); font-size:13px;` |
| `styles.css:615` | `all` | `.checkbox-label` | `display:inline-flex; align-items:center; flex-direction:row; gap:6px; color:var(--muted); font-size:var(--type-toggle-label); padding:0; border:0; background:none;` |
| `styles.css:626` | `all` | `.checkbox-label input[type="checkbox"]` | `width:auto; height:auto; max-width:none; flex:none; align-self:center; margin:0;` |
| `styles.css:635` | `all` | `tbody tr.inactive td .cell-contain` | `font-style: italic; color:var(--muted);` |
| `styles.css:640` | `all` | `th.sortable` | `cursor:pointer; user-select:none;` |
| `styles.css:641` | `all` | `th.sortable.active-sort` | `color: var(--text);` |
| `styles.css:642` | `all` | `th.sortable .arrow` | `margin: 2px 0 0 3px;color: var(--text);font-weight:900;position: absolute;font-size: 6px;` |
| `styles.css:645` | `all` | `#filter-active` | `display:none;` |
| `styles.css:648` | `all` | `#save-rows td` | `font-family: var(--body-font); font-size: var(--type-table-data);` |
| `styles.css:652` | `all` | `#save-rows td:not(:first-child):not(:last-child)` | `color: var(--muted); font-weight: 500; letter-spacing: 0.02em;` |
| `styles.css:657` | `all` | `#save-rows span.subtle` | `display: none;` |
| `styles.css:658` | `all` | `.save-name-input` | `width:100%; font-weight:700;` |
| `styles.css:663` | `all` | `.modal.hidden` | `display:none;` |
| `styles.css:664` | `all` | `.modal` | `position:fixed; inset:0; z-index:9999;` |
| `styles.css:665` | `all` | `.modal-backdrop` | `position:absolute; inset:0; background:rgba(0,0,0,0.6);` |
| `styles.css:668` | `all` | `.modal-panel` | `position:relative; width:min(720px, calc(100vw - 24px)); margin:10px auto; height: calc(100dvh - 20px); background:var(--bg-secondary); border:1px solid var(--border); border-radius:16px; padding:14px; box-shadow:0 20px 60px rgba(0,0,0,0.55); display:flex; flex-direction:column;` |
| `styles.css:686` | `all` | `.modal-head` | `display:flex; align-items:center; justify-content:space-between; gap:12px;` |
| `styles.css:688` | `all` | `.modal-body` | `flex:1; overflow:auto; -webkit-overflow-scrolling: touch; padding-bottom: 10px;` |
| `styles.css:696` | `all` | `.modal-foot` | `display:flex; gap:10px; align-items:center; flex-wrap:wrap; padding-top:10px; border-top:1px solid var(--border); position: sticky; bottom: 0; background:var(--bg-secondary);` |
| `styles.css:708` | `all` | `#scan-status` | `margin-left:auto;` |
| `styles.css:710` | `all` | `#scan-video` | `width:100%; height:auto; max-height:55dvh; border-radius:12px; background:#000; object-fit: cover;` |
| `styles.css:720` | `all` | `.scan-frame` | `position: relative; width: 100%;` |
| `styles.css:725` | `all` | `.scan-overlay` | `position: absolute; inset: 0; pointer-events: none;` |
| `styles.css:732` | `all` | `.scan-box` | `position: absolute; left: 6%; top: 6%; width: 88%; height: 30%; border-radius: 14px; border: 2px solid rgba(57, 255, 20, 0.95); box-shadow: 0 0 0 9999px rgba(0,0,0,0.35), 0 0 14px rgba(57, 255, 20, 0.55), 0 0 28px rgba(57, 255, 20, 0.35), inset 0 0 12px rgba(57, 255, 20, 0.22);` |
| `styles.css:749` | `all` | `#scan-zoom` | `width:160px;` |
| `styles.css:754` | `all` | `.pitch-wrap` | `width: 100%; overflow: auto; display: flex; justify-content: center;` |
| `styles.css:762` | `all` | `.pitch` | `position: relative; isolation: isolate; width: 100%; overflow: scroll; border-radius: var(--radius-cell); border: 1px solid var(--border); background:var(--pitch-bg); display: grid; grid-auto-rows: minmax(min-content, max-content); grid-template-areas: ". . st . ." "lm . cam . rm" ". cml . cmr ." ". . cdm . ." "lb cbl . cbr rb" ". . gk . ."; gap: 12px 10px; padding: 20px 4px; box-sizing: border-box; justify-content: center; align-content: start;` |
| `styles.css:792` | `all` | `.pitch::before` | `z-index:0; content: ""; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--pitch-line); pointer-events: none;` |
| `styles.css:806` | `all` | `.pitch::after` | `z-index:0; content: ""; position: absolute; left: 50%; top: 50%; width: 28%; aspect-ratio: 1 / 1; border-radius: 999px; transform: translate(-50%, -50%); border: 1px solid var(--pitch-line); pointer-events: none;` |
| `styles.css:821` | `all` | `.pitch-pos` | `position: relative; z-index:1; width: 100%; border-radius: var(--radius-cell); backdrop-filter: blur(6px); box-sizing: border-box; overflow: hidden; width: 64px;` |
| `styles.css:833` | `all` | `.pitch-pos .head` | `display: flex; align-items: center; justify-content: center; gap: 8px; padding: 4px; background: var(--pitch-panel);` |
| `styles.css:842` | `all` | `.pitch-pos .pos-code` | `font-weight: 700; letter-spacing: 0.02em; font-size: 9px;` |
| `styles.css:848` | `all` | `.pitch-pos .count` | `opacity: 0.75; font-size: 10px; display: none;` |
| `styles.css:855` | `all` | `.pitch-pos ul` | `list-style: none; margin: 0; padding: 0; display: grid; gap: 0px; background: var(--pitch-panel); border-radius: 0 0 var(--radius-cell) var(--radius-cell);` |
| `styles.css:866` | `all` | `.pitch-pos li` | `display: flex; align-items: baseline; justify-content: space-between; gap: 10px; font-size: 12px; white-space: nowrap;` |
| `styles.css:875` | `all` | `.pitch-pos li:nth-child(odd)` | `background-color: var(--pitch-row);` |
| `styles.css:878` | `all` | `.pitch-pos li:nth-child(even)` | `background-color: var(--pitch-row-alt);` |
| `styles.css:883` | `all` | `.pitch-pos .name` | `overflow: hidden; text-overflow: ellipsis;` |
| `styles.css:889` | `all` | `.pitch-pos .meta` | `opacity: 0.85; font-variant-numeric: tabular-nums;` |
| `styles.css:895` | `all` | `.pitch-pos.empty ul` | `{}` |
| `styles.css:902` | `all` | `.pitch-pos li` | `display: flex; align-items: baseline; justify-content: center; gap: 0px; font-size: 9px; font-weight: bold; white-space: nowrap; padding: 4px 2px;` |
| `styles.css:913` | `all` | `.pitch-pos .name` | `overflow: hidden; text-overflow: ellipsis; max-width: 48px;` |
| `styles.css:920` | `all` | `.pitch-pos .meta` | `opacity: 0.8; font-variant-numeric: tabular-nums; display: none;` |
| `styles.css:927` | `all` | `.pitch-pos.empty ul` | `{}` |
| `styles.css:939` | `@media (max-width: 900px)` | `.grid` | `grid-template-columns: repeat(2, minmax(0, 1fr));` |
| `styles.css:940` | `@media (max-width: 900px)` | `.totals` | `grid-template-columns: repeat(2, minmax(0, 1fr));` |
| `styles.css:944` | `@media (min-width: 1200px)` | `.pitch-pos ul` | `max-height: 220px;` |
| `styles.css:948` | `@media (max-width: 768px)` | `.container` | `padding-inline: var(--space-page-gutter);` |
| `styles.css:953` | `all` | `:where(button, a, input, select):focus-visible` | `outline:3px solid var(--focus); outline-offset:3px;` |
| `styles.css:957` | `all` | `input[type="checkbox"]` | `accent-color:var(--green);` |
| `styles.css:958` | `all` | `.footer` | `display:flex; align-items:flex-end; justify-content:space-between; gap:16px; flex-wrap:wrap;` |
| `styles.css:959` | `all` | `.footer > p` | `flex:1; margin:0;` |
| `styles.css:960` | `all` | `.theme-control` | `display:flex; margin-left:auto; order:1;` |
| `styles.css:961` | `all` | `.theme-switch` | `position:relative; display:inline-flex; align-items:center; justify-content:space-around; width:56px; height:28px; padding:2px; border:1px solid var(--border); border-radius:999px; background:var(--bg-primary); color:var(--muted); cursor:pointer;` |
| `styles.css:975` | `all` | `.theme-switch-thumb` | `position:absolute; top:2px; left:2px; width:22px; height:22px; border-radius:999px; background:var(--blue); transition:transform .2s ease;` |
| `styles.css:985` | `all` | `.theme-switch[aria-checked="true"] .theme-switch-thumb` | `transform:translateX(28px);` |
| `styles.css:986` | `all` | `.theme-switch-icon` | `position:relative; width:16px; height:16px;` |
| `styles.css:987` | `all` | `.theme-switch[aria-checked="true"] .theme-switch-icon:last-child, .theme-switch[aria-checked="false"] .theme-switch-icon:nth-child(2)` | `color:var(--text);` |
| `styles.css:989` | `all` | `.theme-footer` | `margin-top:auto;` |
| `styles.css:990` | `all` | `body` | `min-height:100dvh; height:auto; display:flex; flex-direction:column;` |
| `styles.css:991` | `all` | `body > main` | `width:100%; flex:1; display:flex; flex-direction:column;` |
| `styles.css:992` | `all` | `main > .footer` | `margin-top:auto; padding-top:18px;` |
| `styles.css:993` | `all` | `input, select, .btn-secondary, .icon-btn, .segmented` | `border-color:var(--control-border);` |
| `styles.css:994` | `all` | `.segmented-secondary` | `border:0;` |
| `styles.css:995` | `all` | `.segmented-secondary .seg-btn` | `border-bottom-color:var(--control-border);` |
| `styles.css:996` | `all` | `.segmented-secondary .seg-btn.active` | `border-bottom-color:var(--green);` |
| `styles.css:997` | `all` | `.icon-btn, .seg-btn` | `min-height:32px;` |
| `styles.css:998` | `all` | `.title-edit` | `min-height:24px;` |
| `styles.css:1000` | `@media (prefers-reduced-motion: reduce)` | `*, *::before, *::after` | `animation:none !important; transition:none !important;` |
| `styles.css:1003` | `@media (forced-colors: active)` | `select` | `appearance:auto; background-image:none;` |
| `styles.css:1004` | `@media (forced-colors: active)` | `.segmented-secondary .seg-btn.active` | `border-bottom:3px solid Highlight;` |

### Login inline stylesheet

| Source | Condition | Selector | Exact declarations |
| --- | --- | --- | --- |
| `login.html:13` | `all` | `.login-wrap` | `max-width: 520px; margin: 64px auto; padding: 0 16px;` |
| `login.html:14` | `all` | `.login-wrap .row` | `display: flex; gap: var(--space-form-fields); flex-wrap: wrap;` |
| `login.html:15` | `all` | `.login-wrap .row > *` | `flex: 1; min-width: min(180px, 100%);` |
| `login.html:16` | `all` | `.login-wrap label` | `margin-bottom: 7px;` |
| `login.html:17` | `all` | `.login-wrap input` | `font-size: 16px;` |
| `login.html:18` | `all` | `.login-wrap .muted` | `color: var(--muted);` |
| `login.html:19` | `all` | `.login-wrap .error` | `color: var(--danger); white-space: pre-wrap;` |
| `login.html:20` | `all` | `.login-wrap .ok` | `color: var(--ok); white-space: pre-wrap;` |
| `login.html:21` | `all` | `.login-wrap #confirm-block` | `display: flex; flex-direction: column; gap: var(--space-card-items);` |
| `login.html:22` | `all` | `.login-wrap #status:empty, .login-wrap #error:empty, .login-wrap #ok:empty` | `display: none;` |

## Appendix B. Source DOM structures and inline styles (S)

Trees include initially hidden nodes and their source attributes. Text and SVG paths are preserved; comments and scripts are omitted. JavaScript changes are described in §4 and Appendix C. This is markup structure, not a claim that every node is visible. Browser-owned option/menu rendering remains external.

### index.html

```text
body
  header class='app-header'
    div class='container'
      div class='card-head page-header'
        div
          div class='save-title-row'
            h1
              text: Dashboard
          p class='sub'
            text: Create, open and delete career mode trackers. Data is saved to AWS (your account).
        div class='actions header-utilities'
          button id='btn-signout' class='btn btn-secondary' type='button'
            text: Sign out
  main class='container'
    section class='card'
      div class='card-head'
        h2
          text: Career saves
        div class='actions'
          button id='btn-add-save' class='btn btn-primary' type='button'
            text: Add new career save
      div class='table-wrap'
        table style='min-width: 640px;'
          thead
            tr
              th
                text: Save
              th
                text: Created
              th class='num'
                text: Players
              th class='num'
                text: Profit
              th
          tbody id='save-rows'
      p class='subtle' id='empty-state' style='display:none; margin-top: 12px;'
        text: No career saves yet. Click
        span class='mono'
          text: Add new career save
        text: to get started.
    footer class='footer'
      div class='theme-control'
        button class='theme-switch' type='button' role='switch' data-theme-toggle aria-label='Dark mode' aria-checked='true' title='Toggle light and dark mode'
          span class='theme-switch-thumb' aria-hidden='true'
          svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'
            circle cx='12' cy='12' r='4'
            path d='M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'
          svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linejoin='round' aria-hidden='true'
            path d='M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z'
      p
        text: Tip: your saves are tied to your login, so you can access them on any device.
```

### tracker.html

```text
body
  header class='app-header'
    div class='container'
      div class='card-head page-header'
        div
          div class='save-title-row'
            h1 id='save-title'
              text: FC26 Transfer Tracker Test
            button id='edit-save-title' class='title-edit' type='button'
              text: Edit title
          p class='sub' id='save-sub'
            text: Track transfer cost, sale, profit and ROI per player. Data is saved to AWS (your account name here).
        div class='actions header-utilities'
          a id='back-to-dashboard' class='btn btn-secondary' href='./index.html' aria-label='Dashboard' title='Dashboard'
            svg width='18' height='18' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' aria-hidden='true'
              rect x='3' y='3' width='7' height='7' rx='1'
              rect x='14' y='3' width='7' height='7' rx='1'
              rect x='3' y='14' width='7' height='7' rx='1'
              rect x='14' y='14' width='7' height='7' rx='1'
          button id='btn-seed-master' class='btn btn-secondary hidden' type='button'
            text: Seed Player DB
          input id='master-file' class='hidden' type='file' accept='.csv,text/csv'
          button id='btn-signout' class='btn btn-secondary' type='button'
            text: Sign out
  main class='container'
    section class='card' id='edit-card'
      div class='card-head'
        h2
          text: Add / Edit player
        div class='actions'
          div class='segmented' role='tablist' aria-label='Currency'
            button class='seg-btn active' data-currency='GBP' type='button'
              text: £
            button class='seg-btn' data-currency='EUR' type='button'
              text: €
            button class='seg-btn' data-currency='USD' type='button'
              text: $
      button id='btn-scan' class='btn btn-secondary' type='button'
        text: Scan from camera
      button id='btn-rescan' class='btn btn-secondary hidden' type='button'
        text: Rescan header
      div id='edit-player-name' class='edit-name'
        text: New Player
      form id='player-form' autocomplete='off'
        div class='grid'
          label class='suggest-box' style='grid-column: 1 / -1;'
            text: Search player database
            input id='f-lookup' placeholder='Type a name… (e.g. Bellingham)'
            div id='lookup-suggestions' class='suggestions hidden'
          label
            text: Forename
            input id='f-first' required placeholder='New'
            span id='auto-first' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Surname
            input id='f-surname' required placeholder='Player'
            span id='auto-surname' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Seniority
            select id='f-seniority'
              option value='Senior' selected
                text: Senior
              option value='Youth'
                text: Youth
              option value='Watchlist'
                text: Shortlist
          label
            text: Homegrown?
            input id='f-homegrown' type='checkbox'
          label
            text: Position
            select id='f-pos' required
              option value='' selected disabled
                text: Select…
              option value='GK'
                text: GK
              option value='RB'
                text: RB
              option value='CB'
                text: CB
              option value='LB'
                text: LB
              option value='CDM'
                text: CDM
              option value='CM'
                text: CM
              option value='CAM'
                text: CAM
              option value='LM'
                text: LM
              option value='RM'
                text: RM
              option value='ST'
                text: ST
            span id='auto-pos' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Strong foot
            select id='f-foot' required
              option value='R' selected
                text: Right
              option value='L'
                text: Left
            span id='auto-foot' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Overall
            input id='f-intl' type='number' min='1' max='99' step='1' required placeholder='65'
            span id='auto-intl' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Potential Min.
            input id='f-potmin' type='number' min='1' max='99' step='1' required placeholder='65'
            span id='auto-potmin' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Potential Max.
            input id='f-potmax' type='number' min='1' max='99' step='1' required placeholder='90'
            span id='auto-potmax' class='auto-badge hidden'
              text: Auto-detected
          label
            text: Current player?
            select id='f-active'
              option value='Y' selected
                text: Yes
              option value='N'
                text: No (Sold)
          label
            text: Cost
            input id='f-cost' type='text' inputmode='numeric' placeholder='0'
          label
            text: Sale
            input id='f-sale' type='text' inputmode='numeric' placeholder='0'
      div class='actions'
        button id='btn-cancel' class='btn btn-secondary hidden' type='button'
          text: Cancel
        button id='btn-add' class='btn btn-primary' type='button'
          text: Add player
        button id='btn-update' class='btn btn-primary hidden' type='button'
          text: Update player
        button id='btn-clear' class='btn btn-secondary' type='button'
          text: Clear
    section class='card'
      div class='card-head'
        h2
          text: Totals
        div class='actions'
          div class='segmented' role='tablist' aria-label='Seniority filter'
            button class='seg-btn active' data-seniority='Senior' type='button'
              text: Senior
            button class='seg-btn' data-seniority='Youth' type='button'
              text: Youth
            button class='seg-btn' data-seniority='Watchlist' type='button'
              text: Shortlist
            button class='seg-btn' data-seniority='All' type='button'
              text: All
          button id='btn-export' class='btn btn-secondary hidden' type='button'
            text: Export JSON
          label class='btn btn-secondary file-btn hidden' for='import-file'
            text: Import JSON
          input id='import-file' class='hidden' type='file' accept='application/json'
          button id='btn-reset' class='btn btn-danger hidden' type='button'
            text: Reset all
      div class='totals'
        div class='total'
          div class='label'
            text: Total spend
          div id='t-cost' class='value val-neg'
            text: £0
        div class='total'
          div class='label'
            text: Total sales
          div id='t-sale' class='value val-pos'
            text: £0
        div class='total'
          div class='label'
            text: Total profit
          div id='t-profit' class='value'
            text: £0
        div class='total'
          div class='label'
            text: Average ROI
          div id='t-roi' class='value'
            text: —
      p class='subtle'
        text: Average ROI is computed over players with a non-zero cost and a sale value.
    section class='card'
      div class='card-head'
        h2
          text: Players
        div class='actions'
          div class='segmented' role='tablist' aria-label='Seniority filter'
            button class='seg-btn active' data-seniority='Senior' type='button'
              text: Senior
            button class='seg-btn' data-seniority='Youth' type='button'
              text: Youth
            button class='seg-btn' data-seniority='Watchlist' type='button'
              text: Shortlist
            button class='seg-btn' data-seniority='All' type='button'
              text: All
          select id='filter-active' class='select'
            option value='ALL' selected
              text: All
            option value='Y'
              text: Active (Y)
            option value='N'
              text: Sold (N)
      input id='search' class='search' placeholder='Search name / position…'
      label class='checkbox-label'
        input type='checkbox' id='toggle-ex'
        span
          text: Show ex-players
      div id='players-count' class='subtle' style='margin: 8px 0 6px;'
        text: Showing 0 players
      div class='table-wrap'
        table
          thead
            tr
              th data-sort='player' class='sortable'
                text: Player
              th data-sort='position' class='sortable'
                text: Pos
              th data-sort='ovr' class='sortable'
                text: Ovr
              th data-sort='potential' class='sortable'
                text: Pot
              th data-sort='cost' class='num sortable'
                text: Cost
              th data-sort='sale' class='num sortable'
                text: Sale
              th
          tbody id='rows'
    section class='card' id='pitch-card'
      div class='card-head pitch-header'
        h2
          text: Squad on pitch
        div class='segmented' role='tablist' aria-label='Pitch sort'
          button class='seg-btn active' data-pitch-sort='ovr' type='button'
            text: Overall
          button class='seg-btn' data-pitch-sort='potential' type='button'
            text: Potential
      select id='formation-select' aria-label='Formation'
      p class='subtle pitch-hint'
        text: Players are grouped by position. Use the squad filters below to choose who appears.
      div class='pitch-filters'
        div class='segmented segmented-secondary' role='tablist' aria-label='Pitch seniority'
          button class='seg-btn active' data-pitch-seniority='Senior' type='button'
            text: Senior
          button class='seg-btn' data-pitch-seniority='Youth' type='button'
            text: Youth
          button class='seg-btn' data-pitch-seniority='All' type='button'
            text: Senior + Youth
          button class='seg-btn' data-pitch-seniority='Homegrown' type='button'
            text: Homegrown
        label class='checkbox-label'
          input type='checkbox' id='pitch-watchlist'
          span
            text: Include shortlist
      div class='pitch-wrap'
        div class='pitch' id='pitch'
    div id='scan-modal' class='modal hidden' role='dialog' aria-modal='true' aria-label='Scan player card'
      div class='modal-backdrop' data-scan-close
      div class='modal-panel'
        div class='modal-head'
          h3 style='margin:0;'
            text: Scan player
          button class='btn btn-secondary' type='button' data-scan-close
            text: Close
        div class='modal-body'
          p class='subtle' style='margin-top:8px;'
            text: Point your camera at the player overview screen, then tap Capture.
          div class='scan-frame'
            video id='scan-video' autoplay playsinline
            div class='scan-overlay' aria-hidden='true'
              div class='scan-box'
          canvas id='scan-canvas' class='hidden'
          pre id='scan-debug' class='hidden' style='white-space:pre-wrap; margin-top:10px;'
        div class='modal-foot'
          button id='btn-scan-capture' class='btn btn-primary' type='button'
            text: Capture
          input id='scan-zoom' type='range' min='1' max='1' step='0.1' value='1'
          div id='scan-status' class='subtle'
            text: Camera idle
    footer class='footer'
      div class='theme-control'
        button class='theme-switch' type='button' role='switch' data-theme-toggle aria-label='Dark mode' aria-checked='true' title='Toggle light and dark mode'
          span class='theme-switch-thumb' aria-hidden='true'
          svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'
            circle cx='12' cy='12' r='4'
            path d='M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'
          svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linejoin='round' aria-hidden='true'
            path d='M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z'
      p
        text: Tip: your saves are tied to your login, so you can access them on any device.
```

### login.html

```text
body
  div class='login-wrap'
    h1
      text: FC26 Transfer Tracker
    p class='muted'
      text: Sign in to access your career saves on any device.
    div class='card'
      div class='row'
        div
          label for='email'
            text: Email
          input id='email' type='email' autocomplete='email' placeholder='you@email.com'
        div
          label for='password'
            text: Password
          input id='password' type='password' autocomplete='current-password' placeholder='••••••••'
      div class='row'
        button id='btn-signin' class='btn btn-primary' type='button'
          text: Sign in
        button id='btn-signup' class='btn btn-secondary' type='button'
          text: Create account
      div id='confirm-block' class='hidden'
        p class='muted' style='margin: 0 0 8px 0;'
          text: Enter the verification code sent to your email.
        div class='row'
          input id='confirm-code' inputmode='numeric' placeholder='Verification code'
          button id='btn-confirm' class='btn btn-primary' type='button'
            text: Confirm account
          button id='btn-resend' class='btn btn-secondary' type='button'
            text: Resend code
      div id='status' class='muted'
      div id='error' class='error'
      div id='ok' class='ok'
  footer class='footer container theme-footer'
    div class='theme-control'
      button class='theme-switch' type='button' role='switch' data-theme-toggle aria-label='Dark mode' aria-checked='true' title='Toggle light and dark mode'
        span class='theme-switch-thumb' aria-hidden='true'
        svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linecap='round' aria-hidden='true'
          circle cx='12' cy='12' r='4'
          path d='M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5'
        svg class='theme-switch-icon' viewbox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.8' stroke-linejoin='round' aria-hidden='true'
          path d='M20.5 14A9 9 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z'
```

## Appendix C. Exact JavaScript-generated DOM templates (S)

These excerpts retain source comments to distinguish disabled columns. Variable substitutions are content, not extra component types. Effective styling is the ordered CSS ledger.

### Career row — `dashboard.js:80`

```javascript
    tr.innerHTML = `
      <td>
        <div class="cell-contain wide">
          <strong>${escapeHtml(s.name || s.title || "Untitled save")}</strong>
          <span class="subtle">${escapeHtml(s.id)}</span>
        </div>
      </td>
      <td>${fmtDate(getSaveCreatedIso(s))}</td>
      <td class="num">${stat.count}</td>
      <td class="num">${fmtMoneyAbbrevGBP(stat.profit)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" type="button" data-open>Open</button>
          <button class="icon-btn" type="button" data-edit>Edit</button>
          <button class="icon-btn danger" type="button" data-del>Delete</button>
        </div>
      </td>
    `;
```

### Player row — `app.js:1463`

```javascript
    tr.innerHTML = `
      <td><div class="cell-contain wide">${escapeHtml(displayName(p))} <div class="player-meta"><span><span class="badge ${badgeClass(status)}">${status}</span> • ${escapeHtml(p.seniority === "Watchlist" ? "Shortlist" : (p.seniority || "Senior"))} • ${escapeHtml((p.foot === "L") ? "L" : "R")}</span></div></div></td>
      <td><div class="cell-contain">${escapeHtml(p.pos || "")}</div></td>
      <!-- <td><div class="cell-contain">${escapeHtml((p.foot === "L") ? "L" : "R")}</div></td> -->
      <td><div class="cell-contain">${escapeHtml(String(p.intl ?? ""))}</div></td>
      <td><div class="cell-contain">${avgDisplay}</div></td>
      <!-- <td><div class="cell-contain wide"><span class="badge ${badgeClass(status)}">${status}</span></div></td>
      <td><div class="cell-contain wide">${escapeHtml(p.seniority === "Watchlist" ? "Shortlist" : (p.seniority || "Senior"))}</div></td>
      <td><div class="cell-contain">${p.homegrown ? "Y" : "N"}</div></td> -->
      <td class="num"><div class="cell-contain"><span class="val-neg">${fmtMoneyAbbrevFromGBP(p.cost_gbp || 0, currency)}</span></div></td>
      <td class="num"><div class="cell-contain">${saleCell}</div></td>
      <!--<td class="num"><div class="cell-contain"><span class="${valClassFromNumber(profGBP)}">${fmtMoneyAbbrevFromGBP(profGBP, currency)}</span></div></td>
      <td class="num"><div class="cell-contain"><span class="${valClassFromNumber(Number.isFinite(r)?r:NaN)}">${fmtPct(r)}</span></div></td>-->
      <td>
        <div class="row-actions">
          <button class="icon-btn" data-action="edit" data-id="${p.id}">Edit</button>
          <button class="icon-btn danger" data-action="delete" data-id="${p.id}">Delete</button>
        </div>
      </td>`;
```

### Lookup loading and result rows — `app.js:1078`

```javascript
  lookupBox.innerHTML = items.map((m, i) => {
    if (m && m.__loading){
      const msg = escapeHtml(m.shortName || "Loading player database…");
      const meta = escapeHtml(m.__meta || "");
      return `
        <button type="button" class="is-loading" disabled>
          <span class="s-main">${msg}</span>
          ${meta ? `<span class="s-meta">${meta}</span>` : ``}
        </button>
      `;
    }

    const name = escapeHtml(displayMasterName(m));
    const pos = escapeHtml(pickPrimaryPosition(m.playerPositions || "") || "");
    const meta = `${pos} • ${m.overall ?? "?"}/${m.potential ?? "?"} • ${(normMasterFoot(m.preferredFoot) === "L") ? "L" : "R"}`;
    return `
      <button type="button" data-idx="${i}">
        <span class="s-main">${name}</span>
        <span class="s-meta">${escapeHtml(meta)}</span>
      </button>
    `;
  }).join("");
```

### Pitch position and player rows — `app.js:1769`

```javascript
    const panel = document.createElement("div");
    panel.className = "pitch-pos" + (list.length ? "" : " empty");
    panel.style.gridArea = slot.area;

    const head = document.createElement("div");
    head.className = "head";
    head.innerHTML = `
      <div class="pos-code">${escapeHtml(slot.pos)}</div>
      <div class="count">${list.length}</div>
    `;
    panel.appendChild(head);

    const ul = document.createElement("ul");

    if (!list.length){
      const li = document.createElement("li");
      li.textContent = "No players";
      ul.appendChild(li);
    } else {
      // Show up to N; you can increase if you want.
      const shown = list;

      for (const p of shown){
        const line = pitchPlayerLine(p);
        const li = document.createElement("li");
        li.innerHTML = `
          <span class="name">${escapeHtml(line.name)}</span>
          <span class="meta">${escapeHtml(line.meta)}</span>
        `;
        ul.appendChild(li);
      }
    }

    panel.appendChild(ul);
```

Other generated structures: formation `<option value="key">label</option>` in `app.js applyFormation` selector setup; sorting `<span class="arrow">▲|▼</span>` in `updateSortIndicators`; lookup/error `<div class="s-err">Lookup error: escaped message</div>` in `runLookup` and Add handler. All are included in the inventory. The export anchor is transient and is not visible app UI.

## Appendix D. Exact formation grids and nested position instances (S)

Source: `formations.js FORMATIONS`. Each quoted grid row contains five CSS grid cells; `.` is an empty cell, not a component instance. `layout` order is DOM order and bucket-assignment order. Preserve every empty row as a grid track; do not infer that name of area changes displayed position. Default: `4-2-3-1`. All forms except `3-4-2-1` have11 instances; that form has10.

### 3-4-2-1 — 10 PositionPanel instances

```text
. . st . .
. caml . camr .
lm . . . rm
. . cdm . .
. cbl cbm cbr .
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `CAM` | `caml` | 2, 2 |
| 3 | `CAM` | `camr` | 2, 4 |
| 4 | `LM` | `lm` | 3, 1 |
| 5 | `RM` | `rm` | 3, 5 |
| 6 | `CDM` | `cdm` | 4, 3 |
| 7 | `CB` | `cbl` | 5, 2 |
| 8 | `CB` | `cbm` | 5, 3 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `GK` | `gk` | 6, 3 |

### 3-5-2 — 11 PositionPanel instances

```text
. stl . str .
lm . cam . rm
. cml . cmr .
. cbl cbm cbr .
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `LM` | `lm` | 2, 1 |
| 4 | `RM` | `rm` | 2, 5 |
| 5 | `CAM` | `cam` | 2, 3 |
| 6 | `CM` | `cml` | 3, 2 |
| 7 | `CM` | `cmr` | 3, 4 |
| 8 | `CB` | `cbl` | 4, 2 |
| 9 | `CB` | `cbm` | 4, 3 |
| 10 | `CB` | `cbr` | 4, 4 |
| 11 | `GK` | `gk` | 5, 3 |

### 4-1-2-1-2 — 11 PositionPanel instances

```text
. stl . str .
. . cam . .
. cml . cmr .
. . cdm . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `CAM` | `cam` | 2, 3 |
| 4 | `CM` | `cml` | 3, 2 |
| 5 | `CM` | `cmr` | 3, 4 |
| 6 | `CDM` | `cdm` | 4, 3 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-1-3-2 — 11 PositionPanel instances

```text
. stl . str .
lm . . . rm
. . cm . .
. . cdm . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `LM` | `lm` | 2, 1 |
| 4 | `RM` | `rm` | 2, 5 |
| 5 | `CM` | `cm` | 3, 3 |
| 6 | `CDM` | `cdm` | 4, 3 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-1-4-1 — 11 PositionPanel instances

```text
. . st . .
lm cml . cmr rm
. . cdm . .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `LM` | `lm` | 2, 1 |
| 3 | `RM` | `rm` | 2, 5 |
| 4 | `CM` | `cml` | 2, 2 |
| 5 | `CM` | `cmr` | 2, 4 |
| 6 | `CDM` | `cdm` | 3, 3 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-2-1-3 — 11 PositionPanel instances

```text
. lm st rm .
. . cam . .
. cml . cmr .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `LM` | `lm` | 1, 2 |
| 2 | `RM` | `rm` | 1, 4 |
| 3 | `ST` | `st` | 1, 3 |
| 4 | `CAM` | `cam` | 2, 3 |
| 5 | `CM` | `cml` | 3, 2 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-2-2-2 — 11 PositionPanel instances

```text
. stl . str .
. caml . camr .
. cml . cmr .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `CAM` | `caml` | 2, 2 |
| 4 | `CAM` | `camr` | 2, 4 |
| 5 | `CM` | `cml` | 3, 2 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-2-3-1 — 11 PositionPanel instances

```text
. . st . .
lm . cam . rm
. cml . cmr .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `LM` | `lm` | 2, 1 |
| 3 | `RM` | `rm` | 2, 5 |
| 4 | `CAM` | `cam` | 2, 3 |
| 5 | `CM` | `cml` | 3, 2 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-3-1-2 — 11 PositionPanel instances

```text
. stl . str .
. . cam . .
. cml cmc cmr .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `CAM` | `cam` | 2, 3 |
| 4 | `CM` | `cml` | 3, 2 |
| 5 | `CM` | `cmc` | 3, 3 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-3-3 — 11 PositionPanel instances

```text
lm . st . rm
. cml cmc cmr .
. . . . .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `LM` | `lm` | 1, 1 |
| 2 | `RM` | `rm` | 1, 5 |
| 3 | `ST` | `st` | 1, 3 |
| 4 | `CM` | `cml` | 2, 2 |
| 5 | `CM` | `cmc` | 2, 3 |
| 6 | `CM` | `cmr` | 2, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-4-1-1 — 11 PositionPanel instances

```text
. . st . .
. . cam . .
lm cml . cmr rm
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `CAM` | `cam` | 2, 3 |
| 3 | `LM` | `lm` | 3, 1 |
| 4 | `RM` | `rm` | 3, 5 |
| 5 | `CM` | `cml` | 3, 2 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-4-2 — 11 PositionPanel instances

```text
. stl . str .
lm . . . rm
. cml . cmr .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `LM` | `lm` | 2, 1 |
| 4 | `RM` | `rm` | 2, 5 |
| 5 | `CM` | `cml` | 3, 2 |
| 6 | `CM` | `cmr` | 3, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 4-5-1 — 11 PositionPanel instances

```text
. . st . .
lm cml cam cmr rm
. . . . .
. . . . .
lb cbl . cbr rb
. . gk . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `LM` | `lm` | 2, 1 |
| 3 | `RM` | `rm` | 2, 5 |
| 4 | `CM` | `cml` | 2, 2 |
| 5 | `CAM` | `cam` | 2, 3 |
| 6 | `CM` | `cmr` | 2, 4 |
| 7 | `LB` | `lb` | 5, 1 |
| 8 | `CB` | `cbl` | 5, 2 |
| 9 | `CB` | `cbr` | 5, 4 |
| 10 | `RB` | `rb` | 5, 5 |
| 11 | `GK` | `gk` | 6, 3 |

### 5-3-2 — 11 PositionPanel instances

```text
. stl . str .
. . cam . .
. cml . cmr .
lbw cbl cbm cbr rbw
. . gk . .
. . . . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `stl` | 1, 2 |
| 2 | `ST` | `str` | 1, 4 |
| 3 | `CAM` | `cam` | 2, 3 |
| 4 | `CM` | `cml` | 3, 2 |
| 5 | `CM` | `cmr` | 3, 4 |
| 6 | `LB` | `lbw` | 4, 1 |
| 7 | `CB` | `cbl` | 4, 2 |
| 8 | `CB` | `cbm` | 4, 3 |
| 9 | `CB` | `cbr` | 4, 4 |
| 10 | `RB` | `rbw` | 4, 5 |
| 11 | `GK` | `gk` | 5, 3 |

### 5-4-1 — 11 PositionPanel instances

```text
. . st . .
lm cml . cmr rm
. . . . .
lbw cbl cbm cbr rbw
. . gk . .
. . . . .
```

| DOM order | Position text | Grid area | Grid row, column (1-based) |
| --- | --- | --- | --- |
| 1 | `ST` | `st` | 1, 3 |
| 2 | `LM` | `lm` | 2, 1 |
| 3 | `RM` | `rm` | 2, 5 |
| 4 | `CM` | `cml` | 2, 2 |
| 5 | `CM` | `cmr` | 2, 4 |
| 6 | `LB` | `lbw` | 4, 1 |
| 7 | `CB` | `cbl` | 4, 2 |
| 8 | `CB` | `cbm` | 4, 3 |
| 9 | `CB` | `cbr` | 4, 4 |
| 10 | `RB` | `rbw` | 4, 5 |
| 11 | `GK` | `gk` | 5, 3 |

## Appendix E. Source evidence fingerprints and review checklist

SHA-256 fingerprints record the exact local source version inspected. They do not imply a committed repository state. The foundations audit was already an untracked file at task start.

| File | Lines | SHA-256 |
| --- | --- | --- |
| `tracker.html` | 339 | `63f4600f07ad5257d18e69e7620a514a09c00fe1e6724437334171b8671b9ff8` |
| `index.html` | 73 | `59bd7e357d106d432a238904be3b9a1fb92b698974340e2e8da4e631e1140e4a` |
| `login.html` | 77 | `b2cc4ffa7cdf495b3c0794013a2242640f22ebc70ff077d2d6a8d51f69ef3c9c` |
| `styles.css` | 1005 | `eb77f8dd0e8efbb458a2624119fc338717eeb3d585b354b55a7cb3549ec06c80` |
| `app.js` | 2160 | `b234da4cd1c3ba11e018a4482b58eccd2059002ba44c44ec404cee4b7f0b1c82` |
| `dashboard.js` | 208 | `4f86f3eea8f85b467beb9240889497237eeecfacaecfcabde55672a0a87cbb84` |
| `login.js` | 177 | `42071d8a2b48f09cb55c48875c0255be0ead08bda714e4e32da0d0d5512fda07` |
| `theme.js` | 31 | `45cc4826db69ea9e14d59714091843c8729b9c16e248aad3a08d0bf5c58886d1` |
| `formations.js` | 389 | `8c5ad829cb0b9f6fcfed7e7275b10f17b85c7aab6318c143aad522b0331c1984` |
| `FIGMA_FOUNDATIONS_AUDIT.md` | 297 | `b53ffd52a4c4e0638ba4b2fd74642e85fc0946e8061866c5b2a4e8d5c301a0fe` |

Audit review: all requested sources read; every shared stylesheet rule and Login inline rule transcribed; three HTML body trees included; four generated template families included; all15 formation maps recorded; source-only/unused/native states separated; responsive arithmetic explicitly I; no B measurements invented; existing foundation IDs/value parity explicitly U; only this blueprint written. A later builder must resolve U evidence before exact Figma visual acceptance.
