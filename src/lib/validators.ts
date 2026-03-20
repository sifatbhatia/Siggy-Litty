import { variantMap } from '../data/variants';
import type { VariantId } from './types';

const contains = (html: string, pattern: RegExp): boolean => pattern.test(html);

export const validateVariantHtml = (variantId: Exclude<VariantId, 'plain-text'>, html: string): string[] => {
  const variant = variantMap[variantId];
  const issues: string[] = [];

  if (!contains(html, /<table\b/i)) issues.push('Expected table-based layout.');
  if (!contains(html, /style=/i)) issues.push('Expected inline styles.');

  if (!variant.useStyleTag && contains(html, /<style\b/i)) {
    issues.push('Unexpected <style> block for strict variant.');
  }

  if (!variant.useWebFonts && contains(html, /@font-face|fonts\.googleapis/i)) {
    issues.push('Unexpected web-font dependency for strict variant.');
  }

  if (variant.svgPolicy === 'avoid' && contains(html, /\.svg(?:["')?#]|$)/i)) {
    issues.push('Unexpected SVG reference in variant that forbids SVG.');
  }

  if (!variant.useRoundedCorners && contains(html, /border-radius\s*:/i)) {
    issues.push('Unexpected border-radius in strict variant.');
  }

  if (!contains(html, /<td[^>]*valign="top"[^>]*>/i) || !contains(html, /vertical-align:top/i)) {
    issues.push('Expected top-aligned table cells for stable image and text alignment.');
  }

  if (contains(html, /<img\b/i) && !contains(html, /<tr>\s*<td[^>]*>.*?<\/td>\s*<td[^>]*>/is)) {
    issues.push('Expected a row-based two-column table structure when an image is present.');
  }

  if (contains(html, /href="(?:javascript:|data:)/i) || contains(html, /src="(?:javascript:|data:)/i)) {
    issues.push('Unsafe URL protocol detected in markup.');
  }

  if (variant.id === 'outlook-safe' && contains(html, /display\s*:\s*flex|display\s*:\s*grid|position\s*:\s*absolute/i)) {
    issues.push('Outlook-safe variant includes layout CSS that Outlook desktop may ignore.');
  }

  return issues;
};
