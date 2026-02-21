const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/vehicles
router.get('/', authenticate, (req, res) => {
    const db = req.app.locals.db;
    const vehicles = db.prepare('SELECT * FROM vehicles ORDER BY created_at DESC').all();
    res.json(vehicles);
});

// GET /api/vehicles/:id
router.get('/:id', authenticate, (req, res) => {
    const db = req.app.locals.db;
    const v = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    if (!v) return res.status(404).json({ error: 'Vehicle not found' });
    res.json(v);
});

// POST /api/vehicles — Admin only
router.post('/', authenticate, authorize('admin'), (req, res) => {
    const { license_plate, make, model, type, capacity, odometer } = req.body;
    if (!license_plate || !make || !model || !capacity) {
        return res.status(400).json({ error: 'Required: license_plate, make, model, capacity' });
    }

    const db = req.app.locals.db;
    const count = db.prepare('SELECT COUNT(*) as c FROM vehicles').get().c;
    const id = 'V' + String(count + 1).padStart(3, '0');

    try {
        db.prepare('INSERT INTO vehicles (id, license_plate, make, model, type, capacity, odometer) VALUES (?,?,?,?,?,?,?)').run(id, license_plate, make, model, type || 'Truck', capacity, odometer || 0);
        const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(id);
        res.status(201).json(vehicle);
    } catch (err) {
        if (err.message.includes('UNIQUE')) {
            return res.status(409).json({ error: 'License plate already exists' });
        }
        throw err;
    }
});

// PUT /api/vehicles/:id — Admin only
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
    const { license_plate, make, model, type, capacity, odometer, status } = req.body;
    const db = req.app.locals.db;

    const existing = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Vehicle not found' });

    db.prepare('UPDATE vehicles SET license_plate=?, make=?, model=?, type=?, capacity=?, odometer=?, status=? WHERE id=?').run(
        license_plate || existing.license_plate, make || existing.make, model || existing.model,
        type || existing.type, capacity ?? existing.capacity, odometer ?? existing.odometer,
        status || existing.status, req.params.id
    );

    const updated = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// DELETE /api/vehicles/:id — Admin only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
    const db = req.app.locals.db;
    const result = db.prepare('DELETE FROM vehicles WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Vehicle not found' });
    res.json({ message: 'Vehicle deleted' });
});

module.exports = router;
