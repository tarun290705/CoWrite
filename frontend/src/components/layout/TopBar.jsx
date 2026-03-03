import styles from "./TopBar.module.css";

function TopBar({ noteTitle, onSaveSnapshot, onToggleHistory, currentUser }) {
  const initials = currentUser ? currentUser.slice(0, 2).toUpperCase() : "??";

  const handleBackToDashboard = () => {
    window.location.href = "/dashboard";
  };

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          className={styles.backBtn}
          onClick={handleBackToDashboard}
          title="Back to dashboard"
        >
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
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
        </button>

        <div className={styles.logo}>
          <span className={styles.logoMark}>C</span>
          <span className={styles.logoText}>CoWrite</span>
        </div>

        <div className={styles.divider} />

        <span className={styles.noteTitle}>{noteTitle || "Untitled Note"}</span>

        <span className={styles.savedBadge}>
          <span className={styles.savedDot} />
          Saved
        </span>
      </div>

      <div className={styles.right}>
        <button
          className={styles.btnGhost}
          onClick={onToggleHistory}
          title="Version History"
        >
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
          History
        </button>

        <button
          className={styles.btnPrimary}
          onClick={onSaveSnapshot}
          title="Save a version snapshot"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17,21 17,13 7,13 7,21" />
            <polyline points="7,3 7,8 15,8" />
          </svg>
          Snapshot
        </button>

        <div className={styles.userChip} title={currentUser}>
          <div className={styles.userAvatar}>{initials}</div>
          <span className={styles.userName}>{currentUser || "You"}</span>
        </div>
      </div>
    </header>
  );
}

export default TopBar;
