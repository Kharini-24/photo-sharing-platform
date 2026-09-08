import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios"; // plain axios here on purpose -- no auth token needed for this public page

export default function PublicGallery() {
  const { slug } = useParams();
  const [pin, setPin] = useState("");
  const [photos, setPhotos] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`http://localhost:5000/api/gallery/${slug}/access`, { pin });
      setPhotos(res.data.photos);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong.");
    }
  }

  // Before the correct PIN is entered, only show the PIN form -- never the photos.
  if (!photos) {
    return (
      <div className="public-gallery-pin">
        <h2>Enter Gallery PIN</h2>
        <form onSubmit={handleSubmit}>
          <input
            placeholder="6-digit PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={6}
            required
          />
          <button type="submit">View Gallery</button>
        </form>
        {error && <p className="error">{error}</p>}
      </div>
    );
  }

  return (
    <div className="public-gallery">
      <h2>Photo Gallery</h2>
      <div className="photo-grid">
        {photos.map((p, idx) => (
          <img key={idx} src={p.url} alt={p.filename} />
        ))}
      </div>
    </div>
  );
}
