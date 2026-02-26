import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef } from 'react';
import {
    getSessionId,
    saveTrip,
    findLiveMatches,
    removeTrip,
    sendLiveRequest,
    getIncomingRequests,
    getSentRequests,
    acceptLiveRequest,
    declineLiveRequest,
    checkAcceptedRequests,
    cleanupSession,
} from '../utils/tripStorage';

// ─── Status Constants ────────────────────────────────────
export const TRIP_STATUS = {
    IDLE: 'IDLE',
    WAITING: 'WAITING',
    REQUEST_PENDING: 'REQUEST_PENDING',
    CONNECTED: 'CONNECTED',
    TIMEOUT: 'TIMEOUT',
    COMPLETED: 'COMPLETED',
};

export const REQUEST_STATUS = {
    PENDING: 'PENDING',
    ACCEPTED: 'ACCEPTED',
    DECLINED: 'DECLINED',
    EXPIRED: 'EXPIRED',
};

// ─── Initial State ───────────────────────────────────────
const initialState = {
    tripStatus: TRIP_STATUS.IDLE,
    activeTrip: null,
    matches: [],
    sentRequests: [],       // [{ matchId, status, ... }]
    receivedRequests: [],   // incoming requests from other tabs
    connectedPartner: null,
    privacyChoice: null,
    timeoutLimitMs: 5 * 60 * 1000, // 5 minutes
    sessionId: null,
};

// ─── Reducer ─────────────────────────────────────────────
const ACTION = {
    CREATE_TRIP: 'CREATE_TRIP',
    SET_MATCHES: 'SET_MATCHES',
    SEND_REQUEST: 'SEND_REQUEST',
    SET_SENT_REQUESTS: 'SET_SENT_REQUESTS',
    SET_RECEIVED_REQUESTS: 'SET_RECEIVED_REQUESTS',
    ACCEPT_REQUEST: 'ACCEPT_REQUEST',
    DECLINE_REQUEST: 'DECLINE_REQUEST',
    PARTNER_ACCEPTED: 'PARTNER_ACCEPTED',
    TRIGGER_TIMEOUT: 'TRIGGER_TIMEOUT',
    RETRY_MATCHING: 'RETRY_MATCHING',
    END_TRIP: 'END_TRIP',
};

function tripReducer(state, action) {
    switch (action.type) {
        case ACTION.CREATE_TRIP:
            return {
                ...state,
                tripStatus: TRIP_STATUS.WAITING,
                activeTrip: action.payload.trip,
                privacyChoice: action.payload.privacy,
                sessionId: action.payload.sessionId,
                matches: [],
                sentRequests: [],
                receivedRequests: [],
                connectedPartner: null,
            };

        case ACTION.SET_MATCHES:
            return { ...state, matches: action.payload };

        case ACTION.SEND_REQUEST: {
            const alreadySent = state.sentRequests.some(r => r.matchId === action.payload);
            if (alreadySent) return state;
            return {
                ...state,
                tripStatus: TRIP_STATUS.REQUEST_PENDING,
                sentRequests: [
                    ...state.sentRequests,
                    { matchId: action.payload, status: REQUEST_STATUS.PENDING },
                ],
            };
        }

        case ACTION.SET_SENT_REQUESTS:
            return { ...state, sentRequests: action.payload };

        case ACTION.SET_RECEIVED_REQUESTS:
            return { ...state, receivedRequests: action.payload };

        case ACTION.ACCEPT_REQUEST: {
            const request = state.receivedRequests.find(r => r.id === action.payload.requestId);
            if (!request || state.tripStatus === TRIP_STATUS.CONNECTED) return state;
            return {
                ...state,
                tripStatus: TRIP_STATUS.CONNECTED,
                connectedPartner: {
                    id: request.id,
                    name: request.fromName || 'Anonymous',
                    start: request.tripStart,
                    end: request.tripEnd,
                    mode: request.tripMode,
                    privacy_type: action.payload.privacy || 'anonymous',
                    sessionId: request.fromSessionId,
                    verified: true,
                },
                receivedRequests: state.receivedRequests.map(r =>
                    r.id === action.payload.requestId ? { ...r, status: REQUEST_STATUS.ACCEPTED } : r
                ),
            };
        }

        case ACTION.DECLINE_REQUEST:
            return {
                ...state,
                receivedRequests: state.receivedRequests.map(r =>
                    r.id === action.payload ? { ...r, status: REQUEST_STATUS.DECLINED } : r
                ),
            };

        case ACTION.PARTNER_ACCEPTED: {
            // Our sent request was accepted by the other person
            const partner = state.matches.find(m => m.id === action.payload.matchId);
            return {
                ...state,
                tripStatus: TRIP_STATUS.CONNECTED,
                connectedPartner: partner ? {
                    ...partner,
                    privacy_type: partner.privacy_type || 'anonymous',
                } : {
                    id: action.payload.matchId,
                    name: 'Travel Partner',
                    privacy_type: 'anonymous',
                    verified: true,
                    ...action.payload.tripDetails,
                },
                sentRequests: state.sentRequests.map(r =>
                    r.matchId === action.payload.matchId ? { ...r, status: REQUEST_STATUS.ACCEPTED } : r
                ),
            };
        }

        case ACTION.TRIGGER_TIMEOUT:
            if (state.tripStatus === TRIP_STATUS.CONNECTED) return state;
            return { ...state, tripStatus: TRIP_STATUS.TIMEOUT };

        case ACTION.RETRY_MATCHING:
            return {
                ...state,
                tripStatus: TRIP_STATUS.WAITING,
                matches: [],
                sentRequests: [],
            };

        case ACTION.END_TRIP:
            return { ...initialState };

        default:
            return state;
    }
}

