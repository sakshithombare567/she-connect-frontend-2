import React, { useState, useEffect  } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Truck, Users } from 'lucide-react';
import LocationInput from '../components/LocationInput';
import MapView from '../components/MapView';
import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';

const StartTrip = () => {
    const navigate = useNavigate();
    const [startLocation, setStartLocation] = useState('');
    const [endLocation, setEndLocation] = useState('');
    const [startCoords, setStartCoords] = useState(null);
    const [endCoords, setEndCoords] = useState(null);
    const [loadingCoords, setLoadingCoords] = useState(false);

    // Fetch coordinates when start or end location changes
    useEffect(() => {
        let ignore = false;
        async function fetchCoords() {
            setLoadingCoords(true);
            const [start, end] = await Promise.all([
                getCoordsFromLocation(startLocation),
                getCoordsFromLocation(endLocation)
            ]);
            if (!ignore) {
                setStartCoords(start);
                setEndCoords(end);
            }
            setLoadingCoords(false);
        }
        if (startLocation.length >= 3 && endLocation.length >= 3) {
            fetchCoords();
        } else {
            setStartCoords(null);
            setEndCoords(null);
        }
        return () => { ignore = true; };
    }, [startLocation, endLocation]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Navigate to Match Making page with trip details
        // In a real app, you might first call an API here to create the travel intent
        navigate('/match-making', {
            state: { start: startLocation, end: endLocation }
        });
    };

    return (
        <div className="bg-gray-50 min-h-screen font-sans">
            {/* Simple Navbar for this page */}
            <nav className="bg-white shadow-sm p-4">
                <div className="max-w-7xl mx-auto flex items-center">
                    <Link to="/dashboard" className="flex items-center text-gray-600 hover:text-pink-600 transition-colors">
                        <ArrowLeft size={20} className="mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            </nav>

            <main className="max-w-3xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-2xl shadow-lg p-8">
                    <div className="text-center mb-10">
                        <div className="inline-flex items-center justify-center p-3 bg-pink-100 rounded-full mb-4">
                            <MapPin size={32} className="text-pink-600" />
                        </div>
                        <h1 className="text-3xl font-bold text-gray-900">Start Your Trip</h1>
                        <p className="mt-2 text-gray-600">Enter your trip details to find safe travel partners.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <LocationInput
                                    label="Start Location"
                                    value={startLocation}
                                    onChange={setStartLocation}
                                    placeholder="Enter start location"
                                />
                            </div>
                            <div>
                                <LocationInput
                                    label="End Location"
                                    value={endLocation}
                                    onChange={setEndLocation}
                                    placeholder="Enter destination"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <div>
                                <label htmlFor="transportMode" className="block text-sm font-medium text-gray-700 mb-1">
                                    Mode of Transport
                                </label>
                                <div className="relative">
                                    <select
                                        id="transportMode"
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none appearance-none bg-white transition-all"
                                        required
                                    >
                                        <option value="">Select Mode</option>
                                        <option value="car">Car</option>
                                        <option value="bus">Bus</option>
                                        <option value="train">Train</option>
                                        <option value="uber">Uber/Cab</option>
                                        <option value="auto">Auto Rickshaw</option>
                                        <option value="metro">Metro</option>
                                    </select>
                                    <Truck className="absolute right-3 top-2.5 text-gray-400" size={18} />
                                </div>
                            </div>
                            <div>
                                <label htmlFor="transportNo" className="block text-sm font-medium text-gray-700 mb-1">
                                    Transport Number (Optional)
                                </label>
                                <input
                                    type="text"
                                    id="transportNo"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none transition-all"
                                    placeholder="e.g. DL 01 AB 1234"
                                />
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition-colors"
                            >
                                <Users className="mr-2" size={20} />
                                Find Match Partners
                            </button>
                        </div>
                    </form>

                    {/* Map Section */}
                    <div className="mt-8">
                        <h2 className="text-xl font-semibold mb-2 text-gray-800">Route Preview</h2>
                        {loadingCoords ? (
                            <div className="text-center text-gray-500">Loading map...</div>
                        ) : (
                            <MapView startCoords={startCoords} endCoords={endCoords} />
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default StartTrip
