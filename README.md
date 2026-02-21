# 🚛 FleetFlow — Modular Fleet & Logistics Management System

> A full-stack fleet and logistics management system built with **React**, **Node.js**, **Express**, and **SQLite**. Designed for real-time fleet tracking, trip dispatching, maintenance logging, and operational analytics — all with role-based access control.

---

## 📹 Demo Video

🎬 **YouTube Demo:** [_Video link will be added here_]

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + Vite | Component-based UI with fast HMR |
| **Backend** | Node.js + Express.js | RESTful API server |
| **Database** | SQLite (better-sqlite3) | Lightweight, zero-config DB |
| **Authentication** | JWT + bcrypt | Secure token-based auth with hashed passwords |
| **Charts** | Chart.js + react-chartjs-2 | Interactive analytics visualizations |
| **HTTP Client** | Axios | API communication with JWT interceptors |
| **Routing** | React Router v6 | Client-side navigation with protected routes |

---

## ✨ Features

### 🔐 Authentication & Authorization
- User **Registration** and **Login** with bcrypt-hashed passwords
- **JWT token-based** session management (24h expiry)
- **Role-based access control** — Admin, Dispatcher, Driver
- Auto-logout on token expiry

### 📊 Role-Based Dashboards

| Feature | Admin | Dispatcher | Driver |
|---|---|---|---|
| Dashboard KPIs | ✅ Full overview | ✅ Full overview | ✅ Own stats only |
| Vehicle Registry | ✅ Full CRUD | ✅ View only | ❌ Hidden |
| Trip Dispatcher | ✅ Full CRUD | ✅ Full CRUD | ✅ View own trips |
| Maintenance Logs | ✅ Full CRUD | ✅ Create/View | ❌ Hidden |
| Expenses & Fuel | ✅ Full CRUD | ✅ Create/View | ✅ View own |
| Driver Performance | ✅ Full CRUD | ✅ View only | ✅ Own profile |
| Analytics & Reports | ✅ Full access | ✅ Full access | ❌ Hidden |

### 🚗 Core Modules
1. **Dashboard** — KPI cards (Active Fleet, Maintenance Alerts, Pending Cargo, Utilization Rate) + Recent Trips table
2. **Vehicle Registry** — Add, edit, delete vehicles with license plate, capacity, odometer tracking
3. **Trip Dispatcher** — Dispatch trips with weight validation, 4-stage progress tracking (Dispatched → In Transit → Delivered → Completed)
4. **Maintenance & Service Logs** — Log repairs with auto "In Shop" vehicle status
5. **Expense & Fuel Logging** — Track fuel costs, misc expenses per trip
6. **Driver Performance & Safety** — Safety scores, completion rates, license expiry warnings
7. **Operational Analytics** — 4 interactive charts (Line, Bar, Doughnut, Radar) + Monthly P&L summary

### 📜 Business Rules (Server-Enforced)
- **Weight Validation** — API blocks trips where cargo weight exceeds vehicle capacity
- **In Shop Rule** — Creating a maintenance log automatically sets vehicle status to "In Shop"
- **Auto-Ready** — Marking maintenance as done restores vehicle to "Ready" (if no other active repairs)
- **Safety Lock** — Drivers with expired licenses cannot be assigned to new trips
- **Suspension Block** — Suspended drivers are blocked from trip assignment

---

## 🚀 How to Run This Project

