import UserAvatar, { getAvatarColor } from "../ui/UserAvatar";
import styles from "./ActiveUsersBar.module.css";

function ActiveUsersBar({ activeUsers = [], typingUsers = [], currentUser }) {
  const others = activeUsers.filter((u) => u !== currentUser);
  const selfOnline = activeUsers.includes(currentUser);

  if (!activeUsers.length) return null;

  return (
    <div className={styles.bar}>
      <div className={styles.presenceInfo}>
        <span className={styles.liveDot} />
        <span className={styles.presenceLabel}>
          {activeUsers.length === 1
            ? "Only you"
            : `${activeUsers.length} people here`}
        </span>
      </div>

      <div className={styles.avatarStack}>
        {others.slice(0, 5).map((user) => {
          const isTyping = typingUsers.includes(user);
          return (
            <div
              key={user}
              className={`${styles.avatarSlot} ${isTyping ? styles.isTyping : ""}`}
            >
              <UserAvatar
                username={user}
                size="sm"
                showStatus
                isTyping={isTyping}
              />
              <span
                className={styles.cursorLabel}
                style={{ backgroundColor: getAvatarColor(user) }}
              >
                {user}
                {isTyping && <span className={styles.editingDot}> ✎</span>}
              </span>
            </div>
          );
        })}

        {others.length > 5 && (
          <div className={styles.overflowBadge}>+{others.length - 5}</div>
        )}

        {selfOnline && (
          <div className={`${styles.avatarSlot} ${styles.selfSlot}`}>
            <UserAvatar username={currentUser} size="sm" showStatus />
            <span
              className={styles.cursorLabel}
              style={{ backgroundColor: getAvatarColor(currentUser) }}
            >
              You
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default ActiveUsersBar;
