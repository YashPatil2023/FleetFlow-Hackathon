import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [form, setForm] = useState({ fullname: '', email: '', username: '', password: '', role: 'driver' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();

    const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async e => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (isLogin) {
                await login(form.username, form.password);
            } else {
                if (!form.fullname || !form.email || !form.username || !form.password) {
                    setError('All fields are required');
                    setLoading(false);
                    return;
                }
                await register(form);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
        setLoading(false);
    };

    return (
        <div className="auth-screen">
            <div className="auth-container">
                <div className="auth-logo">
                    <div className="logo-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <rect width="48" height="48" rx="12" fill="url(#logoGrad)" />
                            <path d="M14 30L20 18L26 24L34 14" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx="34" cy="14" r="3" fill="white" />
                            <defs><linearGradient id="logoGrad" x1="0" y1="0" x2="48" y2="48"><stop stopColor="#6C63FF" /><stop offset="1" stopColor="#3B82F6" /></linearGradient></defs>
                        </svg>
                    </div>
                    <h1 className="auth-title">FleetFlow</h1>
                    <p className="auth-subtitle">Fleet & Logistics Management System</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <h2>{isLogin ? 'Welcome back' : 'Create Account'}</h2>
                    <p className="auth-form-sub">{isLogin ? 'Sign in to your account' : 'Fill in the details to register'}</p>

                    {error && <div className="form-error">{error}</div>}

                    {!isLogin && (
                        <>
                            <div className="form-group">
                                <label>Full Name *</label>
                                <input type="text" name="fullname" value={form.fullname} onChange={handleChange} placeholder="Enter your full name" />
                            </div>
                            <div className="form-group">
                                <label>Email *</label>
                                <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter your email" />
                            </div>
                        </>
                    )}

                    <div className="form-group">
                        <label>Username *</label>
                        <input type="text" name="username" value={form.username} onChange={handleChange} placeholder="Enter your username" />
                    </div>
                    <div className="form-group">
                        <label>Password *</label>
                        <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter your password" />
                    </div>

                    {!isLogin && (
                        <div className="form-group">
                            <label>Role *</label>
                            <select name="role" value={form.role} onChange={handleChange}>
                                <option value="admin">Admin</option>
                                <option value="dispatcher">Dispatcher</option>
                                <option value="driver">Driver</option>
                            </select>
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
                        {loading ? 'Please wait...' : (isLogin ? 'Login' : 'Register')}
                    </button>

                    <p className="auth-switch">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <a href="#" onClick={e => { e.preventDefault(); setIsLogin(!isLogin); setError(''); }}>
                            {isLogin ? 'Register' : 'Login'}
                        </a>
                    </p>
                </form>
            </div>
        </div>
    );
}
