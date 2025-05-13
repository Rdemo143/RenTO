# RenTO - Property Management System

A full-stack web application for property management.

## Project Structure

- `frontend/` - React.js frontend application
- `backend/` - Node.js/Express backend API

## Development

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Deployment

- Frontend: Deployed on Vercel (https://ren-to.vercel.app/)
- Backend: Deployed on Render (https://rento-fk3u.onrender.com/)

## Environment Variables

### Frontend
- `VITE_API_URL` - Backend API URL

### Backend
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT authentication 