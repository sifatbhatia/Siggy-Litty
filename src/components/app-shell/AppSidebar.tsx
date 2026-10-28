export type NavSection =
  | "profile"
  | "contact"
  | "links"
  | "style"
  | "content"
  | "design"
  | "theme"
  | "preview"
  | "compatibility"
  | "export";

export interface NavItem {
  id: NavSection;
  label: string;
  tabName?: string;
  icon: string;
}

const creationItems: NavItem[] = [
  { id: "profile", label: "Profile", tabName: "Profile", icon: "user" },
  { id: "contact", label: "Contact", tabName: "Contact", icon: "mail" },
  { id: "links", label: "Links", tabName: "Links", icon: "link" },
  { id: "style", label: "Theme", tabName: "Style", icon: "palette" },
  { id: "content", label: "Content", icon: "layers" },
  { id: "design", label: "Design", icon: "sliders" },
];

const outputItems: NavItem[] = [
  { id: "preview", label: "Preview", icon: "eye" },
  { id: "compatibility", label: "Compatibility", icon: "shield" },
  { id: "export", label: "Export", icon: "code" },
];

export function AppSidebar({
  activeNav,
  onSelectNav,
  onReset,
}: {
  activeNav: NavSection;
  onSelectNav: (nav: NavSection) => void;
  onReset: () => void;
}) {
  const renderIcon = (name: string) => {
    switch (name) {
      case "user":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        );
      case "mail":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
          </svg>
        );
      case "link":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
        );
      case "palette":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.563-2.512 5.563-5.563C22 6.5 17.5 2 12 2Z" />
          </svg>
        );
      case "layers":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z" />
            <path d="m2 12 8.58 3.91a2 2 0 0 0 1.66 0L22 12" />
            <path d="m2 17 8.58 3.91a2 2 0 0 0 1.66 0L22 17" />
          </svg>
        );
      case "sliders":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <line x1="4" x2="4" y1="21" y2="14" />
            <line x1="4" x2="4" y1="10" y2="3" />
            <line x1="12" x2="12" y1="21" y2="12" />
            <line x1="12" x2="12" y1="8" y2="3" />
            <line x1="20" x2="20" y1="21" y2="16" />
            <line x1="20" x2="20" y1="12" y2="3" />
            <line x1="1" x2="7" y1="14" y2="14" />
            <line x1="9" x2="15" y1="8" y2="8" />
            <line x1="17" x2="23" y1="16" y2="16" />
          </svg>
        );
      case "eye":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        );
      case "shield":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        );
      case "code":
        return (
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="signet-sidebar" aria-label="Creation and output navigation">
      <div className="signet-sidebar__group">
        <span className="signet-sidebar__heading">Creation</span>
        <nav className="signet-sidebar__nav" role="tablist" aria-label="Editor sections">
          {creationItems.map((item) => {
            const isSelected = activeNav === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`signet-sidebar__item ${
                  isSelected ? "signet-sidebar__item--active" : ""
                }`}
                onClick={() => onSelectNav(item.id)}
              >
                <span className="signet-sidebar__icon" aria-hidden="true">
                  {renderIcon(item.icon)}
                </span>
                <span className="signet-sidebar__label">
                  {item.tabName || item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="signet-sidebar__group">
        <span className="signet-sidebar__heading">Output</span>
        <nav className="signet-sidebar__nav">
          {outputItems.map((item) => {
            const isSelected = activeNav === item.id;
            return (
              <button
                key={item.id}
                role="tab"
                id={`tab-${item.id}`}
                aria-selected={isSelected}
                tabIndex={isSelected ? 0 : -1}
                className={`signet-sidebar__item ${
                  isSelected ? "signet-sidebar__item--active" : ""
                }`}
                onClick={() => onSelectNav(item.id)}
              >
                <span className="signet-sidebar__icon" aria-hidden="true">
                  {renderIcon(item.icon)}
                </span>
                <span className="signet-sidebar__label">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="signet-sidebar__group signet-sidebar__group--bottom">
        <span className="signet-sidebar__heading">Utility</span>
        <button
          className="signet-sidebar__item signet-sidebar__item--utility"
          onClick={onReset}
          title="Reset to sample profile"
        >
          <span className="signet-sidebar__icon" aria-hidden="true">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </span>
          <span className="signet-sidebar__label">Reset profile</span>
        </button>
      </div>
    </aside>
  );
}
