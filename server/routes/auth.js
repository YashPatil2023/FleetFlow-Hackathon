const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { JWT_SECRET, authenticate } = require('../middleware/auth');

const router = express.Router();

// POST /api/auth/register
router.post('/register', (req, res) => {
    const { fullname, email, username, password, role } = req.body;

    if (!fullname || !email || !username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const validRoles = ['admin', 'dispatcher', 'driver'];
    const userRole = validRoles.includes(role) ? role : 'driver';

    const db = req.app.locals.db;

    // Check if username or email exists
    const existing = db.prepare('SELECT id FROM users WHERE username = ? OR email = ?').get(username, email);
    if (existing) {
        return res.status(409).json({ error: 'Username or email already exists' });
    }

    const password_hash = bcrypt.hashSync(password, 10);
    const result = db.prepare(
        'INSERT INTO users (fullname, email, username, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(fullname, email, username, password_hash, userRole);

    // If role is driver, also create a driver profile
    if (userRole === 'driver') {
        const driverCount = db.prepare('SELECT COUNT(*) as c FROM drivers').get().c;
        const driverId = 'D' + String(driverCount + 1).padStart(3, '0');
        db.prepare(
            'INSERT INTO drivers (id, user_id, name, license, expiry, completion_rate, safety_score, complaints, duty_status) VALUES (?,?,?,?,?,?,?,?,?)'
        ).run(driverId, result.lastInsertRowid, fullname, '', '2027-01-01', 0, 100, 0, 'In Duty');
    }

    const token = jwt.sign(
        { id: result.lastInsertRowid, username, role: userRole, fullname },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.status(201).json({
        message: 'Registration successful',
        token,
        user: { id: result.lastInsertRowid, fullname, email, username, role: userRole }
    });
});

// POST /api/auth/login
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const db = req.app.locals.db;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
        return res.status(401).json({ error: 'Invalid username or password' });
    }

    const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role, fullname: user.fullname },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({
        message: 'Login successful',
        token,
        user: { id: user.id, fullname: user.fullname, email: user.email, username: user.username, role: user.role }
    });
});

// GET /api/auth/me — get current user info
router.get('/me', authenticate, (req, res) => {
    const db = req.app.locals.db;
    const user = db.prepare('SELECT id, fullname, email, username, role, created_at FROM users WHERE id = ?').get(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
});

module.exports = router;
