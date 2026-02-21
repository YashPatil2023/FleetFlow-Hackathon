const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/expenses
router.get('/', authenticate, (req, res) => {
    const db = req.app.locals.db;
    let expenses;

    if (req.user.role === 'driver') {
        const driver = db.prepare('SELECT id FROM drivers WHERE user_id = ?').get(req.user.id);
        if (!driver) return res.json([]);
        expenses = db.prepare(`
            SELECT e.*, d.name as driver_name
            FROM expenses e
            LEFT JOIN drivers d ON e.driver_id = d.id
            WHERE e.driver_id = ?
            ORDER BY e.created_at DESC
        `).all(driver.id);
    } else {
        expenses = db.prepare(`
            SELECT e.*, d.name as driver_name
            FROM expenses e
            LEFT JOIN drivers d ON e.driver_id = d.id
            ORDER BY e.created_at DESC
        `).all();
    }
    res.json(expenses);
});

// POST /api/expenses
router.post('/', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const { trip_id, driver_id, distance, fuel_expense, misc_expense } = req.body;
    if (!trip_id || !driver_id) {
        return res.status(400).json({ error: 'Required: trip_id, driver_id' });
    }

    const db = req.app.locals.db;
    const count = db.prepare('SELECT COUNT(*) as c FROM expenses').get().c;
    const id = 'E' + String(count + 1).padStart(3, '0');

    db.prepare('INSERT INTO expenses (id, trip_id, driver_id, distance, fuel_expense, misc_expense) VALUES (?,?,?,?,?,?)').run(
        id, trip_id, driver_id, distance || 0, fuel_expense || 0, misc_expense || 0
    );

    const expense = db.prepare(`
        SELECT e.*, d.name as driver_name
        FROM expenses e
        LEFT JOIN drivers d ON e.driver_id = d.id
        WHERE e.id = ?
    `).get(id);

    res.status(201).json(expense);
});

// DELETE /api/expenses/:id
router.delete('/:id', authenticate, authorize('admin'), (req, res) => {
    const db = req.app.locals.db;
    const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(req.params.id);
    if (result.changes === 0) return res.status(404).json({ error: 'Expense not found' });
    res.json({ message: 'Expense deleted' });
});

module.exports = router;
