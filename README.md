# Signet

A compatibility-aware email signature generator built with TypeScript, React, and Vite.

It collects one profile, then generates:
- universal-safe HTML
- Spark-optimized HTML
- Gmail-safe HTML
- Outlook-safe HTML
- Apple Mail-safe HTML
- plain-text fallback

It also ships with:
- 5 themes/templates (including Bare Transparent)
- a client compatibility matrix
- per-client install instructions
- output validation tests for strict variants

## Why this exists

Email signatures are nasty little compatibility traps. The signature editor and the final recipient client are often two different rendering environments. Gmail sanitizes. Outlook desktop still behaves like Word. Apple Mail is generous. Spark is friendly to pasted HTML. Proton is privacy-forward. Yahoo is conservative.

So this project chooses **progressive enhancement over cleverness**.

## Quick start

```bash
git clone https://github.com/sifatbhatia/Signet.git
cd Signet
npm install
npm run dev
```

Open the local URL Vite prints, usually:

```bash
http://localhost:5173
```

## Test and build

```bash
npm run test
npm run build
npm run preview
```

## Editor-first interface

- Profile, Contact, Links, and Style panels keep the editing loop compact. On mobile, use **Edit details / Preview & export** to move between panes.
- Five original signature themes and all six original export formats are preserved. The generator and its constraints are unchanged.
- The approved, locally hosted Siftion UI font is used only in app chrome. Email HTML keeps its original system-font stacks and table layout. Font licensing is included in `public/fonts/OFL.txt`.
- The live preview is a script-free sandboxed iframe; app CSS and appearance do not recolor or restyle the export. It is a browser depiction, not a Gmail/Outlook simulation.
- **Copy signature** writes rich HTML and a readable plain-text fallback. If rich copying is unsupported, it tries plain text. If clipboard access is denied, selected manual-copy text and HTML download remain available.
- **Download HTML/text** exports the selected format. **Download bundle** contains your profile, theme, all six outputs, warnings, and checks as JSON. Bundle import is not implemented.
- Profile data stays in React memory and is lost on reload. Only your app appearance choice is stored locally. Hosted avatar/logo URLs are fetched by the browser when previewing.
- Link exports use the first four complete links, as before; the bundle retains the full list.

## Browser verification

```sh
# Requires uv and an installed Microsoft Edge; override EDGE in the script for another executable.
uv run --with playwright python scripts/check-redesign.py http://127.0.0.1:4188
# After npm run build and npm run preview -- --host 127.0.0.1 --port 4189 --strictPort:
uv run --with playwright python scripts/check-redesign.py http://127.0.0.1:4189
npm exec -- vite-node scripts/check-export-preservation.ts --verify
```

The browser suite exercises all fields, links, five themes, six outputs, downloads, actual clipboard readback, denied-copy fallback, keyboard navigation, independent appearance, and 320–1440px responsive layouts. Reports and screenshots are saved under `verification/redesign/` or `verification/production/`. It checks original exports against `verification/original-exports.json`; do not overwrite that baseline to make a changed output pass.

## Architecture

```text
src/
  App.tsx                  UI for profile input, preview, copy/export, and matrix
  data/
    compatibility.ts       researched client matrix + install steps + sources
    defaults.ts            example starter profile
    themes.ts              5 templates/themes
    variants.ts            variant rules and normalization constraints
  lib/
    generator.ts           normalization + HTML/text generation
    validators.ts          strict-output checks
    types.ts               shared types
tests/
  generator.test.ts        output and validation coverage
```

## Normalization strategy

The generator intentionally degrades features per target:

- **Universal-safe / Gmail-safe / Outlook-safe**
  - no dependence on `<style>` blocks
  - inline styles only
  - table-based layout
  - no SVG references
  - no web fonts
  - no border-radius in strict variants where it can cause inconsistent rendering

- **Spark-optimized**
  - keeps inline-safe structure
  - allows a bit more visual polish such as rounded avatar treatment
  - still avoids fragile CSS that recipients may ignore

- **Apple Mail-safe**
  - allows a small style block for `prefers-color-scheme`
  - permits richer typography and SVG allowance if supplied
  - still includes safe fallback structure

- **Plain text**
  - pure fallback for privacy-first or restricted environments

## Templates/themes

1. **Graphite Grid** – editorial/high-contrast default
2. **Linen Note** – warmer personal/consulting tone
3. **Cobalt Ribbon** – bolder agency/startup tone
4. **Noir Mono** – stripped-back minimal option
5. **Bare Transparent** – no background fill; inherits the compose surface

## Export/install workflow

Each output panel provides:
- copy to clipboard
- export as `.html` or `.txt`
- install steps for the relevant client
- validation status

## Recommended usage rules

- Host images over HTTPS and pre-size them before use.
- Prefer PNG over SVG unless you fully control the destination client.
- Avoid long legal disclaimers on mobile-heavy teams.
- Use dark gray text instead of pure black when Gmail/Outlook dark mode matters.
- Test with a real send, not just the signature editor preview.

## Known limitations

- This app cannot perfectly simulate every compose editor’s sanitization path.
- Outlook desktop remains the hardest target; always test in classic Windows Outlook if that audience matters.
- Dark mode is not fully controllable in Gmail and Outlook.
- Web-font and SVG support in signatures is intentionally conservative because the recipient client still decides final rendering.
- Remote-image blocking/privacy proxies can break avatar/logo visibility.

## Docs

- [`DESIGN.md`](./DESIGN.md)
- [`RESEARCH.md`](./RESEARCH.md)
- [`COMPATIBILITY.md`](./COMPATIBILITY.md)
