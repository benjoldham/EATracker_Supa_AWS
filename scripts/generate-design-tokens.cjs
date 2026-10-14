const fs = require("node:fs");
const path = require("node:path");
const root = path.resolve(__dirname, "..");
const snapshot = JSON.parse(
  fs.readFileSync(path.join(root, "design-system/figma-tokens.json"), "utf8"),
);
const name = (value) => value.replaceAll("/", "-");
const primitive = (value) => `--primitive-${name(value)}`;
function unwrap(value) {
  if (value && value.alias) return unwrap(value.values[0].value);
  if (value && value.missing)
    throw new Error(`Unresolved alias ${value.missing}`);
  return value;
}
function literal(variable, value) {
  value = unwrap(value);
  if (variable.type === "COLOR") {
    const rgb = ["r", "g", "b"].map((k) => Math.round(value[k] * 255));
    return value.a === 1
      ? `#${rgb.map((v) => v.toString(16).padStart(2, "0")).join("")}`
      : `rgb(${rgb.join(" ")} / ${Number(value.a.toFixed(4))})`;
  }
  if (variable.type === "STRING") return JSON.stringify(value);
  return `${value}${variable.name.startsWith("font/weight/") ? "" : "px"}`;
}
function declaration(variable, mode, collection) {
  const entry = variable.values.find((x) => x.mode === mode);
  const key =
    collection === "_primitives"
      ? primitive(variable.name)
      : `--${name(variable.name)}`;
  let value =
    collection === "Colour Modes"
      ? `var(${primitive(entry.value.alias)})`
      : literal(variable, entry.value);
  // Sizes aliases to approved spacing retain the primitive hierarchy.
  if (collection === "Sizes" && entry.value.alias?.startsWith("spacing/")) {
    const resolved = unwrap(entry.value);
    const match = snapshot.collections._primitives.find(
      (v) =>
        v.name.startsWith("spacing/") && unwrap(v.values[0].value) === resolved,
    );
    if (match) value = `var(${primitive(match.name)})`;
  }
  return `  ${key}: ${value};`;
}
const primitives = snapshot.collections._primitives;
const colours = snapshot.collections["Colour Modes"];
// Breakpoint variables carry explanatory strings; CSS queries need literal conditions.
const sizes = snapshot.collections.Sizes.filter(
  (v) => !v.name.startsWith("breakpoint/"),
);
const block = (selector, lines) => `${selector} {\n${lines.join("\n")}\n}\n`;
let css =
  "/* Generated from live Figma collections. Run node scripts/generate-design-tokens.cjs. */\n";
css += block(":root", [
  "  color-scheme: dark;",
  ...primitives.map((v) => declaration(v, "Default", "_primitives")),
  ...colours.map((v) => declaration(v, "Dark", "Colour Modes")),
  ...sizes.map((v) => declaration(v, "Xl > LG", "Sizes")),
]);
css += block(':root[data-theme="light"]', [
  "  color-scheme: light;",
  ...colours.map((v) => declaration(v, "Light", "Colour Modes")),
]);
css +=
  "@media (max-width: 768px) {\n" +
  block(
    "  :root",
    sizes
      .filter(
        (v) =>
          JSON.stringify(v.values[0].value) !==
          JSON.stringify(v.values[1].value),
      )
      .map((v) => "  " + declaration(v, "MD > XS", "Sizes")),
  ) +
  "}\n";
const target = path.join(root, "design-system/tokens.css");
if (process.argv.includes("--check")) {
  if (fs.readFileSync(target, "utf8") !== css)
    throw new Error("tokens.css differs from the Figma snapshot");
  console.log(
    `Verified ${primitives.length} primitives, ${colours.length} colours in both modes and ${sizes.length} size tokens.`,
  );
} else fs.writeFileSync(target, css);
