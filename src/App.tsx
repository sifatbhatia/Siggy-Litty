import { KeyboardEvent, useMemo, useState } from 'react';
import { compatibilityMatrix } from './data/compatibility';
import { defaultProfile } from './data/defaults';
import { themes } from './data/themes';
import { generateAllOutputs } from './lib/generator';
import { validateVariantHtml } from './lib/validators';
import type { Profile, SignatureOutput, SocialLink, ThemeId, VariantId } from './lib/types';

const downloadFile = (filename: string, content: string, mime: string) => {
  const blob = new Blob([content], { type: mime });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 500);
};

const previewTips: Record<VariantId, string> = {
  'universal-safe': 'Best default when broad compatibility matters more than visual flourish.',
  'spark-optimized': 'Keeps the same core structure but allows a softer, more polished avatar treatment.',
  'gmail-safe': 'Trimmed for Gmail’s editor constraints and tighter mobile compose windows.',
  'outlook-safe': 'Most conservative export. Use this when Word-based Outlook is a real audience.',
  'apple-mail-safe': 'Allows a little more refinement and dark-mode friendliness where supported.',
  'plain-text': 'Fallback for locked-down clients, plain-text compose, or privacy-first teams.'
};

const fallbackVariantContext: Partial<Record<VariantId, {
  client: string;
  notes: string[];
  htmlCss: string;
  images: string;
  darkMode: string;
}>> = {
  'universal-safe': {
    client: 'Cross-client baseline',
    notes: [
      'This export is intentionally generic: it aims for the safest overlap across major mail clients rather than one editor’s happy path.',
      'Use it when you need one dependable default before tailoring for Gmail, Spark, Outlook, or Apple Mail.'
    ],
    htmlCss: 'Inline-only table HTML aimed at the broadest practical compatibility window.',
    images: 'Remote images stay optional so the signature still works if assets are blocked or stripped.',
    darkMode: 'Neutral-safe colors reduce inversion damage, but no client can guarantee exact dark-mode fidelity.'
  },
  'plain-text': {
    client: 'Plain-text fallback',
    notes: ['Plain-text fallback strips layout and images by design.'],
    htmlCss: 'No HTML dependency.',
    images: 'No images.',
    darkMode: 'Not applicable in plain text.'
  }
};

