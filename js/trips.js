/* ============================================
   FleetFlow — Module 4: Trip Dispatcher
   ============================================ */

const Trips = {
    statusFlow: ['Dispatched', 'In Transit', 'Delivered', 'Completed'],

    render() {
        const trips = App.getData('trips') || [];
        const main = document.getElementById('main-content');

        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Trip Dispatcher</h1>
                    <p class="page-header-sub">Dispatch and manage fleet trips</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Trips.openAddModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Trip
                    </button>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card blue">
                    <div class="kpi-label">Total Trips</div>
                    <div class="kpi-value">${trips.length}</div>
                </div>
                <div class="kpi-card yellow">
                    <div class="kpi-label">In Transit</div>
                    <div class="kpi-value">${trips.filter(t => t.status === 'In Transit').length}</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">Completed</div>
                    <div class="kpi-value">${trips.filter(t => t.status === 'Completed').length}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>All Trips</h3>
                    <div class="table-filters">
                        <select id="trip-filter-status" onchange="Trips.filter()">
                            <option value="">All Status</option>
                            <option value="Dispatched">Dispatched</option>
                            <option value="In Transit">In Transit</option>
                            <option value="Delivered">Delivered</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
                <div id="trips-table-body">
                    ${this.renderTable(trips)}
                </div>
            </div>
        `;
    },

    renderTable(trips) {
        if (trips.length === 0) {
            return '<div class="table-empty">No trips dispatched yet. Create your first trip!</div>';
        }
        return `
            <table>
                <thead>
                    <tr>
                        <th>Trip ID</th>
                        <th>Vehicle</th>
                        <th>Driver</th>
                        <th>Origin</th>
                        <th>Destination</th>
                        <th>Cargo (kg)</th>
                        <th>Progress</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${trips.map(t => {
            const v = App.getVehicle(t.vehicleId);
            const d = App.getDriver(t.driverId);
            const stIdx = this.statusFlow.indexOf(t.status);
            const statusClass = t.status === 'Completed' ? 'green' : t.status === 'In Transit' ? 'blue' : t.status === 'Delivered' ? 'cyan' : 'yellow';
            return `
                            <tr>
                                <td class="text-bold">${t.id}</td>
                                <td>${v ? v.make + ' ' + v.model : t.vehicleId}</td>
                                <td>${d ? d.name : t.driverId}</td>
                                <td>${t.origin}</td>
                                <td>${t.destination}</td>
                                <td>${t.cargoWeight.toLocaleString()}</td>
                                <td>
                                    <div class="progress-steps">
                                        ${this.statusFlow.map((s, i) => `<div class="progress-step ${i <= stIdx ? (i < stIdx ? 'completed' : 'active') : ''}"></div>`).join('')}
                                    </div>
                                </td>
                                <td><span class="badge badge-${statusClass}">${t.status}</span></td>
                                <td>
                                    <div class="action-btns">
                                        ${t.status !== 'Completed' ? `<button class="action-btn edit" onclick="Trips.advanceStatus('${t.id}')" title="Advance Status">▶</button>` : ''}
                                        <button class="action-btn delete" onclick="Trips.delete('${t.id}')" title="Delete">✕</button>
                                    </div>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    },

    filter() {
        const status = document.getElementById('trip-filter-status').value;
        let trips = App.getData('trips') || [];
        if (status) trips = trips.filter(t => t.status === status);
        document.getElementById('trips-table-body').innerHTML = this.renderTable(trips);
    },

    openAddModal() {
        const vehicles = (App.getData('vehicles') || []).filter(v => v.status === 'Ready');
        const drivers = (App.getData('drivers') || []).filter(d => {
            const today = new Date().toISOString().split('T')[0];
            return d.dutyStatus !== 'Suspended' && d.expiry >= today;
        });

        const body = `
            <div class="form-group">
                <label>Select Vehicle *</label>
                <select id="t-vehicle" onchange="Trips.updateCapacity()">
                    <option value="">-- Choose a vehicle --</option>
                    ${vehicles.map(v => `<option value="${v.id}" data-cap="${v.capacity}">${v.id} — ${v.make} ${v.model} (${v.capacity}kg)</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Cargo Weight (kg) *</label>
                <input type="number" id="t-cargo" placeholder="Enter cargo weight">
                <small id="t-cargo-hint" style="color:var(--text-muted);font-size:12px;margin-top:4px;display:block;"></small>
            </div>
            <div class="form-group">
                <label>Select Driver *</label>
                <select id="t-driver">
                    <option value="">-- Choose a driver --</option>
                    ${drivers.map(d => `<option value="${d.id}">${d.name} (Score: ${d.safetyScore}%)</option>`).join('')}
                </select>
                ${drivers.length === 0 ? '<small style="color:var(--accent-red);font-size:12px;">No eligible drivers available. Check license expiry and duty status.</small>' : ''}
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Origin Address *</label>
                    <input type="text" id="t-origin" placeholder="e.g. Mumbai">
                </div>
                <div class="form-group">
                    <label>Destination *</label>
                    <input type="text" id="t-dest" placeholder="e.g. Pune">
                </div>
            </div>
            <div class="form-group">
                <label>Estimated Fuel Cost (₹)</label>
                <input type="number" id="t-fuel" placeholder="e.g. 3000">
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-success" onclick="Trips.dispatch()">Confirm & Dispatch Trip</button>
        `;
        App.showModal('New Trip Form', body, footer);
    },

    updateCapacity() {
        const sel = document.getElementById('t-vehicle');
        const opt = sel.options[sel.selectedIndex];
        const cap = opt.dataset.cap;
        document.getElementById('t-cargo-hint').textContent = cap ? `Max capacity: ${Number(cap).toLocaleString()} kg` : '';
    },

    dispatch() {
        const vehicleId = document.getElementById('t-vehicle').value;
        const cargo = parseInt(document.getElementById('t-cargo').value) || 0;
        const driverId = document.getElementById('t-driver').value;
        const origin = document.getElementById('t-origin').value.trim();
        const dest = document.getElementById('t-dest').value.trim();
        const fuel = parseInt(document.getElementById('t-fuel').value) || 0;

        if (!vehicleId || !driverId || !origin || !dest || !cargo) {
            App.toast('Please fill in all required fields', 'warning');
            return;
        }

        // Weight validation
        const vehicle = App.getVehicle(vehicleId);
        if (vehicle && cargo > vehicle.capacity) {
            App.toast(`Too heavy! Max capacity is ${vehicle.capacity}kg but cargo is ${cargo}kg.`, 'error');
            return;
        }

        const trips = App.getData('trips') || [];
        const id = App.genId('T');
        trips.push({
            id, vehicleId, driverId,
            type: 'Delivery',
            origin, destination: dest,
            cargoWeight: cargo,
            fuelCost: fuel,
            status: 'Dispatched',
            date: new Date().toISOString().split('T')[0]
        });
        App.setData('trips', trips);
        App.closeModal();
        App.toast('Trip dispatched successfully!', 'success');
        this.render();
    },

    advanceStatus(id) {
        const trips = App.getData('trips') || [];
        const trip = trips.find(t => t.id === id);
        if (!trip) return;

        const idx = this.statusFlow.indexOf(trip.status);
        if (idx < this.statusFlow.length - 1) {
            trip.status = this.statusFlow[idx + 1];
            App.setData('trips', trips);

            // If completed, update driver completion rate
            if (trip.status === 'Completed') {
                const drivers = App.getData('drivers') || [];
                const driver = drivers.find(d => d.id === trip.driverId);
                if (driver) {
                    driver.completionRate = Math.min(100, driver.completionRate + 1);
                    App.setData('drivers', drivers);
                }
            }

            App.toast(`Trip ${id} → ${trip.status}`, 'success');
            this.render();
        }
    },

    delete(id) {
        if (!confirm('Delete this trip?')) return;
        let trips = App.getData('trips') || [];
        trips = trips.filter(t => t.id !== id);
        App.setData('trips', trips);
        App.toast('Trip removed', 'info');
        this.render();
    }
};
