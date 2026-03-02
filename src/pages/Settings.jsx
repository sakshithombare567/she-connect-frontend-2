import React, { useState } from 'react';
import { Menu, Settings as SettingsIcon, Bell, Eye, Shield, HelpCircle, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Settings = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const settingSections = [
        {
            title: "Notifications",
            icon: Bell,
            gradient: "linear-gradient(135deg, var(--color-accent), #6D28D9)",
            lightBg: "#F3EEFF",
            desc: "Manage how you receive trip alerts and messages"
        },
        {
            title: "Privacy & Visibility",
            icon: Eye,
            gradient: "linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))",
            lightBg: "var(--color-primary-light)",
            desc: "Control who can see your travel profile and college info"
        },
        {
            title: "Safety Shield",
            icon: Shield,
            gradient: "linear-gradient(135deg, #10B981, #059669)",
            lightBg: "#D1FAE5",
            desc: "Configure emergency trigger settings and location sharing"
        },
        {
            title: "Help & Support",
            icon: HelpCircle,
            gradient: "linear-gradient(135deg, var(--color-accent-alt), #D97706)",
            lightBg: "#FEF3C7",
            desc: "Contact 24/7 support or read safety guidelines"
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

                <div className="max-w-4xl mx-auto p-4 sm:p-6 md:p-10">
                    <div className="mb-6 sm:mb-10">
                        <p className="font-bold uppercase tracking-widest text-xs mb-2" style={{ color: 'var(--color-primary)' }}>Preferences</p>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                            App <span style={{
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Settings</span> ⚙️
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:gap-6">
                        <div className="glass p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: 'var(--color-primary)' }}></div>

                            <div className="relative z-10 space-y-3 sm:space-y-4">
                                <div className="flex items-center gap-3 sm:gap-5 mb-6 sm:mb-10 pb-4 sm:pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                    <div className="p-3 sm:p-4 rounded-2xl sm:rounded-[20px] shadow-lg text-white"
                                        style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                                        <SettingsIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>App Preferences</h3>
                                        <p className="font-medium text-sm hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>Customize your SheConnect experience</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {settingSections.map((section, index) => {
                                        const Icon = section.icon;
                                        return (
                                            <button
                                                key={index}
                                                className="w-full p-4 sm:p-6 rounded-2xl sm:rounded-3xl transition-all flex items-center justify-between group/item glass hover:shadow-lg hover:-translate-y-0.5"
                                            >
                                                <div className="flex items-center gap-3 sm:gap-5">
                                                    <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl transition-transform group-hover/item:scale-110 text-white"
                                                        style={{ background: section.gradient }}>
                                                        <Icon size={20} />
                                                    </div>
                                                    <div className="text-left">
                                                        <h4 className="font-black tracking-tight text-sm sm:text-base" style={{ color: 'var(--color-text-primary)' }}>{section.title}</h4>
                                                        <p className="text-xs sm:text-sm font-bold hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>{section.desc}</p>
                                                    </div>
                                                </div>
                                                <div className="p-2 rounded-xl transition-all"
                                                    style={{ background: 'rgba(255,255,255,0.5)', color: 'var(--color-text-secondary)' }}>
                                                    <ChevronRight size={20} />
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="glass-dark p-6 sm:p-10 rounded-3xl sm:rounded-[40px] shadow-2xl text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-[100px] opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: 'var(--color-primary)' }}></div>
                            <h4 className="text-xl font-black mb-2">Beta Access</h4>
                            <p className="font-medium leading-relaxed max-w-sm text-gray-400">Some advanced settings like "Dark Mode" and "Voice Alerts" are coming in the next update!</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Settings;
