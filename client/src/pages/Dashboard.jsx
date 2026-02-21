import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export default function Dashboard() {
    const { user, hasRole } = useAuth();
    const [stats, setStats] = useState(null);
    const [trips, setTrips] = useState([]);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const tripsRes = await API.get('/trips');
            setTrips(tripsRes.data);

            if (hasRole('admin', 'dispatcher')) {
                const analyticsRes = await API.get('/analytics');
                setStats(analyticsRes.data.kpis);
            }
        } catch (err) { console.error(err); }
    };

    // Driver-specific dashboard
    if (user?.role === 'driver') {
        const myTrips = trips;
        const completed = myTrips.filter(t => t.status === 'Completed').length;
        const active = myTrips.filter(t => t.status !== 'Completed').length;

        return (
            <div className="page-enter">
                <div className="page-header">
                    <div>
                        <h1>Welcome, {user.fullname}</h1>
                        <p className="page-header-sub">Your driver dashboard</p>
                    </div>
                </div>
                <div className="kpi-grid">
                    <div className="kpi-card blue"><div className="kpi-label">My Trips</div><div className="kpi-value">{myTrips.length}</div></div>
                    <div className="kpi-card green"><div className="kpi-label">Completed</div><div className="kpi-value">{completed}</div></div>
                    <div className="kpi-card yellow"><div className="kpi-label">Active</div><div className="kpi-value">{active}</div></div>
                </div>
                {myTrips.length > 0 && (
                    <div className="table-container">
                        <div className="table-header"><h3>My Recent Trips</h3></div>
                        <table><thead><tr><th>Trip ID</th><th>Vehicle</th><th>Route</th><th>Status</th><th>Date</th></tr></thead>
                            <tbody>
                                {myTrips.slice(0, 10).map(t => (
                                    <tr key={t.id}>
                                        <td className="text-bold">{t.id}</td>
                                        <td>{t.vehicle_name || t.vehicle_id}</td>
                                        <td>{t.origin} → {t.destination}</td>
                                        <td><span className={`badge badge-${t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'blue' : 'yellow'}`}>{t.status}</span></td>
                                        <td className="text-muted">{t.date}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        );
    }

    // Admin/Dispatcher dashboard
    return (
        <div className="page-enter">
            <div className="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p className="page-header-sub">Overview of your fleet operations</p>
                </div>
            </div>
            <div className="kpi-grid">
                <div className="kpi-card blue"><div className="kpi-label">Active Fleet</div><div className="kpi-value">{stats?.activeFleet ?? '—'}</div><div className="kpi-change up">↑ On the road</div></div>
                <div className="kpi-card red"><div className="kpi-label">Maintenance Alerts</div><div className="kpi-value">{stats ? stats.totalVehicles - stats.activeFleet : '—'}</div></div>
                <div className="kpi-card yellow"><div className="kpi-label">Pending Cargo</div><div className="kpi-value">{trips.filter(t => t.status === 'Dispatched' || t.status === 'In Transit').length}</div></div>
                <div className="kpi-card green"><div className="kpi-label">Utilization Rate</div><div className="kpi-value">{stats?.utilRate ?? '—'}%</div></div>
            </div>

            <div className="table-container">
                <div className="table-header"><h3>Recent Trips</h3></div>
                {trips.length === 0 ? <div className="table-empty">No trips yet</div> : (
                    <table><thead><tr><th>Trip ID</th><th>Vehicle</th><th>Driver</th><th>Route</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {trips.slice(0, 10).map(t => (
                                <tr key={t.id}>
                                    <td className="text-bold">{t.id}</td>
                                    <td>{t.vehicle_name || t.vehicle_id}</td>
                                    <td>{t.driver_name || t.driver_id}</td>
                                    <td>{t.origin} → {t.destination}</td>
                                    <td><span className={`badge badge-${t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'blue' : t.status === 'Delivered' ? 'cyan' : 'yellow'}`}>{t.status}</span></td>
                                    <td className="text-muted">{t.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
