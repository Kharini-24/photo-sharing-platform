# Photo Sharing Platform

Full-stack implementation for the **TrizenAI Full-Stack Internship Challenge**.

## Overview

A photography/event team can upload photos for an event. An Admin/Lead reviews the uploaded photos, selects the photos to publish, and creates a customer-facing gallery protected by a PIN.

Customers can access the published gallery using a shareable link and PIN without creating an account.

## Features

### Admin / Lead

- Register and login
- Create events
- Add Team Members to events
- View event photos
- Review and select photos
- Remove photos from an event
- Publish selected photos as a customer gallery
- Generate a unique shareable gallery URL
- Generate a secure 6-digit gallery PIN

### Team Member

- Register and login
- Access assigned events
- Upload photos
- View their uploaded photos
- Remove their own uploaded photos
- Cannot publish galleries

### Customer

- No account required
- Access gallery through a shareable URL
- Enter gallery PIN
- View only the photos selected and published by the Admin
- Incorrect PIN is rejected

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Axios
- CSS

### Backend

- Node.js
- Express.js
- Multer

### Database

- MongoDB
- Mongoose
- MongoDB Atlas

### Photo Storage

- Cloudinary

Photos are stored in Cloudinary while MongoDB stores photo metadata and Cloudinary URLs/public IDs.

### Authentication & Security

- JWT authentication
- bcrypt password hashing
- Role-based access control
- Protected API routes
- Event membership validation
- Gallery PIN verification

## System Architecture

```text
                [ React + Vite ]
                       |
                 HTTP / JSON
                       |
                       v
                [ Express API ]
                  /         \
                 /           \
                v             v
        [ MongoDB Atlas ]  [ Cloudinary ]
          Metadata           Photo Files
Database Schema
User
name
email
password (hashed)
role (admin / member)
Event
name
createdBy
members
Photo
event
uploadedBy
imageUrl
publicId
filename
fileSize
Gallery
event
pin
shareSlug
photos
isPublished
Relationships
One Event has multiple Photos.
One Event can have multiple Team Members.
One Event can have one published Gallery.
A Gallery contains a selected subset of the Event's Photos.
Local Setup
1. Clone the repository
git clone https://github.com/Kharini-24/photo-sharing-platform.git
cd photo-sharing-platform
2. Backend Setup
cd backend
npm install

Create a .env file inside the backend folder:

MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
PORT=5000

Start the backend:  npm start

For development with Nodemon:  npm run dev

The backend runs on:
http://localhost:5000

3. Frontend Setup

Open another terminal:
cd frontend
npm install

Create a .env file inside the frontend folder:

VITE_API_URL=http://localhost:5000/api

Start the frontend:

npm run dev

The frontend runs on:

http://localhost:5173
Environment Variables


The frontend requires:

VITE_API_URL=http://localhost:5000/api

For production, the frontend VITE_API_URL is configured in Vercel to point to the deployed Render backend.

Never commit real credentials, API keys, secrets, or .env files to GitHub.

Deployment

The application is deployed using:

Frontend: Vercel
Backend: Render
Database: MongoDB Atlas
Photo Storage: Cloudinary
Live Application

Frontend:

https://photo-sharing-platform-mu.vercel.app/

Backend API:

https://photo-sharing-backend-4mz9.onrender.com/

GitHub Repository:

https://github.com/Kharini-24/photo-sharing-platform

Demo
Admin Account

Admin email:  harini@gmail.com

The Admin password is provided separately for evaluation and is intentionally not included in this public repository.

Team Member Account
Team Member email:  priya@gmail.com

The Team Member password is provided separately for evaluation and is intentionally not included in this public repository.

Demo Gallery

Gallery URL:
https://photo-sharing-platform-mu.vercel.app/gallery/G1nM8OWE

Gallery PIN:  421874

The demo gallery was tested successfully on the deployed application.

Security & Authorization

The application implements role-based access control and protected API routes.

Authentication
JWT is used for authentication.
Passwords are hashed using bcrypt.
Protected routes require a valid authentication token.
Authorization
Only Admins can publish galleries.
Team Members can access only events they belong to.
Team Members can view their own uploaded photos.
Admins can view all photos in their events.
Team Members can remove only their own photos.
Admins can remove photos from their events.
Users cannot access photos from unrelated events.
Gallery Security
Galleries are accessed using a unique shareable slug.
Customers must provide the correct PIN.
Incorrect PIN attempts return an error.
Unpublished or nonexistent galleries cannot be accessed.
Photo Upload Validation

The application validates uploaded photos:

Only image files are accepted.
Maximum file size is 10 MB.
Invalid uploads return appropriate error messages.
Uploaded images are stored in Cloudinary.
MongoDB stores the photo metadata.
Photo Deletion

The application supports removing uploaded photos.

When a photo is removed:

The user's permission is checked.
The photo is deleted from Cloudinary.
The photo metadata is deleted from MongoDB.
The photo is removed from the UI.
Testing

The backend includes automated API tests using:

Jest
Supertest
MongoDB Memory Server

Run the tests from the backend directory:

npm test
Automated Tests

The test suite covers:

Authentication — invalid login credentials are rejected.
Authorization / RBAC — Team Members cannot publish galleries.
Photo access control — users cannot access photos from events they do not belong to.
Gallery publishing — Admins can publish galleries with selected photos.
Gallery PIN verification — incorrect PINs are rejected.
Test Result

All automated tests pass successfully:

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Manual Testing

The deployed application was manually tested for:

Admin registration and login
Team Member login
Admin event access
Adding Team Members
Team Member event access
Team Member photo upload
Team Member photo removal
Admin photo selection
Gallery publishing
Customer gallery access
Correct gallery PIN
Incorrect gallery PIN
Unauthorized event access
Upload validation
File-size validation
Public gallery deep-link routing
Known Limitations
Gallery PIN attempts are not rate-limited.
Large photo collections do not currently use pagination.
Automated CI/CD pipeline is not configured.

These can be considered future improvements for a production-scale version.

Project Workflow
Admin Registration/Login
          |
          v
      Create Event
          |
          v
    Add Team Members
          |
          v
   Team Uploads Photos
          |
          v
      Admin Reviews
          |
          v
   Select Photos
          |
          v
    Publish Gallery
          |
          v
 Generate Gallery URL + PIN
          |
          v
 Customer Opens Gallery
          |
          v
       Enter PIN
          |
          v
     View Selected Photos
Submission Links
Live Application

https://photo-sharing-platform-mu.vercel.app/

Backend

https://photo-sharing-backend-4mz9.onrender.com/

GitHub Repository

https://github.com/Kharini-24/photo-sharing-platform