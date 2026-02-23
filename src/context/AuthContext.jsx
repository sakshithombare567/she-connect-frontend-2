import React, { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/authService';
import { mockUser } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Using mock user — switch to null + fetchProfile() when backend is ready
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);














    const fetchProfile = async () => {
        try {
            const response = await getProfile();
            setUser(response.data);
        } catch (error) {
            console.error("Failed to fetch profile:", error);
            localStorage.removeItem('token');
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            fetchProfile();
        } else {
            setLoading(false);
        }
    }, []);

    const login = async (userData) => {
        try {
            // If userData contains token, save it and fetch profile
            if (userData.access_token) {
                localStorage.setItem('token', userData.access_token);
                await fetchProfile();
            } else {
                setUser(userData);
            }
        } catch (error) {
            console.error("Login failed:", error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
