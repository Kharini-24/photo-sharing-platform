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

```text
[React Frontend]
       |
   HTTP / JSON
       |
       v
[Express API]
   |         |
Mongoose     |
   |         |
   v         v
[MongoDB] [Cloudinary]
(metadata) (photo files)

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
npm run dev

Create a .env file inside the backend folder with the required MongoDB, JWT, and Cloudinary configuration.

Frontend
cd frontend
npm install
npm run dev

Create a .env file inside the frontend folder:

VITE_API_URL=http://localhost:5000/api

The frontend runs on http://localhost:5173 and the backend runs on http://localhost:5000.


## Environment Variables

### Backend

Create a `.env` file inside the `backend` folder with:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000
Frontend

Create a .env file inside the frontend folder with:

VITE_API_URL=http://localhost:5000/api

For the deployed frontend, VITE_API_URL is configured in Vercel to point to the deployed Render backend.

Never commit real credentials or .env files to GitHub.

## Deployment

- **Backend:** Deployed on Render
- **Frontend:** Deployed on Vercel
- **Database:** MongoDB Atlas
- **Photo Storage:** Cloudinary

### Live Application

- **Frontend:** https://photo-sharing-platform-mu.vercel.app/
- **Backend API:** https://photo-sharing-backend-4mz9.onrender.com/

The frontend uses the `VITE_API_URL` environment variable to connect to the deployed backend API.

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

## Features

- Admin/Lead authentication and event management
- Team Member authentication and assigned event access
- Add and manage photography team members
- Multiple photo uploads per event
- Cloudinary-based photo storage
- Admin photo review and selection
- PIN-protected customer galleries
- Shareable gallery links
- Role-based access control
- Responsive dark-themed interface
- Protected event and photo access
- Upload validation and file-size limits

## Testing

The backend includes automated API tests using **Jest**, **Supertest**, and **MongoDB Memory Server**.

Run the tests from the `backend` directory:

```bash
npm test
```

### Automated Tests

The test suite covers:

* Authentication — invalid login credentials are rejected.
* Authorization / RBAC — Team Members cannot publish galleries.
* Photo access control — users cannot access photos from events they do not belong to.
* Gallery publishing — event Admins can publish galleries with selected photos.
* Gallery PIN verification — incorrect PINs are rejected.

### Test Result

All automated tests pass successfully:

```text
Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
```

### Additional Manual Testing

The application was also manually tested for:

* User registration and login
* Admin and Team Member role-based access
* Unauthorized event access
* Team Member photo upload access
* Admin photo selection and gallery publishing
* Customer gallery access with a valid PIN
* Access to unpublished galleries/photos
* Invalid photo upload handling
* File-size validation

## Demo Credentials

- **Admin:** Add your actual Admin email and password here.
- **Team Member:** Add your actual Team Member email and password here.
- **Demo Gallery:** Add the generated gallery URL and PIN here.

> These credentials are provided for evaluation purposes.
