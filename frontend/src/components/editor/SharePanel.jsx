import { useState } from "react";
import styles from "./SharePanel.module.css";

function SharePanel({ noteId, onShare }) {
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("viewer");
  const [status, setStatus] = useState(null);

  const handleShare = async () => {
    if (!username.trim()) return;
    try {
      await onShare(username.trim(), role);
      setStatus("success");
      setUsername("");
      setTimeout(() => setStatus(null), 2500);
    } catch {
      setStatus("error");
      setTimeout(() => setStatus(null), 2500);
    }
  };

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          <polyline points="16,6 12,2 8,6" />
          <line x1="12" y1="2" x2="12" y2="15" />
        </svg>
        <span>Share note</span>
      </div>

      <div className={styles.form}>
        <input
          className={styles.input}
          placeholder="Enter username..."
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleShare()}
        />
        <select
          className={styles.select}
          value={role}
          onChange={(e) => setRole(e.target.value)}
        >
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
        </select>
        <button className={styles.shareBtn} onClick={handleShare}>
          Invite
        </button>
      </div>

      {status === "success" && (
        <p className={`${styles.message} ${styles.success}`}>
          ✓ Invite sent successfully
        </p>
      )}
      {status === "error" && (
        <p className={`${styles.message} ${styles.error}`}>
          ✗ Failed to send invite
        </p>
      )}
    </div>
  );
}

export default SharePanel;
