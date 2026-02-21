const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/maintenance
router.get('/', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const db = req.app.locals.db;
    const logs = db.prepare(`
        SELECT m.*, v.make || ' ' || v.model as vehicle_name
        FROM maintenance m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        ORDER BY m.created_at DESC
    `).all();
    res.json(logs);
});

// POST /api/maintenance — Admin, Dispatcher
router.post('/', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const { vehicle_id, issue, cost, date } = req.body;
    if (!vehicle_id || !issue) {
        return res.status(400).json({ error: 'Required: vehicle_id, issue' });
    }

    const db = req.app.locals.db;
    const vehicle = db.prepare('SELECT * FROM vehicles WHERE id = ?').get(vehicle_id);
    if (!vehicle) return res.status(404).json({ error: 'Vehicle not found' });

    const count = db.prepare('SELECT COUNT(*) as c FROM maintenance').get().c;
    const id = 'M' + String(count + 1).padStart(3, '0');

    db.prepare('INSERT INTO maintenance (id, vehicle_id, issue, cost, date) VALUES (?,?,?,?,?)').run(
        id, vehicle_id, issue, cost || 0, date || new Date().toISOString().split('T')[0]
    );

    // Auto "In Shop" rule
    db.prepare('UPDATE vehicles SET status = ? WHERE id = ?').run('In Shop', vehicle_id);

    const log = db.prepare(`
        SELECT m.*, v.make || ' ' || v.model as vehicle_name
        FROM maintenance m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        WHERE m.id = ?
    `).get(id);

    res.status(201).json({ ...log, notice: 'Vehicle automatically marked as "In Shop"' });
});

// PUT /api/maintenance/:id/done — Mark complete
router.put('/:id/done', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const db = req.app.locals.db;
    const log = db.prepare('SELECT * FROM maintenance WHERE id = ?').get(req.params.id);
    if (!log) return res.status(404).json({ error: 'Log not found' });

    db.prepare('UPDATE maintenance SET status = ? WHERE id = ?').run('Done', req.params.id);

    // Check if any other active maintenance for this vehicle
    const otherActive = db.prepare('SELECT COUNT(*) as c FROM maintenance WHERE vehicle_id = ? AND status = ? AND id != ?').get(log.vehicle_id, 'In Progress', req.params.id);
    if (otherActive.c === 0) {
        db.prepare('UPDATE vehicles SET status = ? WHERE id = ?').run('Ready', log.vehicle_id);
    }

    const updated = db.prepare(`
        SELECT m.*, v.make || ' ' || v.model as vehicle_name
        FROM maintenance m
        LEFT JOIN vehicles v ON m.vehicle_id = v.id
        WHERE m.id = ?
    `).get(req.params.id);

    res.json(updated);
});

// DELETE /api/maintenance/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
    const db = req.app.locals.db;
    const result = db.prepare('DELETE FROM maintenance WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Log not found' });
    res.json({ message: 'Maintenance log deleted' });
});

module.exports = router;
