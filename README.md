# Email Signature Studio

A compatibility-aware email signature generator built with TypeScript, React, and Vite.

It collects one profile, then generates:
- universal-safe HTML
- Spark-optimized HTML
- Gmail-safe HTML
- Outlook-safe HTML
- Apple Mail-safe HTML
- plain-text fallback

It also ships with:
- 4 themes/templates
- a client compatibility matrix
- per-client install instructions
- output validation tests for strict variants

## Why this exists

Email signatures are nasty little compatibility traps. The signature editor and the final recipient client are often two different rendering environments. Gmail sanitizes. Outlook desktop still behaves like Word. Apple Mail is generous. Spark is friendly to pasted HTML. Proton is privacy-forward. Yahoo is conservative.

So this project chooses **progressive enhancement over cleverness**.

## Quick start

```bash
cd /home/lume/.openclaw/workspace/email-signature-studio
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

## Architecture

```text
src/
  App.tsx                  UI for profile input, preview, copy/export, and matrix
  data/
    compatibility.ts       researched client matrix + install steps + sources
    defaults.ts            example starter profile
    themes.ts              4 templates/themes
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

## Research docs

- [`RESEARCH.md`](./RESEARCH.md)
- [`COMPATIBILITY.md`](./COMPATIBILITY.md)

## Practical audit notes (Mar 2026)

A small quality pass focused on highest-impact issues rather than a broad redesign.

What changed:
- Fixed the output summary bug where the universal-safe HTML variant could show plain-text/dark-mode fallback messaging instead of real cross-client guidance.
- Added better accessibility semantics for output tabs and theme selection (`tabpanel`, keyboard arrow navigation, radio-style theme state).
- Improved compatibility table accessibility with a caption and explicit column scopes.
- Added clearer clipboard failure feedback so unsupported browsers do not fail silently.

Still intentionally true:
- Preview remains advisory, not authoritative — final validation should happen in actual sent emails.
- The app stays conservative about dark mode and remote images because recipient clients still control the last mile.
