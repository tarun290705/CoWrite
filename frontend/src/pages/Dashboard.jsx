import { useEffect, useState } from "react";
import API from "../services/api";
import styles from "./Dashboard.module.css";

function formatRelativeTime(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(diffMs / 3600000);
  const days = Math.floor(diffMs / 86400000);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;

  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function NoteCard({ note, onClick }) {
  const title = note.title || `Note #${note.id}`;
  const date = note.updated_at || note.created_at || "";
  const preview =
    (note.content || "")
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 90) || "Empty note";

  return (
    <button className={styles.noteCard} onClick={onClick}>
      <div className={styles.cardIcon}>
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
        </svg>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardTitle}>{title}</div>
        <div className={styles.cardPreview}>{preview}</div>
      </div>
      <div className={styles.cardFooter}>
        <span className={styles.cardDate}>{formatRelativeTime(date)}</span>
        <svg
          className={styles.cardArrow}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        >
          <path d="M9 18l6-6-6-6" />
        </svg>
      </div>
    </button>
  );
}

function Dashboard() {
  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const username = localStorage.getItem("username") || "there";

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const myRes = await API.get("notes/");
      const sharedRes = await API.get("shared-notes/");
      setMyNotes(myRes.data);
      setSharedNotes(sharedRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createNote = async () => {
    if (!title.trim()) return;
    setCreating(true);
    try {
      const res = await API.post("notes/", { title, content: "" });
      window.location.href = `/notes/${res.data.id}`;
    } catch (err) {
      console.error(err);
      alert("Could not create note.");
    } finally {
      setCreating(false);
    }
  };

  const openNote = (id) => {
    window.location.href = `/notes/${id}`;
  };

  const handleLogout = () => {
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    localStorage.removeItem("username");
    window.location.href = "/";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") createNote();
  };

  const totalNotes = myNotes.length + sharedNotes.length;

  return (
    <div className={styles.page}>
      <header className={styles.topbar}>
        <div className={styles.topbarLeft}>
          <div className={styles.logoMark}>C</div>
          <span className={styles.logoText}>CoWrite</span>
        </div>

        <div className={styles.topbarRight}>
          <div className={styles.userBadge}>
            <div className={styles.userAvatar}>
              {username.slice(0, 2).toUpperCase()}
            </div>
            <span className={styles.userName}>{username}</span>
          </div>

          <button className={styles.logoutBtn} onClick={handleLogout}>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign out
          </button>
        </div>
      </header>

      <main className={styles.main}>
        {/* Hero row */}
        <div className={styles.hero}>
          <div className={styles.heroText}>
            <h1>
              Good {getTimeOfDay()}, {username} 👋
            </h1>
            <p>
              {totalNotes === 0
                ? "Create your first note to get started."
                : `You have ${myNotes.length} note${myNotes.length !== 1 ? "s" : ""}${sharedNotes.length > 0 ? ` and ${sharedNotes.length} shared with you` : ""}.`}
            </p>
          </div>

          <div className={styles.createRow}>
            <input
              className={styles.createInput}
              placeholder="Note title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              className={styles.createBtn}
              onClick={createNote}
              disabled={creating || !title.trim()}
            >
              {creating ? (
                <span className={styles.spinner} />
              ) : (
                <>
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
                </>
              )}
            </button>
          </div>
        </div>

        {loading && (
          <div className={styles.skeletonGrid}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={styles.skeletonCard} />
            ))}
          </div>
        )}

        {!loading && (
          <>
            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>My Notes</h2>
                {myNotes.length > 0 && (
                  <span className={styles.badge}>{myNotes.length}</span>
                )}
              </div>

              {myNotes.length === 0 ? (
                <div className={styles.emptySection}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                  <span>No notes yet — create one above.</span>
                </div>
              ) : (
                <div className={styles.grid}>
                  {myNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => openNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Shared With Me</h2>
                {sharedNotes.length > 0 && (
                  <span className={styles.badge}>{sharedNotes.length}</span>
                )}
              </div>

              {sharedNotes.length === 0 ? (
                <div className={styles.emptySection}>
                  <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  >
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                  <span>No notes have been shared with you yet.</span>
                </div>
              ) : (
                <div className={styles.grid}>
                  {sharedNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={() => openNote(note.id)}
                    />
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function getTimeOfDay() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}

export default Dashboard;
