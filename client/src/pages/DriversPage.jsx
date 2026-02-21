import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function DriversPage() {
    const [drivers, setDrivers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', license: '', expiry: '', duty_status: 'In Duty', safety_score: '100', completion_rate: '0', complaints: '0' });
    const [filterStatus, setFilterStatus] = useState('');
    const { hasRole } = useAuth();

    useEffect(() => { load(); }, []);
    const load = async () => { const res = await API.get('/drivers'); setDrivers(res.data); };
    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async e => {
        e.preventDefault();
        try {
            const data = { ...form, safety_score: parseFloat(form.safety_score), completion_rate: parseFloat(form.completion_rate), complaints: parseInt(form.complaints) };
            if (editing) { await API.put(`/drivers/${editing}`, data); }
            else { await API.post('/drivers', data); }
            setShowModal(false); setEditing(null); load();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const openEdit = d => {
        setEditing(d.id);
        setForm({ name: d.name, license: d.license, expiry: d.expiry, duty_status: d.duty_status, safety_score: String(d.safety_score), completion_rate: String(d.completion_rate), complaints: String(d.complaints) });
        setShowModal(true);
    };

    const deleteDriver = async id => { if (!confirm('Delete?')) return; await API.delete(`/drivers/${id}`); load(); };

    const today = new Date().toISOString().split('T')[0];
    const filtered = drivers.filter(d => !filterStatus || d.duty_status === filterStatus);

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Driver Performance & Safety</h1><p className="page-header-sub">Monitor driver profiles, safety scores, and license status</p></div>
                {hasRole('admin') && <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ name: '', license: '', expiry: '', duty_status: 'In Duty', safety_score: '100', completion_rate: '0', complaints: '0' }); setShowModal(true); }}>+ Add Driver</button>}
            </div>
            <div className="kpi-grid">
                <div className="kpi-card blue"><div className="kpi-label">Total</div><div className="kpi-value">{drivers.length}</div></div>
                <div className="kpi-card green"><div className="kpi-label">In Duty</div><div className="kpi-value">{drivers.filter(d => d.duty_status === 'In Duty').length}</div></div>
                <div className="kpi-card yellow"><div className="kpi-label">On Break</div><div className="kpi-value">{drivers.filter(d => d.duty_status === 'Taking a Break').length}</div></div>
                <div className="kpi-card red"><div className="kpi-label">Suspended</div><div className="kpi-value">{drivers.filter(d => d.duty_status === 'Suspended').length}</div></div>
            </div>
            <div className="table-container">
                <div className="table-header"><h3>Driver Profiles</h3>
                    <div className="table-filters"><select onChange={e => setFilterStatus(e.target.value)}><option value="">All</option><option>In Duty</option><option>Taking a Break</option><option>Suspended</option></select></div>
                </div>
                {filtered.length === 0 ? <div className="table-empty">No drivers</div> : (
                    <table><thead><tr><th>Name</th><th>License</th><th>Expiry</th><th>Completion</th><th>Safety</th><th>Complaints</th><th>Status</th>{hasRole('admin') && <th>Actions</th>}</tr></thead>
                        <tbody>{filtered.map(d => {
                            const expired = d.expiry < today;
                            const scoreClass = d.safety_score >= 90 ? 'green' : d.safety_score >= 70 ? 'yellow' : 'red';
                            const dutyClass = d.duty_status === 'In Duty' ? 'green' : d.duty_status === 'Taking a Break' ? 'yellow' : 'red';
                            return (
                                <tr key={d.id}><td className="text-bold">{d.name}</td><td>{d.license}</td>
                                    <td><span className={expired ? 'text-red' : ''}>{d.expiry}</span>{expired && <><br /><small className="text-red">⚠ EXPIRED</small></>}</td>
                                    <td><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><div className="mini-bar"><div className="mini-bar-fill" style={{ width: `${d.completion_rate}%` }} /></div><span>{d.completion_rate}%</span></div></td>
                                    <td><span className={`badge badge-${scoreClass}`}>{d.safety_score}%</span></td>
                                    <td>{d.complaints}</td>
                                    <td><span className={`badge badge-${dutyClass}`}>{d.duty_status}</span></td>
                                    {hasRole('admin') && <td><div className="action-btns"><button className="action-btn edit" onClick={() => openEdit(d)}>✎</button><button className="action-btn delete" onClick={() => deleteDriver(d.id)}>✕</button></div></td>}
                                </tr>
                            );
                        })}</tbody></table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>{editing ? 'Edit Driver' : 'Add Driver'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group"><label>Full Name *</label><input name="name" value={form.name} onChange={handleChange} required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>License # *</label><input name="license" value={form.license} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Expiry *</label><input name="expiry" type="date" value={form.expiry} onChange={handleChange} required /></div>
                            </div>
                            <div className="form-group"><label>Duty Status</label><select name="duty_status" value={form.duty_status} onChange={handleChange}><option>In Duty</option><option>Taking a Break</option><option>Suspended</option></select></div>
                            {editing && <div className="form-row">
                                <div className="form-group"><label>Safety Score</label><input name="safety_score" type="number" value={form.safety_score} onChange={handleChange} min="0" max="100" /></div>
                                <div className="form-group"><label>Completion Rate</label><input name="completion_rate" type="number" value={form.completion_rate} onChange={handleChange} min="0" max="100" /></div>
                            </div>}
                            <div className="info-box info">ℹ Drivers with expired licenses are automatically blocked from new trips.</div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Add'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
