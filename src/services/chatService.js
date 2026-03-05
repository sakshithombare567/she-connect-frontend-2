// src/services/chatService.js
import api from '../api/axios';

/**
 * Fetch chat messages with a specific partner
 * @param {number} partnerId - User ID of chat partner
 * @param {number} limit - Number of messages to fetch
 * @param {number} offset - Pagination offset
 * @returns {Promise<Object>} - Messages data
 */
export const getChatMessages = async (partnerId, limit = 50, offset = 0) => {
    try {
        const response = await api.get(`/chat/${partnerId}?limit=${limit}&offset=${offset}`);
        return response.data;
    } catch (error) {
        console.error('Failed to fetch chat messages:', error);
        return { messages: [] };
    }
};
