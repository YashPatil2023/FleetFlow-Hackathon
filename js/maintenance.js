/* ============================================
   FleetFlow — Module 5: Maintenance & Service Logs
   ============================================ */

const Maintenance = {
    render() {
        const logs = App.getData('maintenance') || [];
        const main = document.getElementById('main-content');

        main.innerHTML = `
            <div class="page-header">
                <div>
                    <h1>Maintenance & Service Logs</h1>
                    <p class="page-header-sub">Track vehicle repairs and servicing</p>
                </div>
                <div class="page-actions">
                    <button class="btn btn-primary" onclick="Maintenance.openAddModal()">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                        Create New Service
                    </button>
                </div>
            </div>

            <div class="kpi-grid">
                <div class="kpi-card red">
                    <div class="kpi-label">Active Repairs</div>
                    <div class="kpi-value">${logs.filter(l => l.status === 'In Progress').length}</div>
                </div>
                <div class="kpi-card green">
                    <div class="kpi-label">Completed</div>
                    <div class="kpi-value">${logs.filter(l => l.status === 'Done').length}</div>
                </div>
                <div class="kpi-card yellow">
                    <div class="kpi-label">Total Cost</div>
                    <div class="kpi-value">${App.currency(logs.reduce((s, l) => s + (l.cost || 0), 0))}</div>
                </div>
            </div>

            <div class="table-container">
                <div class="table-header">
                    <h3>Service Logs</h3>
                    <div class="table-filters">
                        <select id="maint-filter" onchange="Maintenance.filter()">
                            <option value="">All Status</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Done">Done</option>
                        </select>
                    </div>
                </div>
                <div id="maint-table-body">
                    ${this.renderTable(logs)}
                </div>
            </div>
        `;
    },

    renderTable(logs) {
        if (logs.length === 0) {
            return '<div class="table-empty">No maintenance logs. All vehicles are healthy!</div>';
        }
        return `
            <table>
                <thead>
                    <tr>
                        <th>Log ID</th>
                        <th>Vehicle</th>
                        <th>Issue / Service</th>
                        <th>Cost (₹)</th>
                        <th>Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${logs.map(l => {
            const v = App.getVehicle(l.vehicleId);
            return `
                            <tr>
                                <td class="text-bold">${l.id}</td>
                                <td>${v ? v.make + ' ' + v.model : l.vehicleId}</td>
                                <td>${l.issue}</td>
                                <td>${App.currency(l.cost)}</td>
                                <td class="text-muted">${l.date}</td>
                                <td><span class="badge ${l.status === 'Done' ? 'badge-green' : 'badge-orange'}">${l.status}</span></td>
                                <td>
                                    <div class="action-btns">
                                        ${l.status === 'In Progress' ? `<button class="action-btn edit" onclick="Maintenance.markDone('${l.id}')" title="Mark Done">✓</button>` : ''}
                                        <button class="action-btn delete" onclick="Maintenance.delete('${l.id}')" title="Delete">✕</button>
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
        const status = document.getElementById('maint-filter').value;
        let logs = App.getData('maintenance') || [];
        if (status) logs = logs.filter(l => l.status === status);
        document.getElementById('maint-table-body').innerHTML = this.renderTable(logs);
    },

    openAddModal() {
        const vehicles = App.getData('vehicles') || [];
        const body = `
            <div class="form-group">
                <label>Vehicle *</label>
                <select id="m-vehicle">
                    <option value="">-- Select Vehicle --</option>
                    ${vehicles.map(v => `<option value="${v.id}">${v.id} — ${v.make} ${v.model} (${v.status})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Issue / Service *</label>
                <input type="text" id="m-issue" placeholder="e.g. Oil change, Engine issue, New tires">
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label>Cost (₹)</label>
                    <input type="number" id="m-cost" placeholder="e.g. 5000" value="0">
                </div>
                <div class="form-group">
                    <label>Date</label>
                    <input type="date" id="m-date" value="${new Date().toISOString().split('T')[0]}">
                </div>
            </div>
            <div style="background:rgba(249,115,22,0.1);border:1px solid rgba(249,115,22,0.3);border-radius:8px;padding:12px;margin-top:8px;">
                <small style="color:var(--accent-orange);">⚠ <strong>"In Shop" Rule:</strong> Adding a maintenance log will automatically set the vehicle's status to "In Shop", preventing it from being dispatched on new trips.</small>
            </div>
        `;
        const footer = `
            <button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Maintenance.save()">Create Log</button>
        `;
        App.showModal('New Service Log', body, footer);
    },

    save() {
        const vehicleId = document.getElementById('m-vehicle').value;
        const issue = document.getElementById('m-issue').value.trim();
        const cost = parseInt(document.getElementById('m-cost').value) || 0;
        const date = document.getElementById('m-date').value;

        if (!vehicleId || !issue) {
            App.toast('Please fill in required fields', 'warning');
            return;
        }

        // Add log
        const logs = App.getData('maintenance') || [];
        const id = App.genId('M');
        logs.push({ id, vehicleId, issue, cost, date, status: 'In Progress' });
        App.setData('maintenance', logs);

        // Auto-mark vehicle as "In Shop"
        const vehicles = App.getData('vehicles') || [];
        const vIdx = vehicles.findIndex(v => v.id === vehicleId);
        if (vIdx !== -1) {
            vehicles[vIdx].status = 'In Shop';
            App.setData('vehicles', vehicles);
        }

        App.closeModal();
        App.toast('Service log created. Vehicle marked as "In Shop".', 'success');
        this.render();
    },

    markDone(id) {
        const logs = App.getData('maintenance') || [];
        const log = logs.find(l => l.id === id);
        if (!log) return;

        log.status = 'Done';
        App.setData('maintenance', logs);

        // Restore vehicle to Ready
        const vehicles = App.getData('vehicles') || [];
        const vIdx = vehicles.findIndex(v => v.id === log.vehicleId);
        if (vIdx !== -1) {
            // Only set ready if no other active maintenance for this vehicle
            const otherActive = logs.filter(l => l.vehicleId === log.vehicleId && l.status === 'In Progress');
            if (otherActive.length === 0) {
                vehicles[vIdx].status = 'Ready';
                App.setData('vehicles', vehicles);
            }
        }

        App.toast('Service completed. Vehicle back to "Ready".', 'success');
        this.render();
    },

    delete(id) {
        if (!confirm('Delete this log?')) return;
        let logs = App.getData('maintenance') || [];
        logs = logs.filter(l => l.id !== id);
        App.setData('maintenance', logs);
        App.toast('Log removed', 'info');
        this.render();
    }
};
