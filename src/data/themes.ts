import type { Theme } from '../lib/types';

export const themes: Theme[] = [
  {
    id: 'graphite',
    name: 'Graphite Grid',
    description: 'Editorial, high-contrast, and crisp. Good default for universal-safe output.',
    fontStack: "'Segoe UI', Helvetica, Arial, sans-serif",
    accent: '#2053ff',
    accentSoft: '#eaf0ff',
    surface: '#ffffff',
    ink: '#0f172a',
    muted: '#516076',
    divider: '#dbe3ef',
    layout: 'split'
  },
  {
    id: 'linen',
    name: 'Linen Note',
    description: 'Warm, human, and slightly softer for personal brands and consultancies.',
    fontStack: "Georgia, 'Times New Roman', serif",
    accent: '#8a4b2a',
    accentSoft: '#f7ece5',
    surface: '#fffdf9',
    ink: '#2f241f',
    muted: '#6f6058',
    divider: '#ead9cc',
    layout: 'split'
  },
  {
    id: 'cobalt',
    name: 'Cobalt Ribbon',
    description: 'Bold left-edge banding for agencies, startups, and product teams.',
    fontStack: "'Avenir Next', 'Segoe UI', Arial, sans-serif",
    accent: '#0b57d0',
    accentSoft: '#ebf3ff',
    surface: '#f8fbff',
    ink: '#132238',
    muted: '#4d5f77',
    divider: '#c9d7ef',
    layout: 'split'
  },
  {
    id: 'noir',
    name: 'Noir Mono',
    description: 'Minimal, restrained, and precise. Great when you want the least visual risk.',
    fontStack: "Tahoma, Verdana, Arial, sans-serif",
    accent: '#111111',
    accentSoft: '#f2f2f2',
    surface: '#ffffff',
    ink: '#111111',
    muted: '#5b5b5b',
    divider: '#dddddd',
    layout: 'split'
  },
  {
    id: 'bare',
    name: 'Bare Transparent',
    description: 'No fill background, a clean transparent signature block for email clients that already style the compose area.',
    fontStack: "'Segoe UI', Helvetica, Arial, sans-serif",
    accent: '#2053ff',
    accentSoft: 'transparent',
    surface: 'transparent',
    ink: '#0f172a',
    muted: '#516076',
    divider: '#dbe3ef',
    layout: 'split'
  }
];

export const themeMap = Object.fromEntries(themes.map((theme) => [theme.id, theme]));
