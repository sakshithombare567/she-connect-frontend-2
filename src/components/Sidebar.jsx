import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    User,
    MapPin,
    FileText,
    Settings,
    LogOut,
    X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTrip } from '../context/TripContext';

const Sidebar = ({ isOpen, onClose }) => {
    const { logout } = useAuth();
    const location = useLocation();
    const { hasActiveTrip } = useTrip();

    const menuItems = [
        { path: '/home', icon: Home, label: 'Home' },
        { path: '/start-trip', icon: MapPin, label: 'Start Trip', indicator: hasActiveTrip },
        { path: '/blogs', icon: FileText, label: 'Blogs' },
        { path: '/profile', icon: User, label: 'Profile' },
        { path: '/settings', icon: Settings, label: 'Settings' },
    ];

    const isActive = (path) => location.pathname === path;

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
                    onClick={onClose}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 glass-strong shadow-2xl transform transition-transform duration-300 ease-out md:relative md:translate-x-0 md:z-auto ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
                style={{ pointerEvents: 'auto' }}
            >
                <div className="p-8 flex justify-between items-center" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                    <h1 className="text-2xl font-black tracking-tighter" style={{ color: 'var(--color-text-primary)' }}>
                        She<span style={{ color: 'var(--color-primary)' }}>Connect</span>
                    </h1>
                    <button onClick={onClose} className="md:hidden p-2 rounded-xl transition-colors" style={{ color: 'var(--color-text-secondary)' }}>
                        <X size={24} />
                    </button>
                </div>

                <div className="flex flex-col h-[calc(100vh-100px)] justify-between p-4">
                    <nav className="space-y-1.5">
                        {menuItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={onClose}
                                    className={`flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-200 group ${isActive(item.path)
                                        ? 'text-white shadow-lg translate-x-1'
                                        : ''
                                        }`}
                                    style={isActive(item.path)
                                        ? { background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }
                                        : { color: 'var(--color-text-secondary)' }
                                    }
                                    onMouseEnter={e => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = 'var(--color-primary-light)';
                                            e.currentTarget.style.color = 'var(--color-primary)';
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isActive(item.path)) {
                                            e.currentTarget.style.background = 'transparent';
                                            e.currentTarget.style.color = 'var(--color-text-secondary)';
                                        }
                                    }}
                                >
                                    <div className="flex items-center space-x-3.5">
                                        <div className="relative">
                                            <Icon
                                                size={22}
                                                className="transition-colors"
                                            />
                                            {item.indicator && !isActive(item.path) && (
                                                <div className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                            )}
                                        </div>
                                        <span className="font-semibold">
                                            {item.label}
                                        </span>
                                    </div>
                                    {item.badge && (
                                        <span className={`flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-black ${isActive(item.path) ? 'bg-white' : 'text-white'}`}
                                            style={isActive(item.path) ? { color: 'var(--color-primary)' } : { background: 'var(--color-primary)' }}
                                        >
                                            {item.badge}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    <div className="pt-4 px-2 pb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.3)' }}>
                        <button
                            onClick={logout}
                            className="w-full flex items-center space-x-3.5 px-4 py-3.5 rounded-2xl transition-all duration-200 group"
                            style={{ color: 'var(--color-text-secondary)' }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#FEF2F2';
                                e.currentTarget.style.color = '#DC2626';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'transparent';
                                e.currentTarget.style.color = 'var(--color-text-secondary)';
                            }}
                        >
                            <LogOut size={22} className="group-hover:translate-x-0.5 transition-transform" />
                            <span className="font-semibold">Logout</span>
                        </button>

                        <div className="mt-8 p-4 rounded-[20px] glass" style={{ borderColor: 'rgba(181,67,110,0.15)' }}>
                            <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'var(--color-primary)' }}>Support</p>
                            <p className="text-xs font-medium leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>Need help? We're here for you 24/7.</p>
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
