# Findly — Campus Lost & Found

A complete MERN web application based on the **UC-16041 Conception Phase** brief. Findly gives students and staff one place to report, search, claim, and resolve lost or found belongings.

## Included features

- Secure registration and JWT login
- Automatic admin role for configured admin email addresses
- Lost and found item reports with image upload
- Search, category, type, status, sorting, and pagination filters
- Detailed item pages and reporter contact information
- Edit and delete controls restricted to the post owner or an admin
- Claim requests with owner approval or rejection
- Automatic `returned` / `resolved` status after claim approval
- Personal dashboard for reports and pending claims
- Admin monitoring dashboard with users, report statistics, and post management
- Responsive mobile, tablet, and desktop layouts

## Project structure

```text
frontend/  React + Vite user interface
backend/   Node.js + Express API, MongoDB models, and uploads
```

## Requirements

- Node.js 18 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

## Environment setup

Ready-to-run local `.env` files are included in both folders.

Before production deployment:

1. Change `JWT_SECRET` in `backend/.env`.
2. Change `MONGO_URI` to the production MongoDB connection string.
3. Set `CLIENT_URL` and `VITE_API_URL` to the deployed URLs.
4. Set `ADMIN_EMAILS` to one or more comma-separated admin email addresses.

An account registered with an email in `ADMIN_EMAILS` receives the admin role. The included local value is `admin@campus.edu`.

## Run locally

Install all dependencies:

```bash
npm install
npm run install:all
```

Make sure MongoDB is running, then start the two application folders in separate terminals:

```bash
cd backend
npm run dev
```

```bash
cd frontend
npm run dev
```

- Website: http://localhost:5173
- API: http://localhost:5000
- Health check: http://localhost:5000/api/health

## Production build

```bash
npm run build
npm start
```

The frontend build is written to `frontend/dist`. Serve that folder with a static host and run the backend separately.
