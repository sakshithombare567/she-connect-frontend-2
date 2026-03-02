import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Save,
    Eye,
    EyeOff,
    Menu,
    ShieldCheck,
    Shield,
    Check,
    Pencil,
    X
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
    const { user, loading, updateUser } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [passwords, setPasswords] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Edit mode state
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        phone_no: '',
    });
    const [editMessage, setEditMessage] = useState({ type: '', text: '' });
    const [saving, setSaving] = useState(false);

    // Emergency contacts edit state
    const [isEditingContacts, setIsEditingContacts] = useState(false);
    const [editContacts, setEditContacts] = useState([]);
    const [contactMessage, setContactMessage] = useState({ type: '', text: '' });
    const [savingContacts, setSavingContacts] = useState(false);

    // Initialize edit form when user loads or edit starts
    useEffect(() => {
        if (user) {
            setEditForm({
                name: user.name || '',
                phone_no: user.phone_no || '',
            });
        }
    }, [user, isEditing]);

    const handleEditChange = (field, value) => {
        setEditForm(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        setEditMessage({ type: '', text: '' });

        // Validation
        if (!editForm.name || editForm.name.trim().length < 2) {
            setEditMessage({ type: 'error', text: 'Name must be at least 2 characters.' });
            return;
        }
        if (!editForm.phone_no || !/^[0-9]{10}$/.test(editForm.phone_no)) {
            setEditMessage({ type: 'error', text: 'Phone must be a valid 10-digit number.' });
            return;
        }

        setSaving(true);
        try {
            // Simulate API delay
            await new Promise(res => setTimeout(res, 600));
            updateUser(editForm);
            setEditMessage({ type: 'success', text: 'Profile updated successfully!' });
            setTimeout(() => {
                setIsEditing(false);
                setEditMessage({ type: '', text: '' });
            }, 1500);
        } catch (err) {
            setEditMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setSaving(false);
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditMessage({ type: '', text: '' });
        if (user) {
            setEditForm({
                name: user.name || '',
                phone_no: user.phone_no || '',
            });
        }
    };

    // ── Emergency Contacts Handlers ──
    const startEditContacts = () => {
        const contacts = user.emergency_contacts && user.emergency_contacts.length > 0
            ? user.emergency_contacts.map(c => ({ emergency_name: c.emergency_name || '', phone_no: c.phone_no || '' }))
            : [{ emergency_name: '', phone_no: '' }, { emergency_name: '', phone_no: '' }];
        setEditContacts(contacts);
        setIsEditingContacts(true);
        setContactMessage({ type: '', text: '' });
    };

    const handleContactChange = (index, field, value) => {
        setEditContacts(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    };

    const handleSaveContacts = async () => {
        setContactMessage({ type: '', text: '' });

        // Validate
        for (let i = 0; i < editContacts.length; i++) {
            const c = editContacts[i];
            if (!c.emergency_name || c.emergency_name.trim().length < 2) {
                setContactMessage({ type: 'error', text: `Contact ${i + 1}: Name must be at least 2 characters.` });
                return;
            }
            if (!c.phone_no || !/^[0-9]{10}$/.test(c.phone_no)) {
                setContactMessage({ type: 'error', text: `Contact ${i + 1}: Phone must be a valid 10-digit number.` });
                return;
            }
        }

        // Check duplicates
        if (editContacts.length === 2 && editContacts[0].phone_no === editContacts[1].phone_no) {
            setContactMessage({ type: 'error', text: 'Both contacts cannot have the same phone number.' });
            return;
        }

        setSavingContacts(true);
        try {
            await new Promise(res => setTimeout(res, 600));
            updateUser({ emergency_contacts: editContacts });
            setContactMessage({ type: 'success', text: 'Emergency contacts updated!' });
            setTimeout(() => {
                setIsEditingContacts(false);
                setContactMessage({ type: '', text: '' });
            }, 1500);
        } catch (err) {
            setContactMessage({ type: 'error', text: 'Failed to update contacts.' });
        } finally {
            setSavingContacts(false);
        }
    };

    const handleCancelContacts = () => {
        setIsEditingContacts(false);
        setContactMessage({ type: '', text: '' });
    };

    const handleChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const handlePasswordSubmit = (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwords.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match.' });
            return;
        }

        // Actually persist the new password to mock storage
        const savedUser = localStorage.getItem('mock_registered_user');
        if (savedUser) {
            const parsed = JSON.parse(savedUser);
            parsed.password = passwords.newPassword;
            localStorage.setItem('mock_registered_user', JSON.stringify(parsed));
        }

        setMessage({ type: 'success', text: 'Password updated successfully! Use your new password to log in next time.' });
        setPasswords({ newPassword: '', confirmPassword: '' });

        // Clear success message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center" style={{ background: 'var(--color-surface)' }}>
                <div className="w-16 h-16 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-primary-light)', borderTopColor: 'var(--color-primary)' }}></div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex h-screen items-center justify-center p-4" style={{ background: 'var(--color-surface-alt, #F5F0FA)' }}>
                <div className="glass-strong p-8 rounded-[32px] shadow-2xl text-center max-w-sm">
                    <User size={48} className="mx-auto mb-4" style={{ color: 'var(--color-text-secondary)' }} />
                    <h3 className="text-xl font-black mb-2" style={{ color: 'var(--color-text-primary)' }}>Access Restricted</h3>
                    <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Please login to view your profile.</p>
                </div>
            </div>
        );
    }

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

                <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-10 space-y-6 sm:space-y-10">
                    <div className="mb-6 sm:mb-10">
                        <p className="font-bold uppercase tracking-widest text-xs mb-2" style={{ color: 'var(--color-primary)' }}>Member Space</p>
                        <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight" style={{ color: 'var(--color-text-primary)' }}>
                            Your <span style={{
                                background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent'
                            }}>Profile</span> ✨
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-10">
                        <div className="lg:col-span-2 space-y-6 sm:space-y-10">
                            {/* Personal Details Card */}
                            <div className="glass p-5 sm:p-8 md:p-10 rounded-3xl sm:rounded-[40px] shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: 'var(--color-primary-light)' }}></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between gap-4 mb-10 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 rounded-[20px] shadow-lg text-white"
                                                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}>
                                                <User size={28} />
                                            </div>
                                            <div>
                                                <h3 className="text-xl sm:text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Personal Details</h3>
                                                <p className="font-medium text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                                                    {isEditing ? 'Edit your information' : 'Verified account information'}
                                                </p>
                                            </div>
                                        </div>
                                        {!isEditing ? (
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all hover:shadow-md"
                                                style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}
                                            >
                                                <Pencil size={16} />
                                                <span className="hidden sm:inline">Edit</span>
                                            </button>
                                        ) : (
                                            <button
                                                onClick={handleCancelEdit}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold uppercase tracking-wider transition-all hover:bg-red-100"
                                                style={{ background: '#FEE2E2', color: '#EF4444' }}
                                            >
                                                <X size={16} />
                                                <span className="hidden sm:inline">Cancel</span>
                                            </button>
                                        )}
                                    </div>

                                    {/* Edit message */}
                                    {editMessage.text && (
                                        <div className={`p-4 rounded-2xl mb-6 flex items-center gap-3 text-sm font-bold ${editMessage.type === 'error'
                                            ? 'bg-rose-50 text-rose-600 border border-rose-100'
                                            : 'bg-green-50 text-green-600 border border-green-100'
                                            }`}>
                                            <ShieldCheck size={16} />
                                            {editMessage.text}
                                        </div>
                                    )}

                                    {isEditing ? (
                                        /* ── EDIT MODE ── */
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Full Name</label>
                                                    <input
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={(e) => handleEditChange('name', e.target.value)}
                                                        className="w-full p-4 glass rounded-2xl outline-none transition-all font-semibold focus:ring-2 focus:ring-pink-500/30"
                                                        style={{ color: 'var(--color-text-primary)' }}
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
                                                        Email Address <span className="text-gray-300 font-medium normal-case">(cannot change)</span>
                                                    </label>
                                                    <input
                                                        type="email"
                                                        value={user.email_id}
                                                        disabled
                                                        className="w-full p-4 glass rounded-2xl outline-none font-semibold opacity-50 cursor-not-allowed"
                                                        style={{ color: 'var(--color-text-primary)' }}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Phone Number</label>
                                                    <input
                                                        type="tel"
                                                        value={editForm.phone_no}
                                                        onChange={(e) => handleEditChange('phone_no', e.target.value)}
                                                        className="w-full p-4 glass rounded-2xl outline-none transition-all font-semibold focus:ring-2 focus:ring-pink-500/30"
                                                        style={{ color: 'var(--color-text-primary)' }}
                                                        placeholder="10-digit phone number"
                                                        maxLength={10}
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="block text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>
                                                        College <span className="text-gray-300 font-medium normal-case">(cannot change)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        value={user.college || 'IMCC Pune'}
                                                        disabled
                                                        className="w-full p-4 glass rounded-2xl outline-none font-semibold opacity-50 cursor-not-allowed"
                                                        style={{ color: 'var(--color-text-primary)' }}
                                                    />
                                                </div>
                                            </div>

                                            <button
                                                onClick={handleSaveProfile}
                                                disabled={saving}
                                                className="w-full sm:w-auto text-white px-8 py-4 rounded-2xl transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 relative group overflow-hidden disabled:opacity-50"
                                                style={{ background: 'var(--color-text-primary)' }}
                                            >
                                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                                                <span className="relative flex items-center gap-2">
                                                    <Save size={18} />
                                                    {saving ? 'Saving...' : 'Save Changes'}
                                                </span>
                                            </button>
                                        </div>
                                    ) : (
                                        /* ── VIEW MODE ── */
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Full Name</p>
                                                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.name}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Email Address</p>
                                                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.email_id}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>Phone Number</p>
                                                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.phone_no}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--color-text-secondary)' }}>College</p>
                                                <p className="text-xl font-bold" style={{ color: 'var(--color-text-primary)' }}>{user.college || 'IMCC Pune'}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reset Password Card */}
                            <div className="glass p-8 md:p-10 rounded-[40px] shadow-lg relative overflow-hidden group">
                                <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full blur-3xl opacity-30 group-hover:opacity-50 transition-opacity" style={{ background: 'var(--color-accent)' }}></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-5 mb-10 pb-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.3)' }}>
                                        <div className="p-4 rounded-[20px] shadow-lg text-white" style={{ background: 'var(--color-text-primary)' }}>
                                            <Lock size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black tracking-tight" style={{ color: 'var(--color-text-primary)' }}>Security</h3>
                                            <p className="font-medium" style={{ color: 'var(--color-text-secondary)' }}>Update your account password</p>
                                        </div>
                                    </div>

                                    {message.text && (
                                        <div className={`p-5 rounded-[24px] mb-8 flex items-center gap-3 ${message.type === 'error'
                                            ? 'bg-rose-50 text-rose-700 border border-rose-100'
                                            : 'bg-green-50 text-green-700 border border-green-100'
                                            }`}>
                                            <div className={`p-1.5 rounded-full ${message.type === 'error' ? 'bg-rose-200' : 'bg-green-200'}`}>
                                                <ShieldCheck size={16} />
                                            </div>
                                            <span className="font-bold text-sm">{message.text}</span>
                                        </div>
                                    )}

                                    <form onSubmit={handlePasswordSubmit} className="space-y-8 max-w-xl">
                                        <div className="space-y-1">
                                            <label className="block font-bold ml-1 uppercase tracking-wider text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>New Password</label>
                                            <div className="relative group">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    name="newPassword"
                                                    value={passwords.newPassword}
                                                    onChange={handleChange}
                                                    className="w-full p-4 glass rounded-2xl outline-none transition-all font-semibold pr-14"
                                                    style={{ color: 'var(--color-text-primary)' }}
                                                    placeholder="Min. 6 characters"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-4 transition-colors"
                                                    style={{ color: 'var(--color-text-secondary)' }}
                                                >
                                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="block font-bold ml-1 uppercase tracking-wider text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>Confirm Password</label>
                                            <input
                                                type="password"
                                                name="confirmPassword"
                                                value={passwords.confirmPassword}
                                                onChange={handleChange}
                                                className="w-full p-4 glass rounded-2xl outline-none transition-all font-semibold"
                                                style={{ color: 'var(--color-text-primary)' }}
                                                placeholder="Repeat your password"
                                                required
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            className="w-full text-white px-8 py-5 rounded-2xl transition-all font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 relative group overflow-hidden"
                                            style={{ background: 'var(--color-text-primary)' }}
                                        >
                                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))' }}></div>
                                            <span className="relative flex items-center gap-2">
                                                <Save size={20} />
                                                Update Password
                                            </span>
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Safe Contacts Card */}
                            <div className="p-6 sm:p-8 rounded-[40px] shadow-2xl text-white relative overflow-hidden"
                                style={{ background: 'linear-gradient(135deg, var(--color-primary), var(--color-primary-dark))' }}>
                                <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="bg-white/20 p-4 rounded-[24px] shadow-inner mb-4 w-fit">
                                                <Shield size={32} />
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight mb-1">Safe Contacts</h3>
                                            <p className="text-white/70 font-medium text-sm leading-relaxed">Guardians alerted during emergencies.</p>
                                        </div>
                                        {!isEditingContacts && (
                                            <button
                                                onClick={startEditContacts}
                                                className="bg-white/20 hover:bg-white/30 p-2.5 rounded-xl transition-all"
                                                title="Edit contacts"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        )}
                                    </div>

                                    {/* Contact message */}
                                    {contactMessage.text && (
                                        <div className={`p-3 rounded-2xl mb-4 text-sm font-bold ${contactMessage.type === 'error'
                                            ? 'bg-red-500/20 text-red-100 border border-red-400/30'
                                            : 'bg-green-500/20 text-green-100 border border-green-400/30'
                                            }`}>
                                            {contactMessage.text}
                                        </div>
                                    )}

                                    {isEditingContacts ? (
                                        /* ── EDIT CONTACTS MODE ── */
                                        <div className="space-y-4">
                                            {editContacts.map((contact, index) => (
                                                <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl space-y-3">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-white/50">Contact #{index + 1}</p>
                                                    <input
                                                        type="text"
                                                        value={contact.emergency_name}
                                                        onChange={(e) => handleContactChange(index, 'emergency_name', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none text-white font-semibold text-sm placeholder:text-white/30 focus:border-white/50 transition-all"
                                                        placeholder="Full Name"
                                                    />
                                                    <input
                                                        type="tel"
                                                        value={contact.phone_no}
                                                        onChange={(e) => handleContactChange(index, 'phone_no', e.target.value)}
                                                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl outline-none text-white font-semibold text-sm placeholder:text-white/30 focus:border-white/50 transition-all"
                                                        placeholder="10-digit phone"
                                                        maxLength={10}
                                                    />
                                                </div>
                                            ))}

                                            <div className="flex gap-3 pt-2">
                                                <button
                                                    onClick={handleCancelContacts}
                                                    className="flex-1 py-3 border border-white/30 rounded-xl text-sm font-bold hover:bg-white/10 transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    onClick={handleSaveContacts}
                                                    disabled={savingContacts}
                                                    className="flex-1 py-3 bg-white text-pink-600 rounded-xl text-sm font-black hover:bg-white/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    <Save size={14} />
                                                    {savingContacts ? 'Saving...' : 'Save'}
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* ── VIEW CONTACTS MODE ── */
                                        <div className="space-y-4">
                                            {user.emergency_contacts && user.emergency_contacts.length > 0 ? (
                                                user.emergency_contacts.map((contact, index) => (
                                                    <div key={index} className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl flex items-center justify-between">
                                                        <div>
                                                            <p className="font-bold text-sm">{contact.emergency_name}</p>
                                                            <p className="text-xs text-white/60 font-medium">{contact.phone_no}</p>
                                                        </div>
                                                        <div className="bg-green-400 p-1.5 rounded-full shadow-lg">
                                                            <Check size={12} className="text-white" />
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <button
                                                    onClick={startEditContacts}
                                                    className="w-full py-4 px-6 border border-white/30 rounded-2xl text-sm font-bold hover:bg-white/20 transition-all"
                                                >
                                                    Add Contact +
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="glass-dark p-8 rounded-[40px] shadow-2xl text-white">
                                <h3 className="text-xl font-black mb-4">Security Tip 🛡️</h3>
                                <p className="text-sm font-medium leading-relaxed text-gray-400">
                                    Never share your login OTP or password with anyone, even if they claim to be from the SheConnect team.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Profile;
