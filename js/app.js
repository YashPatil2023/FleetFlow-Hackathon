/* ============================================
   FleetFlow — App Core (Router, Utils, Init)
   ============================================ */

const App = {
    currentPage: 'dashboard',

    // ---- Data Store (localStorage wrapper) ----
    getData(key) {
        try {
            const d = localStorage.getItem('ff_' + key);
            return d ? JSON.parse(d) : null;
        } catch { return null; }
    },

    setData(key, value) {
        localStorage.setItem('ff_' + key, JSON.stringify(value));
    },

    // ---- Seed Demo Data ----
    seedData() {
        if (this.getData('seeded')) return;

        // Default users
        this.setData('users', [
            { id: 1, fullname: 'Admin User', username: 'admin', password: 'admin', email: 'admin@fleetflow.com', role: 'admin' }
        ]);

        // Vehicles
        this.setData('vehicles', [
            { id: 'V001', make: 'Tata', model: 'Ace', type: 'Truck', capacity: 1000, odometer: 34000, status: 'Ready', licensePlate: 'MH-04-AB-1234' },
            { id: 'V002', make: 'Mahindra', model: 'Bolero Pickup', type: 'Truck', capacity: 1500, odometer: 52000, status: 'Ready', licensePlate: 'MH-12-CD-5678' },
            { id: 'V003', make: 'Ashok Leyland', model: 'Dost', type: 'Truck', capacity: 2500, odometer: 78000, status: 'In Shop', licensePlate: 'MH-01-EF-9012' },
            { id: 'V004', make: 'Eicher', model: 'Pro 2049', type: 'Heavy', capacity: 5000, odometer: 120000, status: 'Ready', licensePlate: 'GJ-05-GH-3456' },
        ]);

        // Drivers
        this.setData('drivers', [
            { id: 'D001', name: 'Rajesh Kumar', license: '23223', expiry: '2027-06-15', completionRate: 92, safetyScore: 95, complaints: 1, dutyStatus: 'In Duty' },
            { id: 'D002', name: 'Sunil Patil', license: '23224', expiry: '2026-12-30', completionRate: 88, safetyScore: 91, complaints: 2, dutyStatus: 'In Duty' },
            { id: 'D003', name: 'Amit Sharma', license: '23225', expiry: '2025-03-10', completionRate: 95, safetyScore: 89, complaints: 0, dutyStatus: 'Taking a Break' },
        ]);

        // Trips
        this.setData('trips', [
            { id: 'T001', vehicleId: 'V001', driverId: 'D001', type: 'Delivery', origin: 'Mumbai', destination: 'Pune', cargoWeight: 800, fuelCost: 2500, status: 'Completed', date: '2026-02-18' },
            { id: 'T002', vehicleId: 'V002', driverId: 'D002', type: 'Delivery', origin: 'Delhi', destination: 'Jaipur', cargoWeight: 1200, fuelCost: 3500, status: 'In Transit', date: '2026-02-20' },
        ]);

        // Maintenance
        this.setData('maintenance', [
            { id: 'M001', vehicleId: 'V003', issue: 'Engine Issue', cost: 8500, date: '2026-02-15', status: 'In Progress' },
        ]);

        // Expenses
        this.setData('expenses', [
            { id: 'E001', tripId: 'T001', driverId: 'D001', distance: 150, fuelExpense: 2500, miscExpense: 500, status: 'Done' },
        ]);

        this.setData('seeded', true);
    },

    // ---- Navigation ----
    navigate(page) {
        this.currentPage = page;

        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.toggle('active', item.dataset.page === page);
        });

        // Render
        const main = document.getElementById('main-content');
        main.innerHTML = '';
        main.classList.remove('page-enter');
        void main.offsetWidth; // force reflow
        main.classList.add('page-enter');

        switch (page) {
            case 'dashboard': Dashboard.render(); break;
            case 'vehicles': Vehicles.render(); break;
            case 'trips': Trips.render(); break;
            case 'maintenance': Maintenance.render(); break;
            case 'expenses': Expenses.render(); break;
            case 'drivers': Drivers.render(); break;
            case 'analytics': Analytics.render(); break;
        }
    },

    // ---- Toast Notifications ----
    toast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(60px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    },

    // ---- Modal ----
    showModal(title, bodyHTML, footerHTML = '') {
        const overlay = document.getElementById('modal-overlay');
        const content = document.getElementById('modal-content');
        content.innerHTML = `
            <div class="modal-header">
                <h3>${title}</h3>
                <button class="modal-close" onclick="App.closeModal()">&times;</button>
            </div>
            <div class="modal-body">${bodyHTML}</div>
            ${footerHTML ? `<div class="modal-footer">${footerHTML}</div>` : ''}
        `;
        overlay.style.display = 'flex';
    },

    closeModal() {
        document.getElementById('modal-overlay').style.display = 'none';
    },

    // ---- Utility: Generate ID ----
    genId(prefix) {
        const items = this.getData(prefix === 'V' ? 'vehicles' : prefix === 'T' ? 'trips' : prefix === 'D' ? 'drivers' : prefix === 'M' ? 'maintenance' : 'expenses') || [];
        const num = items.length + 1;
        return prefix + String(num).padStart(3, '0');
    },

    // ---- Utility: Format currency ----
    currency(n) {
        return '₹' + Number(n).toLocaleString('en-IN');
    },

    // ---- Get vehicle/driver by ID ----
    getVehicle(id) {
        return (this.getData('vehicles') || []).find(v => v.id === id);
    },
    getDriver(id) {
        return (this.getData('drivers') || []).find(d => d.id === id);
    },

    // ---- Init ----
    init() {
        this.seedData();

        // Nav clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', e => {
                e.preventDefault();
                this.navigate(item.dataset.page);
            });
        });

        // Modal close on overlay click
        document.getElementById('modal-overlay').addEventListener('click', e => {
            if (e.target === e.currentTarget) this.closeModal();
        });

        // Keyboard shortcut: Escape to close modal
        document.addEventListener('keydown', e => {
            if (e.key === 'Escape') this.closeModal();
        });
    }
};
