/* ============================================
   FleetFlow — Module 6: Expense & Fuel Logging
   ============================================ */

const Expenses = {
    render() {
        const expenses = App.getData('expenses') || [];
        const totalFuel = expenses.reduce((s, e) => s + (e.fuelExpense || 0), 0);
        const totalMisc = expenses.reduce((s, e) => s + (e.miscExpense || 0), 0);
        const main = document.getElementById('main-content');

        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Expense & Fuel Logging</h1>
                    <p class="page-header-sub">Track all trip expenses and fuel costs</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Expenses.openAddModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Add an Expense
                    </button>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card yellow">
                    <div class="kpi-label">Total Fuel Cost</div>
                    <div class="kpi-value">${App.currency(totalFuel)}</div>
                </div>
                <div class="kpi-card red">
                    <div class="kpi-label">Misc. Expenses</div>
                    <div class="kpi-value">${App.currency(totalMisc)}</div>
                </div>
                <div class="kpi-card blue">
                    <div class="kpi-label">Total Cost</div>
                    <div class="kpi-value">${App.currency(totalFuel + totalMisc)}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>Expense Records</h3>
                </div>
                <div id="expenses-table-body">
                    ${this.renderTable(expenses)}
                </div>
            </div>

            ${this.renderPerVehicleCosts()}
        `;
    },

    renderTable(expenses) {
        if (expenses.length === 0) {
            return '<div class="table-empty">No expenses logged yet.</div>';
        }
        return `
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Trip ID</th>
                        <th>Driver</th>
                        <th>Distance (km)</th>
                        <th>Fuel Expense</th>
                        <th>Misc. Expense</th>
                        <th>Total</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(e => {
            const d = App.getDriver(e.driverId);
            const total = (e.fuelExpense || 0) + (e.miscExpense || 0);
            return `
                            <tr>
                                <td class="text-bold">${e.id}</td>
                                <td>${e.tripId}</td>
                                <td>${d ? d.name : e.driverId}</td>
                                <td>${e.distance ? e.distance.toLocaleString() + ' km' : '—'}</td>
                                <td>${App.currency(e.fuelExpense)}</td>
                                <td>${App.currency(e.miscExpense)}</td>
                                <td class="text-bold">${App.currency(total)}</td>
                                <td><span class="badge badge-green">${e.status}</span></td>
                                <td>
                                    <div class="action-btns">
                                        <button class="action-btn delete" onclick="Expenses.delete('${e.id}')" title="Delete">✕</button>
                                    </div>
                                </td>
                            </tr>
                        `;
        }).join('')}
                </tbody>
            </table>
        `;
    },

    renderPerVehicleCosts() {
        const expenses = App.getData('expenses') || [];
        const trips = App.getData('trips') || [];
        const maintenance = App.getData('maintenance') || [];
        const vehicles = App.getData('vehicles') || [];

        // Gather costs per vehicle
        const costMap = {};
        vehicles.forEach(v => { costMap[v.id] = { fuel: 0, maintenance: 0, misc: 0 }; });

        expenses.forEach(e => {
            const trip = trips.find(t => t.id === e.tripId);
            if (trip && costMap[trip.vehicleId]) {
                costMap[trip.vehicleId].fuel += e.fuelExpense || 0;
                costMap[trip.vehicleId].misc += e.miscExpense || 0;
            }
        });

        maintenance.forEach(m => {
            if (costMap[m.vehicleId]) {
                costMap[m.vehicleId].maintenance += m.cost || 0;
            }
        });

        const entries = vehicles.map(v => {
            const c = costMap[v.id] || { fuel: 0, maintenance: 0, misc: 0 };
            return { ...v, totalCost: c.fuel + c.maintenance + c.misc, ...c };
        }).filter(v => v.totalCost > 0);

        if (entries.length === 0) return '';

        return `
            <div class="table-container mt-16">
                <div class="table-header">
                    <h3>Cost Per Vehicle</h3>
                </div>
                <table>
                    <thead>
                        <tr>
                            <th>Vehicle</th>
                            <th>Fuel Cost</th>
                            <th>Maintenance</th>
                            <th>Misc.</th>
                            <th>Total Cost</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${entries.map(v => `
                            <tr>
                                <td class="text-bold">${v.id} — ${v.make} ${v.model}</td>
                                <td>${App.currency(v.fuel)}</td>
                                <td>${App.currency(v.maintenance)}</td>
                                <td>${App.currency(v.misc)}</td>
                                <td class="text-bold">${App.currency(v.totalCost)}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    openAddModal() {
        const trips = App.getData('trips') || [];
        const drivers = App.getData('drivers') || [];

        const body = `
            <div class="form-group">
                <label>Trip ID *</label>
                <select id="e-trip">
                    <option value="">-- Select Trip --</option>
                    ${trips.map(t => `<option value="${t.id}">${t.id} — ${t.origin} → ${t.destination}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Driver *</label>
                <select id="e-driver">
                    <option value="">-- Select Driver --</option>
                    ${drivers.map(d => `<option value="${d.id}">${d.name}</option>`).join('')}
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Fuel Cost (₹) *</label>
                    <input type="number" id="e-fuel" placeholder="e.g. 2500" value="0">
                </div>
                <div class="form-group">
                    <label>Misc. Expense (₹)</label>
                    <input type="number" id="e-misc" placeholder="e.g. 500" value="0">
                </div>
            </div>
            <div class="form-group">
                <label>Distance (km)</label>
                <input type="number" id="e-distance" placeholder="e.g. 150">
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Expenses.save()">Create Expense</button>
        `;
        App.showModal('Add Expense', body, footer);
    },

    save() {
        const tripId = document.getElementById('e-trip').value;
        const driverId = document.getElementById('e-driver').value;
        const fuelExpense = parseInt(document.getElementById('e-fuel').value) || 0;
        const miscExpense = parseInt(document.getElementById('e-misc').value) || 0;
        const distance = parseInt(document.getElementById('e-distance').value) || 0;

        if (!tripId || !driverId) {
            App.toast('Please fill in all required fields', 'warning');
            return;
        }

        const expenses = App.getData('expenses') || [];
        const id = App.genId('E');
        expenses.push({ id, tripId, driverId, fuelExpense, miscExpense, distance, status: 'Done' });
        App.setData('expenses', expenses);
        App.closeModal();
        App.toast('Expense logged successfully!', 'success');
        this.render();
    },

    delete(id) {
        if (!confirm('Delete this expense?')) return;
        let expenses = App.getData('expenses') || [];
        expenses = expenses.filter(e => e.id !== id);
        App.setData('expenses', expenses);
        App.toast('Expense removed', 'info');
        this.render();
    }
};
