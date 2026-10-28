import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { compatibilityMatrix } from "./data/compatibility";
import { defaultProfile } from "./data/defaults";
import { themes } from "./data/themes";
import { buildPlainText, generateAllOutputs } from "./lib/generator";
import { validateVariantHtml } from "./lib/validators";
import type { Profile, SocialLink, ThemeId, VariantId } from "./lib/types";

type Section = "Profile" | "Contact" | "Links" | "Style";
const sections: Section[] = ["Profile", "Contact", "Links", "Style"];
const shortNames: Record<VariantId, string> = {
  "universal-safe": "Universal",
  "spark-optimized": "Spark",
  "gmail-safe": "Gmail",
  "outlook-safe": "Outlook",
  "apple-mail-safe": "Apple Mail",
  "plain-text": "Plain text",
};
const downloadFile = (filename: string, content: string, mime: string) => {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
};
function Icon({
  name,
}: {
  name: "copy" | "download" | "sun" | "moon" | "arrow" | "mark";
}) {
  const paths = {
    copy: "M8 7V3h12v13h-4M4 7h12v14H4z",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    sun: "M12 1v3m0 16v3M1 12h3m16 0h3M4 4l2 2m12 12 2 2M4 20l2-2M18 6l2-2M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    moon: "M20 15A9 9 0 0 1 9 4a9 9 0 1 0 11 11",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    mark: "M4 5h16v14H4zM4 5l8 7 8-7",
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  );
}

