const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const fs = require('fs');

const app = express();
const PORT = 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- Database ---
const dbPath = path.join(__dirname, 'db', 'fleetflow.db');
if (!fs.existsSync(dbPath)) {
    console.log('⚠ Database not found. Run: npm run seed');
    process.exit(1);
}
const db = new Database(dbPath);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// Make db available to routes
app.locals.db = db;

// --- Routes ---
app.use('/api/auth', require('./routes/auth'));
app.use('/api/vehicles', require('./routes/vehicles'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/maintenance', require('./routes/maintenance'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/drivers', require('./routes/drivers'));
app.use('/api/analytics', require('./routes/analytics'));

// --- Serve React build in production ---
if (fs.existsSync(path.join(__dirname, '..', 'client', 'dist'))) {
    app.use(express.static(path.join(__dirname, '..', 'client', 'dist')));
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '..', 'client', 'dist', 'index.html'));
    });
}

// --- Error handler ---
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
    console.log(`🚀 FleetFlow API running on http://localhost:${PORT}`);
});
