import type { VariantConfig } from '../lib/types';

export const variants: VariantConfig[] = [
  {
    id: 'universal-safe',
    name: 'Universal-safe HTML',
    description: 'Table-based, inline-only, remote image friendly, and conservative for broadest rendering safety.',
    useStyleTag: false,
    useWebFonts: false,
    useRoundedCorners: false,
    imagePolicy: 'remote-only',
    svgPolicy: 'avoid',
    darkModeStrategy: 'neutral-safe',
    imageShape: 'square',
    compact: false
  },
  {
    id: 'spark-optimized',
    name: 'Spark-optimized HTML',
    description: 'Keeps Spark-friendly HTML paste support, allows rounded avatars, and preserves a little more visual polish.',
    useStyleTag: false,
    useWebFonts: false,
    useRoundedCorners: true,
    imagePolicy: 'remote-only',
    svgPolicy: 'remote-fallback',
    darkModeStrategy: 'neutral-safe',
    imageShape: 'circle',
    compact: false,
    dynamicTextInherit: true
  },
  {
    id: 'gmail-safe',
    name: 'Gmail-safe HTML',
    description: 'Optimized for Gmail signature editor constraints: no style block dependence, no SVG, conservative spacing.',
    useStyleTag: false,
    useWebFonts: false,
    useRoundedCorners: false,
    imagePolicy: 'remote-only',
    svgPolicy: 'avoid',
    darkModeStrategy: 'neutral-safe',
    imageShape: 'square',
    compact: true
  },
  {
    id: 'outlook-safe',
    name: 'Outlook-safe HTML',
    description: 'Extra conservative for Word-based Outlook rendering: tables, fixed dimensions, minimal CSS, and no border-radius dependency.',
    useStyleTag: false,
    useWebFonts: false,
    useRoundedCorners: false,
    imagePolicy: 'cid-or-remote',
    svgPolicy: 'avoid',
    darkModeStrategy: 'neutral-safe',
    imageShape: 'square',
    compact: false
  },
  {
    id: 'apple-mail-safe',
    name: 'Apple Mail-safe HTML',
    description: 'Allows a targeted style block and richer typography for Apple Mail while keeping a safe fallback path.',
    useStyleTag: true,
    useWebFonts: true,
    useRoundedCorners: true,
    imagePolicy: 'remote-only',
    svgPolicy: 'allow',
    darkModeStrategy: 'apple-targeted',
    imageShape: 'circle',
    compact: false,
    dynamicTextInherit: true
  }
];

export const variantMap = Object.fromEntries(variants.map((variant) => [variant.id, variant]));
