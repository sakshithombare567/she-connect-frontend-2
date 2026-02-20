import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Shield, MapPin, FileText, Settings, LogOut, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user, loading, logout } = useAuth();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
                <div className="text-2xl font-bold text-pink-600 animate-pulse">Loading SheConnect...</div>
            </div>
        );
    }

   if (!user) 
    /* if (!activeUser)*/ {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-100 font-sans">
                <div className="text-xl text-gray-600">Please login to view your dashboard.</div>
            </div>
        );
    }

    const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

    return (
        <div className="flex h-screen bg-gray-100 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 w-full bg-white shadow-sm z-40 p-4 flex justify-between items-center">
                <h1 className="text-xl font-bold text-pink-600">SheConnect</h1>
                <button onClick={toggleSidebar} className="text-gray-600 focus:outline-none">
                    {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-md transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-pink-600">SheConnect</h1>
                    {/* Close button for mobile inside sidebar */}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500">
                        <X size={24} />
                    </button>
                </div>
                <nav className="flex-1 p-4 space-y-2">
                    <Link
                        to="/dashboard"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                    >
                        <User size={20} />
                        <span>Profile</span>
                    </Link>
                    <Link
                        to="/start-trip"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                    >
                        <MapPin size={20} />
                        <span>Start Trip</span>
                    </Link>
                    <Link
                        to="/blogs"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                    >
                        <FileText size={20} />
                        <span>Blogs</span>
                    </Link>
                    <Link
                        to="/settings"
                        onClick={() => setIsSidebarOpen(false)}
                        className="flex items-center space-x-3 text-gray-700 p-2 rounded-lg hover:bg-pink-50 hover:text-pink-600"
                    >
                        <Settings size={20} />
                        <span>Settings</span>
                    </Link>
                </nav>
                <div className="p-4 border-t">
                    <button
                        onClick={logout}
                        className="w-full flex items-center space-x-3 text-gray-600 p-2 rounded-lg hover:bg-gray-100"
                    >
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8 overflow-y-auto mt-16 md:mt-0">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold mb-8 text-gray-800">Welcome back, {user.name}!</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* User Profile Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-pink-100 p-3 rounded-full">
                                    <User size={32} className="text-pink-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Your Profile</h3>
                                    <p className="text-gray-500">Personal Information</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm text-gray-500">Full Name</p>
                                    <p className="font-medium text-gray-800">{user.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Email Address</p>
                                    <p className="font-medium text-gray-800">{user.email_id}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Phone Number</p>
                                    <p className="font-medium text-gray-800">{user.phone_no}</p>
                                </div>
                            </div>
                        </div>

                        {/* Emergency Contacts Card */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-red-100">
                            <div className="flex items-center space-x-4 mb-6">
                                <div className="bg-red-100 p-3 rounded-full">
                                    <Shield size={32} className="text-red-600" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold text-gray-800">Emergency Contacts</h3>
                                    <p className="text-gray-500">Always notified in case of emergency</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                {user.emergency_contacts && user.emergency_contacts.length > 0 ? (
                                    user.emergency_contacts.map((contact, index) => (
                                        <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                            <div>
                                                <p className="font-medium text-gray-800">{contact.emergency_name}</p>
                                                <p className="text-sm text-gray-500">{contact.phone_no} ({contact.gender})</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-center">No emergency contacts added.</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
