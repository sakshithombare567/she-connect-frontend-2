import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import MapLibreMap from '../components/MapLibre';
import {
    ArrowLeft,
    Menu,
    Shield,
    User as UserIcon,
    MapPin,
    Play,
    CheckCircle2,
    Navigation2,
    MessageCircle,
    Phone,
    AlertCircle
} from 'lucide-react';
import EmergencyModal from '../components/EmergencyModal';
import ChatRoom from '../components/ChatRoom';
import FeedbackModal from '../components/FeedbackModal';
import { useAuth } from '../context/AuthContext';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';

const LiveConnection = () => {
    const { user, loading: authLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // State from navigation (partner, privacy, etc)
    const { partner, privacyChoice, userTrip } = location.state || {};

    const [status, setStatus] = useState('coordinated'); // coordinated -> meeting -> connected
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [mapMode, setMapMode] = useState('starts'); // 'starts' or 'route'
    const [loading, setLoading] = useState(true);
    const [showEmergency, setShowEmergency] = useState(false);
    const [showFeedback, setShowFeedback] = useState(false);
    const [chatDisabled, setChatDisabled] = useState(false);
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        console.debug('LiveConnection: showEmergency ->', showEmergency);
    }, [showEmergency]);

    useEffect(() => {
        if (!partner || !userTrip) return;

        async function fetchCoordinates() {
            try {
                // If coordinated, show both starting points
                if (mapMode === 'starts') {
                    const [myStart, partnerStart] = await Promise.all([
                        getCoordsFromLocation(userTrip.start),
                        getCoordsFromLocation(partner.start)
                    ]);
                    setStartCoords(myStart);
                    setEndCoords(partnerStart);
                } else {
                    // If connected, show route from start to end
                    const [routeStart, routeEnd] = await Promise.all([
                        getCoordsFromLocation(userTrip.start),
                        getCoordsFromLocation(userTrip.end)
                    ]);
                    setStartCoords(routeStart);
                    setEndCoords(routeEnd);
                }
            } catch (err) {
                console.error("Error fetching coordinates:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchCoordinates();
    }, [partner, userTrip, mapMode]);

    const handleMeet = () => {
        setStatus('meeting');
        // Simulate meeting process...
        setTimeout(() => {
            setStatus('connected');
            setMapMode('route');
        }, 1500);
    };

    if (authLoading || loading) {
        return (
            <div className="flex h-screen items-center justify-center bg-white font-sans">
                <div className="w-16 h-16 border-4 border-pink-100 border-t-pink-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!partner) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#f8fafc] font-sans p-4">
                <div className="bg-white p-8 rounded-[32px] shadow-2xl border border-gray-100 text-center max-w-sm">
                    <AlertCircle size={48} className="mx-auto text-rose-500 mb-4" />
                    <h3 className="text-xl font-black text-gray-900 mb-2">No Active Connection</h3>
                    <p className="text-gray-500 font-medium mb-6">Please find a partner first to use this live coordination space.</p>
                    <button onClick={() => navigate('/home')} className="w-full py-4 bg-gray-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest">
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans text-gray-900">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter">She<span className="text-pink-600">Connect</span></h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-8">
                    {/* Status Banner */}
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-white p-8 rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-pink-100 rounded-full blur-3xl -mr-16 -mt-16 opacity-30"></div>

                        <div className="flex items-center gap-6 relative z-10">
                            <div className={`w-20 h-20 rounded-[32px] flex items-center justify-center shadow-inner transition-colors ${status === 'connected' ? 'bg-green-50 text-green-600' : 'bg-pink-50 text-pink-600'
                                }`}>
                                {status === 'connected' ? <CheckCircle2 size={36} /> : <Navigation2 size={36} className="animate-pulse" />}
                            </div>
                            <div>
                                <h2 className="text-3xl font-black tracking-tight leading-tight">
                                    {status === 'connected' ? 'Trip in Progress!' : 'Coordinate Meeting'} 🤝
                                </h2>
                                <p className="text-gray-400 font-medium text-sm mt-1">
                                    {status === 'connected'
                                        ? 'You are now traveling with your partner.'
                                        : `Locate ${partner.name || 'your partner'} at the starting point.`}
                                </p>
                            </div>
                        </div>

                        {status !== 'connected' && (
                            <button
                                onClick={handleMeet}
                                disabled={status === 'meeting'}
                                className="px-10 py-5 bg-gray-900 text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl hover:shadow-pink-100 transition-all flex items-center gap-3 relative overflow-hidden group"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                <span className="relative flex items-center gap-3">
                                    {status === 'meeting' ? 'Processing...' : 'Get Connected'} <Play size={18} fill="currentColor" />
                                </span>
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Map View */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="bg-white p-4 rounded-[40px] shadow-sm border border-white overflow-hidden h-[500px] relative group">
                                <div className="absolute top-8 left-8 z-10">
                                    <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3">
                                        <div className={`w-2 h-2 rounded-full animate-ping ${status === 'connected' ? 'bg-green-500' : 'bg-pink-500'}`}></div>
                                        <span className="text-xs font-black uppercase tracking-widest text-gray-700">
                                            {mapMode === 'starts' ? 'Coordinating Meeting' : 'Active Route'}
                                        </span>
                                    </div>
                                </div>
                                                                <MapLibreMap startCoords={startCoords} endCoords={endCoords} />
                            </div>
                        </div>

                        {/* Partner & Trip Details */}
                        <div className="space-y-6">
                            {/* Partner Card */}
                            <div className="bg-white p-8 rounded-[40px] shadow-sm border border-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-gray-50 rounded-full blur-2xl -mr-12 -mt-12 group-hover:bg-pink-50 transition-colors"></div>
                                <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2">
                                    Partner Profile <div className="w-1 h-1 rounded-full bg-pink-600"></div>
                                </h3>

                                <div className="flex items-center gap-5 mb-8">
                                    <div className="w-20 h-20 rounded-3xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-3xl border border-gray-100 shadow-inner group-hover:bg-pink-50 transition-colors">
                                        {privacyChoice === 'details' ? partner.name?.charAt(0) : '?'}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-gray-900 tracking-tight">
                                            {privacyChoice === 'details' ? partner.name : `Anonymous ID: #${partner.id}`}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1">
                                            {privacyChoice === 'details' ? (
                                                <span className="text-xs bg-pink-100 text-pink-600 font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                                                    {partner.college || 'Verified'}
                                                </span>
                                            ) : (
                                                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-bold">
                                                    <Shield size={12} className="text-blue-500" />
                                                    <span>Privacy Protected</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-gray-50">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                            <MapPin size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Starting Point</p>
                                            <p className="text-sm font-bold text-gray-700">{partner.start}</p>
                                        </div>
                                    </div>

                                    {privacyChoice === 'details' && partner.phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 shrink-0">
                                                <Phone size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-0.5">Contact Number</p>
                                                <p className="text-sm font-bold text-gray-700">{partner.phone}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-8">
                                    <button onClick={() => setShowChat(true)} className="flex-1 py-4 bg-pink-50 text-pink-600 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-pink-100 transition-colors">
                                        <MessageCircle size={18} /> Chat
                                    </button>
                                    <button
                                        onClick={() => {
                                            console.debug('LiveConnection: Emergency button clicked');
                                            setShowEmergency(true);
                                        }}
                                        className="p-4 bg-gray-50 text-gray-400 rounded-2xl hover:bg-rose-50 hover:text-rose-600 transition-colors"
                                    >
                                        <AlertCircle size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Chat Card (toggle) */}
                            {/* Chat now opens in a modal; remove inline rendering to avoid overlap */}

                            {/* Trip Summary Card */}
                            <div className="bg-gray-900 p-8 rounded-[40px] text-white relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500 rounded-full blur-[100px] opacity-10 group-hover:opacity-30 transition-opacity"></div>
                                <h3 className="text-lg font-black text-white/50 mb-6 uppercase tracking-[0.2em] text-[10px]">Trip Route Overview</h3>

                                <div className="space-y-6 relative z-10">
                                    <div className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-3 h-3 rounded-full bg-pink-500 shadow-[0_0_10px_rgba(236,72,153,0.5)]"></div>
                                            <div className="w-0.5 h-12 border-l border-dashed border-white/20 my-1"></div>
                                            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                        </div>
                                        <div className="flex flex-col justify-between py-0.5">
                                            <div className="text-sm font-black tracking-tight">{userTrip.start}</div>
                                            <div className="text-sm font-black tracking-tight">{userTrip.end}</div>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-white/10">
                                        <div className="text-xs font-bold text-white/40 uppercase tracking-widest">Transport</div>
                                        <div className="text-xs font-black text-pink-400 uppercase tracking-widest">{userTrip.mode || 'Private Car'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                                </main>

                                <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
                                <FeedbackModal
                                    isOpen={showFeedback}
                                    onClose={() => setShowFeedback(false)}
                                    onSubmit={(payload) => {
                                        console.debug('Feedback submitted', payload);
                                        // Mark chat disabled and optionally send payload to backend
                                        setChatDisabled(true);
                                        setShowFeedback(false);
                                    }}
                                />
                                <ChatRoom
                                    isModal={true}
                                    isOpen={showChat}
                                    onClose={() => setShowChat(false)}
                                    roomId={partner?.id || 'room1'}
                                    userName={user?.name || 'You'}
                                    disabled={chatDisabled}
                                    onEndTrip={() => setShowFeedback(true)}
                                />
        </div>
    );
};

export default LiveConnection;
