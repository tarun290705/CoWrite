# CoWrite

CoWrite is a real-time collaborative note-taking app that lets multiple users write, edit, and share notes simultaneously. Built with Django Channels for WebSocket support and React for a smooth, responsive interface.

## ✨ Features

- **Real-time Collaboration**: Multiple users can edit the same note simultaneously with live sync via WebSockets.
- **Typing Indicators**: See when another user is actively typing in a shared note.
- **Active User Presence**: View all users currently in a note session in real time.
- **Role-based Access**: Share notes with others as an Editor or Viewer.
- **Version History**: Save snapshots of a note and restore any previous version.
- **Dual Note Sections**: Separate views for your own notes and notes shared with you.
- **User Authentication**: Secure registration and login powered by SimpleJWT.

## 🏛️ Architecture

CoWrite is split into two independent services that run in parallel.

- **Backend**: A Django + Django Channels application serving both the REST API and WebSocket connections. Daphne is used as the ASGI server. Redis (via Docker) acts as the channel layer for broadcasting real-time events across WebSocket connections.
- **Frontend**: A React (Vite) single-page application that communicates with the backend via Axios for REST calls and native WebSockets for real-time collaboration.

## 🛠️ Tech Stack

- **Frontend**: React, Vite, ReactQuill, Axios, CSS Modules
- **Backend**: Django, Django Channels, Django REST Framework, SimpleJWT, Daphne
- **Real-time**: WebSockets, Redis (Docker)
- **Database**: PostgreSQL

## 🚀 Getting Started

### Prerequisites

- Python 3.8+
- Node.js and npm
- Docker (for Redis)

### 1. Clone the Repository

```bash
git clone https://github.com/tarun290705/CoWrite.git
cd CoWrite
```

### 2. Start Redis via Docker

Redis is required for Django Channels to broadcast WebSocket messages across connections.

```bash
docker run -d -p 6379:6379 redis
```

### 3. Backend Setup

The backend runs on `http://127.0.0.1:8000` via Daphne.

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply migrations
python manage.py migrate

# Start the server with Daphne
daphne -p 8000 backend.asgi:application
```

Your `backend/.env` file should contain:

```env
SECRET_KEY=your-django-secret-key
DEBUG=True
```

### 4. Frontend Setup

The frontend runs on `http://localhost:5173`.

```bash
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```
Once both services are running, open `http://localhost:5173` in your browser.

## 📂 Project Structure

```
CoWrite/
├── backend/
│   ├── backend/
│   │   ├── __init__.py
│   │   ├── asgi.py
│   │   ├── settings.py
│   │   ├── urls.py
│   │   └── wsgi.py
│   ├── notes/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── consumers.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── users/
│   │   ├── __init__.py
│   │   ├── admin.py
│   │   ├── apps.py
│   │   ├── models.py
│   │   ├── serializers.py
│   │   ├── tests.py
│   │   ├── urls.py
│   │   └── views.py
│   ├── .gitignore
│   ├── manage.py
│   └── requirements.txt
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── editor/
    │   │   │   ├── ActiveUsersBar.jsx
    │   │   │   ├── ActiveUsersBar.module.css
    │   │   │   ├── SharePanel.jsx
    │   │   │   ├── SharePanel.module.css
    │   │   │   ├── TypingIndicator.jsx
    │   │   │   ├── TypingIndicator.module.css
    │   │   │   ├── VersionHistoryDrawer.jsx
    │   │   │   └── VersionHistoryDrawer.module.css
    │   │   ├── layout/
    │   │   │   ├── Sidebar.jsx
    │   │   │   ├── Sidebar.module.css
    │   │   │   ├── TopBar.jsx
    │   │   │   └── TopBar.module.css
    │   │   └── ui/
    │   │       ├── UserAvatar.jsx
    │   │       └── UserAvatar.module.css
    │   ├── pages/
    │   │   ├── Dashboard.jsx
    │   │   ├── Dashboard.module.css
    │   │   ├── Editor.jsx
    │   │   ├── Editor.module.css
    │   │   ├── Login.jsx
    │   │   └── Login.module.css
    │   ├── services/
    │   │   └── api.js
    │   ├── styles/
    │   │   └── globals.css
    │   ├── App.jsx
    │   └── main.jsx
    ├── .gitignore
    ├── eslint.config.js
    ├── index.html
    ├── package-lock.json
    ├── package.json
    └── vite.config.js
```
