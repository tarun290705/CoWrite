import { useState } from "react";
import API from "../services/api";

function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const res = await API.post("login/", {
        username,
        password,
      });

      localStorage.setItem("access", res.data.access);

      const notesRes = await API.get("notes/");

      let notes = notesRes.data;

      if (notes.length === 0) {
        const sharedRes = await API.get("shared-notes/");
        notes = sharedRes.data;
      }

      if (notes.length > 0) {
        const noteId = notes[0].id;
        window.location.href = "/dashboard";
      } else {
        alert("No notes available for this user");
      }
    } catch (err) {
      console.error(err);
      alert("Login failed");
    }
  };

  return (
    <div style={{ padding: "50px" }}>
      <h2>Login</h2>
      <input
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <br />
      <br />
      <input
        type="password"
        placeholder="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <br />
      <br />
      <button onClick={handleLogin}>Login</button>
    </div>
  );
}

export default Login;
