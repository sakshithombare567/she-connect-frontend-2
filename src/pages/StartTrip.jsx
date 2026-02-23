import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Truck, Users, Menu } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapLibreMap from '../components/MapLibre';
import Sidebar from '../components/Sidebar';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';
import PrivacyModal from '../components/common/PrivacyModal';
import MatchMakingModal from '../components/common/MatchMakingModal';

const StartTrip = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [loadingCoords, setLoadingCoords] = useState(false);
    const [showPrivacyModal, setShowPrivacyModal] = useState(false);
    const [transportMode, setTransportMode] = useState('');
    const [transportNo, setTransportNo] = useState('');

    // MatchMaking Modal State
    const [showMatchMakingModal, setShowMatchMakingModal] = useState(false);
    const [privacyChoice, setPrivacyChoice] = useState('');

    // Track if coords were manually set from a suggestion to skip redundant geocoding
    const startFromSuggestion = useRef(false);
    const endFromSuggestion = useRef(false);

    // Fetch start coordinates
    useEffect(() => {
        if (startLocation.length < 3) {
            setStartCoords(null);
            startFromSuggestion.current = false;
            return;
        }

        // If startLocation was set by suggestion click, don't re-geocode
        if (startFromSuggestion.current) {
            startFromSuggestion.current = false;
            return;
        }

        const timer = setTimeout(async () => {
            const coords = await getCoordsFromLocation(startLocation);
            if (coords) setStartCoords(coords);
        }, 800);
        return () => clearTimeout(timer);
    }, [startLocation]);

    // Fetch end coordinates
    useEffect(() => {
        if (endLocation.length < 3) {
            setEndCoords(null);
            endFromSuggestion.current = false;
            return;
        }

        // If endLocation was set by suggestion click, don't re-geocode
        if (endFromSuggestion.current) {
            endFromSuggestion.current = false;
            return;
        }

        const timer = setTimeout(async () => {
            const coords = await getCoordsFromLocation(endLocation);
            if (coords) setEndCoords(coords);
        }, 800);
        return () => clearTimeout(timer);
    }, [endLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setShowPrivacyModal(true);
    };

    const handlePrivacyConfirm = (choice) => {
        setShowPrivacyModal(false);
        setPrivacyChoice(choice);
        setShowMatchMakingModal(true);
    };

    const handlePartnerSelect = (partner) => {
        setShowMatchMakingModal(false);
        navigate('/live-connection', {
            state: {
                partner: partner,
                privacyChoice: privacyChoice,
                userTrip: {
                    start: startLocation,
                    end: endLocation,
                    mode: transportMode,
                    transportNo: transportNo
                }
            }
        });
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

            <main className="flex-1 overflow-y-auto relative">
                {/* Mobile Header */}
                <header className="md:hidden sticky top-0 bg-white/80 backdrop-blur-md z-40 px-6 py-4 flex justify-between items-center border-b border-gray-50">
                    <h1 className="text-xl font-black tracking-tighter text-gray-900">
                        She<span className="text-pink-600">Connect</span>
                    </h1>
                    <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-gray-50 rounded-xl text-gray-600 focus:outline-none">
                        <Menu size={24} />
                    </button>
                </header>

                <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
                    {/* Map Section - Moved to Top with Premium Frame */}
                    <div className="mb-8 relative group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-rose-500 rounded-[24px] blur opacity-20 group-hover:opacity-30 transition-opacity duration-1000"></div>
                        <div className="relative bg-white rounded-[24px] shadow-2xl overflow-hidden border border-white/20">
                            <div className="absolute top-4 left-4 z-10">
                                <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg border border-gray-100/50 flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                    <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">Live Route Preview</span>
                                </div>
                            </div>
                            {loadingCoords ? (
                                <div className="h-[450px] flex flex-col items-center justify-center bg-gray-50 gap-4">
                                    <Users className="animate-bounce text-pink-400" size={32} />
                                    <div className="text-sm font-medium text-gray-400">Personalizing your map...</div>
                                </div>
                            ) : (
                                <MapLibreMap startCoords={startCoords} endCoords={endCoords} />
                            )}
                        </div>
                    </div>

                    {/* Form Section */}
                    <div className="bg-white/70 backdrop-blur-xl rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white p-8 md:p-10 relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                                <div>
                                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
                                        Plan Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-rose-600">Safe Journey</span>
                                    </h1>
                                    <p className="mt-2 text-gray-500 font-medium">Connect with verified partners for a worry-free trip.</p>
                                </div>
                                <div className="hidden md:flex items-center gap-2 bg-pink-50 px-4 py-2 rounded-2xl border border-pink-100">
                                    <Users size={18} className="text-pink-600" />
                                    <span className="text-sm font-bold text-pink-700">1.2k active travelers</span>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-8">
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="relative">
                                        <LocationInput
                                            label="Starting Point"
                                            value={startLocation}
                                            onChange={(val, coords) => {
                                                setStartLocation(val);
                                                if (coords) {
                                                    const isDifferent = !startCoords || startCoords[0] !== coords[0] || startCoords[1] !== coords[1];
                                                    if (isDifferent) {
                                                        startFromSuggestion.current = true;
                                                        setStartCoords(coords);
                                                    }
                                                }
                                            }}
                                            placeholder="Where should we pick you up?"
                                        />
                                    </div>
                                    <div className="relative">
                                        <LocationInput
                                            label="Destination"
                                            value={endLocation}
                                            onChange={(val, coords) => {
                                                setEndLocation(val);
                                                if (coords) {
                                                    const isDifferent = !endCoords || endCoords[0] !== coords[0] || endCoords[1] !== coords[1];
                                                    if (isDifferent) {
                                                        endFromSuggestion.current = true;
                                                        setEndCoords(coords);
                                                    }
                                                }
                                            }}
                                            placeholder="Where are you heading?"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    <div className="space-y-1">
                                        <label htmlFor="transportMode" className="block text-sm font-bold text-gray-700 ml-1">
                                            Preferred Transport
                                        </label>
                                        <div className="relative group">
                                            <select
                                                id="transportMode"
                                                value={transportMode}
                                                onChange={(e) => setTransportMode(e.target.value)}
                                                className="w-full pl-5 pr-12 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none appearance-none transition-all hover:bg-white hover:border-gray-300"
                                                required
                                            >
                                                <option value="">Choose your mode</option>
                                                <option value="car">Car Pool</option>
                                                <option value="bus">Public Bus</option>
                                                <option value="train">Railway</option>
                                                <option value="uber">Uber / Ola</option>
                                                <option value="auto">Auto Rickshaw</option>
                                                <option value="metro">Metro Rail</option>
                                                <option value="cab">Cab</option>
                                            </select>
                                            <Truck className="absolute right-4 top-4 text-gray-400 group-focus-within:text-pink-600 transition-colors" size={20} />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label htmlFor="transportNo" className="block text-sm font-bold text-gray-700 ml-1">
                                            Travel ID / Vehicle No. <span className="text-gray-400 font-normal">(Optional)</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="transportNo"
                                            value={transportNo}
                                            onChange={(e) => setTransportNo(e.target.value)}
                                            className="w-full px-5 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 outline-none transition-all hover:bg-white hover:border-gray-300"
                                            placeholder="e.g. MH 12 AB 1234"
                                        />
                                    </div>
                                </div>

                                <div className="pt-6">
                                    <button
                                        type="submit"
                                        className="w-full relative group overflow-hidden py-4 px-6 rounded-2xl bg-gray-900 transition-all duration-300 hover:shadow-[0_15px_30px_-10px_rgba(0,0,0,0.3)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative flex items-center justify-center text-white font-bold text-lg">
                                            <Users className="mr-3" size={24} />
                                            Find Travel Partners
                                        </span>
                                    </button>
                                    <p className="text-center mt-4 text-xs text-gray-400 font-medium">
                                        By continuing, you agree to our <span className="text-pink-500 underline">Safety Guidelines</span>
                                    </p>
                                </div>
                            </form>
                        </div>

                        {/* Background Decorative Elements */}
                        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-pink-100 rounded-full blur-[100px] opacity-50"></div>
                        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-100 rounded-full blur-[100px] opacity-50"></div>
                    </div>
                </div>
            </main>

            <PrivacyModal
                isOpen={showPrivacyModal}
                onClose={() => setShowPrivacyModal(false)}
                onConfirm={handlePrivacyConfirm}
                partnerName="Potential Matches"
            />

            <MatchMakingModal
                isOpen={showMatchMakingModal}
                onClose={() => setShowMatchMakingModal(false)}
                tripDetails={{
                    start: startLocation,
                    end: endLocation,
                    mode: transportMode
                }}
                privacyChoice={privacyChoice}
                onConnect={handlePartnerSelect}
            />
        </div>
    );
};

export default StartTrip;
