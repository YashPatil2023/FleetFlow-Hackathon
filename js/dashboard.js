/* ============================================
   FleetFlow — Module 2: Main Dashboard
   ============================================ */

const Dashboard = {
    render() {
        const vehicles = App.getData('vehicles') || [];
        const trips = App.getData('trips') || [];
        const maintenance = App.getData('maintenance') || [];
        const drivers = App.getData('drivers') || [];

        const activeFleet = vehicles.filter(v => v.status === 'Ready').length;
        const maintAlerts = vehicles.filter(v => v.status === 'In Shop').length;
        const pendingCargo = trips.filter(t => t.status === 'Dispatched' || t.status === 'In Transit').length;
        const utilizationRate = vehicles.length > 0 ? Math.round((activeFleet / vehicles.length) * 100) : 0;

        const main = document.getElementById('main-content');
        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Dashboard</h1>
                    <p class="page-header-sub">Overview of your fleet operations</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="App.navigate('trips'); setTimeout(() => Trips.openAddModal(), 100)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Trip
                    </button>
                    <button class="btn btn-secondary" onclick="App.navigate('vehicles'); setTimeout(() => Vehicles.openAddModal(), 100)">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Vehicle
                    </button>
                </div>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="kpi-card blue">
                    <div class="kpi-label">Active Fleet</div>
                    <div class="kpi-value">${activeFleet}</div>
                    <div class="kpi-change up">↑ On the road</div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-label">Maintenance Alerts</div>
                    <div class="kpi-value">${maintAlerts}</div>
                    <div class="kpi-change ${maintAlerts > 0 ? 'down' : 'up'}">${maintAlerts > 0 ? '⚠ In Shop' : '✓ All clear'}</div>
                </div>
                <div class="kpi-card yellow">
                    <div class="kpi-label">Pending Cargo</div>
                    <div class="kpi-value">${pendingCargo}</div>
                    <div class="kpi-change up">Awaiting delivery</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">Utilization Rate</div>
                    <div class="kpi-value">${utilizationRate}%</div>
                    <div class="kpi-change up">Fleet efficiency</div>
                </div>
            </div>

            <!-- Quick Filters -->
            <div class="table-container">
                <div class="table-header">
                    <h3>Recent Trips</h3>
                    <div class="table-filters">
                        <select id="dash-filter-type" onchange="Dashboard.filterTrips()">
                            <option value="">All Types</option>
                            <option value="Delivery">Delivery</option>
                            <option value="Pickup">Pickup</option>
                            <option value="Transfer">Transfer</option>
                        </select>
                        <select id="dash-filter-status" onchange="Dashboard.filterTrips()">
                            <option value="">All Status</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div id="dash-trips-table">
                    ${this.renderTripsTable(trips)}
                </div>
            </div>
        `;
    },

    renderTripsTable(trips) {
        if (trips.length === 0) {
            return '<div class="table-empty">No trips recorded yet. Create your first trip!</div>';
        }

        const recent = trips.slice(-10).reverse();
        return `
            <table>
                <thead>
                    <tr>
                        <th>Trip ID</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Route</th>
                        <th>Status</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${recent.map(t => {
            const v = App.getVehicle(t.vehicleId);
            const d = App.getDriver(t.driverId);
            const statusClass = t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'blue' : t.status === 'Delivered' ? 'cyan' : 'yellow';
            return `
                            <tr>
                                <td class="text-bold">${t.id}</td>
                                <td>${v ? v.make + ' ' + v.model : t.vehicleId}</td>
                                <td>${d ? d.name : t.driverId}</td>
                                <td>${t.origin} → ${t.destination}</td>
                                <td><span class="badge badge-${statusClass}">${t.status}</span></td>
                                <td class="text-muted">${t.date}</td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    },

    filterTrips() {
        const typeFilter = document.getElementById('dash-filter-type').value;
        const statusFilter = document.getElementById('dash-filter-status').value;
        let trips = App.getData('trips') || [];
        if (typeFilter) trips = trips.filter(t => t.type === typeFilter);
        if (statusFilter) trips = trips.filter(t => t.status === statusFilter);
        document.getElementById('dash-trips-table').innerHTML = this.renderTripsTable(trips);
    }
};
