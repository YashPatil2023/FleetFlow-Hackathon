import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
    { path: '/', label: 'Dashboard', icon: '⊞', roles: ['admin', 'dispatcher', 'driver'] },
    { path: '/vehicles', label: 'Vehicle Registry', icon: '⊟', roles: ['admin', 'dispatcher'] },
    { path: '/trips', label: 'Trip Dispatcher', icon: '◉', roles: ['admin', 'dispatcher', 'driver'] },
    { path: '/maintenance', label: 'Maintenance', icon: '⚙', roles: ['admin', 'dispatcher'] },
    { path: '/expenses', label: 'Trip & Expenses', icon: '₹', roles: ['admin', 'dispatcher', 'driver'] },
    { path: '/drivers', label: 'Performance', icon: '☺', roles: ['admin', 'dispatcher', 'driver'] },
    { path: '/analytics', label: 'Analytics', icon: '⊿', roles: ['admin', 'dispatcher'] },
];

export default function Sidebar() {
    const { user, logout } = useAuth();

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role));

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div className="logo-icon-sm">
                    <svg width="32" height="32" viewBox="0 0 48 48" fill="none">
                        <rect width="48" height="48" rx="12" fill="url(#sideGrad)" />
                        <path d="M14 30L20 18L26 24L34 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="34" cy="14" r="3" fill="white" />
                        <defs><linearGradient id="sideGrad" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#6C63FF" /><stop offset="1" stopColor="#3B82F6" /></linearGradient></defs>
                    </svg>
                </div>
                <span className="sidebar-title">FleetFlow</span>
            </div>

            <nav className="sidebar-nav">
                {visibleItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                    >
                        <span className="nav-icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                <div className="user-info">
                    <div className="user-avatar">{user?.fullname?.[0] || 'U'}</div>
                    <div className="user-details">
                        <div className="user-name">{user?.fullname}</div>
                        <div className="user-role">{user?.role}</div>
                    </div>
                </div>
                <button className="logout-btn" onClick={logout} title="Logout">⏻</button>
            </div>
        </aside>
    );
}
