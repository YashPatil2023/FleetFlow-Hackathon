import { useState, useEffect } from 'react';
import API from '../services/api';

export default function MaintenancePage() {
    const [logs, setLogs] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({ vehicle_id: '', issue: '', cost: '0', date: new Date().toISOString().split('T')[0] });
    const [filterStatus, setFilterStatus] = useState('');

    useEffect(() => { load(); }, []);
    const load = async () => {
        const [m, v] = await Promise.all([API.get('/maintenance'), API.get('/vehicles')]);
        setLogs(m.data); setVehicles(v.data);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async e => {
        e.preventDefault();
        try {
            await API.post('/maintenance', { ...form, cost: parseInt(form.cost) || 0 });
            setShowModal(false); setForm({ vehicle_id: '', issue: '', cost: '0', date: new Date().toISOString().split('T')[0] }); load();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const markDone = async id => { await API.put(`/maintenance/${id}/done`); load(); };
    const deleteMaint = async id => { if (!confirm('Delete?')) return; await API.delete(`/maintenance/${id}`); load(); };

    const fmt = n => '₹' + Number(n || 0).toLocaleString('en-IN');
    const filtered = logs.filter(l => !filterStatus || l.status === filterStatus);
    const totalCost = logs.reduce((s, l) => s + (l.cost || 0), 0);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Maintenance & Service Logs</h1><p className="page-header-sub">Track vehicle repairs and servicing</p></div>
                <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Service</button>
            </div>
            <div className="kpi-grid">
                <div className="kpi-card red"><div className="kpi-label">Active Repairs</div><div className="kpi-value">{logs.filter(l => l.status === 'In Progress').length}</div></div>
                <div className="kpi-card green"><div className="kpi-label">Completed</div><div className="kpi-value">{logs.filter(l => l.status === 'Done').length}</div></div>
                <div className="kpi-card yellow"><div className="kpi-label">Total Cost</div><div className="kpi-value">{fmt(totalCost)}</div></div>
            </div>
            <div className="table-container">
                <div className="table-header"><h3>Service Logs</h3>
                    <div className="table-filters"><select onChange={e => setFilterStatus(e.target.value)}><option value="">All</option><option>In Progress</option><option>Done</option></select></div>
                </div>
                {filtered.length === 0 ? <div className="table-empty">No logs</div> : (
                    <table><thead><tr><th>ID</th><th>Vehicle</th><th>Issue</th><th>Cost</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>{filtered.map(l => (
                            <tr key={l.id}><td className="text-bold">{l.id}</td><td>{l.vehicle_name || l.vehicle_id}</td><td>{l.issue}</td><td>{fmt(l.cost)}</td><td className="text-muted">{l.date}</td>
                                <td><span className={`badge ${l.status === 'Done' ? 'badge-green' : 'badge-orange'}`}>{l.status}</span></td>
                                <td><div className="action-btns">{l.status === 'In Progress' && <button className="action-btn edit" onClick={() => markDone(l.id)}>✓</button>}<button className="action-btn delete" onClick={() => deleteMaint(l.id)}>✕</button></div></td>
                            </tr>
                        ))}</tbody></table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>New Service Log</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group"><label>Vehicle *</label><select name="vehicle_id" value={form.vehicle_id} onChange={handleChange} required><option value="">-- Select --</option>{vehicles.map(v => <option key={v.id} value={v.id}>{v.id} — {v.make} {v.model}</option>)}</select></div>
                            <div className="form-group"><label>Issue / Service *</label><input name="issue" value={form.issue} onChange={handleChange} required placeholder="e.g. Oil change" /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Cost (₹)</label><input name="cost" type="number" value={form.cost} onChange={handleChange} /></div>
                                <div className="form-group"><label>Date</label><input name="date" type="date" value={form.date} onChange={handleChange} /></div>
                            </div>
                            <div className="info-box warning">⚠ Vehicle will be automatically set to "In Shop"</div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Create Log</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
