import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

export default function PublicGallery() {
  const { slug } = useParams();

  const [pin, setPin] = useState("");
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();

    if (pin.length !== 6) {
      setError("Please enter a 6-digit PIN.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/gallery/${slug}/access`,
        { pin }
      );

      setPhotos(res.data.photos);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Incorrect PIN or gallery unavailable."
      );
    } finally {
      setLoading(false);
    }
  }

  /* PIN SCREEN */
  if (!photos) {
    return (
      <main className="customer-gallery-page">
        <section className="gallery-access">

          <div className="gallery-access-top">
            <span className="gallery-access-number">01</span>
            <span>PRIVATE GALLERY</span>
          </div>

          <div className="gallery-access-content">
            <div className="gallery-lock">
              <span>⌑</span>
            </div>

            <span className="auth-small-label">
              YOUR PHOTOGRAPHS AWAIT
            </span>

            <h1>Your private gallery</h1>

            <p>
              Enter the 6-digit PIN provided by your
              photographer to view your photos.
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="6-digit PIN"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, ""))
                }
                maxLength={6}
                autoComplete="off"
                required
              />

              {error && (
                <p className="error gallery-error">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Opening Gallery..." : "View Gallery →"}
              </button>
            </form>

            <span className="gallery-private-note">
              This gallery is private and protected by a PIN.
            </span>
          </div>

          <div className="gallery-access-bottom">
            <span>FRAME &amp; SHARE</span>
            <span>PRIVATE · SECURE · PERSONAL</span>
          </div>

        </section>
      </main>
    );
  }

  /* CUSTOMER GALLERY */
  return (
    <main className="customer-gallery-page">
      <section className="customer-gallery">

        <header className="customer-gallery-header">
          <div>
            <span className="auth-small-label">
              PRIVATE GALLERY
            </span>

            <h1>Your photographs</h1>

            <p>
              {photos.length}{" "}
              {photos.length === 1 ? "photograph" : "photographs"}
            </p>
          </div>

          <span className="gallery-mark">Frame &amp; Share</span>
        </header>

        {photos.length === 0 ? (
          <div className="photo-empty">
            <h3>No photos available</h3>
            <p>
              There are currently no photos in this gallery.
            </p>
          </div>
        ) : (
          <div className="customer-photo-grid">
            {photos.map((photo, index) => (
              <figure key={index} className="customer-photo">
                <img
                  src={photo.url}
                  alt={photo.filename || `Gallery photo ${index + 1}`}
                  loading="lazy"
                />
              </figure>
            ))}
          </div>
        )}

        <footer className="customer-gallery-footer">
          <span>FRAME &amp; SHARE</span>
          <span>PRIVATE GALLERY</span>
        </footer>

      </section>
    </main>
  );
}