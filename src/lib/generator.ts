import { compatibilityMatrix } from '../data/compatibility';
import { variantMap } from '../data/variants';
import type { Profile, SignatureOutput, SocialLink, Theme, VariantConfig, VariantId } from './types';

const escapeHtml = (value: string): string =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeText = (value?: string): string => value?.replace(/\s+/g, ' ').trim() ?? '';
const normalizeUrlInput = (value?: string): string => value?.trim() ?? '';
const hasText = (value?: string): value is string => Boolean(normalizeText(value));
const isSafeRemoteUrl = (value: string): boolean => /^(https?:)?\/\//i.test(value);
const isSafeCidUrl = (value: string): boolean => /^cid:/i.test(value);

const sanitizeWebsiteUrl = (value?: string): string | undefined => {
  const trimmed = normalizeUrlInput(value);
  if (!trimmed) return undefined;
  if (isSafeRemoteUrl(trimmed)) return trimmed;
  if (/^[a-z0-9.-]+\.[a-z]{2,}(?:[/?#]|$)/i.test(trimmed)) return `https://${trimmed}`;
  return undefined;
};

const sanitizeImageUrl = (value: string | undefined, variant: VariantConfig): string | undefined => {
  const trimmed = normalizeUrlInput(value);
  if (!trimmed) return undefined;

  const safeForVariant =
    variant.imagePolicy === 'cid-or-remote' ? isSafeRemoteUrl(trimmed) || isSafeCidUrl(trimmed) : isSafeRemoteUrl(trimmed);

  if (!safeForVariant) return undefined;
  if (variant.svgPolicy === 'avoid' && /\.svg(?:$|[?#])/i.test(trimmed)) return undefined;
  return trimmed;
};

const formatHref = (value: string, kind: 'url' | 'email' | 'phone'): string => {
  const trimmed = normalizeText(value);
  if (!trimmed) return '';

  if (kind === 'email') return `mailto:${trimmed}`;
  if (kind === 'phone') {
    const digits = trimmed.replace(/[^+\d]/g, '');
    return digits ? `tel:${digits}` : '';
  }

  return sanitizeWebsiteUrl(trimmed) ?? '';
};

const linkHtml = (
  label: string,
  href: string,
  color: string,
  extraStyle = 'font-weight:500; text-decoration:none;'
): string => {
  const cleanLabel = normalizeText(label);
  if (!cleanLabel) return '';
  if (!href) return escapeHtml(cleanLabel);
  return `<a href="${escapeHtml(href)}" style="color:${color}; ${extraStyle}">${escapeHtml(cleanLabel)}</a>`;
};

const prefersCompact = (variant: VariantConfig): boolean => variant.compact;

const normalizedTextColor = (theme: Theme): string => {
  if (theme.ink.toLowerCase() === '#000000') return '#1d1d1d';
  return theme.ink;
};

const normalizeSocialLinks = (socialLinks: SocialLink[]): SocialLink[] =>
  socialLinks
    .map((link) => ({ label: normalizeText(link.label), url: normalizeUrlInput(link.url) }))
    .filter((link) => link.label && link.url)
    .slice(0, 4);

const normalizeProfile = (profile: Profile): Profile => ({
  ...profile,
  fullName: normalizeText(profile.fullName),
  pronouns: normalizeText(profile.pronouns),
  title: normalizeText(profile.title),
  company: normalizeText(profile.company),
  tagline: normalizeText(profile.tagline),
  email: normalizeText(profile.email),
  phone: normalizeText(profile.phone),
  website: normalizeUrlInput(profile.website),
  location: normalizeText(profile.location),
  addressLine: normalizeText(profile.addressLine),
  avatarUrl: normalizeUrlInput(profile.avatarUrl),
  logoUrl: normalizeUrlInput(profile.logoUrl),
  calendlyUrl: normalizeUrlInput(profile.calendlyUrl),
  disclaimer: normalizeText(profile.disclaimer),
  socialLinks: normalizeSocialLinks(profile.socialLinks)
});

const buildMetaLine = (profile: Profile): string => [profile.title, profile.company].filter(hasText).join(' · ');
const joinInline = (items: string[], separatorHtml: string): string => items.filter(Boolean).join(separatorHtml);

const buildContactLine = (profile: Profile, theme: Theme): string => {
  const websiteHref = profile.website ? formatHref(profile.website, 'url') : '';
  const phoneHref = profile.phone ? formatHref(profile.phone, 'phone') : '';
  const bookingHref = profile.calendlyUrl ? formatHref(profile.calendlyUrl, 'url') : '';

  return joinInline(
    [
      profile.email
        ? linkHtml(profile.email, formatHref(profile.email, 'email'), theme.accent, 'font-weight:600; text-decoration:none;')
        : '',
      profile.phone ? linkHtml(profile.phone, phoneHref, theme.ink) : '',
      websiteHref ? linkHtml(profile.website!.replace(/^https?:\/\//i, ''), websiteHref, theme.ink) : '',
      bookingHref ? linkHtml('Book time', bookingHref, theme.accent) : ''
    ],
    `<span style="color:${theme.divider};"> &nbsp;•&nbsp; </span>`
  );
};

const buildSocialRow = (profile: Profile, theme: Theme, linkColor?: string): string =>
  joinInline(
    profile.socialLinks
      .map((link) => {
        const href = formatHref(link.url, 'url');
        return href
          ? linkHtml(link.label, href, linkColor ?? theme.accent, 'font-weight:500; text-decoration:none;')
          : '';
      })
      .filter(Boolean),
    `<span style="color:${theme.divider};"> &nbsp;•&nbsp; </span>`
  );

const buildAvatarCell = (
  avatarUrl: string | undefined,
  variant: VariantConfig,
  imageSize = 72,
  gapRight = 16
): string => {
  if (!avatarUrl) return '';
  const radius = variant.useRoundedCorners
    ? variant.imageShape === 'circle'
      ? ' border-radius:999px;'
      : ' border-radius:10px;'
    : '';

  const cellWidth = imageSize + gapRight;

  return `<td width="${cellWidth}" valign="top" style="width:${cellWidth}px; vertical-align:top; padding:2px ${gapRight}px 0 0; mso-line-height-rule:exactly;"><img src="${escapeHtml(avatarUrl)}" width="${imageSize}" height="${imageSize}" alt="" style="display:block; width:${imageSize}px; height:${imageSize}px; vertical-align:top; border:0; outline:none; text-decoration:none;${radius}" /></td>`;
};

const buildLogoRow = (logoUrl: string | undefined, company: string): string => {
  if (!logoUrl) return '';
  const altText = company ? `${company} logo` : 'Company logo';
  return `<tr><td style="padding:2px 0 10px 0;"><img src="${escapeHtml(logoUrl)}" alt="${escapeHtml(altText)}" height="22" style="display:block; height:22px; width:auto; max-width:180px; border:0; outline:none; text-decoration:none;" /></td></tr>`;
};

const buildRow = (content: string, style: string): string => (content ? `<tr><td style="${style}">${content}</td></tr>` : '');

const buildSignatureBody = (rawProfile: Profile, theme: Theme, variant: VariantConfig): string => {
  const profile = normalizeProfile(rawProfile);
  const avatarUrl = sanitizeImageUrl(profile.avatarUrl, variant);
  const logoUrl = sanitizeImageUrl(profile.logoUrl, variant);
  const metaLine = buildMetaLine(profile);
  const contactLine = buildContactLine(profile, theme);
  const locationLine = [profile.location, profile.addressLine].filter(hasText).join(' · ');
  const compact = prefersCompact(variant);
  const textColor = variant.dynamicTextInherit ? 'inherit' : normalizedTextColor(theme);
  const mutedColor = variant.dynamicTextInherit ? 'inherit' : theme.muted;
  const isOutlookLike = variant.id === 'outlook-safe' || variant.id === 'gmail-safe';
  const isAppleLike = variant.id === 'apple-mail-safe';
  const isSparkLike = variant.id === 'spark-optimized';
  const socialLine = buildSocialRow(profile, theme, isSparkLike ? theme.ink : undefined);

  const fontFamily = isOutlookLike ? 'Arial, Helvetica, sans-serif' : theme.fontStack;
  const shellPadding = compact ? '14px 16px' : isAppleLike ? '18px 20px' : isSparkLike ? '12px 14px' : '16px 18px';
  const shellBorder = variant.id === 'outlook-safe' || isSparkLike ? '' : ` border-top:1px solid ${theme.divider};`;
  const nameSize = isAppleLike ? 20 : isSparkLike ? 17 : 18;
  const nameLine = isAppleLike ? 24 : isSparkLike ? 21 : 22;
  const avatarSize = isAppleLike ? 76 : isSparkLike ? 68 : 72;
  const metaPadding = isSparkLike ? '0 0 4px 0' : '0 0 8px 0';
  const taglinePadding = isSparkLike ? '0 0 7px 0' : '0 0 10px 0';
  const contactPadding = isSparkLike ? '0 0 5px 0' : '0 0 7px 0';
  const locationPadding = isSparkLike ? '0 0 5px 0' : '0 0 7px 0';
  const socialPadding = isSparkLike ? '0' : '1px 0 0 0';

  const detailRows = [
    buildRow(
      `${escapeHtml(profile.fullName || rawProfile.fullName || 'Your Name')}${
        profile.pronouns
          ? `<span style="font-size:11px; font-weight:400; color:${mutedColor};"> &nbsp;(${escapeHtml(profile.pronouns)})</span>`
          : ''
      }`,
      `font-family:${fontFamily}; font-size:${nameSize}px; line-height:${nameLine}px; font-weight:700; color:${textColor}; padding:0 0 3px 0; letter-spacing:0.1px;`
    ),
    buildRow(
      escapeHtml(metaLine),
      `font-family:${fontFamily}; font-size:${isAppleLike ? '13px' : '12px'}; line-height:${isAppleLike ? '18px' : isSparkLike ? '16px' : '17px'}; color:${mutedColor}; padding:${metaPadding};`
    ),
    buildRow(
      escapeHtml(profile.tagline ?? ''),
      `font-family:${fontFamily}; font-size:${isAppleLike ? '14px' : '13px'}; line-height:${isAppleLike ? '20px' : isSparkLike ? '18px' : '19px'}; color:${textColor}; padding:${taglinePadding};`
    ),
    buildLogoRow(logoUrl, profile.company),
    buildRow(
      contactLine,
      `font-family:${fontFamily}; font-size:13px; line-height:${isSparkLike ? '18px' : '19px'}; color:${textColor}; padding:${contactPadding}; word-break:break-word;`
    ),
    buildRow(
      escapeHtml(locationLine),
      `font-family:${fontFamily}; font-size:12px; line-height:${isSparkLike ? '17px' : '18px'}; color:${mutedColor}; padding:${locationPadding};`
    ),
    buildRow(
      socialLine,
      `font-family:${fontFamily}; font-size:12px; line-height:${isSparkLike ? '17px' : '18px'}; color:${mutedColor}; padding:${socialPadding}; word-break:break-word;`
    ),
    buildRow(
      escapeHtml(profile.disclaimer ?? ''),
      `font-family:${fontFamily}; font-size:11px; line-height:16px; color:${mutedColor}; padding:12px 0 0 0; border-top:1px solid ${theme.divider};`
    )
  ].join('');

  const avatarGap = isSparkLike ? 12 : 16;
  const innerTable = `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:100%;"><tr>${buildAvatarCell(avatarUrl, variant, avatarSize, avatarGap)}<td valign="top" style="vertical-align:top; padding:0; word-break:break-word;"><table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:100%;">${detailRows}</table></td></tr></table>`;

  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse; width:100%; max-width:600px; font-family:${fontFamily}; color:${textColor}; background:${theme.surface};"><tr><td style="padding:${shellPadding};${shellBorder}">${innerTable}</td></tr></table>`;
};

const buildAppleMailStyleBlock = (theme: Theme): string => `
<style>
  .signature-shell, .signature-shell table, .signature-shell td, .signature-shell span {
    color: inherit;
  }
  @media (prefers-color-scheme: dark) {
    .signature-shell { background:${theme.surface} !important; color: inherit !important; }
    .signature-shell a { color: ${theme.accent} !important; }
  }
</style>`;

const buildHtmlDocument = (profile: Profile, theme: Theme, variant: VariantConfig): string => {
  const body = buildSignatureBody(profile, theme, variant);
  const styleBlock = variant.useStyleTag ? buildAppleMailStyleBlock(theme) : '';
  return `${styleBlock}<div class="signature-shell" dir="auto">${body}</div>`;
};

export const buildPlainText = (rawProfile: Profile): string => {
  const profile = normalizeProfile(rawProfile);
  const contactLine = [profile.email, profile.phone, formatHref(profile.website ?? '', 'url')].filter(Boolean).join(' | ');
  const locationLine = [profile.location, profile.addressLine].filter(hasText).join(' · ');
  const socialText = profile.socialLinks
    .map((link) => {
      const href = formatHref(link.url, 'url');
      return href ? `${link.label}: ${href}` : '';
    })
    .filter(Boolean)
    .join(' | ');

  return [
    profile.fullName || rawProfile.fullName,
    buildMetaLine(profile),
    profile.tagline,
    contactLine,
    locationLine,
    profile.calendlyUrl ? `Book time: ${formatHref(profile.calendlyUrl, 'url')}` : '',
    socialText,
    profile.disclaimer
  ]
    .filter(Boolean)
    .join('\n');
};

export const generateOutput = (rawProfile: Profile, theme: Theme, variantId: VariantId): SignatureOutput => {
  const profile = normalizeProfile(rawProfile);

  if (variantId === 'plain-text') {
    return {
      id: 'plain-text',
      name: 'Plain text fallback',
      description: 'Readable fallback for plain-text compose or privacy-first workflows.',
      text: buildPlainText(profile),
      warnings: ['No images, custom spacing, or styled links.'],
      installSteps: ['Paste directly into the client’s plain-text signature field or use as fallback content.'],
      checks: ['Plain-text output generated.']
    };
  }

  const variant = variantMap[variantId];
  const client = compatibilityMatrix.find((entry) => entry.id === variantId.replace('-safe', '').replace('-optimized', ''));
  const warnings: string[] = [];

  if (!sanitizeImageUrl(profile.avatarUrl, variant)) {
    warnings.push('No safe avatar URL supplied; output will render text-only identity block.');
  }

  if (profile.logoUrl && !sanitizeImageUrl(profile.logoUrl, variant)) {
    warnings.push(
      variant.svgPolicy === 'avoid'
        ? 'SVG logo omitted for this variant. Use PNG fallback if you need a visible logo.'
        : 'Logo URL omitted because only remote HTTPS/HTTP or CID image sources are supported.'
    );
  }

  if (profile.website && !formatHref(profile.website, 'url')) {
    warnings.push('Website omitted because the URL was not a safe http(s) link.');
  }

  if (variant.darkModeStrategy === 'neutral-safe') {
    warnings.push('Designed for survivable dark mode, not exact dark-mode fidelity.');
  }

  if (variant.id === 'outlook-safe') {
    warnings.push('Test in classic Outlook for Windows before rollout; Word rendering remains idiosyncratic.');
  }

  return {
    id: variant.id,
    name: variant.name,
    description: variant.description,
    html: buildHtmlDocument(profile, theme, variant),
    warnings,
    installSteps: client?.installSteps ?? ['Paste into your signature editor and verify in a real sent message.'],
    checks: [
      variant.useStyleTag ? 'Includes optional Apple Mail style block.' : 'Inline-style-only output.',
      variant.svgPolicy === 'avoid' ? 'SVG-sensitive assets suppressed.' : 'SVG permitted when provided.',
      variant.imagePolicy === 'cid-or-remote' ? 'Image strategy documented for CID or remote hosting.' : 'Remote hosted image strategy.',
      'True two-column structure with top-aligned avatar cell.'
    ]
  };
};

export const generateAllOutputs = (profile: Profile, theme: Theme): SignatureOutput[] =>
  [
    'universal-safe',
    'spark-optimized',
    'gmail-safe',
    'outlook-safe',
    'apple-mail-safe',
    'plain-text'
  ].map((variantId) => generateOutput(profile, theme, variantId as VariantId));
