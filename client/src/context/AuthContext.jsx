import { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('ff_user');
        return saved ? JSON.parse(saved) : null;
    });
    const [loading, setLoading] = useState(false);

    const login = async (username, password) => {
        const res = await API.post('/auth/login', { username, password });
        localStorage.setItem('ff_token', res.data.token);
        localStorage.setItem('ff_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    };

    const register = async (data) => {
        const res = await API.post('/auth/register', data);
        localStorage.setItem('ff_token', res.data.token);
        localStorage.setItem('ff_user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        return res.data;
    };

    const logout = () => {
        localStorage.removeItem('ff_token');
        localStorage.removeItem('ff_user');
        setUser(null);
    };

    const hasRole = (...roles) => user && roles.includes(user.role);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading, hasRole }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
