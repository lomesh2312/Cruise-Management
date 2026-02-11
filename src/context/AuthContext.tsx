/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

interface AuthContextType {
    token: string | null;
    admin: any | null;
    login: (token: string, admin: any) => void;
    logout: () => void;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [token, setToken] = useState<string | null>(localStorage.getItem('cruise_token'));
    const [admin, setAdmin] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = () => {
        localStorage.removeItem('cruise_token');
        setToken(null);
        setAdmin(null);
    };

    const login = (newToken: string, newAdmin: any) => {
        localStorage.setItem('cruise_token', newToken);
        setToken(newToken);
        setAdmin(newAdmin);
    };

    useEffect(() => {
        if (token) {
            api.get('/auth/me')
                .then(res => setAdmin(res.data))
                .catch(() => logout())
                .finally(() => setLoading(false));
        } else {
            // eslint-disable-next-line
            setLoading(false);
        }
    }, [token]);

    return (
        <AuthContext.Provider value={{ token, admin, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};
