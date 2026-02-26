/**
 * tripStorage.js — localStorage-based shared "database" for live cross-tab matching.
 * 
 * Each browser tab gets a unique sessionId (via sessionStorage).
 * All trips and requests are stored in localStorage so any tab can read them.
 * This enables two people (two tabs) to find each other in real time.
 */

const TRIPS_KEY = 'sheconnect_live_trips';
const REQUESTS_KEY = 'sheconnect_live_requests';
const SESSION_KEY = 'sheconnect_session_id';

// ─── Session Identity ────────────────────────────────────
// Each tab gets its own unique ID so we can tell users apart
export const getSessionId = () => {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
        id = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6);
        sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
};

// ─── Trip Storage ────────────────────────────────────────

const readTrips = () => {
    try {
        return JSON.parse(localStorage.getItem(TRIPS_KEY)) || [];
    } catch {
        return [];
    }
};

const writeTrips = (trips) => {
    localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
};

/**
 * Save the current user's trip to the shared store
 */
export const saveTrip = (trip, sessionId, privacyChoice, userName = 'Anonymous') => {
    const trips = readTrips();
    // Remove any old trip from this session first
    const filtered = trips.filter(t => t.sessionId !== sessionId);
    filtered.push({
        ...trip,
        sessionId,
        privacyChoice,
        userName,
        savedAt: new Date().toISOString(),
    });
    writeTrips(filtered);
};

/**
 * Find matching trips from OTHER users (not the current session)
 */
export const findLiveMatches = (activeTrip, currentSessionId) => {
    const trips = readTrips();

    const normalize = (str) => str?.trim().toLowerCase() || '';
    const extractCity = (str) => normalize(str).split(',')[0].trim();

    const getTransportGroup = (mode) => {
        const m = normalize(mode);
        if (['car', 'cab', 'uber', 'ola', 'auto'].some(opt => m.includes(opt))) return 'road_private';
        if (['train', 'metro', 'railway'].some(opt => m.includes(opt))) return 'rail';
        if (m.includes('bus')) return 'bus';
        if (m.includes('flight') || m.includes('plane')) return 'air';
        return m;
    };

    const locationMatches = (a, b) => {
        const fullA = normalize(a);
        const fullB = normalize(b);
        const cityA = extractCity(a);
        const cityB = extractCity(b);
        return fullA.includes(fullB) || fullB.includes(fullA)
            || cityA === cityB || cityA.includes(cityB) || cityB.includes(cityA);
    };

    return trips
        .filter(t => t.sessionId !== currentSessionId) // Exclude own trip
        .filter(t => {
            const startOk = locationMatches(activeTrip.start, t.start);
            const endOk = locationMatches(activeTrip.end, t.end);
            const modeOk = getTransportGroup(activeTrip.mode) === getTransportGroup(t.mode);
            return startOk && endOk && modeOk;
        })
        .map(t => ({
            id: t.id,
            name: t.userName || 'Traveler',
            start: t.start,
            end: t.end,
            mode: t.mode,
            college: 'Verified',
            verified: true,
            privacy_type: t.privacyChoice || 'anonymous',
            area: '',
            sessionId: t.sessionId,
            status: 'active',
        }));
};

/**
 * Remove the current user's trip from the shared store
 */
export const removeTrip = (sessionId) => {
    const trips = readTrips();
    writeTrips(trips.filter(t => t.sessionId !== sessionId));
};

// ─── Request Storage ─────────────────────────────────────

const readRequests = () => {
    try {
        return JSON.parse(localStorage.getItem(REQUESTS_KEY)) || [];
    } catch {
        return [];
    }
};

const writeRequests = (requests) => {
    localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

/**
 * Send a connection request to another user
 */
export const sendLiveRequest = (fromSessionId, toSessionId, fromName, tripDetails) => {
    const requests = readRequests();
    // Prevent duplicates
    const exists = requests.some(r => r.fromSessionId === fromSessionId && r.toSessionId === toSessionId);
    if (exists) return;

    requests.push({
        id: Date.now(),
        fromSessionId,
        toSessionId,
        fromName: fromName || 'Anonymous',
        tripStart: tripDetails.start,
        tripEnd: tripDetails.end,
        tripMode: tripDetails.mode,
        status: 'PENDING',
        sentAt: new Date().toISOString(),
    });
    writeRequests(requests);
};

/**
 * Get incoming requests for this session
 */
export const getIncomingRequests = (sessionId) => {
    return readRequests().filter(r => r.toSessionId === sessionId && r.status === 'PENDING');
};

/**
 * Get sent requests from this session
 */
export const getSentRequests = (sessionId) => {
    return readRequests().filter(r => r.fromSessionId === sessionId);
};

/**
 * Accept a request — update its status
 */
export const acceptLiveRequest = (requestId) => {
    const requests = readRequests();
    const updated = requests.map(r =>
        r.id === requestId ? { ...r, status: 'ACCEPTED' } : r
    );
    writeRequests(updated);
    return updated.find(r => r.id === requestId);
};

/**
 * Decline a request
 */
export const declineLiveRequest = (requestId) => {
    const requests = readRequests();
    writeRequests(requests.map(r =>
        r.id === requestId ? { ...r, status: 'DECLINED' } : r
    ));
};

/**
 * Check if any of our SENT requests have been accepted
 */
export const checkAcceptedRequests = (sessionId) => {
    return readRequests().filter(
        r => r.fromSessionId === sessionId && r.status === 'ACCEPTED'
    );
};

/**
 * Clean up all data for a session (on trip end)
 */
export const cleanupSession = (sessionId) => {
    removeTrip(sessionId);
    const requests = readRequests();
    writeRequests(requests.filter(
        r => r.fromSessionId !== sessionId && r.toSessionId !== sessionId
    ));
};
