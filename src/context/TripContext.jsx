import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTrip as apiCreateTrip, getMyTrips, getTripMatches, sendTripRequest, getMyRequests, respondToRequest, endTrip as apiEndTrip } from '../services/travelService';
import { useAuth } from './AuthContext';

export const TRIP_STATUS = {
    IDLE: 'IDLE',
    WAITING: 'WAITING',
    REQUEST_PENDING: 'REQUEST_PENDING',
    CONNECTED: 'CONNECTED',
    TIMEOUT: 'TIMEOUT',
    COMPLETED: 'COMPLETED',
};

const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
    const { user } = useAuth();
    const [activeTrip, setActiveTrip] = useState(null);
    const [tripStatus, setTripStatus] = useState(TRIP_STATUS.IDLE);
    const [matches, setMatches] = useState([]);
    const [sentRequests, setSentRequests] = useState([]);
    const [receivedRequests, setReceivedRequests] = useState([]);
    const [connectedPartner, setConnectedPartner] = useState(null);
    const [timeoutLimitMs] = useState(5 * 60 * 1000); // 5 mins
    
    // Live connection states (stubs for UI)
    const [weMet, setWeMet] = useState({ me: false, partner: false });
    const [iReached, setIReached] = useState({ me: false, partner: false });
    const bothMet = weMet.me && weMet.partner;
    const bothReached = iReached.me && iReached.partner;
    const [partnerEndedTrip, setPartnerEndedTrip] = useState(false);
    const [privacyChoice, setPrivacyChoice] = useState('details');

    const pressWeMet = () => setWeMet(prev => ({ ...prev, me: true, partner: true })); // Stub auto-partner
    const pressIReached = () => setIReached(prev => ({ ...prev, me: true, partner: true }));
    const revertToWaiting = () => setTripStatus(TRIP_STATUS.WAITING);
    
    // Restore active trip from backend on mount
    useEffect(() => {
        if (!user) return;
        const fetchActiveTrip = async () => {
            try {
                const trips = await getMyTrips(true, 1, 0);
                if (trips.length > 0) {
                    const trip = trips[0];
                    setActiveTrip({
                        ...trip,
                        id: trip.travel_id,
                        start: trip.start_label,
                        end: trip.end_label,
                        mode: trip.mode_of_transport,
                        vehicleNo: trip.vehicle_no,
                        createdAt: trip.created_at,
                    });
                    
                    const reqs = await getMyRequests();
                    const acceptedSent = reqs.sent.find(r => r.status === 'accepted');
                    const acceptedReceived = reqs.received.find(r => r.status === 'accepted');
                    if (acceptedSent || acceptedReceived) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({
                             id: acceptedSent ? acceptedSent.receiver_travel_id : acceptedReceived.sender_travel_id,
                        });
                    } else {
                        setTripStatus(TRIP_STATUS.WAITING);
                    }
                }
            } catch (err) {
                console.error("Error fetching active trip", err);
            }
        };
        fetchActiveTrip();
    }, [user]);

    // Live Polling
    useEffect(() => {
        let interval;
        const isSearching = tripStatus === TRIP_STATUS.WAITING || tripStatus === TRIP_STATUS.REQUEST_PENDING;
        
        if (isSearching && activeTrip) {
            const poll = async () => {
                try {
                    const matchData = await getTripMatches(activeTrip.id);
                    const mappedMatches = (matchData.matches || []).map(m => ({
                        id: m.match_id,
                        name: m.anonymous_id ? `Traveler ${m.anonymous_id.substring(0,4)}` : "Verified User",
                        start: m.start_location,
                        end: m.end_location,
                        mode: m.mode_of_transport,
                        distance: m.start_distance_m,
                        verified: true,
                    }));
                    setMatches(mappedMatches);
                    
                    const reqData = await getMyRequests();
                    const mappedReceived = (reqData.received || []).filter(r => r.status === 'pending').map(r => ({
                        id: r.request_id,
                        fromName: `Traveler (Trip ${r.sender_travel_id})`,
                        tripStart: "Matched Route",
                        tripEnd: "",
                        status: r.status,
                    }));
                    setReceivedRequests(mappedReceived);
                    
                    const mappedSent = (reqData.sent || []).map(r => ({
                        matchId: r.receiver_travel_id.toString(),
                        status: r.status.toUpperCase()
                    }));
                    setSentRequests(mappedSent);
                    
                    const acceptedSent = mappedSent.find(r => r.status === 'ACCEPTED');
                    if (acceptedSent) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({ id: acceptedSent.matchId });
                    }
                } catch (err) {
                    console.error("Error polling", err);
                }
            };
            
            poll(); // run immediately
            interval = setInterval(poll, 3000);
        }
        return () => clearInterval(interval);
    }, [tripStatus, activeTrip]);

    const createTrip = async (tripData, userDetails) => {
        try {
            const response = await apiCreateTrip({
                start: { lat: tripData.startCoords[0], lng: tripData.startCoords[1], label: tripData.start },
                end: { lat: tripData.endCoords[0], lng: tripData.endCoords[1], label: tripData.end },
                start_time: new Date(Date.now() + 5 * 60000).toISOString(), // 5 mins in future to account for latency
                time_flex_minutes: 30,
                transport_mode: tripData.mode,
                vehicle_no: tripData.vehicleNo || null
            });
            setActiveTrip({
                id: response.trip_id,
                start: tripData.start,
                end: tripData.end,
                mode: tripData.mode,
                createdAt: new Date().toISOString()
            });
            setTripStatus(TRIP_STATUS.WAITING);
            return true;
        } catch (err) {
            console.error("Create Trip Error:", err);
            alert("Could not create trip. " + (err.response?.data?.detail || err.message));
            return false;
        }
    };

    const sendRequest = async (matchId, privacyChoice) => {
        try {
            await sendTripRequest(activeTrip.id, parseInt(matchId));
            setSentRequests(prev => [...prev, { matchId, status: 'PENDING' }]);
            setTripStatus(TRIP_STATUS.REQUEST_PENDING);
        } catch (err) {
            console.error("Send Request Error:", err);
            alert("Error sending request: " + (err.response?.data?.detail || err.message));
        }
    };

    const acceptRequest = async (requestId, privacyChoice) => {
        try {
            await respondToRequest(requestId, 'accepted');
            setTripStatus(TRIP_STATUS.CONNECTED);
            setConnectedPartner({ id: 'connected' });
        } catch (err) {
            console.error("Accept Request Error:", err);
        }
    };

    const declineRequest = async (requestId) => {
        try {
            await respondToRequest(requestId, 'rejected');
            setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error("Decline Request Error:", err);
        }
    };

    const endTrip = async () => {
        try {
            if (activeTrip?.id) {
                await apiEndTrip(activeTrip.id);
            } else {
                await apiEndTrip();
            }
        } catch (err) {
            console.error("End Trip Error:", err);
        } finally {
            setActiveTrip(null);
            setTripStatus(TRIP_STATUS.IDLE);
            setMatches([]);
            setSentRequests([]);
            setReceivedRequests([]);
            setConnectedPartner(null);
        }
    };

    const retryMatching = () => setTripStatus(TRIP_STATUS.WAITING);
    const triggerTimeout = () => setTripStatus(TRIP_STATUS.TIMEOUT);
    const emergencyAction = () => alert("Emergency Action Triggered!");

    return (
        <TripContext.Provider value={{
            tripStatus, activeTrip, matches, sentRequests, receivedRequests, connectedPartner,
            createTrip, sendRequest, acceptRequest, declineRequest, endTrip, retryMatching, triggerTimeout, emergencyAction,
            hasActiveTrip: tripStatus !== TRIP_STATUS.IDLE, timeoutLimitMs,
            weMet, iReached, bothMet, bothReached, partnerEndedTrip, pressWeMet, pressIReached, revertToWaiting, privacyChoice
        }}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) throw new Error("useTrip must be used within TripProvider");
    return context;
};