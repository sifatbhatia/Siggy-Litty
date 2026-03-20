export type ThemeId = 'graphite' | 'linen' | 'cobalt' | 'noir' | 'bare';

export type VariantId =
  | 'universal-safe'
  | 'spark-optimized'
  | 'gmail-safe'
  | 'outlook-safe'
  | 'apple-mail-safe'
  | 'plain-text';

export type SocialLink = {
  label: string;
  url: string;
};

export type Profile = {
  fullName: string;
  pronouns?: string;
  title: string;
  company: string;
  tagline?: string;
  email: string;
  phone?: string;
  website?: string;
  location?: string;
  addressLine?: string;
  avatarUrl?: string;
  logoUrl?: string;
  calendlyUrl?: string;
  disclaimer?: string;
  socialLinks: SocialLink[];
};

export type Theme = {
  id: ThemeId;
  name: string;
  description: string;
  fontStack: string;
  accent: string;
  accentSoft: string;
  surface: string;
  ink: string;
  muted: string;
  divider: string;
  layout: 'split' | 'stacked' | 'banded' | 'minimal';
};

export type VariantConfig = {
  id: VariantId;
  name: string;
  description: string;
  useStyleTag: boolean;
  useWebFonts: boolean;
  useRoundedCorners: boolean;
  imagePolicy: 'remote-only' | 'cid-or-remote';
  svgPolicy: 'avoid' | 'remote-fallback' | 'allow';
  darkModeStrategy: 'neutral-safe' | 'apple-targeted';
  imageShape: 'square' | 'circle';
  compact: boolean;
  dynamicTextInherit?: boolean;
};

export type SignatureOutput = {
  id: VariantId;
  name: string;
  description: string;
  html?: string;
  text?: string;
  warnings: string[];
  installSteps: string[];
  checks: string[];
};

export type CompatibilityCell = {
  summary: string;
  level: 'good' | 'mixed' | 'poor';
};

export type ClientCompatibility = {
  id: string;
  client: string;
  editor: string;
  htmlCss: CompatibilityCell;
  images: CompatibilityCell;
  darkMode: CompatibilityCell;
  mediaQueries: CompatibilityCell;
  webFonts: CompatibilityCell;
  svg: CompatibilityCell;
  animatedGif: CompatibilityCell;
  tracking: CompatibilityCell;
  mobile: CompatibilityCell;
  installSteps: string[];
  notes: string[];
  sources: { label: string; url: string }[];
};
