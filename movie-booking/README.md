# 🎬 BookMyShow Clone - Online Movie Ticket Booking System

A full-stack movie ticket booking system built with **React.js**, **Node.js + Express**, and **MongoDB**.

---

## 📁 Project Structure

```
movie-booking/
├── backend/
│   ├── models/          → User, Movie, Booking schemas
│   ├── routes/          → Auth, Movie, Booking routes
│   ├── controllers/     → Business logic
│   ├── middleware/      → JWT auth + role middleware
│   ├── server.js        → Express entry point
│   ├── seed.js          → Demo data seeder
│   └── .env             → Environment variables
└── frontend/
    └── src/
        ├── components/  → Navbar, MovieCard
        ├── pages/       → Login, Register, Home, Detail, Booking, Admin
        ├── services/    → Axios API calls
        └── context/     → Auth context (JWT)
```

---

## ⚡ Quick Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

---

### 1️⃣ Clone / Extract the project

```bash
cd movie-booking
```

---

### 2️⃣ Backend Setup

```bash
cd backend
npm install
```

**Configure `.env`** (already set up, edit if needed):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/moviebooking
JWT_SECRET=bookmyshow_super_secret_jwt_key_2024
NODE_ENV=development
```

**Seed the database** (14 movies + admin + user):
```bash
npm run seed
```

**Start the backend:**
```bash
npm run dev    # Development (with nodemon)
# OR
npm start      # Production
```

Backend runs at: `http://localhost:5000`

---

### 3️⃣ Frontend Setup

Open a **new terminal**:

```bash
cd frontend
npm install
npm start
```

Frontend runs at: `http://localhost:3000`

---

## 🔐 Demo Login Credentials

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@bookmyshow.com     | admin123   |
| User  | user@example.com         | user123    |

> 💡 **Tip:** You can also use the **Demo User / Demo Admin** buttons on the login page!

---

## 🌐 API Endpoints

### Auth
| Method | Endpoint             | Access  | Description       |
|--------|----------------------|---------|-------------------|
| POST   | /api/auth/register   | Public  | Register user     |
| POST   | /api/auth/login      | Public  | Login             |
| GET    | /api/auth/profile    | User    | Get own profile   |

### Movies
| Method | Endpoint              | Access  | Description        |
|--------|-----------------------|---------|--------------------|
| GET    | /api/movies           | Public  | Get all movies     |
| GET    | /api/movies/:id       | Public  | Get single movie   |
| GET    | /api/movies/admin/all | Admin   | Get all (admin)    |
| POST   | /api/movies           | Admin   | Add new movie      |
| PUT    | /api/movies/:id       | Admin   | Update movie       |
| DELETE | /api/movies/:id       | Admin   | Delete movie       |

### Bookings
| Method | Endpoint                | Access  | Description         |
|--------|-------------------------|---------|---------------------|
| POST   | /api/bookings           | User    | Create booking      |
| GET    | /api/bookings/my        | User    | My bookings         |
| GET    | /api/bookings/all       | Admin   | All bookings        |
| GET    | /api/bookings/stats     | Admin   | Dashboard stats     |
| PUT    | /api/bookings/:id/cancel| User    | Cancel booking      |

---

## 🎬 14 Demo Movies Included

1. Kalki 2898-AD (Telugu · Sci-Fi)
2. Stree 2 (Hindi · Comedy)
3. Pushpa 2: The Rule (Telugu · Action)
4. Singham Again (Hindi · Action)
5. The Marvels (English · Superhero)
6. Animal (Hindi · Action)
7. Jawan (Hindi · Action)
8. RRR (Telugu · Action)
9. Leo (Tamil · Action)
10. Oppenheimer (English · Drama)
11. Dunki (Hindi · Drama)
12. Salaar (Kannada · Action)
13. Rocky Aur Rani Kii Prem Kahaani (Hindi · Romance)
14. Pathaan (Hindi · Action)

---

## ✨ Features

### 👤 User
- Register & Login with JWT
- Browse 14 movies with search + filter by language & genre
- View movie details (cast, rating, showtimes, seat availability)
- Visual seat selection with seat map
- Book tickets (seats reduce in real-time)
- View booking history with Booking ID
- Cancel bookings (seats are restored)

### 🛠️ Admin
- Admin dashboard with revenue/booking stats
- Add / Edit / Delete movies
- View all bookings with customer details
- Manage seat availability

---

## 🛠️ Tech Stack

| Layer     | Technology                              |
|-----------|-----------------------------------------|
| Frontend  | React 18, React Router 6, Axios        |
| Styling   | Custom CSS (BookMyShow dark theme)      |
| Backend   | Node.js, Express.js                     |
| Database  | MongoDB, Mongoose                       |
| Auth      | JWT, bcryptjs                           |
| Notifications | react-hot-toast                    |

---

## 🔧 Troubleshooting

**MongoDB connection error:**
```bash
# Make sure MongoDB is running locally:
mongod --dbpath /data/db

# OR use MongoDB Atlas - update MONGO_URI in .env:
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/moviebooking
```

**Port already in use:**
```bash
# Change PORT in backend/.env
PORT=5001
```

**CORS errors:**
- Ensure backend is running on port 5000
- Frontend proxy in package.json points to `http://localhost:5000`

**npm install fails:**
```bash
npm install --legacy-peer-deps
```

---

## 📦 Build for Production

```bash
# Frontend
cd frontend
npm run build

# Serve backend + built frontend
cd backend
# Copy frontend/build to backend/public
# Add: app.use(express.static('public'))
npm start
```

---

## 🎨 Color Scheme

| Color         | Hex       | Usage              |
|---------------|-----------|--------------------|
| Primary Red   | #e02d2d   | Buttons, accents   |
| Dark BG       | #0f0f1a   | Main background    |
| Card BG       | #1e1e30   | Cards, panels      |
| Gold          | #f59e0b   | Ratings, warnings  |
| Green         | #10b981   | Success, available |

---

Made with ❤️ — BookMyShow Clone
