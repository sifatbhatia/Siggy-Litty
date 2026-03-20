# Email Signature Support Research

This document summarizes the sources used to build the generator’s compatibility rules.

## Core takeaway

An email signature has to survive **two environments**:
1. the editor where the signature is pasted/saved
2. the recipient client where the message is actually rendered

That means “works in the signature box” does **not** mean “works when received in Outlook, Gmail mobile, or Yahoo.” The safest strategy is still old-school HTML email code: tables, inline styles, hosted images, system fonts, and modest expectations.

## Practical findings by topic

### 1) HTML/CSS support

- **Gmail** supports formatted signatures and images, but its signature tool is constrained and signatures are capped at **10,000 characters** including images. It is not a safe place to rely on complex pasted HTML or heavyweight markup.
  - Source: Gmail Help — Create a Gmail signature  
    https://support.google.com/mail/answer/8395?hl=en

- **Spark Classic** explicitly supports pasted HTML signatures via an `HTML` mode and lets users add images, making it unusually friendly as a signature editor.
  - Source: Spark Help Center — Manage email signatures  
    https://support.readdle.com/spark/sending-emails/manage-email-signatures

- **Outlook** supports text, links, and pictures in signatures, but classic desktop Outlook is still the riskiest renderer because downstream HTML rendering is heavily constrained.
  - Source: Microsoft Support — How to add and change an email signature in Outlook  
    https://support.microsoft.com/en-us/office/how-to-add-and-change-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2

- **Thunderbird** supports HTML signatures directly or via attached signature files, including image placement.
  - Source: Thunderbird Help — Signatures  
    https://support.mozilla.org/en-US/kb/signatures

- **Apple Mail** supports rich signatures and is one of the more capable renderers among mainstream desktop clients.
  - Source: Apple Support — Create and use email signatures in Mail on Mac  
    https://support.apple.com/guide/mail/create-and-use-email-signatures-mail11943/mac

- **Proton Mail** allows per-address signature configuration and explicitly suggests third-party signature builders.
  - Source: Proton Support — Display name and email signature  
    https://proton.me/support/display-name-email-signature

- **Yahoo Mail** exposes a simpler signature editor and should be treated as a conservative webmail target.
  - Source: Yahoo Help — Add, edit, or disable your signature in Yahoo Mail  
    https://help.yahoo.com/kb/SLN28060.html

### 2) `<style>` blocks and media queries

- Caniemail shows broad but incomplete support for the `<style>` element and for `@media`, with meaningful gaps across Gmail, Outlook variants, and multiple webmail/mobile contexts.
- For signature generation, this matters even more because many editors store only HTML fragments, not full document structure.

Sources:
- Can I Email — `<style>` element  
  https://www.caniemail.com/features/html-style/
- Can I Email — `@media`  
  https://www.caniemail.com/features/css-at-media/

**Rule adopted:** only the Apple Mail-safe variant may depend on a small `<style>` block, and even there the layout still works without it.

### 3) Dark mode behavior

Litmus’s dark mode guidance remains the most useful practical summary: there is no single dark mode. Clients may apply:
- no change
- partial color inversion
- full inversion

Litmus also notes that **Gmail and Outlook are especially difficult to target precisely**, which is why neutral-safe palettes are more reliable than aggressive light/dark assumptions.

Source:
- Litmus — The Developer’s Technical Guide to Coding Dark Mode Emails  
  https://www.litmus.com/blog/coding-emails-for-dark-mode

**Rule adopted:**
- Use dark gray instead of pure black in broad-safe variants.
- Prefer transparent PNG logos.
- Avoid signatures that depend on background fills for legibility.
- Offer Apple Mail-specific dark mode enhancement, but never rely on it.

### 4) Web fonts

Caniemail’s `@font-face` data remains too inconsistent to treat web fonts as signature-safe across the target matrix.

Source:
- Can I Email — `@font-face`  
  https://www.caniemail.com/features/css-at-font-face/

**Rule adopted:** web fonts are disabled except for the Apple Mail-safe variant, which still includes strong system fallbacks.

### 5) SVG support

SVG remains risky for broad signature use. Even where a client or editor tolerates SVG, the recipient client may not.

