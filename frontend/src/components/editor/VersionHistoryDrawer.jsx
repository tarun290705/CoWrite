import styles from "./VersionHistoryDrawer.module.css";

function formatTimestamp(isoString) {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
}

function getVersionLabel(index, total) {
  if (index === 0) return "Latest snapshot";
  if (index === total - 1) return "Initial version";
  return `Version ${total - index}`;
}

function VersionHistoryDrawer({
  isOpen,
  onClose,
  versions = [],
  onLoadVersion,
}) {
  return (
    <>
      <div
        className={`${styles.backdrop} ${isOpen ? styles.backdropVisible : ""}`}
        onClick={onClose}
      />

      <aside className={`${styles.drawer} ${isOpen ? styles.drawerOpen : ""}`}>
        <div className={styles.drawerHeader}>
          <div className={styles.drawerTitle}>
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 3v5h5" />
              <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
              <path d="M12 7v5l4 2" />
            </svg>
            Version History
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.drawerBody}>
          {versions.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 3v5h5" />
                  <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
                </svg>
              </div>
              <p>No snapshots yet.</p>
              <span>Save a snapshot to start tracking versions.</span>
            </div>
          ) : (
            <div className={styles.versionList}>
              {versions.map((v, index) => (
                <div key={v.id} className={styles.versionItem}>
                  <div className={styles.versionTimeline}>
                    <div className={styles.versionDot} />
                    {index < versions.length - 1 && (
                      <div className={styles.versionLine} />
                    )}
                  </div>
                  <div className={styles.versionContent}>
                    <div className={styles.versionLabel}>
                      {getVersionLabel(index, versions.length)}
                    </div>
                    <div className={styles.versionTime}>
                      {formatTimestamp(v.created_at)}
                    </div>
                    <button
                      className={styles.restoreBtn}
                      onClick={() => onLoadVersion(v.id)}
                    >
                      Restore this version
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

export default VersionHistoryDrawer;
