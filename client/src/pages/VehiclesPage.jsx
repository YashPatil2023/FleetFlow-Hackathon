import { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function VehiclesPage() {
    const [vehicles, setVehicles] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ license_plate: '', make: '', model: '', type: 'Truck', capacity: '', odometer: '0', status: 'Ready' });
    const [filter, setFilter] = useState({ type: '', status: '' });
    const { hasRole } = useAuth();

    useEffect(() => { load(); }, []);

    const load = async () => {
        const res = await API.get('/vehicles');
        setVehicles(res.data);
    };

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSave = async e => {
        e.preventDefault();
        try {
            if (editing) {
                await API.put(`/vehicles/${editing}`, { ...form, capacity: parseInt(form.capacity), odometer: parseInt(form.odometer) });
            } else {
                await API.post('/vehicles', { ...form, capacity: parseInt(form.capacity), odometer: parseInt(form.odometer) });
            }
            setShowModal(false);
            setEditing(null);
            setForm({ license_plate: '', make: '', model: '', type: 'Truck', capacity: '', odometer: '0', status: 'Ready' });
            load();
        } catch (err) { alert(err.response?.data?.error || 'Error'); }
    };

    const openEdit = v => {
        setEditing(v.id);
        setForm({ license_plate: v.license_plate, make: v.make, model: v.model, type: v.type, capacity: String(v.capacity), odometer: String(v.odometer), status: v.status });
        setShowModal(true);
    };

    const handleDelete = async id => {
        if (!confirm('Delete this vehicle?')) return;
        await API.delete(`/vehicles/${id}`);
        load();
    };

    const filtered = vehicles.filter(v =>
        (!filter.type || v.type === filter.type) && (!filter.status || v.status === filter.status)
    );

    return (
        <div className="page-enter">
            <div className="page-header">
                <div><h1>Vehicle Registry</h1><p className="page-header-sub">Manage your fleet assets</p></div>
                {hasRole('admin') && <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ license_plate: '', make: '', model: '', type: 'Truck', capacity: '', odometer: '0', status: 'Ready' }); setShowModal(true); }}>+ New Vehicle</button>}
            </div>
            <div className="kpi-grid">
                <div className="kpi-card blue"><div className="kpi-label">Total</div><div className="kpi-value">{vehicles.length}</div></div>
                <div className="kpi-card green"><div className="kpi-label">Ready</div><div className="kpi-value">{vehicles.filter(v => v.status === 'Ready').length}</div></div>
                <div className="kpi-card red"><div className="kpi-label">In Shop</div><div className="kpi-value">{vehicles.filter(v => v.status === 'In Shop').length}</div></div>
            </div>
            <div className="table-container">
                <div className="table-header">
                    <h3>All Vehicles</h3>
                    <div className="table-filters">
                        <select onChange={e => setFilter({ ...filter, type: e.target.value })}><option value="">All Types</option><option>Truck</option><option>Heavy</option><option>Van</option><option>Car</option></select>
                        <select onChange={e => setFilter({ ...filter, status: e.target.value })}><option value="">All Status</option><option>Ready</option><option>In Shop</option></select>
                    </div>
                </div>
                {filtered.length === 0 ? <div className="table-empty">No vehicles found</div> : (
                    <table><thead><tr><th>ID</th><th>Make</th><th>Model</th><th>Type</th><th>Capacity</th><th>Odometer</th><th>Plate</th><th>Status</th>{hasRole('admin') && <th>Actions</th>}</tr></thead>
                        <tbody>
                            {filtered.map(v => (
                                <tr key={v.id}>
                                    <td className="text-bold">{v.id}</td><td>{v.make}</td><td>{v.model}</td><td>{v.type}</td>
                                    <td>{v.capacity.toLocaleString()} kg</td><td>{v.odometer.toLocaleString()} km</td>
                                    <td><span className="badge badge-purple">{v.license_plate}</span></td>
                                    <td><span className={`badge ${v.status === 'Ready' ? 'badge-green' : 'badge-red'}`}>{v.status}</span></td>
                                    {hasRole('admin') && <td><div className="action-btns"><button className="action-btn edit" onClick={() => openEdit(v)}>✎</button><button className="action-btn delete" onClick={() => handleDelete(v.id)}>✕</button></div></td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
                    <div className="modal-content">
                        <div className="modal-header"><h3>{editing ? 'Edit Vehicle' : 'New Vehicle'}</h3><button className="modal-close" onClick={() => setShowModal(false)}>×</button></div>
                        <form className="modal-body" onSubmit={handleSave}>
                            <div className="form-group"><label>License Plate *</label><input name="license_plate" value={form.license_plate} onChange={handleChange} required /></div>
                            <div className="form-row">
                                <div className="form-group"><label>Make *</label><input name="make" value={form.make} onChange={handleChange} required /></div>
                                <div className="form-group"><label>Model *</label><input name="model" value={form.model} onChange={handleChange} required /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Type</label><select name="type" value={form.type} onChange={handleChange}><option>Truck</option><option>Heavy</option><option>Van</option><option>Car</option></select></div>
                                <div className="form-group"><label>Capacity (kg) *</label><input name="capacity" type="number" value={form.capacity} onChange={handleChange} required /></div>
                            </div>
                            <div className="form-row">
                                <div className="form-group"><label>Odometer (km)</label><input name="odometer" type="number" value={form.odometer} onChange={handleChange} /></div>
                                {editing && <div className="form-group"><label>Status</label><select name="status" value={form.status} onChange={handleChange}><option>Ready</option><option>In Shop</option></select></div>}
                            </div>
                            <div className="modal-footer"><button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Save'}</button></div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
