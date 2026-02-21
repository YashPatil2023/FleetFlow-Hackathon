import { useState, useEffect } from 'react';
import API from '../services/api';

export default function ExpensesPage() {
    const [expenses, setExpenses] = useState([]);
    const [trips, setTrips] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ trip_id: '', driver_id: '', fuel_expense: '0', misc_expense: '0', distance: '' });

    useEffect(() => { load(); }, []);
    const load = async () => {
        const [e, t, d] = await Promise.all([API.get('/expenses'), API.get('/trips'), API.get('/drivers')]);
        setExpenses(e.data); setTrips(t.data); setDrivers(d.data);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');

    const handleSave = async e => {
        e.preventDefault();
        try {
            await API.post('/expenses', { ...form, fuel_expense: parseInt(form.fuel_expense) || 0, misc_expense: parseInt(form.misc_expense) || 0, distance: parseInt(form.distance) || 0 });
            setShowModal(false); setForm({ trip_id: '', driver_id: '', fuel_expense: '0', misc_expense: '0', distance: '' }); load();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const deleteExp = async id => { if (!confirm('Delete?')) return; await API.delete(`/expenses/${id}`); load(); };

    const totalFuel = expenses.reduce((s, e) => s + (e.fuel_expense || 0), 0);
    const totalMisc = expenses.reduce((s, e) => s + (e.misc_expense || 0), 0);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Expense & Fuel Logging</h1><p className="page-header-sub">Track trip expenses and fuel costs</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ Add Expense</button>
            </div>
            <div className="kpi-grid">
                <div className="kpi-card yellow"><div className="kpi-label">Fuel Cost</div><div className="kpi-value">{fmt(totalFuel)}</div></div>
                <div className="kpi-card red"><div className="kpi-label">Misc.</div><div className="kpi-value">{fmt(totalMisc)}</div></div>
                <div className="kpi-card blue"><div className="kpi-label">Total</div><div className="kpi-value">{fmt(totalFuel + totalMisc)}</div></div>
            </div>
            <div className="table-container">
                <div className="table-header"><h3>Expense Records</h3></div>
                {expenses.length === 0 ? <div className="table-empty">No expenses logged</div> : (
                    <table><thead><tr><th>ID</th><th>Trip</th><th>Driver</th><th>Distance</th><th>Fuel</th><th>Misc.</th><th>Total</th><th>Actions</th></tr></thead>
                        <tbody>{expenses.map(e => (
                            <tr key={e.id}><td className="text-bold">{e.id}</td><td>{e.trip_id}</td><td>{e.driver_name || e.driver_id}</td>
                                <td>{e.distance ? e.distance.toLocaleString() + ' km' : '—'}</td>
                                <td>{fmt(e.fuel_expense)}</td><td>{fmt(e.misc_expense)}</td>
                                <td className="text-bold">{fmt((e.fuel_expense || 0) + (e.misc_expense || 0))}</td>
                                <td><div className="action-btns"><button className="action-btn delete" onClick={() => deleteExp(e.id)}>✕</button></div></td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>Add Expense</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group"><label>Trip *</label><select name="trip_id" value={form.trip_id} onChange={handleChange} required><option value="">-- Select --</option>{trips.map(t => <option key={t.id} value={t.id}>{t.id} — {t.origin} → {t.destination}</option>)}</select></div>
                            <div className="form-group"><label>Driver *</label><select name="driver_id" value={form.driver_id} onChange={handleChange} required><option value="">-- Select --</option>{drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
                            <div className="form-row">
                                <div className="form-group"><label>Fuel (₹)</label><input name="fuel_expense" type="number" value={form.fuel_expense} onChange={handleChange} /></div>
                                <div className="form-group"><label>Misc. (₹)</label><input name="misc_expense" type="number" value={form.misc_expense} onChange={handleChange} /></div>
                            </div>
                            <div className="form-group"><label>Distance (km)</label><input name="distance" type="number" value={form.distance} onChange={handleChange} /></div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
