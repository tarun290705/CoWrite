import { useEffect, useRef, useState, useCallback, useReducer } from "react";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

import API from "../services/api";
import TopBar from "../components/layout/TopBar";
import Sidebar from "../components/layout/Sidebar";
import ActiveUsersBar from "../components/editor/ActiveUsersBar";
import TypingIndicator from "../components/editor/TypingIndicator";
import VersionHistoryDrawer from "../components/editor/VersionHistoryDrawer";
import SharePanel from "../components/editor/SharePanel";

import styles from "./Editor.module.css";

const QUILL_MODULES = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ["bold", "italic", "underline", "strike"],
    ["blockquote", "code-block"],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ indent: "-1" }, { indent: "+1" }],
    ["link"],
    ["clean"],
  ],
};

const QUILL_FORMATS = [
  "header",
  "bold",
  "italic",
  "underline",
  "strike",
  "blockquote",
  "code-block",
  "list",
  "indent",
  "link",
];

const TYPING_CLEAR_DELAY = 1500;

function decodeJWT(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch {
    return null;
  }
}

function getCurrentUser() {
  const token = localStorage.getItem("access");
  if (token) {
    const payload = decodeJWT(token);
    if (payload) return payload.username || payload.user_id?.toString() || null;
  }
  return localStorage.getItem("username") || null;
}

function Editor({ noteId }) {
  const [content, setContent] = useState("");
  const [activeUsers, setActiveUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [versions, setVersions] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [noteTitle, setNoteTitle] = useState("");

  const currentUser = getCurrentUser();
  const currentUserRef = useRef(currentUser);
  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  const socketRef = useRef(null);
  const debounceRef = useRef(null);
  const typingTimers = useRef({});
  const wsInitReceivedRef = useRef(false);
  const isLocalEditRef = useRef(false);
  const quillRef = useRef(false);

  useEffect(() => {
    API.get(`notes/${noteId}/`)
      .then((res) => {
        setNoteTitle(res.data.title || res.data.name || `Note #${noteId}`);
        if (!wsInitReceivedRef.current) {
          setContent(res.data.content || "");
        }
      })
      .catch(() => {
        setNoteTitle(`Note #${noteId}`);
      });
  }, [noteId]);

  const clearTyping = useCallback((username) => {
    setTypingUsers((prev) => prev.filter((u) => u !== username));
    if (typingTimers.current[username]) {
      clearTimeout(typingTimers.current[username]);
      delete typingTimers.current[username];
    }
  }, []);

  const markTyping = useCallback(
    (username) => {
      if (!username || username === currentUserRef.current) return;
      setTypingUsers((prev) =>
        prev.includes(username) ? prev : [...prev, username],
      );
      if (typingTimers.current[username])
        clearTimeout(typingTimers.current[username]);
      typingTimers.current[username] = setTimeout(() => {
        clearTyping(username);
      }, TYPING_CLEAR_DELAY);
    },
    [clearTyping],
  );

  useEffect(() => {
    const token = localStorage.getItem("access");
    if (!token) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/notes/${noteId}/?token=${token}`,
    );
    socketRef.current = socket;

    socket.onopen = () => console.log("[CoWrite] WS connected");

    socket.onmessage = (event) => {
      let data;
      try {
        data = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (data.type) {
        case "note_init":
          wsInitReceivedRef.current = true;
          setContent(data.content || "");
          break;
        case "note_update":
          if (data.username === currentUserRef.current) return;
          if(isLocalEditRef.current) return;
          setContent(data.content || "");
          markTyping(data.username);
          break;
        case "active_users":
          setActiveUsers(Array.isArray(data.users) ? data.users : []);
          break;
        case "user_joined":
          if (data.username) {
            setActiveUsers((prev) =>
              prev.includes(data.username) ? prev : [...prev, data.username],
            );
          }
          break;
        case "user_left":
          if (data.username) {
            setActiveUsers((prev) => prev.filter((u) => u !== data.username));
            clearTyping(data.username);
          }
          break;
        default:
          break;
      }
    };

    socket.onerror = (err) => {
      if (socket.readyState < 2) {
        console.error("[CoWrite] WS error:", err);
      }
    };

    socket.onclose = () => console.log("[CoWrite] WS disconnected");

    return () => {
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close();
      }
      socketRef.current = null;
      wsInitReceivedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      Object.values(typingTimers.current).forEach(clearTimeout);
      typingTimers.current = {};
    };
  }, [noteId, markTyping, clearTyping]);

  const fetchVersions = useCallback(async () => {
    try {
      const res = await API.get(`notes/${noteId}/versions/`);
      setVersions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("[CoWrite] Versions fetch failed:", err);
    }
  }, [noteId]);

  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);

  const handleChange = useCallback((value) => {
    isLocalEditRef.current = true;
    setContent(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            content: value,
            username: currentUserRef.current,
          }),
        );
      }

      setTimeout (() => {
        isLocalEditRef.current = false;
      }, 50);
    }, 300);
  }, []);

  const handleSaveSnapshot = async () => {
    try {
      await API.post(`notes/${noteId}/save-version/`);
      fetchVersions();
    } catch (err) {
      console.error("[CoWrite] Save snapshot failed:", err);
    }
  };

  const handleLoadVersion = async (versionId) => {
    try {
      const res = await API.get(`versions/${versionId}/`);
      const restored = res.data.content;
      setContent(restored);
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(
          JSON.stringify({
            content: restored,
            username: currentUserRef.current,
          }),
        );
      }
      setHistoryOpen(false);
    } catch (err) {
      console.error("[CoWrite] Load version failed:", err);
    }
  };

  const handleShare = async (username, role) => {
    await API.post(`notes/${noteId}/share/`, { username, role });
  };

  const otherTypingUsers = typingUsers.filter(
    (u) => u !== currentUserRef.current,
  );

  const wordCount = content
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <div className={styles.appShell}>
      <TopBar
        noteTitle={noteTitle}
        currentUser={currentUser}
        onSaveSnapshot={handleSaveSnapshot}
        onToggleHistory={() => setHistoryOpen((o) => !o)}
      />

      <Sidebar activeNoteId={noteId} />

      <main className={styles.mainArea}>
        <ActiveUsersBar
          activeUsers={activeUsers}
          typingUsers={otherTypingUsers}
          currentUser={currentUser}
        />

        <div className={styles.editorWrapper}>
          <ReactQuill
            ref={quillRef}
            theme="snow"
            value={content}
            onChange={handleChange}
            modules={QUILL_MODULES}
            formats={QUILL_FORMATS}
            className={styles.quill}
          />

          <div className={styles.statusBar}>
            <div className={styles.typingArea}>
              <TypingIndicator typingUsers={otherTypingUsers} />
            </div>
            <span className={styles.wordCount}>
              {wordCount} {wordCount === 1 ? "word" : "words"}
            </span>
          </div>
        </div>

        <SharePanel noteId={noteId} onShare={handleShare} />
      </main>

      <VersionHistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        versions={versions}
        onLoadVersion={handleLoadVersion}
      />
    </div>
  );
}

export default Editor;
