# Smart Educational ERP System

A production-style MERN stack Educational ERP with role-based access (Super Admin, Teacher, Student), real-time notifications, file uploads, and analytics.

## Tech Stack

- **Frontend:** React (Vite), TailwindCSS, Framer Motion, Axios, React Router, React Icons, Recharts, Context API
- **Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, Multer, Cloudinary, Nodemailer, Socket.io

## Project Structure

```
smart-erp-project/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── routes/
│   ├── models/
│   ├── middleware/
│   ├── services/
│   ├── utils/
│   ├── uploads/
│   └── server.js
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── layouts/
│       ├── hooks/
│       ├── context/
│       ├── services/
│       ├── utils/
│       ├── assets/
│       └── App.jsx
└── README.md
```

## Setup & Run

### Backend

1. Navigate to backend: `cd backend`
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env` and fill in:
   - `MONGO_URI` (required) – your MongoDB connection string
   - `JWT_SECRET` (required) – any long random string for signing tokens
   - `CLIENT_URL` – frontend URL, e.g. `http://localhost:5173`
   - Optionally: Cloudinary (file uploads), Email (Nodemailer), etc.
4. Seed a Super Admin (optional): `npm run seed`  
   - Creates `admin@smart-erp.com` / `admin123` if no admin exists.
5. Start server: `npm run dev`  
   - API runs on `PORT` (default 5000). Socket.io is attached to the same server.

### Frontend

1. Navigate to frontend: `cd frontend`
2. Install dependencies: `npm install`
3. Create `.env` (optional; defaults work with Vite proxy):
   - `VITE_API_URL=http://localhost:5000`
   - `VITE_SOCKET_URL=http://localhost:5000` (same as API when Socket runs on same server)
4. Start dev server: `npm run dev`  
   - App runs at `http://localhost:5173`

### Default Login (after seeding)

- **Super Admin:** `admin@gmail.com` / `admin123` (after `npm run seed`)
- **Teacher / Student:** Create via Admin dashboard (Students / Teachers), then log in with that email and role.

## Roles

- **Super Admin:** Full access – users, courses, subjects, timetable, announcements, fees, analytics
- **Teacher:** Classes, attendance, assignments, grading, materials, announcements, timetable, analytics
- **Student:** Profile, timetable, attendance, assignments, submissions, results, materials, announcements, fee status

## Environment Variables

See `backend/.env.example` for required variables. Never commit `.env` files.

## ScreenShots

1. **Super Admin:**
   <img width="1904" height="1035" alt="Screenshot 2026-03-26 122739" src="https://github.com/user-attachments/assets/53690ef6-53b1-49ac-8baf-fb9b49749b34" />
2. **Teacher:**
   <img width="1901" height="1032" alt="Screenshot 2026-03-26 122716" src="https://github.com/user-attachments/assets/c51cef82-bc5b-4284-bdbd-a56c9f6ae04a" />
3. **Student:**
   <img width="1918" height="1029" alt="Screenshot 2026-03-26 122802" src="https://github.com/user-attachments/assets/8ccbc6c0-2d02-427f-a99f-9f0cf1e5665e" />

   

  
