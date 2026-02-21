/* ============================================
   FleetFlow — Module 3: Vehicle Registry
   ============================================ */

const Vehicles = {
    render() {
        const vehicles = App.getData('vehicles') || [];
        const main = document.getElementById('main-content');

        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Vehicle Registry</h1>
                    <p class="page-header-sub">Manage your fleet assets</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Vehicles.openAddModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        New Vehicle
                    </button>
                </div>
            </div>

            <!-- KPIs -->
            <div class="kpi-grid">
                <div class="kpi-card blue">
                    <div class="kpi-label">Total Vehicles</div>
                    <div class="kpi-value">${vehicles.length}</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">Ready</div>
                    <div class="kpi-value">${vehicles.filter(v => v.status === 'Ready').length}</div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-label">In Shop</div>
                    <div class="kpi-value">${vehicles.filter(v => v.status === 'In Shop').length}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>All Vehicles</h3>
                    <div class="table-filters">
                        <select id="veh-filter-type" onchange="Vehicles.filter()">
                            <option value="">All Types</option>
                            <option value="Truck">Truck</option>
                            <option value="Heavy">Heavy</option>
                            <option value="Van">Van</option>
                            <option value="Car">Car</option>
                        </select>
                        <select id="veh-filter-status" onchange="Vehicles.filter()">
                            <option value="">All Status</option>
                            <option value="Ready">Ready</option>
                            <option value="In Shop">In Shop</option>
                        </select>
                    </div>
                </div>
                <div id="vehicles-table-body">
                    ${this.renderTable(vehicles)}
                </div>
            </div>
        `;
    },

    renderTable(vehicles) {
        if (vehicles.length === 0) {
            return '<div class="table-empty">No vehicles registered. Add your first vehicle!</div>';
        }
        return `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Make</th>
                        <th>Model</th>
                        <th>Type</th>
                        <th>Capacity (kg)</th>
                        <th>Odometer</th>
                        <th>License Plate</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${vehicles.map(v => `
                        <tr>
                            <td class="text-bold">${v.id}</td>
                            <td>${v.make}</td>
                            <td>${v.model}</td>
                            <td>${v.type}</td>
                            <td>${v.capacity.toLocaleString()}</td>
                            <td>${v.odometer.toLocaleString()} km</td>
                            <td><span class="badge badge-purple">${v.licensePlate}</span></td>
                            <td><span class="badge ${v.status === 'Ready' ? 'badge-green' : 'badge-red'}">${v.status}</span></td>
                            <td>
                                <div class="action-btns">
                                    <button class="action-btn edit" onclick="Vehicles.openEditModal('${v.id}')" title="Edit">✎</button>
                                    <button class="action-btn delete" onclick="Vehicles.delete('${v.id}')" title="Delete">✕</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    },

    filter() {
        const type = document.getElementById('veh-filter-type').value;
        const status = document.getElementById('veh-filter-status').value;
        let vehicles = App.getData('vehicles') || [];
        if (type) vehicles = vehicles.filter(v => v.type === type);
        if (status) vehicles = vehicles.filter(v => v.status === status);
        document.getElementById('vehicles-table-body').innerHTML = this.renderTable(vehicles);
    },

    openAddModal() {
        const body = `
            <div class="form-group">
                <label>License Plate *</label>
                <input type="text" id="v-plate" placeholder="e.g. MH-04-AB-1234">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Make *</label>
                    <input type="text" id="v-make" placeholder="e.g. Tata">
                </div>
                <div class="form-group">
                    <label>Model *</label>
                    <input type="text" id="v-model" placeholder="e.g. Ace">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type *</label>
                    <select id="v-type">
                        <option value="Truck">Truck</option>
                        <option value="Heavy">Heavy</option>
                        <option value="Van">Van</option>
                        <option value="Car">Car</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Max Capacity (kg) *</label>
                    <input type="number" id="v-capacity" placeholder="e.g. 1500">
                </div>
            </div>
            <div class="form-group">
                <label>Initial Odometer (km)</label>
                <input type="number" id="v-odometer" placeholder="e.g. 50000" value="0">
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Vehicles.save()">Save Vehicle</button>
        `;
        App.showModal('New Vehicle Registration', body, footer);
    },

    openEditModal(id) {
        const v = App.getVehicle(id);
        if (!v) return;
        const body = `
            <input type="hidden" id="v-edit-id" value="${v.id}">
            <div class="form-group">
                <label>License Plate *</label>
                <input type="text" id="v-plate" value="${v.licensePlate}">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Make *</label>
                    <input type="text" id="v-make" value="${v.make}">
                </div>
                <div class="form-group">
                    <label>Model *</label>
                    <input type="text" id="v-model" value="${v.model}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Type *</label>
                    <select id="v-type">
                        <option ${v.type === 'Truck' ? 'selected' : ''}>Truck</option>
                        <option ${v.type === 'Heavy' ? 'selected' : ''}>Heavy</option>
                        <option ${v.type === 'Van' ? 'selected' : ''}>Van</option>
                        <option ${v.type === 'Car' ? 'selected' : ''}>Car</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Max Capacity (kg) *</label>
                    <input type="number" id="v-capacity" value="${v.capacity}">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Odometer (km)</label>
                    <input type="number" id="v-odometer" value="${v.odometer}">
                </div>
                <div class="form-group">
                    <label>Status</label>
                    <select id="v-status">
                        <option ${v.status === 'Ready' ? 'selected' : ''}>Ready</option>
                        <option ${v.status === 'In Shop' ? 'selected' : ''}>In Shop</option>
                    </select>
                </div>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Vehicles.update()">Update Vehicle</button>
        `;
        App.showModal('Edit Vehicle', body, footer);
    },

    save() {
        const plate = document.getElementById('v-plate').value.trim();
        const make = document.getElementById('v-make').value.trim();
        const model = document.getElementById('v-model').value.trim();
        const type = document.getElementById('v-type').value;
        const capacity = parseInt(document.getElementById('v-capacity').value) || 0;
        const odometer = parseInt(document.getElementById('v-odometer').value) || 0;

        if (!plate || !make || !model || !capacity) {
            App.toast('Please fill in all required fields', 'warning');
            return;
        }

        const vehicles = App.getData('vehicles') || [];
        const id = App.genId('V');
        vehicles.push({ id, licensePlate: plate, make, model, type, capacity, odometer, status: 'Ready' });
        App.setData('vehicles', vehicles);
        App.closeModal();
        App.toast('Vehicle added successfully!', 'success');
        this.render();
    },

    update() {
        const editId = document.getElementById('v-edit-id').value;
        const vehicles = App.getData('vehicles') || [];
        const idx = vehicles.findIndex(v => v.id === editId);
        if (idx === -1) return;

        vehicles[idx].licensePlate = document.getElementById('v-plate').value.trim();
        vehicles[idx].make = document.getElementById('v-make').value.trim();
        vehicles[idx].model = document.getElementById('v-model').value.trim();
        vehicles[idx].type = document.getElementById('v-type').value;
        vehicles[idx].capacity = parseInt(document.getElementById('v-capacity').value) || 0;
        vehicles[idx].odometer = parseInt(document.getElementById('v-odometer').value) || 0;
        vehicles[idx].status = document.getElementById('v-status').value;

        App.setData('vehicles', vehicles);
        App.closeModal();
        App.toast('Vehicle updated!', 'success');
        this.render();
    },

    delete(id) {
        if (!confirm('Are you sure you want to remove this vehicle?')) return;
        let vehicles = App.getData('vehicles') || [];
        vehicles = vehicles.filter(v => v.id !== id);
        App.setData('vehicles', vehicles);
        App.toast('Vehicle removed', 'info');
        this.render();
    }
};
