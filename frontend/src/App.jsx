import { BrowserRouter, Routes, Route, useParams } from "react-router-dom";
import "./styles/globals.css";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

function EditorWrapper() {
  const { id } = useParams();
  return <Editor noteId={id} />;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/notes/:id" element={<EditorWrapper />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
