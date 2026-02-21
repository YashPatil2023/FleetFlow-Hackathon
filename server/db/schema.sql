-- FleetFlow Database Schema

CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fullname TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'driver' CHECK(role IN ('admin','dispatcher','driver')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY,
    license_plate TEXT UNIQUE NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Truck',
    capacity INTEGER NOT NULL DEFAULT 0,
    odometer INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Ready' CHECK(status IN ('Ready','In Shop')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS drivers (
    id TEXT PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    name TEXT NOT NULL,
    license TEXT NOT NULL,
    expiry TEXT NOT NULL,
    completion_rate REAL DEFAULT 0,
    safety_score REAL DEFAULT 100,
    complaints INTEGER DEFAULT 0,
    duty_status TEXT DEFAULT 'In Duty' CHECK(duty_status IN ('In Duty','Taking a Break','Suspended')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS trips (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id),
    driver_id TEXT REFERENCES drivers(id),
    type TEXT DEFAULT 'Delivery',
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    cargo_weight INTEGER NOT NULL DEFAULT 0,
    fuel_cost REAL DEFAULT 0,
    status TEXT DEFAULT 'Dispatched' CHECK(status IN ('Dispatched','In Transit','Delivered','Completed')),
    date TEXT DEFAULT (date('now')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS maintenance (
    id TEXT PRIMARY KEY,
    vehicle_id TEXT REFERENCES vehicles(id),
    issue TEXT NOT NULL,
    cost REAL DEFAULT 0,
    date TEXT DEFAULT (date('now')),
    status TEXT DEFAULT 'In Progress' CHECK(status IN ('In Progress','Done')),
    created_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    trip_id TEXT REFERENCES trips(id),
    driver_id TEXT REFERENCES drivers(id),
    distance REAL DEFAULT 0,
    fuel_expense REAL DEFAULT 0,
    misc_expense REAL DEFAULT 0,
    status TEXT DEFAULT 'Done',
    created_at TEXT DEFAULT (datetime('now'))
);
