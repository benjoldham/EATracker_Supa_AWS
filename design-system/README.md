# FC26 design system

Implemented from live Figma MCP reads on 14 October 2026. The pre-existing audit and blueprint were not used as design authority.

Source: [Foundations](https://www.figma.com/design/iouhdP3Vig0SLCm4hOPE45/FC-Tracker---Foundations), [native component masters](https://www.figma.com/design/iouhdP3Vig0SLCm4hOPE45/FC-Tracker---Foundations?node-id=57-5), [desktop references](https://www.figma.com/design/iouhdP3Vig0SLCm4hOPE45/FC-Tracker---Foundations?node-id=110-8).

## Token authority and updates

`figma-tokens.json` records all 56 `_primitives`, 25 `Colour Modes` variables and 32 `Sizes` variables. Each value includes its Figma mode and the resolved alias chain, including the external Tailwind spacing, sizing and font collections. No aliases were unresolved.

`tokens.css` is generated with `node scripts/generate-design-tokens.cjs`. Check it with `node scripts/generate-design-tokens.cjs --check`. Future changes should first refresh the snapshot from live Figma, then regenerate and run the browser checks; do not edit generated CSS independently or infer values from this snapshot when live information is available.

CSS properties use the actual Figma token name (the last segment), without collection prefixes or organisational groups. For example, `color/grey/grey-100` becomes `--grey-100`, `spacing/spacing-16` becomes `--spacing-16`, `radius/radius-2` becomes `--radius-2`, `typescale/h1` becomes `--h1`, and `form/field-height` becomes `--field-height`. Full Figma paths remain in the source snapshot for traceability.

When different variables share a name, the immediate role distinguishes them: `--family-primary`, `--text-primary`, `--action-primary`, `--family-secondary`, `--control-secondary`, `--border-hover`, `--surface-hover`, `--card-gap` and `--pitch-gap`. Numeric font weights use `--weight-400`, `--weight-500` and `--weight-700`. These explicit exceptions are stable; the generator rejects new collisions rather than silently overriding or renaming existing tokens.

Semantic colours still reference primitives, and Size aliases to existing spacing primitives still reference those primitives. Component CSS uses semantic colours; raw colour values occur only in the generated primitive block. The naming refactor on 15 October 2026 changed identifiers only, preserving values, aliases, themes, responsive modes and component rules. The four local component tokens below also omit the unnecessary `component-` prefix; the 2px spacing value is named `--spacing-2` consistently with the spacing scale.

Dark is the default. `[data-theme="light"]` changes only semantic colour bindings. Compact Sizes values apply at `max-width: 768px`. The three breakpoint variables contain explanatory strings, rather than numeric CSS lengths: they map to 768px for the compact/gutter mode, 900px for two-column forms and totals, and 1200px for pitch list constraints. They are preserved in the snapshot and represented as literal media conditions because custom properties cannot be used in media conditions.

Application override: the desktop page gutter uses `--spacing-24` (24px) instead of the snapshot's 96px. Compact gutters remain 8px. The generator applies this override centrally so navigation and page content stay aligned and regeneration preserves the requested spacing; the original Figma snapshot is unchanged.

| Type | Desktop size / line height | Compact size / line height |
| --- | --- | --- |
| h1 | 36 / 40 | 24 / 32 |
| h2 | 30 / 36 | 20 / 24 |
| h3 | 24 / 28 | 18 / 24 |
| h4 | 20 / 24 | 16 / 20 |
| body | 16 / 24 | 14 / 20 |
| body-sm | 14 / 20 | 12 / 16 |
| body-xs | 12 / 16 | 12 / 16 |

The obsolete colour names, role-specific font-size aliases and old spacing aliases were removed after migrating all references. Components use the concise typescale with its matching line heights. The primitive library is retained in full, including currently unused approved palette entries, so the generated collection remains faithful to Figma.

## Component mapping

| Application selectors | Live master nodes |
| --- | --- |
| `.btn`, `.icon-btn`, `.title-edit` | Buttons `58:23`, Row Button `61:13`, Text Link within Page Header `74:570` |
| `input`, `select`, `label`, checkbox inputs | Input `61:24`, Select `61:31`, Checkbox `61:35`, Form Fields `66:19`, Inline Checkbox `62:65` |
| `.segmented`, `.segmented-secondary`, `.seg-btn` | Filter Tabs `66:50`, Filter `61:44` |
| `.card-head`, `.page-header`, `.footer` | Section Header `69:51`, Page Header `74:570`, Footer `74:591` |
| `.card`, `#player-form`, `.edit-name`, `.card.editing` | Player Entry Rest `73:348`, Editing `86:4669`, Form Fields `69:215` |
| `.total`, `.totals` | Data Tile `66:51`, Totals `73:530` |
| tables, cells, rows, player list | Table Cell `62:42`, Header Cell `62:33`, Row `69:260`, Players List `74:597` |
| `.pitch`, `.pitch-pos` and player rows | Pitch Field `76:2143`, Position Panel `66:87`, Player Name `62:54` |
| `.career-saves` and `.save-table` | Save List `74:1091` |
| `.login-wrap`, confirmation/error states | Login/Signup `77:2756` |
| camera dialog and guide | Dialog Panel `78:2705`, Camera Frame `78:2702`, Scanner `78:2791` |

Buttons now share approved padding, borders, normal weight and hover overlays. Inputs use the shared field height and body-sm type. Checkboxes keep native input semantics with the master’s surface, border and check colour. Section headers, financial tiles and cards share approved padding and gaps. Tables retain native sticky titles and scrolling, with alternating surfaces and semantic dividers. Pitch rows use approved 12px text, normal weight, 64px panels and semantic odd/even surfaces. Login styling moved into the shared stylesheet. Editing, confirmation, hidden administrative tools and optional scan controls are still governed by existing JavaScript.

The Save List master has a header with no extra bottom padding, unlike Section Header. `.career-saves` applies that distinction explicitly; it is a master-level difference, not a desktop page override.

## Necessary component values and retained geometry

Four component tokens are outside the three local collections; all come directly from live masters, not invented scales:

- `--spacing-2: 2px`: pitch player-row padding and theme-switch inset bind to external Tailwind `spacing/0-5`, which has no local spacing primitive. It is separate from the local radius token because it describes spacing.
- `--pitch-centre-circle-size: 180px`: the Pitch Field’s centre-circle geometry; no Sizes variable covers this dimension.
- `--pitch-min-height: 598px`: the Pitch Field variant’s desktop height. It is a minimum so real player lists can grow. Compact layouts retain content-driven height.
- `--dialog-padding: 14px`: the Dialog Panel binds to external Tailwind `spacing/3-5`. No local spacing token resolves to 14px.

The application retains its 1440px page maximum, 520px login column, 720px dialog maximum, native table minimum widths (440px and 640px), fluid player-name widths, search/select minimum widths, 220px long-pitch-list constraint, circle positioning, camera crop percentages, dynamic viewport height and video sizing. These are structural or functional geometry where the collections supply no complete replacement. Long pitch lists now scroll rather than being clipped at their maximum height. On narrow screens, the five pitch columns scroll within the pitch wrapper. Header content wraps above utilities in compact mode.

Native form elements, the existing navigation/theme SVGs and real camera range/video controls remain. The select arrow is drawn with semantic CSS colours; it does not embed stale raw theme colours. Existing motion durations and reduced-motion behaviour remain. The 3px accessible focus outline/offset is retained because the collections specify its colour but not its geometry. The camera guide now uses the master’s 2px radius and semantic primary border, removing the legacy neon glow. Real scanning/OCR logic is unchanged.

## Validation and remaining differences

See `validation.md` for executed checks and their limits. Desktop comparisons are manual visual comparisons of browser screenshots against live Figma exports, not a pixel-diff certification.

Known differences are intentional where the authority conflicts or the application contains real data:

- Several masters still name legacy `type-h3`, `type-h6` and `type-input` variables. Their 30px, 12px and 14px values map to concise h2, body-xs and body-sm. Some masters use a 32px section-heading line height and a 36px page-heading line height; the latest Sizes collection takes precedence (36px and 40px respectively). This makes desktop sections a few pixels taller.
- The Login desktop composition overrides its column to 494px, leaves a long heading unwrapped and places supporting copy differently. The application retains its 520px responsive column and natural text flow, sharing the actual Login master’s field/card styling.
- Native table content determines column widths and row height, while Figma rows use flex cells with frame-level overrides. Sticky player names and complete financial/action cells remain available through horizontal scrolling. Exact page-reference column positions and row heights therefore differ.
- Live fixture data differs from page-reference player counts, finances and position distribution. Pitch panels grow with actual players; no dummy names or rows are added to reproduce examples. The local-only Seed Player DB button appears in browser captures because existing JavaScript enables it on localhost.
- Sizes specifies a 56×28 switch while the component variants have a 48px width and some page instances have a 22px height. Sizes takes precedence; existing SVG icons and toggle behaviour are retained.
- Actual Cognito/AWS persistence, physical-device Safari, a real camera and OCR were not exercised. External font loading remains a runtime dependency inherited from the application.

AWS code, JavaScript business logic, infrastructure, Amplify configuration and GitHub Actions were not modified.
