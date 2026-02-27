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
    checkCrossedRequests,
    cleanupSession,
    setWeMet as storageSetWeMet,
    getWeMetStatus,
    setIReached as storageSetIReached,
    getIReachedStatus,
    markTripEnded,
    checkPartnerEnded,
    clearEndedFlag,
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
    sentRequests: [],
    receivedRequests: [],
    connectedPartner: null,
    privacyChoice: null,
    userDetails: null,
    timeoutLimitMs: 5 * 60 * 1000,
    sessionId: null,
    weMet: { me: false, partner: false },
    iReached: { me: false, partner: false },
    partnerEndedTrip: false,
};

// ─── Reducer ─────────────────────────────────────────────
const ACTION = {
    CREATE_TRIP: 'CREATE_TRIP',
    SET_MATCHES: 'SET_MATCHES',
    SEND_REQUEST: 'SEND_REQUEST',
    SET_RECEIVED_REQUESTS: 'SET_RECEIVED_REQUESTS',
    ACCEPT_REQUEST: 'ACCEPT_REQUEST',
    DECLINE_REQUEST: 'DECLINE_REQUEST',
    PARTNER_ACCEPTED: 'PARTNER_ACCEPTED',
    TRIGGER_TIMEOUT: 'TRIGGER_TIMEOUT',
    RETRY_MATCHING: 'RETRY_MATCHING',
    END_TRIP: 'END_TRIP',
    SET_WE_MET: 'SET_WE_MET',
    SET_I_REACHED: 'SET_I_REACHED',
    UPDATE_WE_MET_STATUS: 'UPDATE_WE_MET_STATUS',
    UPDATE_I_REACHED_STATUS: 'UPDATE_I_REACHED_STATUS',
    PARTNER_ENDED: 'PARTNER_ENDED',
    REVERT_TO_WAITING: 'REVERT_TO_WAITING',
};