### Prerequisites
- **Node.js** (v18 or higher) — [Download here](https://nodejs.org/)
- **Git** — [Download here](https://git-scm.com/)

### Step-by-Step Setup

```bash
# 1. Clone the repository
git clone https://github.com/YashPatil2023/FleetFlow-Hackathon.git
cd FleetFlow-Hackathon

# 2. Setup Backend
cd server
npm install
npm run seed       # Creates SQLite database with demo data

# 3. Setup Frontend (open a new terminal)
cd client
npm install

# 4. Start Backend (Terminal 1)
cd server
npm start          # Runs on http://localhost:5000

# 5. Start Frontend (Terminal 2)
cd client
npm run dev        # Runs on http://localhost:3000

# 6. Open your browser
# Go to http://localhost:3000
```

### Default Login Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | admin | admin123 |
| **Dispatcher** | dispatcher | dispatch123 |
| **Driver** | rajesh | driver123 |

> 💡 **Tip:** Try logging in with different roles to see how the dashboard and sidebar change!

---

## 📁 Project Structure

```
FleetFlow/
│
├── server/                        # 🖥️ Backend (Node.js + Express)
│   ├── server.js                  # Express entry point
│   ├── package.json               # Backend dependencies
│   ├── middleware/
│   │   └── auth.js                # JWT verification + role-based guards
│   ├── routes/
│   │   ├── auth.js                # POST /register, /login, GET /me
│   │   ├── vehicles.js            # Vehicle CRUD (Admin only write)
│   │   ├── trips.js               # Trip dispatch + weight validation
│   │   ├── maintenance.js         # Service logs + In-Shop auto-rule
│   │   ├── expenses.js            # Expense tracking
│   │   ├── drivers.js             # Driver profiles + safety lock
│   │   └── analytics.js           # Aggregated analytics data
│   └── db/
│       ├── schema.sql             # Database table definitions
│       └── seed.js                # Demo data seeder
│
├── client/                        # ⚛️ Frontend (React + Vite)
│   ├── index.html                 # HTML entry point
│   ├── vite.config.js             # Vite config with API proxy
│   ├── package.json               # Frontend dependencies
│   └── src/
│       ├── main.jsx               # React entry point
│       ├── App.jsx                # Router + ProtectedRoute
│       ├── App.css                # Full dark theme design system
│       ├── context/
│       │   └── AuthContext.jsx     # Auth state + JWT management
│       ├── services/
│       │   └── api.js             # Axios instance with JWT interceptor
│       ├── components/
│       │   └── Sidebar.jsx        # Role-based navigation sidebar
│       └── pages/
│           ├── AuthPage.jsx       # Login / Register page
│           ├── Dashboard.jsx      # Role-aware dashboard
│           ├── VehiclesPage.jsx   # Vehicle registry table + modal
│           ├── TripsPage.jsx      # Trip dispatcher + progress tracking
│           ├── MaintenancePage.jsx # Service logs management
│           ├── ExpensesPage.jsx   # Expense & fuel logging
│           ├── DriversPage.jsx    # Driver profiles + safety scores
│           └── AnalyticsPage.jsx  # Charts + monthly P&L table
│
├── README.md
└── .gitignore
```

---

## 🔌 API Endpoints

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Authenticated | Get current user info |
| GET | `/api/vehicles` | Authenticated | List all vehicles |
| POST | `/api/vehicles` | Admin | Create vehicle |
| PUT | `/api/vehicles/:id` | Admin | Update vehicle |
| DELETE | `/api/vehicles/:id` | Admin | Delete vehicle |
| GET | `/api/trips` | Authenticated | List trips (role-filtered) |
| POST | `/api/trips` | Admin, Dispatcher | Dispatch new trip |
| PUT | `/api/trips/:id/advance` | Admin, Dispatcher | Advance trip status |
| GET | `/api/maintenance` | Admin, Dispatcher | List maintenance logs |
| POST | `/api/maintenance` | Admin, Dispatcher | Create log (auto In-Shop) |
| PUT | `/api/maintenance/:id/done` | Admin, Dispatcher | Mark complete |
| GET | `/api/expenses` | Authenticated | List expenses (role-filtered) |
| GET | `/api/drivers` | Authenticated | List drivers (role-filtered) |
| GET | `/api/analytics` | Admin, Dispatcher | Aggregated analytics data |

---

## 🔒 Security

- Passwords are **never stored in plain text** — hashed with `bcrypt` (salt rounds: 10)
- All API routes are protected with **JWT middleware**
- Role-based authorization prevents unauthorized access at both **UI and API** level
- Auto-logout on expired or invalid tokens

---

## 🎨 Design

- **Dark theme** with vibrant accent colors (purple, blue, green, red, yellow)
- **Glassmorphism** effects on cards and modals
- **Smooth animations** — page transitions, hover effects, KPI card lifts
- **Responsive** layout for different screen sizes
- **Inter font** from Google Fonts for premium typography

---

## 👥 Team

| Name | Role |
|---|---|
| Yash Patil | Team Lead & Full-Stack Developer |
| Sneha Kulkarni | Frontend Developer |
| Rohit Deshmukh | Backend Developer |

---

## 📄 License

This project was built for the **Odoo Hackathon 2026** 🏆

---

*Built with ❤️ using React, Node.js, Express & SQLite*