Source:
- Can I Email — SVG image format  
  https://www.caniemail.com/features/image-svg/

**Rule adopted:** PNG-first. SVG only allowed in the Apple Mail-safe variant, and even then the app warns users to keep a PNG fallback available.

### 6) Images: remote vs CID vs attached

- **Proton** explicitly says pictures in signatures need to be linked to a source and recipients need remote content enabled to see them.
- **Thunderbird** supports both remote and attached image workflows when composing HTML signatures.
- **Spark** supports adding images but notes direct inserted images are not resizable, so pre-sized assets or pasted HTML are safer.

Sources:
- Proton Support — Display name and email signature  
  https://proton.me/support/display-name-email-signature
- Thunderbird Help — Signatures  
  https://support.mozilla.org/en-US/kb/signatures
- Spark Help Center — Manage email signatures  
  https://support.readdle.com/spark/sending-emails/manage-email-signatures

**Rule adopted:**
- Default to remote HTTPS images.
- Outlook-safe documentation mentions CID-or-remote because enterprise Outlook environments sometimes still prefer embedded images.
- The signature should remain understandable with images blocked.

### 7) Animated GIFs

Animated GIF behavior is still inconsistent—especially in Outlook desktop, where the first frame may be all the user sees.

Practical implication: animated GIFs are not a good default for professional signatures.

Supporting context:
- Litmus dark mode and compatibility guidance
- historical Outlook limitations reflected in mainstream email dev practice
- Caniemail’s general matrix for client support differences

**Rule adopted:** treat animated GIF as optional and discouraged across all generated themes.

### 8) Link tracking caveats

There is no single vendor doc saying “don’t track links in signatures,” but the compatibility/privacy evidence points the same direction:
- remote image tracking is weakened by proxies and privacy protections
- privacy-forward users/clients often block remote content
- aggressive tracked links can hurt trust and occasionally deliverability perception

**Rule adopted:**
- keep links canonical where possible
- if tracking is needed, use light UTM parameters rather than long redirect chains
- never make image loads structurally necessary

### 9) Mobile quirks

Across Gmail mobile, Yahoo mobile, Spark mobile, Proton mobile, and recipients on narrow screens, long multi-column signatures degrade quickly.

**Rule adopted:**
- default to one dominant column
- keep lines short
- avoid wide logos and long disclaimers
- keep tap targets readable

## Why the app looks “less flashy” than many signature generators

Because the goal is **actual transportability**.

A signature that looks incredible in a live preview but breaks in Gmail mobile or classic Outlook is not better. It is just a prettier bug.

So the generator favors:
- table-based structure
- inline CSS
- restrained color systems
- optional, non-structural imagery
- system font stacks
- per-client variants instead of one magic HTML blob

## Source list

1. Gmail Help — Create a Gmail signature  
   https://support.google.com/mail/answer/8395?hl=en
2. Spark Help Center — Manage email signatures  
   https://support.readdle.com/spark/sending-emails/manage-email-signatures
3. Apple Support — Create and use email signatures in Mail on Mac  
   https://support.apple.com/guide/mail/create-and-use-email-signatures-mail11943/mac
4. Microsoft Support — How to add and change an email signature in Outlook  
   https://support.microsoft.com/en-us/office/how-to-add-and-change-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2
5. Yahoo Help — Add, edit, or disable your signature in Yahoo Mail  
   https://help.yahoo.com/kb/SLN28060.html
6. Proton Support — Display name and email signature  
   https://proton.me/support/display-name-email-signature
7. Thunderbird Help — Signatures  
   https://support.mozilla.org/en-US/kb/signatures
8. Can I Email — `<style>` element  
   https://www.caniemail.com/features/html-style/
9. Can I Email — `@media`  
   https://www.caniemail.com/features/css-at-media/
10. Can I Email — `@font-face`  
    https://www.caniemail.com/features/css-at-font-face/
11. Can I Email — SVG image format  
    https://www.caniemail.com/features/image-svg/
12. Litmus — The Developer’s Technical Guide to Coding Dark Mode Emails  
    https://www.litmus.com/blog/coding-emails-for-dark-mode
