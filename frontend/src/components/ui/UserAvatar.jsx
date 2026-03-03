import styles from "./UserAvatar.module.css";

const AVATAR_COLORS = [
  "#5b6abf",
  "#2d6a4f",
  "#8e44ad",
  "#c0392b",
  "#d68910",
  "#16a085",
  "#2980b9",
  "#7f8c8d",
  "#e74c3c",
  "#27ae60",
  "#f39c12",
  "#1abc9c",
];

export function getAvatarColor(username) {
  if (!username) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function UserAvatar({
  username,
  size = "md",
  showStatus = true,
  isTyping = false,
}) {
  const initials = username ? username.slice(0, 2).toUpperCase() : "??";

  const color = getAvatarColor(username);

  const sizeClass =
    {
      sm: styles.sm,
      md: styles.md,
      lg: styles.lg,
    }[size] || styles.md;

  return (
    <div
      className={`${styles.avatarWrapper} ${sizeClass} ${isTyping ? styles.typing : ""}`}
      title={username}
    >
      <div className={styles.avatar} style={{ background: color }}>
        {initials}
      </div>
      {showStatus && <span className={styles.statusDot} />}
    </div>
  );
}

export default UserAvatar;
