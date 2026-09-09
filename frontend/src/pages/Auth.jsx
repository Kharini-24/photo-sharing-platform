import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "member",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isRegister) {
        await api.post("/auth/register", form);

        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        const res = await api.post("/auth/login", {
          email: form.email,
          password: form.password,
        });

        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setError("");
  }

  return (
    <main className="auth-page">
      <section className="auth-showcase">
        <div className="auth-brand">Frame &amp; Share</div>

        <div className="auth-copy">
          <span className="auth-eyebrow">PHOTO · EVENT · GALLERY</span>

          <h1>
            Every moment,
            <br />
            <em>beautifully shared.</em>
          </h1>

          <p>
            A simple space for photography teams to organize, select and
            share the moments that matter.
          </p>
        </div>

        <div className="auth-footer-note">
          <span>01</span>
          <div></div>
          <span>Private galleries · Simple sharing</span>
        </div>
      </section>

      <section className="auth-panel">
        <div className="auth-container">
          <div className="auth-heading">
            <span className="auth-small-label">
              {isRegister ? "GET STARTED" : "WELCOME BACK"}
            </span>

            <h2>{isRegister ? "Create your account" : "Sign in"}</h2>

            <p>
              {isRegister
                ? "Join your photography team and start managing events."
                : "Access your events and photography galleries."}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div className="form-field">
                <label htmlFor="name">Full name</label>
                <input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  value={form.name}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            <div className="form-field">
              <label htmlFor="email">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={form.password}
                onChange={handleChange}
                required
              />
            </div>

            {isRegister && (
              <div className="form-field">
                <label htmlFor="role">Account type</label>

                <select
                  id="role"
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="member">Team Member</option>
                  <option value="admin">Admin / Lead</option>
                </select>
              </div>
            )}

            {error && <p className="error">{error}</p>}

            <button className="auth-submit" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : isRegister
                ? "Create Account"
                : "Sign In"}
            </button>
          </form>

          <div className="auth-switch">
            <span>
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}
            </span>

            <button className="link-btn" onClick={toggleMode}>
              {isRegister ? "Sign in" : "Create one"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}