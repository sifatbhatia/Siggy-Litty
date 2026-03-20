import { describe, expect, it } from 'vitest';
import { defaultProfile } from '../src/data/defaults';
import { themeMap } from '../src/data/themes';
import { buildPlainText, generateAllOutputs, generateOutput } from '../src/lib/generator';
import { validateVariantHtml } from '../src/lib/validators';

describe('email signature generator', () => {
  it('generates all required variants', () => {
    const outputs = generateAllOutputs(defaultProfile, themeMap.graphite);
    expect(outputs.map((output) => output.id)).toEqual([
      'universal-safe',
      'spark-optimized',
      'gmail-safe',
      'outlook-safe',
      'apple-mail-safe',
      'plain-text'
    ]);
  });

  it('keeps strict variants free of unsupported features', () => {
    const strictVariants = ['universal-safe', 'gmail-safe', 'outlook-safe'] as const;

    strictVariants.forEach((variantId) => {
      const output = generateOutput(defaultProfile, themeMap.graphite, variantId);
      const issues = validateVariantHtml(variantId, output.html ?? '');
      expect(issues).toEqual([]);
    });
  });

  it('keeps avatar and details in a true top-aligned two-column row', () => {
    const htmlVariants = [
      'universal-safe',
      'spark-optimized',
      'gmail-safe',
      'outlook-safe',
      'apple-mail-safe'
    ] as const;

    htmlVariants.forEach((variantId) => {
      const output = generateOutput(defaultProfile, themeMap.graphite, variantId);
      const html = output.html ?? '';

      expect(html).toMatch(/<td[^>]*width="\d+"[^>]*valign="top"[^>]*>\s*<img/i);
      expect(html).toMatch(/<tr>\s*<td[^>]*>.*?<\/td>\s*<td[^>]*valign="top"/is);
      expect(output.checks).toContain('True two-column structure with top-aligned avatar cell.');
    });
  });

  it('uses company-aware logo alt text and rtl-safe root direction', () => {
    const output = generateOutput(
      { ...defaultProfile, company: 'Northstar Studio', logoUrl: 'https://example.com/logo.png' },
      themeMap.graphite,
      'apple-mail-safe'
    );
    expect(output.html).toContain('alt="Northstar Studio logo"');
    expect(output.html).toContain('dir="auto"');
  });

  it('allows Apple Mail variant to include a style block', () => {
    const output = generateOutput(defaultProfile, themeMap.graphite, 'apple-mail-safe');
    expect(output.html).toContain('<style>');
    expect(validateVariantHtml('apple-mail-safe', output.html ?? '')).toEqual([]);
  });

  it('keeps conservative variants premium but flat, without builder-ish card chrome', () => {
    const universal = generateOutput(defaultProfile, themeMap.graphite, 'universal-safe');
    const outlook = generateOutput(defaultProfile, themeMap.graphite, 'outlook-safe');

    expect(universal.html).toContain('max-width:600px');
    expect(universal.html).toContain('border-top:1px solid');
    expect(universal.html).not.toContain('border:1px solid');
    expect(outlook.html).toContain('padding:');
    expect(outlook.html).not.toContain('border-top:1px solid');
  });

  it('uses restrained inline typography and link styling', () => {
    const output = generateOutput(defaultProfile, themeMap.graphite, 'gmail-safe');
    const html = output.html ?? '';

    expect(html).toMatch(/font-size:(18|19|20)px; line-height:(22|23|24)px; font-weight:700;/);
    expect(html).toContain('font-size:12px; line-height:17px;');
    expect(html).toContain('font-weight:600; text-decoration:none;');
    expect(html).toContain('font-weight:500; text-decoration:none;');
  });

  it('omits svg logo in variants that avoid svg', () => {
    const output = generateOutput(
      { ...defaultProfile, logoUrl: 'https://example.com/logo.svg' },
      themeMap.graphite,
      'gmail-safe'
    );
    expect(output.html).not.toContain('.svg');
  });

  it('drops unsafe image and website urls instead of emitting risky markup', () => {
    const output = generateOutput(
      {
        ...defaultProfile,
        avatarUrl: 'javascript:alert(1)',
        logoUrl: 'data:image/png;base64,abc',
        website: 'javascript:alert(1)',
        socialLinks: [
          { label: 'Portfolio', url: 'example.com/work' },
          { label: 'Oops', url: 'javascript:alert(1)' }
        ]
      },
      themeMap.graphite,
      'outlook-safe'
    );

    expect(output.html).not.toContain('javascript:');
    expect(output.html).not.toContain('data:image');
    expect(output.html).toContain('https://example.com/work');
    expect(output.html).not.toContain('>Oops<');
    expect(output.warnings).toContain('No safe avatar URL supplied; output will render text-only identity block.');
    expect(output.warnings).toContain('Website omitted because the URL was not a safe http(s) link.');
  });

  it('normalizes plain text and preserves safe urls', () => {
    const text = buildPlainText({
      ...defaultProfile,
      fullName: '  Avery   Lane  ',
      website: 'northstar.studio',
      socialLinks: [{ label: ' Portfolio ', url: 'northstar.studio/work' }]
    });

    expect(text).toContain('Avery Lane');
    expect(text).toContain(`https://northstar.studio`);
    expect(text).toContain('Portfolio: https://northstar.studio/work');
  });

  it('builds plain text fallback', () => {
    const output = generateOutput(defaultProfile, themeMap.graphite, 'plain-text');
    expect(output.text).toContain(defaultProfile.fullName);
    expect(output.text).toContain(defaultProfile.email);
  });
});
