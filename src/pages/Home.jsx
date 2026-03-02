import React, { useState } from 'react';
import {
    Home as HomeIcon,
    MapPin,
    FileText,
    Shield,
    Users,
    UserPlus,
    ArrowRight,
    Menu,
    Compass,
    Star,
    Clock,
    Hourglass
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Home = () => {
    const { user, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }}></div>
            </div>
        );
    }

    const featuredActions = [
        {
            title: "Start a Trip",
            desc: "Plan your route and find verified female partners.",
            icon: MapPin,
            path: "/start-trip",
            gradient: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
            lightBg: "var(--color-primary-light)"
        },
        {
            title: "Community Blogs",
            desc: "Read safety tips and stories from fellow travelers.",
            icon: FileText,
            path: "/blogs",
            gradient: "linear-gradient(135deg, var(--color-accent), #6D28D9)",
            lightBg: "#F3EEFF"
        },
        {
            title: "Waiting Room",
            desc: "Find and connect with travel partners on your route.",
            icon: Hourglass,
            path: "/waiting-room",
            gradient: "linear-gradient(135deg, var(--color-accent-alt), #D97706)",
            lightBg: "#FEF3C7"
        }
    ];

    return (
        <div className="flex h-screen" style={{ background: 'var(--color-surface-alt, #F5F0FA)', color: 'var(--color-text-primary)' }}>
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 glass-strong z-40 px-4 py-3 flex justify-between items-center">
                    <h1 className="text-lg font-black tracking-tighter" style={{ color: 'var(--color-text-primary)' }}>She<span style={{ color: 'var(--color-primary)' }}>Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-xl" style={{ background: 'var(--color-primary-light)', color: 'var(--color-text-secondary)' }}>
                        <Menu size={22} />
                    </button>
                </header>

                <div className="max-w-6xl mx-auto p-4 sm:p-6 md:p-10 space-y-8 sm:space-y-12">
                    {/* Hero Section */}
                    <div className="relative glass p-5 sm:p-8 md:p-12 rounded-3xl sm:rounded-[48px] overflow-hidden shadow-xl">
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full blur-[120px] opacity-30 animate-pulse" style={{ background: 'var(--color-primary)' }}></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full blur-[120px] opacity-25" style={{ background: 'var(--color-accent)' }}></div>

                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 sm:gap-10">
                            <div className="flex-1 space-y-4 sm:space-y-6">
                                <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
                                    <Star size={14} style={{ fill: 'var(--color-primary)' }} />
                                    <span>Welcome, {user?.name || 'Explorer'}</span>
                                </div>
                                <h2 className="text-2xl sm:text-4xl md:text-6xl font-black tracking-tight leading-[1.1]">
                                    Your Safe Journey <br />
                                    <span style={{
                                        background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                        WebkitBackgroundClip: 'text',
                                        WebkitTextFillColor: 'transparent'
                                    }}>Starts Here.</span>
                                </h2>
                                <p className="text-sm sm:text-lg font-medium max-w-lg leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                                    Connect with verified female travelers, share your experiences, and explore the world with confidence and safety.
                                </p>
                                <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 pt-2 sm:pt-4">
                                    <Link to="/start-trip" className="px-6 sm:px-8 py-3 sm:py-4 text-white rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest shadow-2xl transition-all flex items-center justify-center gap-2 group relative overflow-hidden"
                                        style={{ background: 'var(--color-text-primary)' }}
                                    >
                                        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                                        <span className="relative flex items-center gap-2">
                                            Start Your Trip <ArrowRight size={18} />
                                        </span>
                                    </Link>
                                    <Link to="/blogs" className="px-6 sm:px-8 py-3 sm:py-4 glass rounded-2xl font-black text-xs sm:text-sm uppercase tracking-widest hover:shadow-lg transition-all text-center"
                                        style={{ color: 'var(--color-text-primary)' }}
                                    >
                                        Explore Stories
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:flex flex-1 justify-center relative">
                                <div className="w-80 h-80 rounded-[64px] shadow-2xl rotate-6 flex items-center justify-center relative group overflow-hidden"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                                >
                                    <Compass size={120} className="text-white opacity-20 group-hover:scale-110 transition-transform duration-700" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <HomeIcon size={80} className="text-white drop-shadow-2xl -rotate-6" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-8">
                        {featuredActions.map((action, index) => {
                            const Icon = action.icon;
                            return (
                                <Link
                                    key={index}
                                    to={action.path}
                                    className="glass p-5 sm:p-8 rounded-3xl sm:rounded-[40px] shadow-lg hover:shadow-xl transition-all group hover:-translate-y-1"
                                >
                                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl flex items-center justify-center mb-4 sm:mb-6 shadow-inner group-hover:scale-110 transition-transform text-white"
                                        style={{ background: action.gradient }}
                                    >
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="text-lg sm:text-xl font-black mb-1 sm:mb-2" style={{ color: 'var(--color-text-primary)' }}>{action.title}</h3>
                                    <p className="font-medium text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6" style={{ color: 'var(--color-text-secondary)' }}>
                                        {action.desc}
                                    </p>
                                    <div className="flex items-center font-black text-xs uppercase tracking-widest gap-2 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--color-primary)' }}>
                                        Access Now <ArrowRight size={14} />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>

                    {/* Safety Notice Footer */}
                    <div className="glass-dark rounded-3xl sm:rounded-[40px] p-5 sm:p-8 md:p-12 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[120px] opacity-10 group-hover:opacity-30 transition-opacity" style={{ background: 'var(--color-primary)' }}></div>
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 sm:gap-8">
                            <div className="flex items-center gap-4 sm:gap-6">
                                <div className="p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-xl text-white"
                                    style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}
                                >
                                    <Shield size={24} className="sm:hidden" />
                                    <Shield size={32} className="hidden sm:block" />
                                </div>
                                <div>
                                    <h4 className="text-xl sm:text-2xl font-black tracking-tight mb-1 sm:mb-2">Our Safety Promise</h4>
                                    <p className="text-gray-400 font-medium max-w-md">
                                        Every traveler on SheConnect is identity-verified. We're committed to creating a secure community for women globally.
                                    </p>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl flex items-center gap-4 border border-white/10">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-full border-2 flex items-center justify-center overflow-hidden"
                                            style={{ borderColor: 'var(--color-text-primary)', background: 'var(--color-primary-light)' }}
                                        >
                                            <Users size={18} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                    ))}
                                </div>
                                <div className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--color-primary)' }}>
                                    5.2k+ Verified Members
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Home;
