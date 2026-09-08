import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [newEventName, setNewEventName] = useState("");
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    const res = await api.get("/events");
    setEvents(res.data);
  }

  async function createEvent(e) {
    e.preventDefault();
    if (!newEventName.trim()) return;
    await api.post("/events", { name: newEventName });
    setNewEventName("");
    loadEvents();
  }

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {user.name} ({user.role})</h2>
        <button onClick={logout}>Logout</button>
      </div>

      {/* Only Admins can create new events -- Team Members just see their assigned events */}
      {user.role === "admin" && (
        <form onSubmit={createEvent} className="create-event-form">
          <input
            placeholder="New event name (e.g. Arjun & Priya Wedding)"
            value={newEventName}
            onChange={(e) => setNewEventName(e.target.value)}
          />
          <button type="submit">Create Event</button>
        </form>
      )}

      <h3>Your Events</h3>
      <ul className="event-list">
        {events.map((ev) => (
          <li key={ev._id}>
            <Link to={`/events/${ev._id}`}>{ev.name}</Link>
          </li>
        ))}
        {events.length === 0 && <p>No events yet.</p>}
      </ul>
    </div>
  );
}
