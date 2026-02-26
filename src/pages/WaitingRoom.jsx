import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import {
    Menu,
    MapPin,
    ArrowRight,
    Clock,
    Truck,
    Users,
    Shield,
    AlertTriangle,
    RefreshCw,
    AlertCircle,
    Loader2,
    CheckCircle2,
    Send,
} from 'lucide-react';
import { useTrip, TRIP_STATUS } from '../context/TripContext';

const WaitingRoom = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const {
        tripStatus,
        activeTrip,
        matches,
        sentRequests,
        privacyChoice,
        connectedPartner,
        sendRequest,
        retryMatching,
        endTrip,
        emergencyAction,
        timeoutLimitMs,
    } = useTrip();

    // Timer state
    const [elapsed, setElapsed] = useState(0);

    // Redirect if no active trip
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.IDLE) {
            navigate('/start-trip', { replace: true });
        }
    }, [tripStatus, navigate]);

    // Redirect when connected
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.CONNECTED && connectedPartner) {
            navigate('/live-connection', { replace: true });
        }
    }, [tripStatus, connectedPartner, navigate]);

    // Elapsed timer
    useEffect(() => {
        if (tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) {
            const interval = setInterval(() => {
                if (activeTrip?.createdAt) {
                    setElapsed(Date.now() - new Date(activeTrip.createdAt).getTime());
                }
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [tripStatus, activeTrip]);

    const isRequestSent = (matchId) =>
        sentRequests.some(r => r.matchId === matchId);

    const getRequestStatus = (matchId) => {
        const req = sentRequests.find(r => r.matchId === matchId);
        return req?.status || null;
    };

    const formatTime = (ms) => {
        const totalSec = Math.max(0, Math.floor(ms / 1000));
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    const remaining = Math.max(0, timeoutLimitMs - elapsed);
    const progress = Math.min(100, (elapsed / timeoutLimitMs) * 100);

    if (tripStatus === TRIP_STATUS.IDLE) return null;

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

                <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
                    {/* ── Trip Details Banner ── */}
                    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[40px] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
                        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full animate-pulse ${tripStatus === TRIP_STATUS.TIMEOUT ? 'bg-amber-500' : 'bg-green-500'}`}></div>
                                    <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${tripStatus === TRIP_STATUS.TIMEOUT ? 'text-amber-400' : 'text-green-400'}`}>
                                        {tripStatus === TRIP_STATUS.TIMEOUT ? 'Search Timed Out' : 'Searching for Partners'}
                                    </span>
                                </div>
                                <h3 className="text-2xl font-black text-white leading-tight">
                                    {activeTrip?.start} <ArrowRight className="inline-block mx-2 text-pink-500" size={24} /> {activeTrip?.end}
                                </h3>
                                <div className="flex items-center gap-6 text-sm text-gray-400 font-bold">
                                    <div className="flex items-center gap-2">
                                        <Truck size={16} className="text-pink-500" />
                                        <span className="capitalize">{activeTrip?.mode}</span>
                                    </div>
                                    {activeTrip?.vehicleNo && (
                                        <div className="flex items-center gap-2">
                                            <Shield size={16} className="text-pink-500" />
                                            <span>{activeTrip.vehicleNo}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-pink-500" />
                                        <span>{new Date(activeTrip?.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => { endTrip(); navigate('/start-trip'); }}
                                className="px-6 py-4 rounded-2xl bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10 backdrop-blur-md"
                            >
                                Cancel Trip
                            </button>
                        </div>
                    </div>

                    {/* ── Timer Progress Bar ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && (
                        <div className="bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-pink-600" />
                                    <span className="text-xs font-black text-gray-500 uppercase tracking-widest">Wait Time</span>
                                </div>
                                <span className="text-sm font-black text-gray-900 tabular-nums">{formatTime(remaining)} remaining</span>
                            </div>
                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-1000 ease-linear ${progress > 80 ? 'bg-gradient-to-r from-amber-500 to-red-500' : 'bg-gradient-to-r from-pink-500 to-rose-500'}`}
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* ── Timeout Overlay ── */}
                    {tripStatus === TRIP_STATUS.TIMEOUT && (
                        <div className="bg-white p-10 rounded-[40px] shadow-lg border-2 border-amber-100 text-center space-y-6 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-50 rounded-full blur-3xl -mr-20 -mt-20"></div>
                            <div className="relative z-10">
                                <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-full text-amber-600 mb-4">
                                    <AlertTriangle size={36} />
                                </div>
                                <h3 className="text-2xl font-black text-gray-900">Search Timed Out</h3>
                                <p className="text-gray-400 font-medium max-w-sm mx-auto mt-2">
                                    We couldn't find a match in time. You can try again or trigger emergency assistance.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                                    <button
                                        onClick={retryMatching}
                                        className="px-8 py-4 rounded-2xl bg-gray-900 text-white font-black text-sm uppercase tracking-widest hover:shadow-2xl transition-all flex items-center justify-center gap-3 group"
                                    >
                                        <RefreshCw size={18} className="group-hover:rotate-180 transition-transform duration-500" />
                                        Check Again
                                    </button>
                                    <button
                                        onClick={emergencyAction}
                                        className="px-8 py-4 rounded-2xl bg-rose-600 text-white font-black text-sm uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_-5px_rgba(225,29,72,0.3)]"
                                    >
                                        <AlertCircle size={18} />
                                        Emergency
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ── Status Indicator ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {matches.length === 0 ? (
                                    <Loader2 size={20} className="text-pink-600 animate-spin" />
                                ) : (
                                    <CheckCircle2 size={20} className="text-green-600" />
                                )}
                                <span className="text-sm font-black text-gray-900">
                                    {matches.length === 0
                                        ? 'Searching for travel partners on your route...'
                                        : `${matches.length} verified ${matches.length === 1 ? 'partner' : 'partners'} found!`
                                    }
                                </span>
                            </div>
                            <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">
                                {activeTrip?.start} → {activeTrip?.end}
                            </span>
                        </div>
                    )}

                    {/* ── Matches List ── */}
                    {(tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING) && matches.length > 0 && (
                        <div className="space-y-4">
                            {matches.map(user => (
                                <div key={user.id} className="bg-white p-8 rounded-[40px] border border-white shadow-[0_20px_50px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(236,72,153,0.05)] transition-all group overflow-hidden relative">
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-pink-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                                    <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center text-pink-600 font-black text-2xl border border-gray-100 shadow-inner group-hover:bg-pink-50 transition-colors">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3 mb-2">
                                                    <h4 className="text-lg font-black text-gray-900 tracking-tight">{user.name}</h4>
                                                    {user.verified && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
                                                    <span className="text-[10px] bg-gray-100 text-gray-500 font-black px-3 py-1 rounded-full uppercase tracking-widest">
                                                        {user.college || 'Verified'}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 font-bold">
                                                    <div className="flex items-center gap-2 text-pink-600 bg-pink-50 px-3 py-1 rounded-lg border border-pink-100/50">
                                                        <MapPin size={14} />
                                                        <span>{user.start} → {user.end}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Truck size={14} />
                                                        <span className="capitalize">{user.mode}</span>
                                                    </div>
                                                    {user.area && (
                                                        <div className="flex items-center gap-1 text-[10px] text-pink-500 font-black uppercase tracking-widest">
                                                            <MapPin size={10} />
                                                            <span>Near {user.area}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => sendRequest(user.id)}
                                            disabled={isRequestSent(user.id)}
                                            className={`px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center gap-3 shrink-0 ${isRequestSent(user.id)
                                                    ? getRequestStatus(user.id) === 'ACCEPTED'
                                                        ? 'bg-green-500 text-white shadow-green-100 cursor-default'
                                                        : 'bg-green-50 text-green-700 border border-green-200 cursor-default'
                                                    : 'bg-gray-900 text-white hover:shadow-2xl hover:shadow-pink-100 bg-gradient-to-r hover:from-pink-600 hover:to-rose-600'
                                                }`}
                                        >
                                            {isRequestSent(user.id) ? (
                                                getRequestStatus(user.id) === 'ACCEPTED' ? (
                                                    <><CheckCircle2 size={18} /> Connected!</>
                                                ) : (
                                                    <><Send size={16} /> Request Sent</>
                                                )
                                            ) : (
                                                <><Send size={16} /> Send Request</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* ── Empty State (searching, no matches yet) ── */}
                    {(tripStatus === TRIP_STATUS.WAITING) && matches.length === 0 && (
                        <div className="bg-white p-20 rounded-[40px] border border-dashed border-gray-200 text-center space-y-4">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-pink-50 rounded-full text-pink-300 mb-2">
                                <Users size={32} className="animate-pulse" />
                            </div>
                            <h3 className="text-xl font-black text-gray-900">Looking for Partners...</h3>
                            <p className="text-gray-400 font-medium max-w-xs mx-auto text-sm">
                                We're searching for verified travelers on your route. Matches will appear here automatically.
                            </p>
                            <div className="flex items-center justify-center gap-2 mt-4">
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                <div className="w-2 h-2 rounded-full bg-pink-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WaitingRoom;
