import { useState } from "react";
import API from "../services/api";
import styles from "./Login.module.css";

function Login() {
  const [mode, setMode] = useState("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const switchMode = (next) => {
    setMode(next);
    setError("");
    setSuccess("");
    setUsername("");
    setEmail("");
    setPassword("");
    setConfirm("");
  };

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter your username and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await API.post("login/", { username, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("username", username);

      const notesRes = await API.get("notes/");
      let notes = notesRes.data;

      if (notes.length === 0) {
        const sharedRes = await API.get("shared-notes/");
        notes = sharedRes.data;
      }

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      setError("Login failed. Check your username and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim() ||
      !confirm.trim()
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await API.post("register/", {
        username: username.trim(),
        email: email.trim(),
        password,
      });

      setSuccess("Account created! Signing you in…");

      const loginRes = await API.post("login/", {
        username: username.trim(),
        password,
      });
      localStorage.setItem("access", loginRes.data.access);
      localStorage.setItem("username", username.trim());

      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      const data = err?.response?.data;
      const msg =
        data?.username?.[0] ||
        data?.email?.[0] ||
        data?.password?.[0] ||
        data?.detail ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = () => {
    if (mode === "login") handleLogin();
    else handleRegister();
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSubmit();
  };

  return (
    <div className={styles.page}>
      <div className={styles.bgDecor} aria-hidden="true">
        <div className={styles.bgCircle1} />
        <div className={styles.bgCircle2} />
      </div>

      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoMark}>C</div>
          <span className={styles.logoText}>CoWrite</span>
        </div>

        <div className={styles.heading}>
          <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
          <p>
            {mode === "login"
              ? "Sign in to continue to CoWrite."
              : "Join CoWrite and start collaborating."}
          </p>
        </div>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.activeTab : ""}`}
            onClick={() => switchMode("login")}
          >
            Sign in
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.activeTab : ""}`}
            onClick={() => switchMode("register")}
          >
            Register
          </button>
        </div>

        <div className={styles.form}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className={styles.input}
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="username"
              autoFocus
            />
          </div>
          {mode === "register" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Email
              </label>
              <input
                id="email"
                className={styles.input}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="email"
              />
            </div>
          )}

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              className={styles.input}
              type="password"
              placeholder={
                mode === "register"
                  ? "Choose a password"
                  : "Enter your password"
              }
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete={
                mode === "register" ? "new-password" : "current-password"
              }
            />
          </div>

          {mode === "register" && (
            <div className={styles.field}>
              <label className={styles.label} htmlFor="confirm">
                Confirm Password
              </label>
              <input
                id="confirm"
                className={styles.input}
                type="password"
                placeholder="Re-enter your password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={handleKeyDown}
                autoComplete="new-password"
              />
            </div>
          )}

          {error && (
            <div className={styles.errorBox}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          {success && (
            <div className={styles.successBox}>
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22,4 12,14.01 9,11.01" />
              </svg>
              {success}
            </div>
          )}

          <button
            className={styles.submitBtn}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.spinner} />
            ) : mode === "login" ? (
              "Sign in"
            ) : (
              "Create account"
            )}
          </button>
        </div>

        <p className={styles.switchText}>
          {mode === "login"
            ? "Don't have an account? "
            : "Already have an account? "}
          <button
            className={styles.switchLink}
            onClick={() => switchMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}

export default Login;
