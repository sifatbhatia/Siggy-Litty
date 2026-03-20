import type { ClientCompatibility } from '../lib/types';

export const compatibilityMatrix: ClientCompatibility[] = [
  {
    id: 'apple-mail',
    client: 'Apple Mail',
    editor: 'Native macOS/iOS client; signatures can include rich text, links, and images.',
    htmlCss: { summary: 'Very strong renderer. Handles modern HTML email better than most desktop clients.', level: 'good' },
    images: { summary: 'Remote images generally render; local drag-in images may become attachments. Prefer remote PNGs for signatures that must sync cleanly.', level: 'good' },
    darkMode: { summary: 'Apple Mail is one of the few clients with meaningful dark-mode targeting support. Neutral-safe colors still work best.', level: 'good' },
    mediaQueries: { summary: '@media and prefers-color-scheme support are relatively strong compared with webmail clients.', level: 'good' },
    webFonts: { summary: 'Best candidate for web fonts, but always include system fallbacks for forwarded mail and cross-client viewing.', level: 'good' },
    svg: { summary: 'Embedded/remote SVG is more viable here than in Gmail or Outlook, but PNG fallback is still safer for logos.', level: 'mixed' },
    animatedGif: { summary: 'GIF animation typically plays.', level: 'good' },
    tracking: { summary: 'Remote-image tracking can be blocked by privacy features such as Mail Privacy Protection. Do not rely on image opens.', level: 'mixed' },
    mobile: { summary: 'iPhone Mail often scales content well, but tiny text and rigid multi-column signatures still feel cramped.', level: 'good' },
    installSteps: [
      'Mail → Settings → Signatures.',
      'Create a signature, then paste the generated Apple Mail-safe HTML via the app or an HTML paste workflow.',
      'Keep remote logos reachable over HTTPS.'
    ],
    notes: [
      'Apple Mail is the loosest target in this matrix, so it gets the richest variant.',
      'Even here, avoiding fancy layouts keeps forwarded/replied messages more stable.'
    ],
    sources: [
      { label: 'Apple Support: Create and use email signatures in Mail on Mac', url: 'https://support.apple.com/guide/mail/create-and-use-email-signatures-mail11943/mac' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' },
      { label: 'Can I Email: @media', url: 'https://www.caniemail.com/features/css-at-media/' }
    ]
  },
  {
    id: 'spark',
    client: 'Spark',
    editor: 'Spark Classic explicitly allows pasting HTML signatures and adding images.',
    htmlCss: { summary: 'Good practical support when pasting prebuilt HTML, but still safest with inline styles and table structure.', level: 'good' },
    images: { summary: 'Remote images are easy; Spark also supports inserted files, but pre-sized hosted images behave more predictably.', level: 'good' },
    darkMode: { summary: 'Dark mode can invert surrounding UI while leaving signature assets untouched. Neutral text and transparent PNGs help.', level: 'mixed' },
    mediaQueries: { summary: 'Not documented as a signature feature; do not depend on them.', level: 'poor' },
    webFonts: { summary: 'Treat custom fonts as unsupported for signatures; use strong system stacks.', level: 'poor' },
    svg: { summary: 'Remote SVG may paste, but PNG fallback is safer for actual recipient rendering.', level: 'mixed' },
    animatedGif: { summary: 'Recipient client, not Spark alone, usually determines final GIF behavior.', level: 'mixed' },
    tracking: { summary: 'Hosted assets can still be blocked by recipients. Keep links canonical and avoid heavy tracking wrappers.', level: 'mixed' },
    mobile: { summary: 'Mobile Spark compose views reward tighter spacing and shorter legal copy.', level: 'good' },
    installSteps: [
      'Spark → Settings → Signatures.',
      'Click HTML and paste the Spark-optimized output.',
      'If using images, pre-size them before paste; Spark notes that direct inserted images are not resizable.'
    ],
    notes: [
      'Spark is the easiest client here for direct HTML-paste workflows.',
      'Still design for downstream recipient clients, not just Spark’s editor.'
    ],
    sources: [
      { label: 'Spark Help Center: Manage email signatures', url: 'https://support.readdle.com/spark/sending-emails/manage-email-signatures' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' }
    ]
  },
  {
    id: 'gmail',
    client: 'Gmail',
    editor: 'Browser editor supports formatted signatures with images, but the signature box is not a full HTML sandbox.',
    htmlCss: { summary: 'Use inline styles only, avoid relying on head/style tags, and expect pasted markup to be sanitized.', level: 'mixed' },
    images: { summary: 'Images count toward Gmail’s 10,000-character signature limit and should be kept small. Remote images are the realistic option.', level: 'mixed' },
    darkMode: { summary: 'Gmail is notorious for partial/full inversion in dark mode and offers little signature-level control.', level: 'poor' },
    mediaQueries: { summary: 'Do not rely on media-query logic in signatures. Gmail support is inconsistent and signatures are pasted fragments.', level: 'poor' },
    webFonts: { summary: 'No practical signature-safe support. Stick to system fonts.', level: 'poor' },
    svg: { summary: 'Avoid SVG for signatures; PNG/JPG is safer.', level: 'poor' },
    animatedGif: { summary: 'GIFs may render, but they are usually a bad fit for signature professionalism and size budgets.', level: 'mixed' },
    tracking: { summary: 'Google image proxying and privacy behaviors reduce the value of per-open image tracking. Prefer normal anchor links with UTM params if needed.', level: 'mixed' },
    mobile: { summary: 'Gmail mobile apps are unforgiving with long signatures. Single-column layout wins.', level: 'mixed' },
    installSteps: [
      'Gmail → Settings → See all settings → Signature.',
      'Paste the Gmail-safe output into the signature editor.',
      'If Gmail rejects the image or exceeds the limit, reduce remote image dimensions and overall markup size.'
    ],
    notes: [
      'Gmail is the main reason the generator defaults to inline-only HTML.',
      'Use dark gray instead of true black to reduce ugly dark-mode inversions.'
    ],
    sources: [
      { label: 'Gmail Help: Create a Gmail signature', url: 'https://support.google.com/mail/answer/8395?hl=en' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' },
      { label: 'Can I Email: @media', url: 'https://www.caniemail.com/features/css-at-media/' },
      { label: 'Litmus: The Developer’s Technical Guide to Coding Dark Mode Emails', url: 'https://www.litmus.com/blog/coding-emails-for-dark-mode' }
    ]
  },
  {
    id: 'outlook',
    client: 'Outlook desktop / web',
    editor: 'Classic Windows Outlook is still the harshest renderer because Word powers large parts of HTML rendering; Outlook web is friendlier but not identical.',
    htmlCss: { summary: 'Tables, fixed widths, inline styles, and old-school spacing remain safest. Avoid floats, advanced layout, and CSS shorthand surprises.', level: 'mixed' },
    images: { summary: 'CID or remote images can work, but remote HTTPS assets are simplest for signatures. Outlook desktop often mangles fancy image treatments.', level: 'mixed' },
    darkMode: { summary: 'Outlook desktop applies hard-to-control dark-mode inversions. Use transparent logos and avoid pure-black text blocks.', level: 'poor' },
    mediaQueries: { summary: 'Classic Windows Outlook ignores most modern media-query behavior; Outlook web is better but not enough to trust for signatures.', level: 'poor' },
    webFonts: { summary: 'Do not rely on them in Outlook-safe output.', level: 'poor' },
    svg: { summary: 'Avoid for signature-critical rendering; PNG fallback is safer.', level: 'poor' },
    animatedGif: { summary: 'Legacy Outlook often shows only the first frame.', level: 'poor' },
    tracking: { summary: 'Enterprise environments may strip trackers or block remote images. Keep business links usable even with images off.', level: 'mixed' },
    mobile: { summary: 'Outlook mobile is less punishing than classic desktop, but desktop constraints should drive design.', level: 'mixed' },
    installSteps: [
      'New Outlook / Outlook on the web: Settings → Accounts → Signatures.',
      'Classic Outlook for Windows: File → Options → Mail → Signatures.',
      'Use the Outlook-safe output, then verify in a test message sent to Gmail and Apple Mail.'
    ],
    notes: [
      'Outlook-safe output intentionally avoids rounded avatars and SVG.',
      'If a logo must be bulletproof, pair it with text branding so the signature still works with image blocking.'
    ],
    sources: [
      { label: 'Microsoft Support: How to add and change an email signature in Outlook', url: 'https://support.microsoft.com/en-us/office/how-to-add-and-change-an-email-signature-in-outlook-8ee5d4f4-68fd-464a-a1c1-0e1c80bb27f2' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' },
      { label: 'Can I Email: @media', url: 'https://www.caniemail.com/features/css-at-media/' },
      { label: 'Litmus: The Developer’s Technical Guide to Coding Dark Mode Emails', url: 'https://www.litmus.com/blog/coding-emails-for-dark-mode' }
    ]
  },
  {
    id: 'yahoo',
    client: 'Yahoo Mail',
    editor: 'Simple signature editor intended for short rich-text content.',
    htmlCss: { summary: 'Conservative support. Treat it like a webmail box that may simplify pasted markup.', level: 'mixed' },
    images: { summary: 'Remote images can work when pasted as HTML, but Yahoo’s own help docs emphasize a plain signature field rather than advanced HTML tooling.', level: 'mixed' },
    darkMode: { summary: 'Expect client-level theme differences without reliable targeting.', level: 'poor' },
    mediaQueries: { summary: 'Do not rely on them for signatures.', level: 'poor' },
    webFonts: { summary: 'Use system fonts only.', level: 'poor' },
    svg: { summary: 'Avoid; PNG/JPG is safer.', level: 'poor' },
    animatedGif: { summary: 'Recipient support varies, but signatures should avoid animated assets anyway.', level: 'mixed' },
    tracking: { summary: 'Link wrappers may trigger spam suspicion faster in webmail contexts. Keep tracking restrained.', level: 'mixed' },
    mobile: { summary: 'Tight vertical stacks behave best.', level: 'mixed' },
    installSteps: [
      'Yahoo Mail → Settings → More Settings → Writing email.',
      'Enable signature and paste a shortened universal-safe or Gmail-safe version.',
      'Re-check saved output because Yahoo may simplify formatting.'
    ],
    notes: [
      'Yahoo is best treated as a conservative webmail target.',
      'Keep copy short and layout single-column where possible.'
    ],
    sources: [
      { label: 'Yahoo Help: Add, edit, or disable your signature in Yahoo Mail', url: 'https://help.yahoo.com/kb/SLN28060.html' },
      { label: 'Can I Email: @media', url: 'https://www.caniemail.com/features/css-at-media/' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' }
    ]
  },
  {
    id: 'proton',
    client: 'Proton Mail',
    editor: 'Per-address signature field with optional third-party generated HTML paste workflow.',
    htmlCss: { summary: 'Fairly capable for simple HTML signatures, but still safest with inline styles and hosted images.', level: 'mixed' },
    images: { summary: 'Proton explicitly notes that added pictures need to be linked to a source and recipients must allow remote content.', level: 'mixed' },
    darkMode: { summary: 'Do not count on signature-specific dark-mode overrides.', level: 'poor' },
    mediaQueries: { summary: 'Support exists for some rendered email contexts, but signatures should not depend on it.', level: 'poor' },
    webFonts: { summary: 'Use fallbacks only.', level: 'poor' },
    svg: { summary: 'Better to avoid unless the downstream recipient client is controlled.', level: 'poor' },
    animatedGif: { summary: 'Possible but not recommended for professional signatures.', level: 'mixed' },
    tracking: { summary: 'Privacy-conscious recipients are more likely to block remote image fetches. Make the signature work without images.', level: 'poor' },
    mobile: { summary: 'Shorter signatures are easier to maintain across Proton web and mobile compose surfaces.', level: 'mixed' },
    installSteps: [
      'Proton Mail → Settings → All settings → Identity and addresses.',
      'Choose the address, then paste the universal-safe or Proton-friendly HTML into Signature.',
      'Host images remotely over HTTPS; Proton notes that pictures must be linked to a source.'
    ],
    notes: [
      'Proton users skew privacy-sensitive, so text-first signatures are a better default.',
      'Remote images should be optional, not structural.'
    ],
    sources: [
      { label: 'Proton Support: Display name and email signature', url: 'https://proton.me/support/display-name-email-signature' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' }
    ]
  },
  {
    id: 'thunderbird',
    client: 'Thunderbird',
    editor: 'Supports HTML signatures directly or via attached signature files.',
    htmlCss: { summary: 'Generally tolerant compared with Outlook and Gmail, especially when attaching a prepared HTML file.', level: 'good' },
    images: { summary: 'Can reference local or remote images; Thunderbird can also attach the image to the message when composing HTML signatures.', level: 'good' },
    darkMode: { summary: 'Dark mode varies by recipient client, but Thunderbird itself is less destructive than Gmail/Outlook.', level: 'mixed' },
    mediaQueries: { summary: 'Better support than many clients, but downstream recipients still matter.', level: 'mixed' },
    webFonts: { summary: 'Still not dependable for recipient-side rendering, so fallbacks remain important.', level: 'mixed' },
    svg: { summary: 'More forgiving than Outlook, but PNG fallback is the portable choice.', level: 'mixed' },
    animatedGif: { summary: 'Generally okay in-client, but not universally preserved after send.', level: 'mixed' },
    tracking: { summary: 'If images are attached, remote tracking disappears; if hosted, recipient blocking still applies.', level: 'mixed' },
    mobile: { summary: 'Thunderbird desktop is the main use case, but recipients on mobile will still see the outgoing signature.', level: 'mixed' },
    installSteps: [
      'Thunderbird → Account Settings.',
      'Either paste HTML into Signature text with “Use HTML” enabled, or attach a generated HTML file as the account signature.',
      'For images, decide between attached images and hosted images based on portability vs. tracking/privacy.'
    ],
    notes: [
      'Thunderbird is the friendliest client here for power-user HTML signature workflows.',
      'That flexibility still does not excuse using unsupported downstream features.'
    ],
    sources: [
      { label: 'Thunderbird Help: Signatures', url: 'https://support.mozilla.org/en-US/kb/signatures' },
      { label: 'Can I Email: @media', url: 'https://www.caniemail.com/features/css-at-media/' },
      { label: 'Can I Email: <style> element', url: 'https://www.caniemail.com/features/html-style/' }
    ]
  }
];
