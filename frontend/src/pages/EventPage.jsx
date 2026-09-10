import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";

export default function EventPage() {
  const { eventId } = useParams();

  const [event, setEvent] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [selected, setSelected] = useState([]);
  const [memberEmail, setMemberEmail] = useState("");
  const [publishResult, setPublishResult] = useState(null);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [publishing, setPublishing] = useState(false);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role === "admin";

  useEffect(() => {
    loadEvent();
    loadPhotos();
  }, [eventId]);

  async function loadEvent() {
    try {
      const res = await api.get(`/events/${eventId}`);
      setEvent(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load this event."
      );
    }
  }

  async function loadPhotos() {
    try {
      const res = await api.get(`/photos/${eventId}`);
      setPhotos(res.data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to load photos."
      );
    }
  }

  async function handleUpload(e) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    try {
      setUploading(true);
      setError("");

      for (const file of files) {
        const formData = new FormData();
        formData.append("photo", file);

        await api.post(`/photos/${eventId}`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
      }

      await loadPhotos();
    } catch (err) {
      setError(
        err.response?.data?.message || "Photo upload failed."
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }
  async function deletePhoto(photoId) {
    const confirmed = window.confirm(
      "Are you sure you want to remove this photo?"
    );
  
    if (!confirmed) return;
  
    try {
      setError("");
  
      await api.delete(`/photos/${photoId}`);
  
      setPhotos((prev) => prev.filter((photo) => photo._id !== photoId));
      setSelected((prev) => prev.filter((id) => id !== photoId));
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to remove photo."
      );
    }
  }

  async function addMember(e) {
    e.preventDefault();

    if (!memberEmail.trim()) return;

    try {
      setAddingMember(true);
      setError("");

      await api.post(`/events/${eventId}/members`, {
        email: memberEmail.trim(),
      });

      setMemberEmail("");
      await loadEvent();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to add team member."
      );
    } finally {
      setAddingMember(false);
    }
  }

  function toggleSelect(photoId) {
    setSelected((prev) =>
      prev.includes(photoId)
        ? prev.filter((id) => id !== photoId)
        : [...prev, photoId]
    );
  }

  async function publishGallery() {
    if (selected.length === 0) return;

    try {
      setPublishing(true);
      setError("");

      const res = await api.post(`/gallery/${eventId}/publish`, {
        photoIds: selected,
      });

      setPublishResult(res.data);
      await loadEvent();
    } catch (err) {
      setError(
        err.response?.data?.message || "Unable to publish gallery."
      );
    } finally {
      setPublishing(false);
    }
  }

  if (error && !event) {
    return (
      <div className="event-page page-wide event-error-page">
        <span className="auth-small-label">EVENT ACCESS</span>
        <h2>Unable to open this event</h2>
        <p className="error">{error}</p>
      </div>
    );
  }

  if (!event) {
    return <p className="loading-text">Loading event...</p>;
  }

  return (
    <main className="event-workspace">
      <div className="event-page page-wide">

        {/* Event Header */}
        <header className="event-page-header">
          <div>
            <span className="event-eyebrow">
              {isAdmin ? "ADMIN · EVENT" : "TEAM · EVENT"}
            </span>

            <h2>{event.name}</h2>

            <p className="event-description">
              {isAdmin
                ? "Review your team's photos and prepare the final gallery."
                : "Upload and manage the photos you've captured for this event."}
            </p>
          </div>

          <div className="event-page-header-right">
            <span className="photo-count-label">
              {photos.length}{" "}
              {photos.length === 1 ? "photo" : "photos"}
            </span>

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
        </header>

        {error && <p className="error event-error">{error}</p>}

        {/* Admin Team Section */}
        {isAdmin && (
          <section className="event-section team-section">
            <div className="section-heading">
              <div>
                <span className="section-number">01</span>
                <h3>Photography Team</h3>
              </div>

              <span className="section-hint">
                Add members by email
              </span>
            </div>

            <form onSubmit={addMember} className="add-member-form">
  <input
    type="email"
    placeholder="Team member email address"
    value={memberEmail}
    onChange={(e) => setMemberEmail(e.target.value)}
    required
  />

  <button type="submit" disabled={addingMember}>
    {addingMember ? "Adding..." : "Add Member"}
  </button>
</form>

<div className="team-members-list">
  <span className="team-list-label">TEAM MEMBERS</span>

  {event.members && event.members.length > 0 ? (
    event.members.map((member) => (
      <div className="team-member" key={member._id}>
        <div className="member-avatar">
          {member.name?.charAt(0)?.toUpperCase() || "M"}
        </div>

        <div className="member-info">
          <strong>{member.name}</strong>
          <span>{member.email}</span>
        </div>
      </div>
    ))
  ) : (
    <p className="no-members">
      No team members added yet.
    </p>
  )}
</div>
          </section>
        )}

        {/* Upload Section */}
        <section className="event-section upload-section-new">
          <div className="section-heading">
            <div>
              <span className="section-number">
                {isAdmin ? "02" : "01"}
              </span>

              <h3>Upload Photos</h3>
            </div>

            <span className="section-hint">
              JPG, PNG and other image formats
            </span>
          </div>

          <label className="upload-dropzone">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleUpload}
              disabled={uploading}
            />

            <span className="upload-symbol">+</span>

            <strong>
              {uploading
                ? "Uploading photos..."
                : "Choose photos to upload"}
            </strong>

            <small>
              You can select multiple photos at once
            </small>
          </label>
        </section>

        {/* Photo Selection */}
        <section className="event-section photos-section">
          <div className="section-heading photos-heading">
            <div>
              <span className="section-number">
                {isAdmin ? "03" : "02"}
              </span>

              <h3>
                {isAdmin ? "Review Photos" : "Your Photos"}
              </h3>
            </div>

            {isAdmin && photos.length > 0 && (
              <span className="selection-count">
                {selected.length} selected
              </span>
            )}
          </div>

          {photos.length === 0 ? (
            <div className="photo-empty">
              <div className="empty-icon">+</div>
              <h3>No photos yet</h3>
              <p>
                Upload photos to start building this gallery.
              </p>
            </div>
          ) : (
            <div className="photo-grid photo-grid-wide">
              {photos.map((photo) => {
                const isSelected = selected.includes(photo._id);

                return (
                  <div
                    key={photo._id}
                    className={`photo-card photo-card-large ${
                      isSelected ? "photo-card-selected" : ""
                    }`}
                  >
                    <img
                      src={photo.imageUrl}
                      alt={photo.filename}
                    />

                    {isAdmin && (
                      <label className="select-overlay">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() =>
                            toggleSelect(photo._id)
                          }
                        />

                        <span>
                          {isSelected ? "Selected" : "Select"}
                        </span>
                      </label>
                                        )}

                                        <button
                                          type="button"
                                          className="delete-photo-button"
                                          onClick={() => deletePhoto(photo._id)}
                                        >
                                          Remove
                                        </button>
                                      </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Publish */}
        {isAdmin && (
          <section className="publish-section publish-section-new">
            <div>
              <span className="section-number">04</span>

              <h3>Publish Gallery</h3>

              <p>
                Select the photos you want customers to see,
                then publish the gallery.
              </p>
            </div>

            <button
              onClick={publishGallery}
              disabled={selected.length === 0 || publishing}
            >
              {publishing
                ? "Publishing..."
                : `Publish Gallery · ${selected.length} Selected`}
            </button>
          </section>
        )}

        {/* Published Result */}
        {publishResult && (
          <section className="publish-result publish-result-new">
            <div className="publish-success-icon">✓</div>

            <div>
              <span className="auth-small-label">
                GALLERY READY
              </span>

              <h3>Gallery published successfully</h3>

              <p>
                Share this link and PIN with your customer.
              </p>

              <div className="share-details">
                <div>
                  <span>SHARE URL</span>
                  <strong>
                    {window.location.origin}
                    {publishResult.shareUrl}
                  </strong>
                </div>

                <div>
                  <span>GALLERY PIN</span>
                  <strong className="gallery-pin">
                    {publishResult.pin}
                  </strong>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}