// The iframe gets the unmodified export, not app styles or custom web fonts.
function SignaturePreview({ html }: { html: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(250);
  const [failedImages, setFailedImages] = useState(false);
  useEffect(() => {
    const element = frame.current;
    if (!element) return;
    let observer: ResizeObserver | undefined;
    let cleanupImages: (() => void)[] = [];
    const loaded = () => {
      observer?.disconnect();
      cleanupImages.forEach((cleanup) => cleanup());
      cleanupImages = [];
      const doc = element.contentDocument;
      const body = doc?.body;
      if (!doc || !body) return;
      const measure = () => {
        if (body.isConnected)
          setHeight(Math.ceil(body.getBoundingClientRect().height) + 2);
      };
      const checkImages = () =>
        setFailedImages(
          [...doc.images].some(
            (image) => image.complete && image.naturalWidth === 0,
          ),
        );
      observer = new ResizeObserver(measure);
      observer.observe(body);
      [...doc.images].forEach((image) => {
        image.addEventListener("load", checkImages);
        image.addEventListener("error", checkImages);
        cleanupImages.push(() => {
          image.removeEventListener("load", checkImages);
          image.removeEventListener("error", checkImages);
        });
      });
      measure();
      checkImages();
    };
    element.addEventListener("load", loaded);
    if (element.contentDocument?.readyState === "complete") loaded();
    return () => {
      element.removeEventListener("load", loaded);
      observer?.disconnect();
      cleanupImages.forEach((cleanup) => cleanup());
    };
  }, [html]);
  return (
    <>
      <iframe
        ref={frame}
        title="Signature preview"
        sandbox="allow-same-origin"
        style={{ height }}
        srcDoc={`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><style>html{color-scheme:light;background:#fff}body{margin:0;font-family:Arial,Helvetica,sans-serif;color:#222;display:flow-root}</style></head><body>${html}</body></html>`}
      />
      {failedImages && (
        <p className="image-warning">
          An image couldn’t load. Check its hosted URL; recipients may also
          block remote images.
        </p>
      )}
    </>
  );
}

export default function App() {
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [themeId, setThemeId] = useState<ThemeId>("linen");
  const [activeOutput, setActiveOutput] = useState<VariantId>("universal-safe");
  const [section, setSection] = useState<Section>("Profile");
  const [mobileView, setMobileView] = useState<"edit" | "preview">("preview");
  const [mode, setMode] = useState<"day" | "night">(() => {
    try {
      // Reads the pre-rename key once so an existing preference survives.
      const stored =
        localStorage.getItem("signet-appearance") ??
        localStorage.getItem("siggy-appearance");
      return stored === "night" ? "night" : "day";
    } catch {
      return "day";
    }
  });
  const [copyState, setCopyState] = useState("");
  const [manualCopy, setManualCopy] = useState(false);
  const [sourceOpen, setSourceOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const timer = useRef<number>();
  const revision = useRef(0);
  const manualField = useRef<HTMLTextAreaElement>(null);
  const nextSocialId = useRef(defaultProfile.socialLinks.length);
  const [socialIds, setSocialIds] = useState(() =>
    defaultProfile.socialLinks.map((_, index) => index),
  );
  const theme = themes.find((entry) => entry.id === themeId) ?? themes[0];
  const outputs = useMemo(
    () => generateAllOutputs(profile, theme),
    [profile, theme],
  );
  const current = outputs.find((entry) => entry.id === activeOutput)!;
  const plainText = useMemo(() => buildPlainText(profile), [profile]);
  const validation = useMemo(
    () =>
      current.html
        ? validateVariantHtml(
            activeOutput as Exclude<VariantId, "plain-text">,
            current.html,
          )
        : [],
    [activeOutput, current.html],
  );
  const client = compatibilityMatrix.find(
    (entry) =>
      entry.id === activeOutput.replace("-safe", "").replace("-optimized", ""),
  );
  const missing = [
    ["Full name", profile.fullName],
    ["Title", profile.title],
    ["Company", profile.company],
    ["Email", profile.email],
  ]
    .filter(([, value]) => !value.trim())
    .map(([label]) => label);
  useEffect(() => {
    document.documentElement.dataset.mode = mode;
    try {
      localStorage.setItem("signet-appearance", mode);
    } catch {
      /* Appearance persistence is optional. */
    }
  }, [mode]);
  useEffect(() => {
    revision.current++;
    window.clearTimeout(timer.current);
    setCopyState("");
    setManualCopy(false);
    setBusy(false);
  }, [profile, themeId, activeOutput]);
  useEffect(() => () => window.clearTimeout(timer.current), []);
  useEffect(() => {
    if (manualCopy) {
      manualField.current?.focus();
      manualField.current?.select();
    }
  }, [manualCopy]);
  const announce = (message: string) => {
    window.clearTimeout(timer.current);
    setCopyState(message);
    timer.current = window.setTimeout(() => setCopyState(""), 6000);
  };
  const setField = (
    key: Exclude<keyof Profile, "socialLinks">,
    value: string,
  ) => setProfile((previous) => ({ ...previous, [key]: value }));
  const socialPatch = (index: number, patch: Partial<SocialLink>) =>
    setProfile((previous) => ({
      ...previous,
      socialLinks: previous.socialLinks.map((link, i) =>
        i === index ? { ...link, ...patch } : link,
      ),
    }));
  const field = (
    key: Exclude<keyof Profile, "socialLinks">,
    label: string,
    maxLength: number,
    type = "text",
    placeholder = "",
    autoComplete?: string,
  ) => (
    <label className="field" key={key} htmlFor={key}>
      <span>{label}</span>
      <input
        id={key}
        name={key}
        type={type}
        maxLength={maxLength}
        dir="auto"
        autoComplete={autoComplete ?? "off"}
        placeholder={placeholder}
        value={profile[key] ?? ""}
        onChange={(event) => setField(key, event.target.value)}
      />
    </label>
  );
  const textArea = (
    key: "tagline" | "disclaimer",
    label: string,
    maxLength: number,
  ) => (
    <label className="field" htmlFor={key}>
      <span>
        {label}
        <span className="optional">Optional</span>
      </span>
      <textarea
        id={key}
        maxLength={maxLength}
        rows={3}
        dir="auto"
        value={profile[key] ?? ""}
        onChange={(event) => setField(key, event.target.value)}
      />
    </label>
  );
  const navigate = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
    length: number,
    select: (index: number) => void,
  ) => {
    if (
      ![
        "ArrowLeft",
        "ArrowRight",
        "ArrowUp",
        "ArrowDown",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? length - 1
          : (index +
              (["ArrowLeft", "ArrowUp"].includes(event.key) ? -1 : 1) +
              length) %
            length;
    select(next);
  };
  const handleCopy = async () => {
    const token = revision.current;
    setBusy(true);
    setManualCopy(false);
    let message = "";
    try {
      if (!current.html) {
        await navigator.clipboard.writeText(plainText);
        message = "Plain text copied.";
      } else {
        await navigator.clipboard.write([
          new ClipboardItem({
            "text/html": new Blob([current.html], { type: "text/html" }),
            "text/plain": new Blob([plainText], { type: "text/plain" }),
          }),
        ]);
        message = `${shortNames[activeOutput]} signature copied with formatting.`;
      }
    } catch {
      try {
        await navigator.clipboard.writeText(plainText);
        message =
          "Plain text copied. Formatting isn’t supported by this clipboard; download HTML instead.";
      } catch {
        if (token === revision.current) {
          setManualCopy(true);
          message =
            "Clipboard blocked. Text selected below: press Ctrl+C or ⌘C, or download the signature.";
        }
      }
    }
    if (token === revision.current) {
      setBusy(false);
      announce(message);
    }
  };
  const handleDownload = () => {
    downloadFile(
      `signature-${current.id}.${current.html ? "html" : "txt"}`,
      current.html ?? current.text ?? "",
      current.html ? "text/html;charset=utf-8" : "text/plain;charset=utf-8",
    );
    announce(`${current.html ? "HTML" : "Text"} download started.`);
  };
  const handleBundle = () => {
    downloadFile(
      "signature-bundle.json",
      JSON.stringify(
        {
          exportedAt: new Date().toISOString(),
          theme: theme.id,
          profile,
          variants: outputs.map((entry) => ({
            id: entry.id,
            name: entry.name,
            html: entry.html ?? null,
            text: entry.text ?? null,
            warnings: entry.warnings,
            checks: entry.checks,
          })),
        },
        null,
        2,
      ),
      "application/json;charset=utf-8",
    );
    announce(
      "Bundle download started. Includes your profile and all six formats.",
    );
  };

  return (
    <div className="app-shell" data-mobile-view={mobileView}>
      <header className="app-header">
        <a className="brand" href="#" aria-label="Signet home">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 36 44" fill="none" focusable="false">
              <polygon points="8,23 8,10 19,4 19,17" fill="var(--text-primary, #111111)" />
              <polygon points="19,4 28,10 28,21 19,17" fill="var(--cobalt, #2F6FE4)" fillOpacity="0.75" />
              <polygon points="28,21 28,34 17,40 17,27" fill="var(--text-primary, #111111)" />
              <polygon points="17,40 8,34 8,23 17,27" fill="var(--cobalt, #2F6FE4)" fillOpacity="0.75" />
            </svg>
          </span>
          <h1>
            Signet<span className="brand-dot">™</span>
          </h1>
        </a>
        <span className="byline">by Siftion</span>
        <div className="header-actions">
          <button
            className="icon-button"
            aria-label={
              mode === "day"
                ? "Switch to dark appearance"
                : "Switch to light appearance"
            }
            onClick={() => setMode(mode === "day" ? "night" : "day")}
          >
            <Icon name={mode === "day" ? "moon" : "sun"} />
          </button>
        </div>
      </header>
      <div className="mobile-switch" aria-label="Workspace view">
        <button
          aria-pressed={mobileView === "edit"}
          onClick={() => setMobileView("edit")}
        >
          Edit details
        </button>
        <button
          aria-pressed={mobileView === "preview"}
          onClick={() => setMobileView("preview")}
        >
          Preview & export
        </button>
      </div>
      <main className="workbench">
        <section className="editor" aria-label="Signature editor">
          <div className="editor-heading">
            <div>
              <p className="eyebrow">Editor</p>
              <h2>Your signature</h2>
            </div>
            <span className="step-count">
              {String(sections.indexOf(section) + 1).padStart(2, "0")}
              <span> / 04</span>
            </span>
          </div>
          <div
            className="editor-tabs"
            role="tablist"
            aria-label="Editing sections"
          >
            {sections.map((entry, index) => (
              <button
                key={entry}
                id={`section-${entry}`}
                role="tab"
                aria-selected={entry === section}
                aria-controls={`editor-${entry}`}
                tabIndex={entry === section ? 0 : -1}
                onClick={() => setSection(entry)}
                onKeyDown={(event) =>
                  navigate(event, index, sections.length, (next) => {
                    setSection(sections[next]);
                    document
                      .getElementById(`section-${sections[next]}`)
                      ?.focus();
                  })
                }
              >
                {entry}
              </button>
            ))}
          </div>
          <div
            className="editor-content"
            id={`editor-${section}`}
            role="tabpanel"
            aria-labelledby={`section-${section}`}
          >
            {section === "Profile" && (
              <>
                <p className="section-description">
                  Name, title, company, and a short introduction.
                </p>
                {field(
                  "fullName",
                  "Full name",
                  80,
                  "text",
                  "Your name",
                  "name",
                )}
                <div className="field-pair">
                  {field(
                    "title",
                    "Title",
                    80,
                    "text",
                    "Your role",
                    "organization-title",
                  )}
                  {field("pronouns", "Pronouns", 32, "text", "she/her")}
                </div>
                {field(
                  "company",
                  "Company",
                  80,
                  "text",
                  "Company or practice",
                  "organization",
                )}
                {textArea("tagline", "A short introduction", 160)}
                <details className="assets">
                  <summary>
                    Photo, logo & footer <span>Optional</span>
                  </summary>
                  <p className="helper">
                    Use a hosted HTTPS image. PNG or JPG is safest. Images may
                    be blocked by recipients.
                  </p>
                  {field("avatarUrl", "Avatar URL", 240, "url", "https://…")}
                  {field("logoUrl", "Logo URL", 240, "url", "https://…")}
                  {textArea("disclaimer", "Disclaimer", 220)}
                </details>
              </>
            )}
            {section === "Contact" && (
              <>
                <p className="section-description">
                  Direct ways for people to reach you.
                </p>
                {field(
                  "email",
                  "Email",
                  120,
                  "email",
                  "you@example.com",
                  "email",
                )}
                {field("phone", "Phone", 40, "tel", "310 555 0134", "tel")}
                {field(
                  "website",
                  "Website",
                  160,
                  "url",
                  "https://example.com",
                  "url",
                )}
                {field(
                  "calendlyUrl",
                  "Booking link",
                  160,
                  "url",
                  "https://calendly.com/…",
                )}
                {field(
                  "location",
                  "Location",
                  80,
                  "text",
                  "City, country",
                  "address-level2",
                )}
                {field("addressLine", "Address or note line", 120)}
              </>
            )}
            {section === "Links" && (
              <>
                <p className="section-description">
                  Where else your work lives. Keep the list short.
                </p>
                <p className="helper">
                  The first four complete links appear in exports. All links
                  stay in your bundle.
                </p>
                <div className="social-list">
                  {profile.socialLinks.map((link, index) => (
                    <div className="social-row" key={socialIds[index]}>
                      <div className="social-heading">
                        <span>Link {index + 1}</span>
                        <button
                          className="text-button danger"
                          aria-label={`Remove link ${index + 1}`}
                          onClick={() => {
                            setSocialIds((ids) =>
                              ids.filter((_, i) => i !== index),
                            );
                            setProfile((previous) => ({
                              ...previous,
                              socialLinks: previous.socialLinks.filter(
                                (_, i) => i !== index,
                              ),
                            }));
                          }}
                        >
                          Remove
                        </button>
                      </div>
                      <label className="field">
                        Label
                        <input
                          aria-label={`Link ${index + 1} label`}
                          maxLength={32}
                          value={link.label}
                          dir="auto"
                          onChange={(event) =>
                            socialPatch(index, { label: event.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        URL
                        <input
                          aria-label={`Link ${index + 1} URL`}
                          type="url"
                          maxLength={200}
                          value={link.url}
                          onChange={(event) =>
                            socialPatch(index, { url: event.target.value })
                          }
                        />
                      </label>
                    </div>
                  ))}
                </div>
                <button
                  className="add-link"
                  onClick={() => {
                    setSocialIds((ids) => [...ids, nextSocialId.current++]);
                    setProfile((previous) => ({
                      ...previous,
                      socialLinks: [
                        ...previous.socialLinks,
                        { label: "", url: "" },
                      ],
                    }));
                  }}
                >
                  ＋ Add link
                </button>
              </>
            )}
            {section === "Style" && (
              <>
                <p className="section-description">
                  Theme and disclaimer. Every export stays email-safe.
                </p>
                <div
                  className="theme-list"
                  role="radiogroup"
                  aria-label="Signature theme"
                >
                  {themes.map((entry, index) => (
                    <button
                      className="theme-option"
                      key={entry.id}
                      id={`theme-${entry.id}`}
                      role="radio"
                      aria-checked={entry.id === themeId}
                      tabIndex={entry.id === themeId ? 0 : -1}
                      onClick={() => setThemeId(entry.id)}
                      onKeyDown={(event) =>
                        navigate(event, index, themes.length, (next) => {
                          setThemeId(themes[next].id);
                          document
                            .getElementById(`theme-${themes[next].id}`)
                            ?.focus();
                        })
                      }
                    >
                      <span
                        className="theme-sample"
                        style={{
                          color: entry.ink,
                          background:
                            entry.surface === "transparent"
                              ? "#efeee9"
                              : entry.surface,
                          fontFamily: entry.fontStack,
                        }}
                      >
                        <span style={{ borderColor: entry.accent }}>Aa</span>
                      </span>
                      <span className="theme-name">
                        {entry.name}
                        <small>
                          {entry.id === "linen"
                            ? "Warm serif"
                            : entry.id === "graphite"
                              ? "Crisp & editorial"
                              : entry.id === "cobalt"
                                ? "A touch of blue"
                                : entry.id === "noir"
                                  ? "Quiet monochrome"
                                  : "No background fill"}
                        </small>
                      </span>
                      <span className="radio-dot" />
                    </button>
                  ))}
                </div>
                <p className="helper style-note">
                  Appearance controls this app. These styles control your
                  signature. Fonts stay email-safe in every export.
                </p>
              </>
            )}
          </div>
          <div className="editor-footer">
            <p>Edits stay in this tab. Download a bundle to keep a copy.</p>
            <button
              className="text-button next-section"
              onClick={() => {
                const next =
                  sections[(sections.indexOf(section) + 1) % sections.length];
                setSection(next);
              }}
            >
              {" "}
              {section === "Style"
                ? "Back to profile"
                : `Next: ${sections[sections.indexOf(section) + 1]}`}
              <Icon name="arrow" />
            </button>
            <button
              className="mobile-preview-button"
              onClick={() => setMobileView("preview")}
            >
              See your signature
              <Icon name="arrow" />
            </button>
          </div>
        </section>
        <section className="workspace" aria-label="Preview and export">
          <div className="workspace-heading">
            <div>
              <p className="eyebrow">Preview &amp; export</p>
              <h2>Your signature in place.</h2>
            </div>
            <span className="live-label">Live preview</span>
          </div>
          <div className="format-bar">
            <span className="format-label">Export for</span>
            <div
              className="variant-tabs"
              role="tablist"
              aria-label="Signature output variants"
            >
              {outputs.map((entry, index) => (
                <button
                  key={entry.id}
                  id={`variant-${entry.id}`}
                  role="tab"
                  aria-selected={entry.id === activeOutput}
                  aria-controls="output-panel"
                  tabIndex={entry.id === activeOutput ? 0 : -1}
                  onClick={() => setActiveOutput(entry.id)}
                  onKeyDown={(event) =>
                    navigate(event, index, outputs.length, (next) => {
                      setActiveOutput(outputs[next].id);
                      document
                        .getElementById(`variant-${outputs[next].id}`)
                        ?.focus();
                    })
                  }
                >
                  {shortNames[entry.id]}
                </button>
              ))}
            </div>
          </div>
          <div
            id="output-panel"
            role="tabpanel"
            aria-labelledby={`variant-${activeOutput}`}
          >
            <div className="compose">
              <div className="compose-title">
                <span>
                  <Icon name="mark" />
                  New message
                </span>
                <span className="compose-format">
                  {current.html ? "HTML signature" : "Plain text"}
                </span>
              </div>
              <div className="compose-recipient">
                <span>To</span>
                <span>dana@example.com</span>
              </div>
              <div className="compose-subject">
                <span>Subject</span>
                <span>Notes from our call</span>
              </div>
              <div className="compose-body">
                <div className="sample-message" aria-hidden="true">
                  <p>Hi Dana,</p>
                  <p>Sending the notes from our call.</p>
                  <p>Best,</p>
                </div>
                {current.html ? (
                  <SignaturePreview html={current.html} />
                ) : (
                  <pre className="plain-preview">{current.text}</pre>
                )}
              </div>
              <div className="compose-footer">
                <span>{theme.name}</span>
                <span>Actual size · Browser preview</span>
              </div>
            </div>
            <div className="export-bar">
              <button
                className="primary"
                onClick={handleCopy}
                disabled={busy || !Boolean(current.html ?? current.text)}
              >
                <Icon name="copy" />
                {busy
                  ? "Copying…"
                  : current.html
                    ? "Copy signature"
                    : "Copy plain text"}
              </button>
              <button onClick={handleDownload}>
                <Icon name="download" />
                Download {current.html ? "HTML" : "text"}
              </button>
              <button
                className="text-button bundle-button"
                onClick={handleBundle}
              >
                Download bundle<span aria-hidden="true">↗</span>
              </button>
            </div>
            <div className="copy-feedback" role="status" aria-live="polite">
              {copyState}
            </div>
            {manualCopy && (
              <label className="manual-copy">
                Manual copy · plain text
                <textarea
                  ref={manualField}
                  readOnly
                  value={plainText}
                  onFocus={(event) => event.currentTarget.select()}
                  rows={5}
                />
                <span className="helper">
                  Use Download HTML above to preserve formatting.
                </span>
              </label>
            )}
            <p className="preview-note">
              A browser preview, not a mail-client simulation. Send a test email
              before you make it official.
            </p>
            <div className="support-details">
              <details>
                <summary>
                  Install in{" "}
                  {shortNames[activeOutput] === "Universal"
                    ? "your email app"
                    : shortNames[activeOutput]}
                  <span>How to</span>
                </summary>
                <ol>
                  {current.installSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ol>
                {activeOutput === "spark-optimized" && (
                  <p className="helper">
                    For a source-code field, use the HTML source below or
                    download HTML. Copy signature copies formatted content, not
                    code.
                  </p>
                )}
              </details>
              <details>
                <summary>
                  Compatibility & checks
                  <span className={validation.length ? "warning-text" : ""}>
                    {validation.length
                      ? `${validation.length} issues`
                      : "Review notes"}
                  </span>
                </summary>
                <p>{current.description}</p>
                {missing.length > 0 && (
                  <p className="warning-text">
                    Missing essentials: {missing.join(", ")}.
                  </p>
                )}
                <h3>Before you send</h3>
                <ul>
                  {current.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
                <h3>Output checks</h3>
                <ul>
                  {[...current.checks, ...validation].map((check) => (
                    <li key={check}>{check}</li>
                  ))}
                </ul>
                {client && (
                  <>
                    <h3>Client notes</h3>
                    <ul>
                      {client.notes.map((note) => (
                        <li key={note}>{note}</li>
                      ))}
                    </ul>
                  </>
                )}
              </details>
              <details
                open={sourceOpen}
                onToggle={(event) => setSourceOpen(event.currentTarget.open)}
              >
                <summary>
                  {current.html ? "HTML source" : "Text source"}
                  <span>View output</span>
                </summary>
                <textarea
                  className="source-code"
                  aria-label="Export source"
                  readOnly
                  value={current.html ?? current.text}
                  rows={9}
                  spellCheck={false}
                  onFocus={(event) => event.currentTarget.select()}
                />
              </details>
              <details className="research">
                <summary>
                  Email client reference<span>7 clients</span>
                </summary>
                <p className="helper">
                  A planning guide, not a promise. Recipient settings and mail
                  updates can change rendering.
                </p>
                {compatibilityMatrix.map((entry) => (
                  <details key={entry.id}>
                    <summary>{entry.client}</summary>
                    <p>{entry.editor}</p>
                    <dl>
                      {(
                        [
                          ["HTML & CSS", entry.htmlCss],
                          ["Images", entry.images],
                          ["Dark mode", entry.darkMode],
                          ["Media queries", entry.mediaQueries],
                          ["Fonts", entry.webFonts],
                          ["SVG", entry.svg],
                          ["Animation", entry.animatedGif],
                          ["Privacy", entry.tracking],
                          ["Mobile", entry.mobile],
                        ] as const
                      ).map(([label, cell]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{cell.summary}</dd>
                        </div>
                      ))}
                    </dl>
                    <h3>Install</h3>
                    <ol>
                      {entry.installSteps.map((step) => (
                        <li key={step}>{step}</li>
                      ))}
                    </ol>
                    <h3>Sources</h3>
                    <ul>
                      {entry.sources.map((source) => (
                        <li key={source.url}>
                          <a href={source.url} target="_blank" rel="noreferrer">
                            {source.label} ↗
                          </a>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </details>
            </div>
          </div>
          <footer className="workspace-footer">
            <span>Exports are email-safe HTML and plain text.</span>
            <span>No fonts or scripts are embedded.</span>
          </footer>
        </section>
      </main>
    </div>
  );
}
