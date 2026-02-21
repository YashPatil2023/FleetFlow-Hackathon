const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const STATUS_FLOW = ['Dispatched', 'In Transit', 'Delivered', 'Completed'];

// GET /api/trips
router.get('/', authenticate, (req, res) => {
    const db = req.app.locals.db;
    let trips;

    if (req.user.role === 'driver') {
        // Drivers see only their own trips
        const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ?').get(req.user.id);
        if (!driver) return res.json([]);
        trips = db.prepare(`
            SELECT t.*, v.make || ' ' || v.model as vehicle_name, d.name as driver_name
            FROM trips t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            WHERE t.driver_id = ?
            ORDER BY t.created_at DESC
        `).all(driver.id);
    } else {
        trips = db.prepare(`
            SELECT t.*, v.make || ' ' || v.model as vehicle_name, d.name as driver_name
            FROM trips t
            LEFT JOIN vehicles v ON t.vehicle_id = v.id
            LEFT JOIN drivers d ON t.driver_id = d.id
            ORDER BY t.created_at DESC
        `).all();
    }

    res.json(trips);
});

// POST /api/trips — Admin, Dispatcher
router.post('/', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const { vehicle_id, driver_id, origin, destination, cargo_weight, fuel_cost, type } = req.body;

    if (!vehicle_id || !driver_id || !origin || !destination || !cargo_weight) {
        return res.status(400).json({ error: 'Required: vehicle_id, driver_id, origin, destination, cargo_weight' });
    }

    const db = req.app.locals.db;

    // Weight validation
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicle_id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });
    if (vehicle.status === 'In Shop') return res.status(400).json({ error: 'Vehicle is currently In Shop and cannot be dispatched' });
    if (cargo_weight > vehicle.capacity) {
        return res.status(400).json({ error: `Too heavy! Max capacity is ${vehicle.capacity}kg but cargo is ${cargo_weight}kg.` });
    }

    // Driver eligibility: check license expiry and duty status
    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(driver_id);
    if (!driver) return res.status(404).json({ error: 'Driver not found' });
    const today = new Date().toISOString().split('T')[0];
    if (driver.expiry < today) {
        return res.status(400).json({ error: `Safety Lock: ${driver.name}'s license is expired (${driver.expiry}). Cannot assign.` });
    }
    if (driver.duty_status === 'Suspended') {
        return res.status(400).json({ error: `${driver.name} is currently Suspended and cannot be assigned.` });
    }

    const count = db.prepare('SELECT COUNT(*) as c FROM trips').get().c;
    const id = 'T' + String(count + 1).padStart(3, '0');

    db.prepare(`INSERT INTO trips (id, vehicle_id, driver_id, type, origin, destination, cargo_weight, fuel_cost, status, date) VALUES (?,?,?,?,?,?,?,?,?,?)`).run(
        id, vehicle_id, driver_id, type || 'Delivery', origin, destination, cargo_weight, fuel_cost || 0, 'Dispatched', today
    );

    const trip = db.prepare(`
        SELECT t.*, v.make || ' ' || v.model as vehicle_name, d.name as driver_name
        FROM trips t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = ?
    `).get(id);

    res.status(201).json(trip);
});

// PUT /api/trips/:id/advance — Advance trip status
router.put('/:id/advance', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const db = req.app.locals.db;
    const trip = db.prepare('SELECT * FROM trips WHERE id = ?').get(req.params.id);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const idx = STATUS_FLOW.indexOf(trip.status);
    if (idx >= STATUS_FLOW.length - 1) {
        return res.status(400).json({ error: 'Trip is already completed' });
    }

    const newStatus = STATUS_FLOW[idx + 1];
    db.prepare('UPDATE trips SET status = ? WHERE id = ?').run(newStatus, req.params.id);

    // If completed, update driver completion rate
    if (newStatus === 'Completed') {
        const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(trip.driver_id);
        if (driver) {
            const newRate = Math.min(100, driver.completion_rate + 1);
            db.prepare('UPDATE drivers SET completion_rate = ? WHERE id = ?').run(newRate, driver.id);
        }
    }

    const updated = db.prepare(`
        SELECT t.*, v.make || ' ' || v.model as vehicle_name, d.name as driver_name
        FROM trips t
        LEFT JOIN vehicles v ON t.vehicle_id = v.id
        LEFT JOIN drivers d ON t.driver_id = d.id
        WHERE t.id = ?
    `).get(req.params.id);

    res.json(updated);
});

// DELETE /api/trips/:id
router.delete('/:id', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const db = req.app.locals.db;
    const result = db.prepare('DELETE FROM trips WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Trip not found' });
    res.json({ message: 'Trip deleted' });
});

module.exports = router;
