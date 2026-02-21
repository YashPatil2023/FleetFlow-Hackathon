/* ============================================
   FleetFlow — Module 1: Authentication
   ============================================ */

const Auth = {
    currentUser: null,

    init() {
        const session = App.getData('session');
        if (session) {
            this.currentUser = session;
            this.showApp();
            return;
        }
        this.showAuth();
        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('show-register').addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('login-form').style.display = 'none';
            document.getElementById('register-form').style.display = 'block';
        });

        document.getElementById('show-login').addEventListener('click', e => {
            e.preventDefault();
            document.getElementById('register-form').style.display = 'none';
            document.getElementById('login-form').style.display = 'block';
        });

        document.getElementById('login-btn').addEventListener('click', () => this.login());
        document.getElementById('register-btn').addEventListener('click', () => this.register());

        // Enter key
        document.getElementById('login-password').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.login();
        });
        document.getElementById('reg-password').addEventListener('keydown', e => {
            if (e.key === 'Enter') this.register();
        });

        document.getElementById('logout-btn').addEventListener('click', () => this.logout());
    },

    login() {
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            App.toast('Please fill in all fields', 'warning');
            return;
        }

        const users = App.getData('users') || [];
        const user = users.find(u => u.username === username && u.password === password);

        if (!user) {
            App.toast('Invalid username or password', 'error');
            return;
        }

        this.currentUser = user;
        App.setData('session', user);
        App.toast(`Welcome back, ${user.fullname}!`, 'success');
        this.showApp();
    },

    register() {
        const fullname = document.getElementById('reg-fullname').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const username = document.getElementById('reg-username').value.trim();
        const password = document.getElementById('reg-password').value.trim();
        const role = document.getElementById('reg-role').value;

        if (!fullname || !email || !username || !password) {
            App.toast('Please fill in all required fields', 'warning');
            return;
        }

        const users = App.getData('users') || [];
        if (users.find(u => u.username === username)) {
            App.toast('Username already exists', 'error');
            return;
        }

        const newUser = {
            id: users.length + 1,
            fullname, email, username, password, role
        };
        users.push(newUser);
        App.setData('users', users);

        this.currentUser = newUser;
        App.setData('session', newUser);
        App.toast('Account created successfully!', 'success');
        this.showApp();
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('ff_session');
        document.getElementById('app').style.display = 'none';
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('login-username').value = '';
        document.getElementById('login-password').value = '';
        App.toast('Logged out successfully', 'info');
    },

    showAuth() {
        document.getElementById('auth-screen').style.display = 'flex';
        document.getElementById('app').style.display = 'none';
    },

    showApp() {
        document.getElementById('auth-screen').style.display = 'none';
        document.getElementById('app').style.display = 'flex';

        // Update user info in sidebar
        const user = this.currentUser;
        document.getElementById('user-avatar').textContent = user.fullname.charAt(0).toUpperCase();
        document.getElementById('user-name').textContent = user.fullname;
        document.getElementById('user-role').textContent = user.role.charAt(0).toUpperCase() + user.role.slice(1);

        App.navigate('dashboard');
    }
};

// Boot
document.addEventListener('DOMContentLoaded', () => {
    App.init();
    Auth.init();
});
