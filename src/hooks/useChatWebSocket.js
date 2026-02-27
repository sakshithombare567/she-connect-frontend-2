import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/axios';

const useChatWebSocket = (partnerUserId) => {
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [partnerLocation, setPartnerLocation] = useState(null);
    const [isConnected, setIsConnected] = useState(false);

    // Unread tracking for sending receipts
    const unreadMessagesRef = useRef(new Set());
    const readReceiptBatchRef = useRef([]);
    const readReceiptTimeoutRef = useRef(null);

    const wsRef = useRef(null);
    const reconnectTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const maxReconnectAttempts = 5;

    // Typing debounce
    const typingTimeoutRef = useRef(null);
    const lastTypingSentRef = useRef(false);

    // Location throttle
    const lastLocationSentTimeRef = useRef(0);

    // Fetch initial history
    useEffect(() => {
        if (!partnerUserId) return;

        const fetchHistory = async () => {
            try {
                // Fetch chat history as per spec
                // Adjusting syntax for typical axios interceptor if any
                const response = await api.get(`/chat/${partnerUserId}?limit=50&offset=0`);
                // Assume response.data is an array of messages
                if (Array.isArray(response.data)) {
                    // Sorting by created_at assuming API might return latest first
                    const sorted = response.data.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                    setMessages(sorted);
                }
            } catch (error) {
                console.error("Failed to fetch chat history:", error);
            }
        };

        fetchHistory();
    }, [partnerUserId]);

    // WebSocket connection & Auto-reconnect
    const connect = useCallback(() => {
        if (!partnerUserId) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) return;

        const token = sessionStorage.getItem('token');
        if (!token) return;

        const baseUrl = import.meta.env.VITE_API_BASE_URL || window.location.origin;
        const wsUrl = baseUrl.replace(/^http/, 'ws') + `/chat/ws?token=${token}`;

        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
            console.log('Chat WebSocket Connected');
            setIsConnected(true);
            reconnectAttempts.current = 0; // reset attempts
        };

        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                switch (data.type) {
                    case 'message':
                        // Incoming message
                        setMessages((prev) => [...prev, data]);
                        // Add to unread track list (handled by IntersectionObserver in component)
                        break;

                    case 'message_sent':
                        // Confirmation my message was saved
                        setMessages((prev) => prev.map(msg =>
                            msg.placeholderId === data.placeholderId
                                ? { ...msg, ...data, status: 'sent', placeholderId: undefined }
                                : msg
                        ));
                        break;

                    case 'typing':
                        // Only act if it's from current partner
                        if (String(data.senderId) === String(partnerUserId)) {
                            setIsTyping(data.isTyping);
                        }
                        break;

                    case 'receipt':
                        // Partner read my messages
                        if (data.chat_ids && Array.isArray(data.chat_ids)) {
                            setMessages((prev) => prev.map(msg =>
                                data.chat_ids.includes(msg.chat_id)
                                    ? { ...msg, status: 'read' }
                                    : msg
                            ));
                        }
                        break;

                    case 'location':
                        if (String(data.senderId) === String(partnerUserId)) {
                            setPartnerLocation({
                                lat: data.lat,
                                lng: data.lng,
                                timestamp: data.timestamp
                            });
                        }
                        break;

                    default:
                        console.warn("Unknown message type:", data.type);
                }
            } catch (err) {
                console.error("Failed to parse WS incoming message", err);
            }
        };

        ws.onclose = () => {
            console.log('Chat WebSocket Disconnected');
            setIsConnected(false);
            wsRef.current = null;

            // Exponential backoff reconnect
            if (reconnectAttempts.current < maxReconnectAttempts) {
                const timeout = Math.min(10000, 1000 * Math.pow(2, reconnectAttempts.current));
                console.log(`Attempting reconnect in ${timeout}ms...`);
                reconnectTimeoutRef.current = setTimeout(() => {
                    reconnectAttempts.current += 1;
                    connect();
                }, timeout);
            }
        };

        ws.onerror = (err) => {
            console.error('Chat WebSocket Error:', err);
            ws.close(); // Force close to trigger auto-reconnect
        };
    }, [partnerUserId]);

    useEffect(() => {
        connect();
        return () => {
            if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        };
    }, [connect]);

    // Outgoing Events

    const sendMessage = useCallback((text) => {
        const trimmed = text.trim();
        if (!trimmed || trimmed.length > 2000) return false;
        if (wsRef.current?.readyState !== WebSocket.OPEN) return false;

        const placeholderId = "temp-" + Date.now();
        const payload = {
            type: 'message',
            receiverId: partnerUserId,
            message: trimmed,
            placeholderId: placeholderId // Custom field to track optimistic update
        };

        wsRef.current.send(JSON.stringify(payload));

        // Optimistic update
        setMessages((prev) => [...prev, {
            placeholderId,
            message: trimmed,
            senderId: 'me', // identifying it's mine
            created_at: new Date().toISOString(),
            status: 'sending'
        }]);

        return true;
    }, [partnerUserId]);

    const sendTyping = useCallback(() => {
        if (wsRef.current?.readyState !== WebSocket.OPEN) return;

        // Reset the timeout that would send "false"
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

        // If we haven't sent 'true' recently, send it now
        if (!lastTypingSentRef.current) {
            wsRef.current.send(JSON.stringify({ type: 'typing', receiverId: partnerUserId, isTyping: true }));
            lastTypingSentRef.current = true;
        }

        // Set timeout to send 'false' after 1.5s of no keystrokes
        typingTimeoutRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({ type: 'typing', receiverId: partnerUserId, isTyping: false }));
                lastTypingSentRef.current = false;
            }
        }, 1500);
    }, [partnerUserId]);

    const markAsRead = useCallback((chatId) => {
        // Prevent duplicate queuing
        if (unreadMessagesRef.current.has(chatId)) return;

        unreadMessagesRef.current.add(chatId);
        readReceiptBatchRef.current.push(chatId);

        // Batch send read receipts
        if (readReceiptTimeoutRef.current) clearTimeout(readReceiptTimeoutRef.current);

        readReceiptTimeoutRef.current = setTimeout(() => {
            if (wsRef.current?.readyState === WebSocket.OPEN && readReceiptBatchRef.current.length > 0) {
                wsRef.current.send(JSON.stringify({
                    type: 'read',
                    receiverId: partnerUserId,
                    chat_ids: [...readReceiptBatchRef.current]
                }));
                readReceiptBatchRef.current = []; // clear batch
            }
        }, 500); // 500ms batching window
    }, [partnerUserId]);

    // Location Tracking with 2.5s Throttle
    useEffect(() => {
        if (!navigator.geolocation) return;

        const watchId = navigator.geolocation.watchPosition(
            (position) => {
                const now = Date.now();
                // Strict 2.5s throttle to satisfy backend rate limit
                if (now - lastLocationSentTimeRef.current >= 2500) {
                    if (wsRef.current?.readyState === WebSocket.OPEN && partnerUserId) {
                        wsRef.current.send(JSON.stringify({
                            type: 'location',
                            receiverId: partnerUserId,
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                            timestamp: new Date().toISOString()
                        }));
                        lastLocationSentTimeRef.current = now;
                    }
                }
            },
            (err) => console.error("Geolocation watch error:", err),
            { enableHighAccuracy: true, maximumAge: 0 }
        );

        return () => navigator.geolocation.clearWatch(watchId);
    }, [partnerUserId, isConnected]); // re-run if connection drops/restores to ensure sending

    return {
        messages,
        isTyping,
        partnerLocation,
        isConnected,
        sendMessage,
        sendTyping,
        markAsRead
    };
};

export default useChatWebSocket;
