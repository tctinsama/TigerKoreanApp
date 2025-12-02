// src/services/chatService.js
import apiClient from './api';

export const chatService = {
  // Tạo conversation mới
  createConversation: async (userId, scenario, difficulty) => {
    try {
      const response = await apiClient.post('/chat/conversations', {
        userId: userId,
        scenario: scenario,
        difficulty: difficulty,
      });
      return response.data;
    } catch (error) {
      console.error('Create conversation error:', error);
      console.error('Error response:', error.response?.data);
      throw error;
    }
  },

  // Gửi tin nhắn và nhận phản hồi từ AI
  sendMessage: async (conversationId, content) => {
    try {
      const response = await apiClient.post(
        `/chat/conversations/${conversationId}/messages`,
        { content }
      );
      return response.data; // ChatResponsePair { userMessage, aiMessage }
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  },

  // Lấy tất cả tin nhắn trong conversation
  getConversationMessages: async (conversationId) => {
    try {
      const response = await apiClient.get(
        `/chat/conversations/${conversationId}/messages`
      );
      return response.data;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  },

  // Lấy tất cả conversations của user
  getUserConversations: async (userId) => {
    try {
      const response = await apiClient.get(`/chat/users/${userId}/conversations`);
      return response.data;
    } catch (error) {
      console.error('Get conversations error:', error);
      throw error;
    }
  },

  // Xóa conversation
  deleteConversation: async (conversationId) => {
    try {
      await apiClient.delete(`/chat/conversations/${conversationId}`);
    } catch (error) {
      console.error('Delete conversation error:', error);
      throw error;
    }
  },

  // Lấy danh sách scenarios hỗ trợ
  getSupportedScenarios: async () => {
    try {
      const response = await apiClient.get('/chat/scenarios');
      return response.data;
    } catch (error) {
      console.error('Get scenarios error:', error);
      return ['restaurant', 'shopping', 'direction', 'introduction', 'daily'];
    }
  },

  // Lấy danh sách difficulties hỗ trợ
  getSupportedDifficulties: async () => {
    try {
      const response = await apiClient.get('/chat/difficulties');
      return response.data;
    } catch (error) {
      console.error('Get difficulties error:', error);
      return ['beginner', 'intermediate', 'advanced'];
    }
  },
};

export default chatService;
