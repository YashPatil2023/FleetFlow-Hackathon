const express = require('express');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// GET /api/analytics — Admin, Dispatcher only
router.get('/', authenticate, authorize('admin', 'dispatcher'), (req, res) => {
    const db = req.app.locals.db;

    // KPIs
    const vehicles = db.prepare('SELECT * FROM vehicles').all();
    const trips = db.prepare('SELECT * FROM trips').all();
    const expenses = db.prepare('SELECT * FROM expenses').all();
    const maintenance = db.prepare('SELECT * FROM maintenance').all();
    const drivers = db.prepare('SELECT * FROM drivers').all();

    const totalFuel = expenses.reduce((s, e) => s + (e.fuel_expense || 0), 0);
    const totalMaint = maintenance.reduce((s, m) => s + (m.cost || 0), 0);
    const totalRevenue = trips.length * 5000;
    const totalCost = totalFuel + totalMaint;
    const roi = totalCost > 0 ? (((totalRevenue - totalCost) / totalCost) * 100).toFixed(1) : 0;
    const activeFleet = vehicles.filter(v => v.status === 'Ready').length;
    const utilRate = vehicles.length > 0 ? Math.round((activeFleet / vehicles.length) * 100) : 0;

    // Trip status distribution
    const tripStatusDist = {
        Dispatched: trips.filter(t => t.status === 'Dispatched').length,
        'In Transit': trips.filter(t => t.status === 'In Transit').length,
        Delivered: trips.filter(t => t.status === 'Delivered').length,
        Completed: trips.filter(t => t.status === 'Completed').length,
    };

    // Per-vehicle costs
    const vehicleCosts = {};
    vehicles.forEach(v => { vehicleCosts[v.id] = { id: v.id, name: v.make + ' ' + v.model, fuel: 0, maint: 0, misc: 0 }; });
    expenses.forEach(e => {
        const trip = trips.find(t => t.id === e.trip_id);
        if (trip && vehicleCosts[trip.vehicle_id]) {
            vehicleCosts[trip.vehicle_id].fuel += e.fuel_expense || 0;
            vehicleCosts[trip.vehicle_id].misc += e.misc_expense || 0;
        }
    });
    maintenance.forEach(m => {
        if (vehicleCosts[m.vehicle_id]) vehicleCosts[m.vehicle_id].maint += m.cost || 0;
    });
    const topCostly = Object.values(vehicleCosts)
        .map(v => ({ ...v, total: v.fuel + v.maint + v.misc }))
        .sort((a, b) => b.total - a.total)
        .slice(0, 5);

    // Driver scores
    const driverScores = drivers.map(d => ({
        name: d.name,
        safety_score: d.safety_score,
        completion_rate: d.completion_rate
    }));

    // Monthly summary (simulated based on real data)
    const months = ['Oct 2025', 'Nov 2025', 'Dec 2025', 'Jan 2026', 'Feb 2026'];
    const fractions = [0.18, 0.22, 0.2, 0.18, 0.22];
    const monthlySummary = months.map((month, i) => ({
        month,
        revenue: Math.round(totalRevenue * fractions[i]),
        fuel: Math.round(totalFuel * fractions[i]),
        maintenance: Math.round(totalMaint * fractions[i]),
        net: Math.round(totalRevenue * fractions[i]) - Math.round(totalFuel * fractions[i]) - Math.round(totalMaint * fractions[i])
    }));

    res.json({
        kpis: {
            totalFuel, totalMaint, totalRevenue, totalCost, roi: parseFloat(roi),
            activeFleet, totalVehicles: vehicles.length, utilRate,
            totalTrips: trips.length, totalDrivers: drivers.length
        },
        tripStatusDist,
        topCostlyVehicles: topCostly,
        driverScores,
        monthlySummary
    });
});

module.exports = router;
