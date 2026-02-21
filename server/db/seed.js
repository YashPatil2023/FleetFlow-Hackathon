const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'fleetflow.db');

// Remove old DB
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Run schema
const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
db.exec(schema);

// --- Seed Users ---
const hash = bcrypt.hashSync('admin123', 10);
const driverHash = bcrypt.hashSync('driver123', 10);
const dispatchHash = bcrypt.hashSync('dispatch123', 10);

db.prepare(`INSERT INTO users (fullname, email, username, password_hash, role) VALUES (?,?,?,?,?)`).run('Admin User', 'admin@fleetflow.com', 'admin', hash, 'admin');
db.prepare(`INSERT INTO users (fullname, email, username, password_hash, role) VALUES (?,?,?,?,?)`).run('Rajesh Kumar', 'rajesh@fleetflow.com', 'rajesh', driverHash, 'driver');
db.prepare(`INSERT INTO users (fullname, email, username, password_hash, role) VALUES (?,?,?,?,?)`).run('Sunil Patil', 'sunil@fleetflow.com', 'sunil', driverHash, 'driver');
db.prepare(`INSERT INTO users (fullname, email, username, password_hash, role) VALUES (?,?,?,?,?)`).run('Dispatch Manager', 'dispatch@fleetflow.com', 'dispatcher', dispatchHash, 'dispatcher');

// --- Seed Vehicles ---
const vStmt = db.prepare(`INSERT INTO vehicles (id, license_plate, make, model, type, capacity, odometer, status) VALUES (?,?,?,?,?,?,?,?)`);
vStmt.run('V001', 'MH-04-AB-1234', 'Tata', 'Ace', 'Truck', 1000, 34000, 'Ready');
vStmt.run('V002', 'MH-12-CD-5678', 'Mahindra', 'Bolero Pickup', 'Truck', 1500, 52000, 'Ready');
vStmt.run('V003', 'MH-01-EF-9012', 'Ashok Leyland', 'Dost', 'Truck', 2500, 78000, 'In Shop');
vStmt.run('V004', 'GJ-05-GH-3456', 'Eicher', 'Pro 2049', 'Heavy', 5000, 120000, 'Ready');

// --- Seed Drivers ---
const dStmt = db.prepare(`INSERT INTO drivers (id, user_id, name, license, expiry, completion_rate, safety_score, complaints, duty_status) VALUES (?,?,?,?,?,?,?,?,?)`);
dStmt.run('D001', 2, 'Rajesh Kumar', '23223', '2027-06-15', 92, 95, 1, 'In Duty');
dStmt.run('D002', 3, 'Sunil Patil', '23224', '2026-12-30', 88, 91, 2, 'In Duty');
dStmt.run('D003', null, 'Amit Sharma', '23225', '2025-03-10', 95, 89, 0, 'Taking a Break');

// --- Seed Trips ---
const tStmt = db.prepare(`INSERT INTO trips (id, vehicle_id, driver_id, type, origin, destination, cargo_weight, fuel_cost, status, date) VALUES (?,?,?,?,?,?,?,?,?,?)`);
tStmt.run('T001', 'V001', 'D001', 'Delivery', 'Mumbai', 'Pune', 800, 2500, 'Completed', '2026-02-18');
tStmt.run('T002', 'V002', 'D002', 'Delivery', 'Delhi', 'Jaipur', 1200, 3500, 'In Transit', '2026-02-20');

// --- Seed Maintenance ---
db.prepare(`INSERT INTO maintenance (id, vehicle_id, issue, cost, date, status) VALUES (?,?,?,?,?,?)`).run('M001', 'V003', 'Engine Issue', 8500, '2026-02-15', 'In Progress');

// --- Seed Expenses ---
db.prepare(`INSERT INTO expenses (id, trip_id, driver_id, distance, fuel_expense, misc_expense, status) VALUES (?,?,?,?,?,?,?)`).run('E001', 'T001', 'D001', 150, 2500, 500, 'Done');

console.log('✅ Database seeded successfully!');
console.log('   Default logins:');
console.log('   Admin:      admin / admin123');
console.log('   Dispatcher: dispatcher / dispatch123');
console.log('   Driver:     rajesh / driver123');

db.close();
