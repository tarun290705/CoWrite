import { useEffect, useState } from "react";
import API from "../services/api";

function Dashboard() {
  const [myNotes, setMyNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const myRes = await API.get("notes/");
      const sharedRes = await API.get("shared-notes/");

      setMyNotes(myRes.data);
      setSharedNotes(sharedRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const createNote = async () => {
    if (!title) return;

    try {
      const res = await API.post("notes/", {
        title,
        content: "",
      });

      // Redirect to new note
      window.location.href = `/notes/${res.data.id}`;
    } catch (err) {
      console.error(err);
    }
  };

  const openNote = (id) => {
    window.location.href = `/notes/${id}`;
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>CoWrite Dashboard</h2>

      {/* Create Note */}
      <div>
        <input
          placeholder="New note title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button onClick={createNote}>Create</button>
      </div>

      <hr />

      {/* My Notes */}
      <h3>My Notes</h3>
      {myNotes.map((note) => (
        <div key={note.id}>
          <button onClick={() => openNote(note.id)}>
            {note.title}
          </button>
        </div>
      ))}

      <hr />

      {/* Shared Notes */}
      <h3>Shared With Me</h3>
      {sharedNotes.map((note) => (
        <div key={note.id}>
          <button onClick={() => openNote(note.id)}>
            {note.title}
          </button>
        </div>
      ))}
    </div>
  );
}

export default Dashboard;