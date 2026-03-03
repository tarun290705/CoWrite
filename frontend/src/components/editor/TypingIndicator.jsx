import styles from "./TypingIndicator.module.css";
import UserAvatar, { getAvatarColor } from "../ui/UserAvatar";

function TypingIndicator({ typingUsers = [] }) {
  if (!typingUsers.length) return null;

  const label =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing`
      : typingUsers.length === 2
        ? `${typingUsers[0]} and ${typingUsers[1]} are typing`
        : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing`;

  return (
    <div className={styles.indicator}>
      <UserAvatar
        username={typingUsers[0]}
        size="sm"
        showStatus={false}
        isTyping
      />
      <span className={styles.label}>{label}</span>
      <span className={styles.dots}>
        <span />
        <span />
        <span />
      </span>
    </div>
  );
}

export default TypingIndicator;
