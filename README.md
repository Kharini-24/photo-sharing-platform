# Photo Sharing Platform

Full-stack submission for the TrizenAI Full-Stack Internship Challenge.

## Overview
A photography/event team uploads photos for an event. An Admin/Lead reviews and selects photos, then publishes a customer-facing gallery protected by a PIN. Customers view the gallery via a shareable link + PIN, with no account required.

## Tech Stack
- **Frontend:** React (Vite), React Router, Axios
- **Backend:** Node.js, Express
- **Database:** MongoDB (Mongoose)
- **File Storage:** Cloudinary (object storage for photos — DB only stores metadata/URLs)
- **Auth:** JWT (JSON Web Tokens) + bcrypt password hashing

## Why this stack
Chosen because it's a stack I'm already comfortable with (MERN), which let me focus effort on getting the core requirements (roles, security, gallery flow) fully correct rather than learning new tools under a deadline.

## System Architecture

```
[React Frontend] <--HTTP/JSON--> [Express API] <--Mongoose--> [MongoDB]
                                        |
                                        v
                                  [Cloudinary]  (actual photo files)
```

## Database Schema

- **User**: name, email, password (hashed), role (admin/member)
- **Event**: name, createdBy (User ref), members (array of User refs)
- **Photo**: event (ref), uploadedBy (ref), imageUrl, publicId, filename, fileSize
- **Gallery**: event (ref), pin, shareSlug (unique), photos (array of Photo refs), isPublished

Relationships: One Event has many Photos and many Members. One Event has one published Gallery containing a subset of its Photos.

## Local Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env   # fill in your MongoDB URI, JWT secret, Cloudinary keys
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`, backend on `http://localhost:5000`.

## Environment Variables
See `backend/.env.example` for the full list. You'll need:
- A free MongoDB Atlas cluster (mongodb.com/atlas)
- A free Cloudinary account (cloudinary.com)

## Deployment
- Backend: deploy to Render or Railway (free tier), set the same env vars in their dashboard
- Frontend: deploy to Vercel, update `src/api.js` baseURL to point to your deployed backend URL

## Security & Edge Cases Handled
- Role-based access control (Admin vs Team Member) via middleware
- A user cannot access an event they're not part of (403 error)
- A Team Member cannot publish a gallery (blocked by `adminOnly` middleware)
- Failed photo upload returns a clear error instead of crashing
- Incorrect PIN returns 401 without revealing whether the gallery exists
- Unpublished/nonexistent galleries return 404

## Known Limitations
- PIN is not rate-limited (a production version would add attempt limits)
- No pagination yet on large photo sets (listed as a bonus feature)
- No automated CI/CD pipeline set up

## Demo Credentials
(Fill in after you register test accounts locally)
- Admin: `admin@test.com` / `password123`
- Team Member: `member@test.com` / `password123`
- Demo Gallery: (generated after you publish one — link + PIN will show in the UI)
