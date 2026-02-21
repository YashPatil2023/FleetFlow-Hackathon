import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_FLOW = ['Dispatched', 'In Transit', 'Delivered', 'Completed'];

export default function TripsPage() {
    const [trips, setTrips] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight: '', fuel_cost: '' });
    const [filterStatus, setFilterStatus] = useState('');
    const [error, setError] = useState('');
    const { hasRole } = useAuth();

    useEffect(() => { load(); }, []);

    const load = async () => {
        const [t, v, d] = await Promise.all([API.get('/trips'), API.get('/vehicles'), API.get('/drivers')]);
        setTrips(t.data);
        setVehicles(v.data.filter(veh => veh.status === 'Ready'));
        setDrivers(d.data);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleDispatch = async e => {
        e.preventDefault();
        setError('');
        try {
            await API.post('/trips', { ...form, cargo_weight: parseInt(form.cargo_weight), fuel_cost: parseInt(form.fuel_cost) || 0 });
            setShowModal(false);
            setForm({ vehicle_id: '', driver_id: '', origin: '', destination: '', cargo_weight: '', fuel_cost: '' });
            load();
        } catch (err) { setError(err.response?.data?.error || 'Error'); }
    };

    const advanceStatus = async id => {
        try { await API.put(`/trips/${id}/advance`); load(); } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const deleteTrip = async id => {
        if (!confirm('Delete this trip?')) return;
        await API.delete(`/trips/${id}`);
        load();
    };

    const selectedVehicle = vehicles.find(v => v.id === form.vehicle_id);
    const filtered = trips.filter(t => !filterStatus || t.status === filterStatus);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Trip Dispatcher</h1><p className="page-header-sub">Dispatch and manage fleet trips</p></div>
                {hasRole('admin', 'dispatcher') && <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Trip</button>}
            </div>
            <div className="kpi-grid">
                <div className="kpi-card blue"><div className="kpi-label">Total Trips</div><div className="kpi-value">{trips.length}</div></div>
                <div className="kpi-card yellow"><div className="kpi-label">In Transit</div><div className="kpi-value">{trips.filter(t => t.status === 'In Transit').length}</div></div>
                <div className="kpi-card green"><div className="kpi-label">Completed</div><div className="kpi-value">{trips.filter(t => t.status === 'Completed').length}</div></div>
            </div>
            <div className="table-container">
                <div className="table-header">
                    <h3>All Trips</h3>
                    <div className="table-filters">
                        <select onChange={e => setFilterStatus(e.target.value)}><option value="">All Status</option>{STATUS_FLOW.map(s => <option key={s}>{s}</option>)}</select>
                    </div>
                </div>
                {filtered.length === 0 ? <div className="table-empty">No trips found</div> : (
                    <table><thead><tr><th>ID</th><th>Vehicle</th><th>Driver</th><th>Origin</th><th>Destination</th><th>Cargo</th><th>Progress</th><th>Status</th>{hasRole('admin', 'dispatcher') && <th>Actions</th>}</tr></thead>
                        <tbody>
                            {filtered.map(t => {
                                const stIdx = STATUS_FLOW.indexOf(t.status);
                                const statusClass = t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'blue' : t.status === 'Delivered' ? 'cyan' : 'yellow';
                                return (
                                    <tr key={t.id}>
                                        <td className="text-bold">{t.id}</td>
                                        <td>{t.vehicle_name || t.vehicle_id}</td>
                                        <td>{t.driver_name || t.driver_id}</td>
                                        <td>{t.origin}</td><td>{t.destination}</td>
                                        <td>{t.cargo_weight?.toLocaleString()} kg</td>
                                        <td><div className="progress-steps">{STATUS_FLOW.map((s, i) => <div key={s} className={`progress-step ${i <= stIdx ? (i < stIdx ? 'completed' : 'active') : ''}`} />)}</div></td>
                                        <td><span className={`badge badge-${statusClass}`}>{t.status}</span></td>
                                        {hasRole('admin', 'dispatcher') && <td><div className="action-btns">
                                            {t.status !== 'Completed' && <button className="action-btn edit" onClick={() => advanceStatus(t.id)} title="Advance">▶</button>}
                                            <button className="action-btn delete" onClick={() => deleteTrip(t.id)}>✕</button>
                                        </div></td>}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>New Trip Form</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form className="modal-body" onSubmit={handleDispatch}>
                            {error && <div className="form-error">{error}</div>}
                            <div className="form-group">
                                <label>Select Vehicle *</label>
                                <select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required>
                                    <option value="">-- Choose a vehicle --</option>
                                    {vehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.make} {v.model} ({v.capacity}kg)</option>)}
                                </select>
                                {selectedVehicle && <small className="text-muted">Max capacity: {selectedVehicle.capacity.toLocaleString()} kg</small>}
                            </div>
                            <div className="form-group"><label>Cargo Weight (kg) *</label><input name="cargo_weight" type="number" value={form.cargo_weight} onChange={handleChange} required /></div>
                            <div className="form-group">
                                <label>Select Driver *</label>
                                <select name="driver_id" value={form.driver_id} onChange={handleChange} required>
                                    <option value="">-- Choose a driver --</option>
                                    {drivers.map(d => <option key={d.id} value={d.id}>{d.name} (Score: {d.safety_score}%)</option>)}
                                </select>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Origin *</label><input name="origin" value={form.origin} onChange={handleChange} required placeholder="e.g. Mumbai" /></div>
                                <div className="form-group"><label>Destination *</label><input name="destination" value={form.destination} onChange={handleChange} required placeholder="e.g. Pune" /></div>
                            </div>
                            <div className="form-group"><label>Est. Fuel Cost (₹)</label><input name="fuel_cost" type="number" value={form.fuel_cost} onChange={handleChange} /></div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-success">Confirm & Dispatch</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
