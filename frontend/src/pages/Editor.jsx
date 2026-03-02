import { useEffect, useRef, useState } from "react";
import API from "../services/api";
import ReactQuill from "react-quill-new";
import "react-quill-new/dist/quill.snow.css";

function Editor({ noteId }) {
  const [content, setContent] = useState("");
  const socketRef = useRef(null);
  const debounceRef = useRef(null);
  const [shareUser, setShareUser] = useState("");
  const [role, setRole] = useState("viewer");
  const [activeUsers, setActiveUsers] = useState([]);
  const [versions, setVersions] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("access");

    if (!token) {
        console.log("No token found");
        return;
    }

    const socket = new WebSocket(
      `ws://127.0.0.1:8000/ws/notes/${noteId}/?token=${token}`,
    );

    socketRef.current = socket;

    socket.onopen = () => {
      console.log("WebSocket conneted");
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      //
      console.log("WS message:", data);

      if (!data.type && data.content !== undefined) {
        setContent(data.content);
        return;
      }

      if (data.type === "active_users") {
        setActiveUsers(data.users);
        return;
      }

      if (data.type === "user_joined") {
        setActiveUsers(prev => {
          if (prev.includes(data.username)) return prev;
          return [...prev, data.username];
        });
      }

      if (data.type === "user_left") {
        setActiveUsers((prev) => prev.filter(user => user !== data.username));
      }
    };

    socket.onerror = (err) => {
        console.error("WebSocket error:", err);
    };

    socket.onclose = () => {
      console.log("WebSocket disconnected");
    };

    return () => {
      socket.close();
      socketRef.current = null;
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [noteId]);

  const handleChange = (value) => {
    setContent(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      if (socketRef.current?.readyState == WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ content: value }));
      }
    }, 300);
  };

  const handleShare = async () => {
    if (!shareUser) return;

    try {
      await API.post(`notes/${noteId}/share/`, {
        username: shareUser,
        role: role,
      });

      alert("Note share successfully");
      setShareUser("");
    } catch (err) {
      console.error(err);
      alert("Failed to share");
    }
  };

  const fetchVersions = async () => {
    try {
      const res = await API.get(`notes/${noteId}/versions/`);
      setVersions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, [noteId]);

  const loadVersion = async (versionId) => {
    try {
      const res = await API.get(`versions/${versionId}`);
      setContent(res.data.content);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>CoWrite Editor</h2>
      <h3>Active Users</h3>
      <ul>
        {activeUsers.map((user) => (
          <li key={user}>{user}</li>
        ))}
      </ul>
      <ReactQuill
        theme="snow"
        value={content}
        onChange={handleChange}
        style={{ height: "400px", marginBottom: "50px" }}
      />
      <hr />

      <h3>Share Note</h3>

      <input
        placeholder="Username"
        value={shareUser}
        onChange={(e) => setShareUser(e.target.value)}
      />

      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="viewer">Viewer</option>
        <option value="editor">Editor</option>
      </select>

      <button onClick={handleShare}>Share</button>
      <hr />
      <h3>Version History</h3>

      <div style={{ maxHeight: "200px", overflowY: "auto" }}>
        {versions.map((v) => (
          <div key={v.id}>
            <button onClick={() => loadVersion(v.id)}>
              {new Date(v.created_at).toLocaleString()}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Editor;
