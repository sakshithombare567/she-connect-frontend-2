import React, { createContext, useContext, useState, useEffect } from 'react';
import { createTrip as apiCreateTrip, getMyTrips, getTripMatches, sendTripRequest, getMyRequests, respondToRequest, endTrip as apiEndTrip } from '../services/travelService';
import { useAuth } from './AuthContext';

import { getCoordsFromLocation } from '../utils/getCoordsFromLocation';

const normalizeCoords = (coords) => {
    if (!coords) return null;
    if (Array.isArray(coords) && coords.length >= 2) {
        const lat = parseFloat(coords[0]);
        const lng = parseFloat(coords[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    if (typeof coords === 'object') {
        const lat = parseFloat(coords.lat ?? coords.latitude);
        const lng = parseFloat(coords.lng ?? coords.lon ?? coords.longitude);
        if (!isNaN(lat) && !isNaN(lng)) {
            return { lat, lng };
        }
    }
    return null;
};

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
    const revertToWaiting = () => {
        setTripStatus(TRIP_STATUS.WAITING);
        setConnectedPartner(null);
        setWeMet({ me: false, partner: false });
        setIReached({ me: false, partner: false });
        setPartnerEndedTrip(false);
    };
    
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
                        start_lat: trip.start_lat,
                        start_lng: trip.start_lng,
                        end_lat: trip.end_lat,
                        end_lng: trip.end_lng,
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
                             id: acceptedSent ? acceptedSent.sent_to : acceptedReceived.sent_by,
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
        let pollInterval;
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
                    const mappedReceived = (reqData.received || [])
                        .filter(r => r.status === 'pending')
                        .map(r => ({
                            id: r.request_id,
                            fromName: `Traveler (Trip ${r.sender_travel_id})`,
                            tripStart: r.partner_start || "Matched Route",
                            tripEnd: r.partner_end || "",
                            status: r.status,
                            partnerUserId: r.sent_by,
                            connectionType: r.sender_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: r.partner_name,
                            college: r.partner_college,
                            phone: r.partner_phone,
                            anonymous_id: r.partner_anonymous_id,
                            start: r.partner_start,
                            end: r.partner_end,
                            verified: true
                        }));
                    setReceivedRequests(mappedReceived);
                    
                    const mappedSent = (reqData.sent || [])
                        .filter(r => r.status === 'pending' || r.status === 'accepted')
                        .map(r => ({
                            id: r.request_id,
                            matchId: r.receiver_travel_id.toString(),
                            status: r.status.toUpperCase(),
                            partnerUserId: r.sent_to,
                            connectionType: r.receiver_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: r.partner_name,
                            college: r.partner_college,
                            phone: r.partner_phone,
                            anonymous_id: r.partner_anonymous_id,
                            start: r.partner_start,
                            end: r.partner_end
                        }));
                    setSentRequests(mappedSent);
                    
                    const acceptedSent = mappedSent.find(r => r.status === 'ACCEPTED');
                    const acceptedReceivedRaw = (reqData.received || []).find(r => r.status === 'accepted');

                    if (acceptedSent) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({ 
                            id: acceptedSent.partnerUserId,
                            privacy_type: acceptedSent.connectionType,
                            name: acceptedSent.name,
                            college: acceptedSent.college,
                            phone: acceptedSent.phone,
                            anonymous_id: acceptedSent.anonymous_id,
                            start: acceptedSent.start,
                            end: acceptedSent.end
                        });
                    } else if (acceptedReceivedRaw) {
                        setTripStatus(TRIP_STATUS.CONNECTED);
                        setConnectedPartner({
                            id: acceptedReceivedRaw.sent_by,
                            privacy_type: acceptedReceivedRaw.sender_privacy_mode === 'DETAILS' ? 'details' : 'anonymous',
                            name: acceptedReceivedRaw.partner_name,
                            college: acceptedReceivedRaw.partner_college,
                            phone: acceptedReceivedRaw.partner_phone,
                            anonymous_id: acceptedReceivedRaw.partner_anonymous_id,
                            start: acceptedReceivedRaw.partner_start,
                            end: acceptedReceivedRaw.partner_end
                        });
                    } else if (tripStatus === TRIP_STATUS.REQUEST_PENDING && mappedSent.filter(r => r.status === 'PENDING').length === 0) {
                        setTripStatus(TRIP_STATUS.WAITING);
                    }
                } catch (err) {
                    console.error("Error polling", err);
                }
            };
            
            poll(); // run immediately
            pollInterval = setInterval(poll, 3000);
        }
        return () => clearInterval(pollInterval);
    }, [tripStatus, activeTrip, getMyRequests]);

    const createTrip = async (tripData) => {
        try {
            let startCoordObj = normalizeCoords(tripData.startCoords);
            if (!startCoordObj && tripData.start) {
                const fetched = await getCoordsFromLocation(tripData.start);
                startCoordObj = normalizeCoords(fetched);
            }

            let endCoordObj = normalizeCoords(tripData.endCoords);
            if (!endCoordObj && tripData.end) {
                const fetched = await getCoordsFromLocation(tripData.end);
                endCoordObj = normalizeCoords(fetched);
            }

            if (!startCoordObj || !endCoordObj) {
                alert("Could not determine coordinates for start or destination location. Please select a valid location.");
                return false;
            }

            const response = await apiCreateTrip({
                start: {
                    lat: startCoordObj.lat,
                    lng: startCoordObj.lng,
                    label: tripData.start
                },
                end: {
                    lat: endCoordObj.lat,
                    lng: endCoordObj.lng,
                    label: tripData.end
                },
                start_time: new Date(Date.now() + 5 * 60000).toISOString(), // 5 mins in future to account for latency
                time_flex_minutes: 30,
                transport_mode: tripData.mode,
                vehicle_no: tripData.vehicleNo || null
            });
            setActiveTrip({
                id: response.travel_id || response.trip_id,
                start: tripData.start,
                end: tripData.end,
                start_lat: startCoordObj.lat,
                start_lng: startCoordObj.lng,
                end_lat: endCoordObj.lat,
                end_lng: endCoordObj.lng,
                mode: tripData.mode,
                vehicleNo: tripData.vehicleNo || null,
                createdAt: new Date().toISOString()
            });
            setTripStatus(TRIP_STATUS.WAITING);
            return true;
        } catch (err) {
            console.error("Create Trip Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Could not create trip. " + errMsg);
            return false;
        }
    };

    const sendRequest = async (matchId, privacyChoice) => {
        try {
            const senderTripId = activeTrip?.id || activeTrip?.travel_id;
            if (!senderTripId) {
                alert("No active trip found. Please start a trip first.");
                return;
            }
            const receiverTripId = parseInt(matchId, 10);
            if (isNaN(receiverTripId)) {
                alert("Invalid match selected.");
                return;
            }
            const res = await sendTripRequest(senderTripId, receiverTripId, privacyChoice);
            setSentRequests(prev => [...prev, { id: res?.request_id, matchId: matchId.toString(), status: 'PENDING' }]);
            setTripStatus(TRIP_STATUS.REQUEST_PENDING);
        } catch (err) {
            console.error("Send Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error sending request: " + errMsg);
        }
    };

    const cancelRequest = async (matchIdOrRequestId) => {
        try {
            const target = sentRequests.find(r => r.matchId === matchIdOrRequestId.toString() || r.id === matchIdOrRequestId);
            if (target?.id) {
                await respondToRequest(target.id, 'cancelled');
            } else if (typeof matchIdOrRequestId === 'number') {
                await respondToRequest(matchIdOrRequestId, 'cancelled');
            }
            setSentRequests(prev => prev.filter(r => r.matchId !== matchIdOrRequestId.toString() && r.id !== matchIdOrRequestId));
            setTripStatus(TRIP_STATUS.WAITING);
        } catch (err) {
            console.error("Cancel Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error cancelling request: " + errMsg);
        }
    };

    const acceptRequest = async (requestId, privacyChoice) => {
        try {
            await respondToRequest(requestId, 'accepted', privacyChoice);
            const req = receivedRequests.find(r => r.id === requestId);
            setTripStatus(TRIP_STATUS.CONNECTED);
            if (req) {
                setConnectedPartner({
                    id: req.partnerUserId,
                    privacy_type: req.connectionType,
                    name: req.name,
                    college: req.college,
                    phone: req.phone,
                    anonymous_id: req.anonymous_id,
                    start: req.start,
                    end: req.end
                });
            }
        } catch (err) {
            console.error("Accept Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error accepting request: " + errMsg);
        }
    };

    const declineRequest = async (requestId) => {
        try {
            await respondToRequest(requestId, 'rejected');
            setReceivedRequests(prev => prev.filter(r => r.id !== requestId));
        } catch (err) {
            console.error("Decline Request Error:", err);
            const detail = err.response?.data?.detail;
            const errMsg = typeof detail === 'object' ? JSON.stringify(detail) : (detail || err.message);
            alert("Error declining request: " + errMsg);
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
            setWeMet({ me: false, partner: false });
            setIReached({ me: false, partner: false });
            setPartnerEndedTrip(false);
        }
    };

    const retryMatching = () => setTripStatus(TRIP_STATUS.WAITING);
    const triggerTimeout = () => setTripStatus(TRIP_STATUS.TIMEOUT);
    const emergencyAction = () => alert("Emergency Action Triggered!");

    return (
        <TripContext.Provider value={{
            tripStatus, activeTrip, matches, sentRequests, receivedRequests, connectedPartner,
            createTrip, sendRequest, cancelRequest, acceptRequest, declineRequest, endTrip, retryMatching, triggerTimeout, emergencyAction,
            hasActiveTrip: tripStatus !== TRIP_STATUS.IDLE, timeoutLimitMs,
            weMet, iReached, bothMet, bothReached, partnerEndedTrip, pressWeMet, pressIReached, revertToWaiting, privacyChoice, setPrivacyChoice
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