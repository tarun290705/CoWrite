import { BrowserRouter, Routes, Route } from "react-router-dom";
import Editor from "./pages/Editor";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

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

function EditorWrapper() {
    const id = window.location.pathname.split("/")[2];
    return <Editor noteId={id} />;
}

export default App;