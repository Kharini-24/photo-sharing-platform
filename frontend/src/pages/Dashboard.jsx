import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [newEventName, setNewEventName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/events");
      setEvents(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load your events."
      );
    } finally {
      setLoading(false);
    }
  }

  async function createEvent(e) {
    e.preventDefault();

    if (!newEventName.trim()) return;

    try {
      await api.post("/events", {
        name: newEventName.trim(),
      });

      setNewEventName("");
      setShowForm(false);
      loadEvents();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to create the event."
      );
    }
  }

  function logout() {
    localStorage.clear();
    navigate("/");
  }

  return (
    <main className="dashboard-page">
      <div className="dashboard page-wide">

        {/* Header */}
        <header className="dashboard-header">
          <div>
            <span className="dashboard-eyebrow">
              {isAdmin ? "ADMIN · WORKSPACE" : "TEAM · WORKSPACE"}
            </span>

            <h2>
              Welcome back, {user.name || "there"}
            </h2>

            <p className="dashboard-subtitle">
              {isAdmin
                ? "Manage your events, team and galleries."
                : "View your assigned events and upload your photos."}
            </p>
          </div>

          <button className="btn-ghost logout-btn" onClick={logout}>
            Sign out
          </button>
        </header>

        {/* Toolbar */}
        <div className="dashboard-toolbar">
          <div>
            <h3>{isAdmin ? "Your Events" : "Assigned Events"}</h3>
            <p className="toolbar-description">
              {events.length}{" "}
              {events.length === 1 ? "event" : "events"}
            </p>
          </div>

          {isAdmin && (
            <button
              className="create-btn"
              onClick={() => {
                setShowForm(!showForm);
                setError("");
              }}
            >
              {showForm ? "Cancel" : "+ Create Event"}
            </button>
          )}
        </div>

        {/* Create Event */}
        {showForm && (
          <form
            onSubmit={createEvent}
            className="create-event-form dashboard-create-form"
          >
            <div className="create-form-content">
              <span className="meta-label">NEW EVENT</span>

              <input
                autoFocus
                type="text"
                placeholder="Event name, e.g. Arjun & Priya Wedding"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
              />
            </div>

            <button type="submit">Create Event</button>
          </form>
        )}

        {error && <p className="error dashboard-error">{error}</p>}

        <div className="dashboard-divider" />

        {/* Loading */}
        {loading ? (
          <div className="empty-state">
            <p>Loading your events...</p>
          </div>
        ) : events.length === 0 ? (
          /* Empty */
          <div className="empty-state dashboard-empty">
            <div className="empty-icon">+</div>

            <h3>
              {isAdmin ? "Create your first event" : "No events assigned"}
            </h3>

            <p>
              {isAdmin
                ? "Start by creating an event for your photography team."
                : "Your assigned events will appear here."}
            </p>

            {isAdmin && (
              <button
                className="create-btn"
                onClick={() => setShowForm(true)}
              >
                + Create Event
              </button>
            )}
          </div>
        ) : (
          /* Event Cards */
          <div className="event-grid">
            {events.map((event) => (
              <Link
                to={`/events/${event._id}`}
                key={event._id}
                className="event-card"
              >
                <div className="event-card-cover">
                  {event.coverUrl ? (
                    <img
                      src={event.coverUrl}
                      alt={event.name}
                    />
                  ) : (
                    <div className="cover-placeholder">
                      <span>PHOTO</span>
                    </div>
                  )}

                  <span
                    className={`badge ${
                      event.isPublished
                        ? "badge-published"
                        : "badge-draft"
                    }`}
                  >
                    {event.isPublished ? "Published" : "Draft"}
                  </span>
                </div>

                <div className="event-card-body">
                  <span className="meta-label">
                    {formatDate(event.createdAt)}
                  </span>

                  <h3>{event.name}</h3>

                  <div className="event-card-footer">
                    <span>
                      {event.photoCount || 0}{" "}
                      {event.photoCount === 1 ? "photo" : "photos"}
                    </span>

                    <span className="view-link">
                      {isAdmin ? "Manage" : "Open"} →
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}