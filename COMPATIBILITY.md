# Compatibility Matrix

Legend:
- **Good** = usually workable with modest care
- **Mixed** = usable, but with meaningful caveats
- **Poor** = don’t depend on it for signature-critical rendering

| Client | HTML/CSS support | Images (CID / remote) | Dark mode | Media queries | Web fonts | SVG | Animated GIF | Link tracking caveats | Mobile quirks |
|---|---|---|---|---|---|---|---|---|---|
| Apple Mail | **Good** — one of the most capable renderers for email-style HTML. | **Good** — remote images usually fine; local drag-in images can become attachments. | **Good** — among the better clients for dark-mode targeting. | **Good** — comparatively strong support. | **Good** — best candidate here, but always include fallbacks. | **Mixed** — can work, but PNG is still safer for broad delivery. | **Good** — generally plays. | **Mixed** — privacy features can proxy/block image tracking. | **Good** — still avoid tiny text and rigid two-column signatures. |
| Spark | **Good** — HTML paste workflow is explicitly supported. | **Good** — hosted images work well; pre-size before paste. | **Mixed** — neutral-safe colors recommended. | **Poor** — don’t rely on media-query-driven behavior. | **Poor** — use system stacks. | **Mixed** — editor may accept it; recipient client still may not. | **Mixed** — final recipient client decides most of this. | **Mixed** — remote tracking still depends on recipient behavior. | **Good** — shorter signatures fit mobile compose better. |
| Gmail | **Mixed** — use inline styles only; pasted markup may be sanitized. | **Mixed** — images count toward 10,000-char signature limit. Prefer small remote images. | **Poor** — notorious for hard-to-control inversion. | **Poor** — signatures should not depend on them. | **Poor** — avoid. | **Poor** — avoid. | **Mixed** — possible, but not wise for signatures. | **Mixed** — Google image proxying weakens open tracking. | **Mixed** — long signatures feel bad in Gmail mobile. |
| Outlook desktop / web | **Mixed** — classic desktop Outlook needs old-school table HTML. | **Mixed** — CID or remote can work; desktop rendering is fussy. | **Poor** — dark mode is difficult to control. | **Poor** — classic Outlook is especially weak here. | **Poor** — avoid for safe output. | **Poor** — avoid for critical branding. | **Poor** — often first-frame only in legacy Outlook. | **Mixed** — enterprise filtering can strip or block assets. | **Mixed** — desktop constraints should drive the design. |
| Yahoo Mail | **Mixed** — treat as conservative webmail. | **Mixed** — simple remote images may work, but keep them optional. | **Poor** — no reliable targeting path. | **Poor** — don’t depend on them. | **Poor** — avoid. | **Poor** — avoid. | **Mixed** — not recommended anyway. | **Mixed** — keep links simple and trustworthy. | **Mixed** — use short stacks and narrow content. |
| Proton Mail | **Mixed** — workable for simple HTML, but keep it restrained. | **Mixed** — Proton notes images must be linked to a source and remote content must load. | **Poor** — don’t count on exact control. | **Poor** — avoid dependence. | **Poor** — avoid. | **Poor** — avoid. | **Mixed** — technically possible, professionally weak. | **Poor** — privacy-conscious environments reduce remote-image reliability. | **Mixed** — shorter signatures survive better. |
| Thunderbird | **Good** — supports HTML signatures directly or via files. | **Good** — supports remote and attached image workflows. | **Mixed** — less destructive than Gmail/Outlook, but downstream clients still matter. | **Mixed** — better than many, but not universal enough to trust blindly. | **Mixed** — still include fallbacks. | **Mixed** — more forgiving than Outlook; still use PNG for portability. | **Mixed** — often fine locally, less certain across recipients. | **Mixed** — attached images remove remote tracking; hosted ones can still be blocked. | **Mixed** — recipients on mobile still see the final outgoing HTML. |

## Generator rules derived from the matrix

### Universal-safe HTML
- table-based layout
- inline styles only
- no SVG
- no web fonts
- no dependence on dark-mode targeting

### Spark-optimized HTML
- still table-based and inline
- allows slightly more visual refinement
- keeps remote-hosted images and pre-sized assets

### Gmail-safe HTML
- compact markup
- no style blocks
- no SVG
- conservative spacing
- no dark-mode assumptions

### Outlook-safe HTML
- fixed, simple table structure
- no rounded corners required for identity graphics
- no flex/grid/positioned layout tricks
- image-safe strategy documented as CID or remote

### Apple Mail-safe HTML
- allows a small style block
- allows richer typography
- permits SVG if supplied, though PNG is still recommended for portability

### Plain text fallback
- no dependencies at all
- works when HTML is stripped or disabled

## Sources

- Gmail Help: https://support.google.com/mail/answer/8395?hl=en
- Spark Help Center: https://support.readdle.com/spark/sending-emails/manage-email-signatures
- Apple Support: https://support.apple.com/guide/mail/create-and-use-email-signatures-mail11943/mac
- Microsoft Support: https://support.microsoft.com/en-us/office/how-to-add-and-change-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2
- Yahoo Help: https://help.yahoo.com/kb/SLN28060.html
- Proton Support: https://proton.me/support/display-name-email-signature
- Thunderbird Help: https://support.mozilla.org/en-US/kb/signatures
- Can I Email `<style>`: https://www.caniemail.com/features/html-style/
- Can I Email `@media`: https://www.caniemail.com/features/css-at-media/
- Can I Email `@font-face`: https://www.caniemail.com/features/css-at-font-face/
- Can I Email SVG: https://www.caniemail.com/features/image-svg/
- Litmus dark mode guide: https://www.litmus.com/blog/coding-emails-for-dark-mode
