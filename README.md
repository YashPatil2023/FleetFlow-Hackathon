# FleetFlow 🚛

**Modular Fleet & Logistics Management System**

A comprehensive fleet management dashboard built for the Odoo Hackathon. Track vehicles, dispatch trips, manage maintenance, log expenses, monitor driver performance, and analyze operational data — all in one place.

---

## ✨ Features

### 1. 🔐 Authentication
- User login and registration
- Role-based access (Admin, Dispatcher, Driver)
- Session persistence

### 2. 📊 Main Dashboard
- KPI cards: Active Fleet, Maintenance Alerts, Pending Cargo, Utilization Rate
- Recent trips overview with filtering
- Quick action buttons for new trips and vehicles

### 3. 🚗 Vehicle Registry
- Full CRUD for fleet vehicles
- Track make, model, type, capacity, odometer, license plate
- Status management (Ready / In Shop)
- Filter by type and status

### 4. 🗺️ Trip Dispatcher
- Create and dispatch trips with route details
- **Weight validation** — blocks overloaded vehicles 
- **Driver eligibility checks** — expired licenses block assignment
- 4-stage progress tracking: Dispatched → In Transit → Delivered → Completed

### 5. 🔧 Maintenance & Service Logs
- Log repairs and servicing per vehicle
- **"In Shop" Rule** — auto-marks vehicle unavailable when serviced
- Auto-restores "Ready" status when service is completed
- Cost tracking per repair

### 6. 💰 Expense & Fuel Logging
- Track fuel costs and miscellaneous expenses per trip
- Per-vehicle cost aggregation (fuel + maintenance + misc)
- Total cost breakdown

### 7. 👤 Driver Performance & Safety
- Track license details with **expiry warnings**
- Safety Score and Completion Rate with visual progress bars
- Duty Status: In Duty / Taking a Break / Suspended
- **Safety Lock** — expired licenses block new trip assignments

### 8. 📈 Operational Analytics
- Interactive charts (Chart.js): Fuel Trend, Top 5 Costliest Vehicles, Trip Distribution, Driver Radar
- KPI cards: Total Fuel Cost, Fleet ROI, Utilization Rate
- Monthly P&L summary table
- Print/Download report support

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Structure |
| CSS3 | Dark theme, responsive design |
| Vanilla JavaScript | SPA logic, routing |
| localStorage | Data persistence |
| Chart.js (CDN) | Analytics charts |
| Google Fonts (Inter) | Typography |

---

## 🚀 Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/YOUR_USERNAME/FleetFlow.git
   ```
2. Open `index.html` in your browser
3. Login with default credentials:
   - **Username:** `admin`
   - **Password:** `admin`

No build step or server required — it's a pure frontend SPA!

---

## 📁 Project Structure

```
FleetFlow/
├── index.html          # Main entry point
├── css/
│   └── styles.css      # Dark theme & design system
├── js/
│   ├── app.js          # Core: router, data store, utilities
│   ├── auth.js         # Authentication
│   ├── dashboard.js    # Dashboard with KPIs
│   ├── vehicles.js     # Vehicle Registry CRUD
│   ├── trips.js        # Trip Dispatcher
│   ├── maintenance.js  # Maintenance Logs
│   ├── expenses.js     # Expense Tracking
│   ├── drivers.js      # Driver Performance
│   └── analytics.js    # Charts & Reports
├── .gitignore
└── README.md
```

---

## 📜 Business Rules

| Rule | Description |
|---|---|
| **Weight Validation** | Cannot dispatch a trip if cargo exceeds vehicle's max capacity |
| **In Shop Rule** | Creating a maintenance log auto-sets vehicle status to "In Shop" |
| **Safety Lock** | Drivers with expired licenses cannot be assigned to new trips |
| **Status Flow** | Trips follow: Dispatched → In Transit → Delivered → Completed |
| **Auto-Ready** | Completing a maintenance log restores vehicle to "Ready" |

---

## 👥 Team

Built for the **Odoo Hackathon** 🏆

---

## 📄 License

MIT License
