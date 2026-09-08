import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";

export default function Auth() {
  const [isRegister, setIsRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "member" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      if (isRegister) {
        await api.post("/auth/register", form);
        // After registering, immediately log them in for a smoother flow
        const res = await api.post("/auth/login", { email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      } else {
        const res = await api.post("/auth/login", { email: form.email, password: form.password });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  return (
    <div className="auth-container">
      <h2>{isRegister ? "Create Account" : "Login"}</h2>
      <form onSubmit={handleSubmit}>
        {isRegister && (
          <input name="name" placeholder="Full Name" value={form.name} onChange={handleChange} required />
        )}
        <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
        <input
          name="password"
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        {isRegister && (
          <select name="role" value={form.role} onChange={handleChange}>
            <option value="member">Team Member</option>
            <option value="admin">Admin / Lead</option>
          </select>
        )}
        {error && <p className="error">{error}</p>}
        <button type="submit">{isRegister ? "Register" : "Login"}</button>
      </form>
      <button className="link-btn" onClick={() => setIsRegister(!isRegister)}>
        {isRegister ? "Already have an account? Login" : "New here? Create an account"}
      </button>
    </div>
  );
}
