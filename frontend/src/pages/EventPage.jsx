import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function EventPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState([]); // photo IDs chosen for publishing
  const [memberEmail, setMemberEmail] = useState("");
  const [publishResult, setPublishResult] = useState(null);
  const [error, setError] = useState("");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  useEffect(() => {
    loadEvent();
    loadPhotos();
  }, [eventId]);

  async function loadEvent() {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load this event.");
    }
  }

  async function loadPhotos() {
    const res = await api.get(`/photos/${eventId}`);
    setPhotos(res.data);
  }

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("photo", file);
    await api.post(`/photos/${eventId}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    loadPhotos();
  }

  async function addMember(e) {
    e.preventDefault();
    await api.post(`/events/${eventId}/members`, { email: memberEmail });
    setMemberEmail("");
    loadEvent();
  }

  function toggleSelect(photoId) {
    setSelected((prev) =>
      prev.includes(photoId) ? prev.filter((id) => id !== photoId) : [...prev, photoId]
    );
  }

  async function publishGallery() {
    const res = await api.post(`/gallery/${eventId}/publish`, { photoIds: selected });
    setPublishResult(res.data);
  }

  if (error) {
    return (
      <div className="event-page">
        <h2>Access Denied</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!event) return <p>Loading...</p>;

  return (
    <div className="event-page">
      <h2>{event.name}</h2>

      {/* Admin-only: add team members */}
      {user.role === "admin" && (
        <form onSubmit={addMember} className="add-member-form">
          <input
            placeholder="Team member email"
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
          />
          <button type="submit">Add Member</button>
        </form>
      )}

      <div className="upload-section">
        <label>Upload a photo:</label>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      <h3>Photos ({photos.length})</h3>
      <div className="photo-grid">
        {photos.map((p) => (
          <div key={p._id} className="photo-card">
            <img src={p.imageUrl} alt={p.filename} />
            {user.role === "admin" && (
              <label>
                <input
                  type="checkbox"
                  checked={selected.includes(p._id)}
                  onChange={() => toggleSelect(p._id)}
                />
                Select
              </label>
            )}
          </div>
        ))}
      </div>

      {user.role === "admin" && (
        <div className="publish-section">
          <button onClick={publishGallery} disabled={selected.length === 0}>
            Publish Gallery ({selected.length} selected)
          </button>
          {publishResult && (
            <div className="publish-result">
              <p>Gallery published!</p>
              <p>Share URL: {window.location.origin}{publishResult.shareUrl}</p>
              <p>PIN: {publishResult.pin}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