const App = () => {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [themeId, setThemeId] = useState<ThemeId>('linen');
  const [activeOutput, setActiveOutput] = useState<VariantId>('universal-safe');
  const [copyState, setCopyState] = useState<string>('');

  const theme = useMemo(() => themes.find((entry) => entry.id === themeId) ?? themes[0], [themeId]);
  const outputs = useMemo(() => generateAllOutputs(profile, theme), [profile, theme]);
  const outputMap = useMemo(() => Object.fromEntries(outputs.map((entry) => [entry.id, entry])) as Record<VariantId, SignatureOutput>, [outputs]);
  const current = outputMap[activeOutput];
  const hasCurrentOutput = Boolean(current.html ?? current.text);

  const missingCoreFields = useMemo(() => {
    const checks = [
      { label: 'Full name', value: profile.fullName },
      { label: 'Title', value: profile.title },
      { label: 'Company', value: profile.company },
      { label: 'Email', value: profile.email }
    ];
    return checks.filter((item) => !item.value?.trim()).map((item) => item.label);
  }, [profile]);

  const validation = useMemo(() => {
    if (!current.html || activeOutput === 'plain-text') return [];
    return validateVariantHtml(activeOutput as Exclude<VariantId, 'plain-text'>, current.html);
  }, [activeOutput, current.html]);

  const currentClient = useMemo(() => {
    if (activeOutput === 'plain-text' || activeOutput === 'universal-safe') return null;
    return compatibilityMatrix.find((entry) => entry.id === activeOutput.replace('-safe', '').replace('-optimized', '')) ?? null;
  }, [activeOutput]);

  const currentContext = useMemo(() => {
    const fallback = fallbackVariantContext[activeOutput];
    if (fallback) {
      return {
        client: fallback.client ?? current.name,
        notes: fallback.notes ?? [],
        htmlCss: fallback.htmlCss ?? 'Conservative HTML output.',
        images: fallback.images ?? 'Optional and safely removable.',
        darkMode: fallback.darkMode ?? 'Dark mode handling varies by client.'
      };
    }

    if (!currentClient) {
      return {
        client: current.name,
        notes: [],
        htmlCss: 'Conservative HTML output.',
        images: 'Optional and safely removable.',
        darkMode: 'Dark mode handling varies by client.'
      };
    }

    return {
      client: currentClient.client,
      notes: currentClient.notes,
      htmlCss: currentClient.htmlCss.summary,
      images: currentClient.images.summary,
      darkMode: currentClient.darkMode.summary
    };
  }, [activeOutput, current.name, currentClient]);

  const recommendedExtras = useMemo(() => {
    const missing: string[] = [];
    if (!profile.avatarUrl?.trim()) missing.push('Avatar');
    if (!profile.website?.trim()) missing.push('Website');
    if (!profile.phone?.trim()) missing.push('Phone');
    return missing;
  }, [profile.avatarUrl, profile.phone, profile.website]);

  const setField = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setProfile((previous) => ({ ...previous, [key]: value }));
  };

  const activeIndex = outputs.findIndex((output) => output.id === activeOutput);
  const activeThemeIndex = themes.findIndex((entry) => entry.id === themeId);

  const handleVariantKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % outputs.length;
    if (event.key === 'ArrowLeft') nextIndex = (index - 1 + outputs.length) % outputs.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = outputs.length - 1;

    const nextOutput = outputs[nextIndex];
    setActiveOutput(nextOutput.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`variant-tab-${nextOutput.id}`)?.focus();
    });
  };

  const handleThemeKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();

    let nextIndex = index;
    if (event.key === 'ArrowRight' || event.key === 'ArrowDown') nextIndex = (index + 1) % themes.length;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') nextIndex = (index - 1 + themes.length) % themes.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = themes.length - 1;

    const nextTheme = themes[nextIndex];
    setThemeId(nextTheme.id);
    window.requestAnimationFrame(() => {
      document.getElementById(`theme-${nextTheme.id}`)?.focus();
    });
  };

  const setSocialLink = (index: number, patch: Partial<SocialLink>) => {
    setProfile((previous) => ({
      ...previous,
      socialLinks: previous.socialLinks.map((item, currentIndex) =>
        currentIndex === index ? { ...item, ...patch } : item
      )
    }));
  };

  const addSocialLink = () => {
    setProfile((previous) => ({
      ...previous,
      socialLinks: [...previous.socialLinks, { label: 'Link label', url: 'https://' }]
    }));
  };

  const removeSocialLink = (index: number) => {
    setProfile((previous) => ({
      ...previous,
      socialLinks: previous.socialLinks.filter((_, currentIndex) => currentIndex !== index)
    }));
  };

  const handleCopy = async () => {
    const value = current.html ?? current.text ?? '';
    if (!value) return;

    try {
      if (current.html && 'ClipboardItem' in window && navigator.clipboard?.write) {
        const item = new ClipboardItem({
          'text/html': new Blob([current.html], { type: 'text/html' }),
          'text/plain': new Blob([current.text ?? current.html], { type: 'text/plain' })
        });
        await navigator.clipboard.write([item]);
        setCopyState(`Copied ${current.name} as HTML + plain text.`);
      } else if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopyState(`Copied ${current.name}.`);
      } else {
        setCopyState('Clipboard copy is not available in this browser. Use download instead.');
      }
    } catch {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
        setCopyState(`Copied ${current.name}.`);
      } else {
        setCopyState('Clipboard copy failed. Use download instead.');
      }
    }

    window.setTimeout(() => setCopyState(''), 2400);
  };

  const handleExport = () => {
    const value = current.html ?? current.text ?? '';
    if (!value) return;
    downloadFile(
      `signature-${current.id}.${current.html ? 'html' : 'txt'}`,
      value,
      current.html ? 'text/html;charset=utf-8' : 'text/plain;charset=utf-8'
    );
    setCopyState(`Downloaded ${current.name}.`);
    window.setTimeout(() => setCopyState(''), 1800);
  };

  const handleExportBundle = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      theme: theme.id,
      profile,
      variants: outputs.map((entry) => ({
        id: entry.id,
        name: entry.name,
        html: entry.html ?? null,
        text: entry.text ?? null,
        warnings: entry.warnings,
        checks: entry.checks
      }))
    };

    downloadFile('signature-bundle.json', JSON.stringify(payload, null, 2), 'application/json;charset=utf-8');
    setCopyState('Downloaded signature bundle.');
    window.setTimeout(() => setCopyState(''), 1800);
  };

  const allChecks = [...current.checks, ...validation];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <section className="hero-block">
          <p className="eyebrow">Email Signature Studio</p>
          <h1>Clean two-column signatures, tuned for the clients people actually use.</h1>
          <p className="lede">
            Fill in one profile, then export careful variants for Gmail, Spark, Outlook, Apple Mail, and plain-text fallback.
          </p>
          <div className="hero-notes" aria-label="Product principles">
            <span>Premium minimal UI</span>
            <span>Compatibility-first output</span>
            <span>Avatar left, details right</span>
          </div>
        </section>

        <section className="panel readiness-panel">
          <div className="row space-between wrap-row">
            <div>
              <p className="section-kicker">Export readiness</p>
              <h2>{missingCoreFields.length === 0 ? 'Ready to test in real mail clients' : 'Add the essentials first'}</h2>
            </div>
            <strong>{missingCoreFields.length === 0 ? 'Ready' : `${missingCoreFields.length} missing`}</strong>
          </div>
          {missingCoreFields.length === 0 ? (
            <p className="helper">
              Core identity is complete. For the most polished result, add the optional items below and send a live test before rollout.
            </p>
          ) : (
            <ul>
              {missingCoreFields.map((field) => (
                <li key={field}>{field}</li>
              ))}
            </ul>
          )}
          {recommendedExtras.length > 0 ? (
            <p className="helper">Optional extras still worth adding: {recommendedExtras.join(', ')}.</p>
          ) : null}
        </section>

        <section className="panel form-panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Profile</p>
              <h2>Identity and contact details</h2>
            </div>
            <p className="helper">Keep copy short. Email signatures work best when every line earns its place.</p>
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <h3>Core identity</h3>
              <p>These lines appear first in every variant.</p>
            </div>
            <div className="grid two-up">
              <label>
                Full name
                <input value={profile.fullName} maxLength={80} dir="auto" autoComplete="name" onChange={(event) => setField('fullName', event.target.value)} />
              </label>
              <label>
                Pronouns
                <input value={profile.pronouns ?? ''} maxLength={32} dir="auto" placeholder="Optional" onChange={(event) => setField('pronouns', event.target.value)} />
              </label>
              <label>
                Title
                <input value={profile.title} maxLength={80} dir="auto" autoComplete="organization-title" onChange={(event) => setField('title', event.target.value)} />
              </label>
              <label>
                Company
                <input value={profile.company} maxLength={80} dir="auto" autoComplete="organization" onChange={(event) => setField('company', event.target.value)} />
              </label>
            </div>
            <label>
              Tagline
              <textarea
                value={profile.tagline ?? ''}
                maxLength={160}
                dir="auto"
                rows={2}
                placeholder="Optional one-line positioning statement"
                onChange={(event) => setField('tagline', event.target.value)}
              />
            </label>
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <h3>Contact and booking</h3>
              <p>Use direct links when possible. They travel better across clients.</p>
            </div>
            <div className="grid two-up">
              <label>
                Email
                <input
                  type="email"
                  value={profile.email}
                  maxLength={120}
                  dir="auto"
                  autoComplete="email"
                  spellCheck={false}
                  onChange={(event) => setField('email', event.target.value)}
                />
              </label>
              <label>
                Phone
                <input
                  type="tel"
                  value={profile.phone ?? ''}
                  maxLength={40}
                  dir="auto"
                  autoComplete="tel"
                  onChange={(event) => setField('phone', event.target.value)}
                />
              </label>
              <label>
                Website
                <input
                  type="url"
                  value={profile.website ?? ''}
                  maxLength={160}
                  dir="auto"
                  autoComplete="url"
                  spellCheck={false}
                  placeholder="https://example.com"
                  onChange={(event) => setField('website', event.target.value)}
                />
              </label>
              <label>
                Booking link
                <input
                  type="url"
                  value={profile.calendlyUrl ?? ''}
                  maxLength={160}
                  dir="auto"
                  spellCheck={false}
                  placeholder="https://calendly.com/..."
                  onChange={(event) => setField('calendlyUrl', event.target.value)}
                />
              </label>
              <label>
                Location
                <input value={profile.location ?? ''} maxLength={80} dir="auto" autoComplete="address-level2" onChange={(event) => setField('location', event.target.value)} />
              </label>
              <label>
                Address or note line
                <input value={profile.addressLine ?? ''} maxLength={120} dir="auto" onChange={(event) => setField('addressLine', event.target.value)} />
              </label>
            </div>
          </div>

          <div className="field-group">
            <div className="field-group-header">
              <h3>Assets and footer note</h3>
              <p>Hosted HTTPS images are safest. Keep logos PNG-first unless you control the destination client.</p>
            </div>
            <div className="grid two-up">
              <label>
                Avatar URL
                <input
                  type="url"
                  value={profile.avatarUrl ?? ''}
                  maxLength={240}
                  dir="auto"
                  spellCheck={false}
                  placeholder="https://..."
                  onChange={(event) => setField('avatarUrl', event.target.value)}
                />
              </label>
              <label>
                Logo URL
                <input
                  type="url"
                  value={profile.logoUrl ?? ''}
                  maxLength={240}
                  dir="auto"
                  spellCheck={false}
                  placeholder="PNG recommended"
                  onChange={(event) => setField('logoUrl', event.target.value)}
                />
              </label>
            </div>
            <label>
              Disclaimer
              <textarea
                value={profile.disclaimer ?? ''}
                maxLength={220}
                dir="auto"
                rows={3}
                placeholder="Optional short note or environmental disclaimer"
                onChange={(event) => setField('disclaimer', event.target.value)}
              />
            </label>
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Links</p>
              <h2>Social and portfolio links</h2>
            </div>
            <button className="secondary" onClick={addSocialLink}>Add link</button>
          </div>
          <p className="helper">Keep these selective. Too many links quickly make signatures feel noisy.</p>
          <div className="stack-sm">
            {profile.socialLinks.map((link, index) => (
              <div className="grid social-row" key={`${link.label}-${index}`}>
                <label>
                  Label
                  <input value={link.label} maxLength={32} dir="auto" onChange={(event) => setSocialLink(index, { label: event.target.value })} />
                </label>
                <label>
                  URL
                  <input
                    type="url"
                    value={link.url}
                    maxLength={200}
                    dir="auto"
                    spellCheck={false}
                    onChange={(event) => setSocialLink(index, { url: event.target.value })}
                  />
                </label>
                <button className="ghost danger" onClick={() => removeSocialLink(index)}>Remove</button>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Theme</p>
              <h2>Pick a restrained visual direction</h2>
            </div>
          </div>
          <div className="theme-grid" role="radiogroup" aria-label="Signature theme">
            {themes.map((entry, index) => (
              <button
                key={entry.id}
                id={`theme-${entry.id}`}
                className={`theme-card ${entry.id === themeId ? 'active' : ''}`}
                onClick={() => setThemeId(entry.id)}
                onKeyDown={(event) => handleThemeKeyDown(event, index)}
                role="radio"
                aria-checked={entry.id === themeId}
                tabIndex={index === activeThemeIndex ? 0 : -1}
              >
                <span className="theme-swatch" style={{ background: entry.accent }} />
                <strong>{entry.name}</strong>
                <span>{entry.description}</span>
              </button>
            ))}
          </div>
        </section>
      </aside>

      <main className="workspace">
        <section className="panel sticky-actions">
          <div className="section-heading outputs-heading">
            <div>
              <p className="section-kicker">Outputs</p>
              <h2>Compatibility-aware exports</h2>
            </div>
            <p className="helper">Copy rich HTML when the client allows it. Keep the plain-text version nearby for fallback.</p>
          </div>
          <div className="toolbar">
            <button onClick={handleCopy} disabled={!hasCurrentOutput}>Copy current</button>
            <button className="secondary" onClick={handleExport} disabled={!hasCurrentOutput}>Download current</button>
            <button className="ghost" onClick={handleExportBundle}>Download bundle</button>
            <span className="copy-state" aria-live="polite">{copyState}</span>
          </div>
          <div className="variant-tabs" role="tablist" aria-label="Signature output variants">
            {outputs.map((output, index) => (
              <button
                key={output.id}
                id={`variant-tab-${output.id}`}
                className={output.id === activeOutput ? 'active' : ''}
                onClick={() => setActiveOutput(output.id)}
                onKeyDown={(event) => handleVariantKeyDown(event, index)}
                role="tab"
                aria-selected={output.id === activeOutput}
                aria-controls={`variant-panel-${output.id}`}
                tabIndex={index === activeIndex ? 0 : -1}
              >
                {output.name}
              </button>
            ))}
          </div>
        </section>

        <section
          className="panel output-panel"
          id={`variant-panel-${activeOutput}`}
          role="tabpanel"
          aria-labelledby={`variant-tab-${activeOutput}`}
        >
          <div className="output-header">
            <div>
              <p className="section-kicker">Current export</p>
              <h3>{current.name}</h3>
              <p className="helper output-description">{current.description}</p>
            </div>
            <div className="status-block">
              <strong>{validation.length === 0 ? 'Checks passing' : `${validation.length} issue(s)`}</strong>
              <span>{previewTips[activeOutput]}</span>
            </div>
          </div>

          <div className="preview-layout">
            <div className="preview-card">
              <div className="preview-meta">
                <span>{theme.name}</span>
                <span>{activeOutput === 'plain-text' ? 'Plain text' : 'Table-based HTML preview'}</span>
              </div>
              {current.html ? (
                <div className="preview-shell">
                  <div className="preview-surface" dangerouslySetInnerHTML={{ __html: current.html }} />
                </div>
              ) : (
                <pre className="text-preview">{current.text}</pre>
              )}
              <p className="helper preview-note">Preview is helpful, but the final verdict is always a real sent message inside the target client.</p>
            </div>

            <aside className="summary-card">
              <h4>What this export is doing</h4>
              <ul className="summary-list">
                <li>Layout: true two-column signature with avatar on the left and details on the right.</li>
                <li>Avatar alignment: top-aligned for steadier rendering across desktop and mobile clients.</li>
                <li>Safety level: {currentContext.htmlCss}</li>
                <li>Images: {currentContext.images}</li>
                <li>Dark mode: {currentContext.darkMode}</li>
              </ul>
              <div className="client-note">
                <strong>{currentContext.client}</strong>
                <p>{currentContext.notes[0] ?? 'Use this export as a starting point, then validate it in a real sent message.'}</p>
              </div>
            </aside>
          </div>

          <div className="grid info-grid">
            <div className="info-card">
              <h4>Warnings</h4>
              <ul>
                {current.warnings.length > 0 ? current.warnings.map((item) => <li key={item}>{item}</li>) : <li>No variant-specific warnings.</li>}
              </ul>
            </div>
            <div className="info-card">
              <h4>Install steps</h4>
              <ol>
                {current.installSteps.map((item) => <li key={item}>{item}</li>)}
              </ol>
            </div>
            <div className="info-card">
              <h4>Validation</h4>
              <ul>
                {allChecks.map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
            <div className="info-card">
              <h4>Client notes</h4>
              <ul>
                {(currentContext.notes.length > 0
                  ? currentContext.notes
                  : ['Use this export as a starting point, then validate it in a real sent message.']
                ).map((item) => <li key={item}>{item}</li>)}
              </ul>
            </div>
          </div>

          <details className="raw-details">
            <summary>Raw output</summary>
            <pre className="code-block">{current.html ?? current.text}</pre>
          </details>
        </section>

        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="section-kicker">Research matrix</p>
              <h2>Major client behavior at a glance</h2>
            </div>
            <p className="helper">Use this as a planning guide, not a promise. Mail clients love edge cases.</p>
          </div>
          <div className="matrix-table">
            <table>
              <caption className="sr-only">Compatibility notes for major email clients and editors.</caption>
              <thead>
                <tr>
                  <th scope="col">Client</th>
                  <th scope="col">HTML/CSS</th>
                  <th scope="col">Images</th>
                  <th scope="col">Dark mode</th>
                  <th scope="col">Media queries</th>
                  <th scope="col">Fonts</th>
                  <th scope="col">SVG</th>
                  <th scope="col">Mobile quirk</th>
                </tr>
              </thead>
              <tbody>
                {compatibilityMatrix.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>{row.client}</strong>
                      <span>{row.editor}</span>
                    </td>
                    <td>{row.htmlCss.summary}</td>
                    <td>{row.images.summary}</td>
                    <td>{row.darkMode.summary}</td>
                    <td>{row.mediaQueries.summary}</td>
                    <td>{row.webFonts.summary}</td>
                    <td>{row.svg.summary}</td>
                    <td>{row.mobile.summary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};

export default App;