function tripReducer(state, action) {
    switch (action.type) {
        case ACTION.CREATE_TRIP:
            return {
                ...state,
                tripStatus: TRIP_STATUS.WAITING,
                activeTrip: action.payload.trip,
                privacyChoice: action.payload.privacy,
                userDetails: action.payload.userDetails || null,
                sessionId: action.payload.sessionId,
                matches: [],
                sentRequests: [],
                receivedRequests: [],
                connectedPartner: null,
                weMet: { me: false, partner: false },
                iReached: { me: false, partner: false },
                partnerEndedTrip: false,
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
                    phone: request.fromPhone || null,
                    college: request.fromCollege || null,
                    start: request.tripStart,
                    end: request.tripEnd,
                    mode: request.tripMode,
                    privacy_type: request.fromPrivacy || 'anonymous',
                    sessionId: request.fromSessionId,
                    verified: true,
                },
                receivedRequests: state.receivedRequests.map(r =>
                    r.id === action.payload.requestId ? { ...r, status: REQUEST_STATUS.ACCEPTED } : r
                ),
                weMet: { me: false, partner: false },
                iReached: { me: false, partner: false },
                partnerEndedTrip: false,
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
            const p = action.payload;
            return {
                ...state,
                tripStatus: TRIP_STATUS.CONNECTED,
                connectedPartner: {
                    id: p.requestId,
                    name: p.acceptorName || 'Travel Partner',
                    phone: p.acceptorPhone || null,
                    college: p.acceptorCollege || null,
                    start: p.tripStart,
                    end: p.tripEnd,
                    mode: p.tripMode,
                    privacy_type: p.acceptorPrivacy || 'anonymous',
                    verified: true,
                    sessionId: p.acceptorSessionId || null,
                },
                sentRequests: state.sentRequests.map(r =>
                    r.matchId === p.matchId ? { ...r, status: REQUEST_STATUS.ACCEPTED } : r
                ),
                weMet: { me: false, partner: false },
                iReached: { me: false, partner: false },
                partnerEndedTrip: false,
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

        case ACTION.SET_WE_MET:
            return { ...state, weMet: { ...state.weMet, me: true } };

        case ACTION.UPDATE_WE_MET_STATUS:
            return { ...state, weMet: action.payload };

        case ACTION.SET_I_REACHED:
            return { ...state, iReached: { ...state.iReached, me: true } };

        case ACTION.UPDATE_I_REACHED_STATUS:
            return { ...state, iReached: action.payload };

        case ACTION.PARTNER_ENDED:
            return { ...state, partnerEndedTrip: true };

        case ACTION.REVERT_TO_WAITING:
            return {
                ...state,
                tripStatus: TRIP_STATUS.WAITING,
                connectedPartner: null,
                sentRequests: [],
                receivedRequests: [],
                weMet: { me: false, partner: false },
                iReached: { me: false, partner: false },
                partnerEndedTrip: false,
            };

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
    const sessionId = getSessionId();

    // ── Actions ──────────────────────────────────────────

    const createTrip = useCallback((tripData, userDetails = {}) => {
        if (state.tripStatus !== TRIP_STATUS.IDLE) {
            console.warn('[TripContext] Cannot create trip — active trip exists.');
            return false;
        }
        clearEndedFlag(sessionId);
        const trip = {
            id: Date.now(),
            start: tripData.start,
            end: tripData.end,
            mode: tripData.mode,
            vehicleNo: tripData.vehicleNo || null,
            createdAt: new Date().toISOString(),
        };
        // Save trip without privacy — privacy is chosen later at send/accept
        saveTrip(trip, sessionId, null, userDetails);
        dispatch({ type: ACTION.CREATE_TRIP, payload: { trip, privacy: null, sessionId, userDetails } });
        return true;
    }, [state.tripStatus, sessionId]);

    // sendRequest now takes privacyChoice from the modal
    const sendRequest = useCallback((matchId, privacyChoice) => {
        const match = state.matches.find(m => m.id === matchId);
        if (!match) return;
        sendLiveRequest(sessionId, match.sessionId, {
            name: state.userDetails?.name || 'Anonymous',
            phone: state.userDetails?.phone || null,
            college: state.userDetails?.college || null,
            privacyChoice: privacyChoice,
        }, state.activeTrip);
        dispatch({ type: ACTION.SEND_REQUEST, payload: matchId });
    }, [sessionId, state.matches, state.activeTrip, state.userDetails]);

    // acceptRequest now takes privacyChoice from the modal
    const acceptRequest = useCallback((requestId, privacyChoice) => {
        acceptLiveRequest(requestId, {
            name: state.userDetails?.name || 'Anonymous',
            phone: state.userDetails?.phone || null,
            college: state.userDetails?.college || null,
            privacyChoice: privacyChoice,
            sessionId: sessionId,
        });
        dispatch({ type: ACTION.ACCEPT_REQUEST, payload: { requestId } });
    }, [state.userDetails, sessionId]);

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
        if (state.connectedPartner?.sessionId) {
            markTripEnded(sessionId, state.connectedPartner.sessionId);
        }
        cleanupSession(sessionId);
        dispatch({ type: ACTION.END_TRIP });
    }, [sessionId, state.connectedPartner]);

    // Revert to waiting — keep same trip, clear connection data
    const revertToWaiting = useCallback(() => {
        // Clean up connection-related data but keep the trip
        const requests = JSON.parse(localStorage.getItem('sheconnect_live_requests') || '[]');
        localStorage.setItem('sheconnect_live_requests', JSON.stringify(
            requests.filter(r => r.fromSessionId !== sessionId && r.toSessionId !== sessionId)
        ));
        clearEndedFlag(sessionId);
        // Clear we met / i reached status
        import('../utils/tripStorage').then(mod => mod.clearStatus(sessionId));
        dispatch({ type: ACTION.REVERT_TO_WAITING });
    }, [sessionId]);

    const emergencyAction = useCallback(() => {
        alert("🚨 EMERGENCY SOS TRIGGERED!\nYour location and trip details have been sent to local authorities and emergency contacts.");
    }, []);

    const pressWeMet = useCallback(() => {
        storageSetWeMet(sessionId);
        dispatch({ type: ACTION.SET_WE_MET });
    }, [sessionId]);

    const pressIReached = useCallback(() => {
        storageSetIReached(sessionId);
        dispatch({ type: ACTION.SET_I_REACHED });
    }, [sessionId]);

    // ── Live Polling — find matches from other tabs ──────
    useEffect(() => {
        const isSearching = (
            state.tripStatus === TRIP_STATUS.WAITING ||
            state.tripStatus === TRIP_STATUS.REQUEST_PENDING
        );

        if (isSearching && state.activeTrip) {
            const poll = () => {
                const liveMatches = findLiveMatches(state.activeTrip, sessionId);
                dispatch({ type: ACTION.SET_MATCHES, payload: liveMatches });

                const incoming = getIncomingRequests(sessionId);
                dispatch({ type: ACTION.SET_RECEIVED_REQUESTS, payload: incoming });

                // Check for crossed requests: both sent to each other → auto-accept
                const crossed = checkCrossedRequests(sessionId);
                if (crossed && state.tripStatus !== TRIP_STATUS.CONNECTED) {
                    acceptLiveRequest(crossed.id, {
                        name: state.userDetails?.name || 'Anonymous',
                        phone: state.userDetails?.phone || null,
                        college: state.userDetails?.college || null,
                        privacyChoice: state.privacyChoice,
                        sessionId: sessionId,
                    });
                    dispatch({ type: ACTION.ACCEPT_REQUEST, payload: { requestId: crossed.id } });
                    return;
                }

                const accepted = checkAcceptedRequests(sessionId);
                if (accepted.length > 0 && state.tripStatus !== TRIP_STATUS.CONNECTED) {
                    const first = accepted[0];
                    dispatch({
                        type: ACTION.PARTNER_ACCEPTED,
                        payload: {
                            requestId: first.id,
                            matchId: first.id,
                            acceptorName: first.acceptorName || 'Travel Partner',
                            acceptorPhone: first.acceptorPhone || null,
                            acceptorCollege: first.acceptorCollege || null,
                            acceptorPrivacy: first.acceptorPrivacy || 'anonymous',
                            acceptorSessionId: first.acceptorSessionId || null,
                            tripStart: first.tripStart,
                            tripEnd: first.tripEnd,
                            tripMode: first.tripMode,
                        }
                    });
                }
            };

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

    // ── Poll We Met / I Reached / Partner Ended ──────────
    useEffect(() => {
        if (state.tripStatus === TRIP_STATUS.CONNECTED && state.connectedPartner?.sessionId) {
            const pollStatus = () => {
                const weMetStatus = getWeMetStatus(sessionId, state.connectedPartner.sessionId);
                dispatch({ type: ACTION.UPDATE_WE_MET_STATUS, payload: weMetStatus });

                const iReachedStatus = getIReachedStatus(sessionId, state.connectedPartner.sessionId);
                dispatch({ type: ACTION.UPDATE_I_REACHED_STATUS, payload: iReachedStatus });

                // Check if partner ended their trip
                if (!state.partnerEndedTrip && checkPartnerEnded(state.connectedPartner.sessionId)) {
                    dispatch({ type: ACTION.PARTNER_ENDED });
                }
            };

            pollStatus();
            const interval = setInterval(pollStatus, 2000);
            return () => clearInterval(interval);
        }
    }, [state.tripStatus, state.connectedPartner?.sessionId, sessionId, state.partnerEndedTrip]);

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
        revertToWaiting,
        emergencyAction,
        pressWeMet,
        pressIReached,
        hasActiveTrip: state.tripStatus !== TRIP_STATUS.IDLE,
        bothMet: state.weMet.me && state.weMet.partner,
        bothReached: state.iReached.me && state.iReached.partner,
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