// ─── Context ─────────────────────────────────────────────
const TripContext = createContext(null);

export const TripProvider = ({ children }) => {
    const [state, dispatch] = useReducer(tripReducer, initialState);
    const pollingRef = useRef(null);
    const timeoutRef = useRef(null);
    const sessionId = getSessionId(); // Unique per browser tab

    // ── Actions ──────────────────────────────────────────

    const createTrip = useCallback((tripData, privacy, userName) => {
        if (state.tripStatus !== TRIP_STATUS.IDLE) {
            console.warn('[TripContext] Cannot create trip — active trip exists.');
            return false;
        }
        const trip = {
            id: Date.now(),
            start: tripData.start,
            end: tripData.end,
            mode: tripData.mode,
            vehicleNo: tripData.vehicleNo || null,
            createdAt: new Date().toISOString(),
        };

        // Save to localStorage so other tabs can discover this trip
        saveTrip(trip, sessionId, privacy, userName || 'Anonymous');

        dispatch({ type: ACTION.CREATE_TRIP, payload: { trip, privacy, sessionId } });
        return true;
    }, [state.tripStatus, sessionId]);

    const sendRequest = useCallback((matchId) => {
        // Find the match to get their sessionId
        const match = state.matches.find(m => m.id === matchId);
        if (!match) return;

        // Write to localStorage so the other tab can see the request
        sendLiveRequest(sessionId, match.sessionId, 'You', state.activeTrip);

        dispatch({ type: ACTION.SEND_REQUEST, payload: matchId });
    }, [sessionId, state.matches, state.activeTrip]);

    const acceptRequest = useCallback((requestId) => {
        // Update localStorage so the sender's tab can see the acceptance
        acceptLiveRequest(requestId);

        dispatch({ type: ACTION.ACCEPT_REQUEST, payload: { requestId, privacy: state.privacyChoice } });
    }, [state.privacyChoice]);

    const declineRequest = useCallback((requestId) => {
        declineLiveRequest(requestId);
        dispatch({ type: ACTION.DECLINE_REQUEST, payload: requestId });
    }, []);

    const triggerTimeout = useCallback(() => {
        dispatch({ type: ACTION.TRIGGER_TIMEOUT });
    }, []);

    const retryMatching = useCallback(() => {
        dispatch({ type: ACTION.RETRY_MATCHING });
    }, []);

    const endTrip = useCallback(() => {
        cleanupSession(sessionId);
        dispatch({ type: ACTION.END_TRIP });
    }, [sessionId]);

    const emergencyAction = useCallback(() => {
        alert("🚨 EMERGENCY SOS TRIGGERED!\nYour location and trip details have been sent to local authorities and emergency contacts.");
    }, []);

    // ── Live Polling — find matches from other tabs ──────
    useEffect(() => {
        const isSearching = (
            state.tripStatus === TRIP_STATUS.WAITING ||
            state.tripStatus === TRIP_STATUS.REQUEST_PENDING
        );

        if (isSearching && state.activeTrip) {
            const poll = () => {
                // Find real trips from other browser tabs via localStorage
                const liveMatches = findLiveMatches(state.activeTrip, sessionId);
                dispatch({ type: ACTION.SET_MATCHES, payload: liveMatches });

                // Check for incoming requests from other tabs
                const incoming = getIncomingRequests(sessionId);
                if (incoming.length > 0) {
                    dispatch({ type: ACTION.SET_RECEIVED_REQUESTS, payload: incoming });
                }

                // Check if any request WE sent has been accepted
                const accepted = checkAcceptedRequests(sessionId);
                if (accepted.length > 0 && state.tripStatus !== TRIP_STATUS.CONNECTED) {
                    const first = accepted[0];
                    dispatch({
                        type: ACTION.PARTNER_ACCEPTED,
                        payload: {
                            matchId: first.id, // Use request ID as matchId fallback
                            tripDetails: {
                                start: first.tripStart,
                                end: first.tripEnd,
                                mode: first.tripMode,
                                name: 'Travel Partner',
                            }
                        }
                    });
                }
            };

            // Poll every 2 seconds for fast discovery
            const initialTimer = setTimeout(poll, 500);
            pollingRef.current = setInterval(poll, 2000);

            return () => {
                clearTimeout(initialTimer);
                clearInterval(pollingRef.current);
            };
        } else {
            clearInterval(pollingRef.current);
        }
    }, [state.tripStatus, state.activeTrip, sessionId]);

    // ── Timeout Timer ────────────────────────────────────
    useEffect(() => {
        if (state.tripStatus === TRIP_STATUS.WAITING) {
            timeoutRef.current = setTimeout(() => {
                triggerTimeout();
            }, state.timeoutLimitMs);

            return () => clearTimeout(timeoutRef.current);
        } else {
            clearTimeout(timeoutRef.current);
        }
    }, [state.tripStatus, state.timeoutLimitMs, triggerTimeout]);

    const value = {
        ...state,
        sessionId,
        createTrip,
        sendRequest,
        acceptRequest,
        declineRequest,
        triggerTimeout,
        retryMatching,
        endTrip,
        emergencyAction,
        hasActiveTrip: state.tripStatus !== TRIP_STATUS.IDLE,
    };

    return (
        <TripContext.Provider value={value}>
            {children}
        </TripContext.Provider>
    );
};

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};
