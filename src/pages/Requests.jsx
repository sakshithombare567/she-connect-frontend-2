import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import {
    User,
    Menu,
    X as CloseIcon,
    ArrowRight,
    MapPin,
    Clock,
    Heart,
    MessageSquare,
    UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { mockReceivedRequests } from '../data/mockData';

import { useNavigate } from 'react-router-dom';
import PrivacyModal from '../components/common/PrivacyModal';

const Requests = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('received');
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    // Mock trip for the logged-in user (usually from global state or context)
    const userTrip = {
        start: "Pune",
        end: "Mumbai",
        mode: "Car"
    };

    const handleAcceptClick = (request) => {
        setSelectedRequest(request);
        setShowPrivacyModal(true);
    };

    const handlePrivacyConfirm = (privacyChoice) => {
        if (!selectedRequest) return;

        navigate('/live-connection', {
            state: {
                partner: selectedRequest,
                privacyChoice: privacyChoice,
                userTrip: userTrip
            }
        });

        setShowPrivacyModal(false);
        setSelectedRequest(null);
    };

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user && !loading) {
        return <div className="p-10 text-center">Please login to view requests.</div>;
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-10">
                    {/* Welcome Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <p className="text-pink-600 font-bold uppercase tracking-widest text-xs mb-2">Travel Partners</p>
                            <h2 className="text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                Connection <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Requests</span> 🤝
                            </h2>
                            <p className="mt-2 text-gray-500 font-medium font-sans">View and manage trip interests shared between you and others.</p>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-8 border-b border-gray-100">
                        <button
                            onClick={() => setActiveTab('received')}
                            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'received' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Received
                            {activeTab === 'received' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-full"></div>}
                        </button>
                        <button
                            onClick={() => setActiveTab('sent')}
                            className={`pb-4 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === 'sent' ? 'text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Sent
                            {activeTab === 'sent' && <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 rounded-full"></div>}
                        </button>
                    </div>

                    {/* Connect Requests Section */}
                    <div className="space-y-6">
                        {activeTab === 'received' ? (
                            <div className="grid grid-cols-1 gap-6">
                                {mockReceivedRequests.length > 0 ? (
                                    mockReceivedRequests.map((request) => (
                                        <div key={request.id} className="bg-white p-8 rounded-[40px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.05)] transition-all group overflow-hidden relative">
                                            <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                            <div className="absolute top-4 right-8">
                                                <span className="text-[10px] bg-pink-50 text-pink-600 font-black px-3 py-1.5 rounded-full uppercase tracking-widest border border-pink-100/50 shadow-sm">
                                                    Shared with you
                                                </span>
                                            </div>

                                            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8 mt-4 lg:mt-0">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-2xl border border-gray-100 shadow-inner group-hover:bg-pink-50 transition-colors">
                                                        {request.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <h4 className="text-xl font-black text-gray-900 tracking-tight">{request.name}</h4>
                                                            <span className="text-[10px] bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                                {request.college}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap items-center gap-5 text-sm text-gray-400 font-bold">
                                                            <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1 rounded-lg border border-pink-100/50">
                                                                <MapPin size={14} />
                                                                <span>{request.start} → {request.end}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <Clock size={16} />
                                                                <span>{new Date(request.requested_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-4">
                                                    <button className="flex-1 lg:flex-none py-4 px-6 rounded-2xl bg-gray-50 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition-all font-bold flex items-center justify-center gap-2 border border-transparent hover:border-rose-100">
                                                        <CloseIcon size={20} />
                                                        Decline
                                                    </button>
                                                    <button
                                                        onClick={() => handleAcceptClick(request)}
                                                        className="flex-1 lg:flex-none py-4 px-8 rounded-2xl bg-gray-900 text-white font-black text-sm hover:shadow-2xl hover:shadow-pink-100 transition-all flex items-center justify-center gap-3 bg-gradient-to-r hover:from-pink-600 hover:to-rose-600 group-hover:from-gray-900 group-hover:to-gray-800"
                                                    >
                                                        Accept <ArrowRight size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <EmptyState message="No Pending Requests" submessage="When other girls want to connect for a trip, they'll appear right here!" />
                                )}
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 gap-6">
                                <EmptyState message="No Sent Requests" submessage="Start a trip or find partners to see your sent requests here." />
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Privacy Modal */}
            <PrivacyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                onConfirm={handlePrivacyConfirm}
                partnerName={selectedRequest?.name}
            />
        </div>
    );
};

const EmptyState = ({ message, submessage }) => (
    <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-50 rounded-full text-gray-300 mb-2">
            <UserPlus size={32} />
        </div>
        <h3 className="text-xl font-black text-gray-900">{message}</h3>
        <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">{submessage}</p>
    </div>
);

export default Requests;
