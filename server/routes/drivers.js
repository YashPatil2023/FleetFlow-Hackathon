const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/drivers
router.get('/', authenticate, (req, res) => {
    const db = req.app.locals.db;

    if (req.user.role === 'driver') {
        // Driver: only their own profile
        const driver = db.prepare('SELECT * FROM drivers WHERE user_id = ?').get(req.user.id);
        return res.json(driver ? [driver] : []);
    }

    const drivers = db.prepare('SELECT * FROM drivers ORDER BY name').all();
    res.json(drivers);
});

// POST /api/drivers — Admin only
router.post('/', authenticate, authorize('admin'), (req, res) => {
    const { name, license, expiry, duty_status } = req.body;
    if (!name || !license || !expiry) {
        return res.status(400).json({ error: 'Required: name, license, expiry' });
    }

    const db = req.app.locals.db;
    const count = db.prepare('SELECT COUNT(*) as c FROM drivers').get().c;
    const id = 'D' + String(count + 1).padStart(3, '0');

    db.prepare('INSERT INTO drivers (id, name, license, expiry, duty_status) VALUES (?,?,?,?,?)').run(
        id, name, license, expiry, duty_status || 'In Duty'
    );

    const driver = db.prepare('SELECT * FROM drivers WHERE id = ?').get(id);
    res.status(201).json(driver);
});

// PUT /api/drivers/:id — Admin only
router.put('/:id', authenticate, authorize('admin'), (req, res) => {
    const { name, license, expiry, duty_status, safety_score, completion_rate, complaints } = req.body;
    const db = req.app.locals.db;

    const existing = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
    if (!existing) return res.status(404).json({ error: 'Driver not found' });

    db.prepare('UPDATE drivers SET name=?, license=?, expiry=?, duty_status=?, safety_score=?, completion_rate=?, complaints=? WHERE id=?').run(
        name || existing.name, license || existing.license, expiry || existing.expiry,
        duty_status || existing.duty_status, safety_score ?? existing.safety_score,
        completion_rate ?? existing.completion_rate, complaints ?? existing.complaints,
        req.params.id
    );

    const updated = db.prepare('SELECT * FROM drivers WHERE id = ?').get(req.params.id);
    res.json(updated);
});

// DELETE /api/drivers/:id — Admin only
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
    const db = req.app.locals.db;
    const result = db.prepare('DELETE FROM drivers WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json({ message: 'Driver deleted' });
});

module.exports = router;
