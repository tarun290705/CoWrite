import { useState, useEffect } from "react";
import API from "../../services/api";
import styles from "./Sidebar.module.css";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NoteIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function Sidebar({ activeNoteId }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setLoading(true);
    setError(false);

    API.get("notes/")
      .then((res) => {
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.results)
            ? data.results
            : [];
        setNotes(list);
      })
      .catch((err) => {
        console.error("[CoWrite] Failed to fetch notes:", err);
        setError(true);
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = notes.filter((note) => {
    const title = note.title || note.name || "";
    return title.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const handleSelect = (id) => {
    window.location.href = `/notes/${id}`;
  };

  const handleNewNote = () => {
    window.location.href = "/dashboard";
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <div className={styles.searchWrapper}>
          <svg
            className={styles.searchIcon}
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              className={styles.clearSearch}
              onClick={() => setSearchQuery("")}
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <nav className={styles.noteList}>
        <div className={styles.sectionLabel}>My Notes</div>

        {loading && (
          <div className={styles.stateMessage}>
            <div className={styles.loadingDots}>
              <span />
              <span />
              <span />
            </div>
            Loading notes…
          </div>
        )}

        {!loading && error && (
          <div className={styles.stateMessage}>
            <span className={styles.errorText}>Could not load notes.</span>
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className={styles.stateMessage}>
            {searchQuery ? "No notes match your search." : "No notes yet."}
          </div>
        )}

        {!loading &&
          !error &&
          filtered.map((note) => {
            const id = note.id;
            const title = note.title || note.name || `Note #${id}`;
            const date = note.updated_at || note.created_at || "";
            const isActive = String(id) === String(activeNoteId);

            return (
              <button
                key={id}
                className={`${styles.noteItem} ${isActive ? styles.active : ""}`}
                onClick={() => handleSelect(id)}
              >
                {isActive && <div className={styles.activeBar} />}
                <div className={styles.noteIcon}>
                  <NoteIcon />
                </div>
                <div className={styles.noteMeta}>
                  <span className={styles.noteTitle}>{title}</span>
                  {date && (
                    <span className={styles.noteDate}>
                      {formatRelativeTime(date)}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
      </nav>

      <div className={styles.sidebarFooter}>
        <button className={styles.newNoteBtn} onClick={handleNewNote}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Note
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
