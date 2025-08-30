
# Folio Guide

A full-stack stock portfolio tracker with real-time price updates, price alerts, and a modern UI.

## Features

- Track your stock portfolio and see real-time prices
- Set upper/lower price alerts for each stock
- Add, edit, and remove stocks
- Modern UI with React, Vite, Tailwind CSS, and shadcn-ui
- Node.js/Express backend with Prisma ORM and SQLite
- Yahoo Finance integration for live prices

---

## Getting Started (Local Development)

### Prerequisites
- Node.js (v18+ recommended)
- npm (v9+ recommended)

### 1. Clone the repository
```sh
git clone <YOUR_GIT_URL>
cd folio-guide
```

### 2. Install dependencies
```sh
# Install frontend dependencies
npm install

# Install backend dependencies
cd api
npm install
cd ..
```

### 3. Setup the database
```sh
cd api
npx prisma migrate dev --name init
npx prisma generate
cd ..
```

### 4. Run the backend
```sh
cd api
npm run dev
# Backend runs on http://localhost:4000
```

### 5. Run the frontend
```sh
# In a new terminal, from the project root
npm run dev
# Frontend runs on http://localhost:5173
```

---

## Using Docker Compose

You can run the entire stack (frontend, backend, and SQLite DB) with Docker Compose:

```sh
docker-compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- SQLite DB: persisted in ./api/dev.db

---

## Project Structure

- `/src` - Frontend React app (Vite, TypeScript, shadcn-ui)
- `/api` - Backend Node.js/Express API (Prisma ORM, SQLite)
- `/docker-compose.yml` - Multi-service dev environment

---

## Deployment

For production, use a real database (e.g., Postgres) and build static frontend assets. Example steps:

1. Build frontend: `npm run build`
2. Serve static files with a production server (e.g., Nginx, Vercel, Netlify)
3. Deploy backend with a production database
4. Set environment variables as needed

---

## Environment Variables

- `DATABASE_URL` (backend): Path or connection string for Prisma/SQLite
- `VITE_API_URL` (frontend): URL of the backend API

---

## Technologies Used

- React, Vite, TypeScript, Tailwind CSS, shadcn-ui (frontend)
- Node.js, Express, Prisma ORM, SQLite, yahoo-finance2 (backend)

---

## License

MIT
