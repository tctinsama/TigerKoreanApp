import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const grammarService = {
  /**
   * Lấy danh sách ngữ pháp theo lessonId
   * @param {string|number} lessonId - ID của bài học
   * @returns {Promise<Array>} Danh sách ngữ pháp
   */
  getGrammarByLessonId: async (lessonId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GRAMMAR.BY_LESSON}/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grammar:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một ngữ pháp
   * @param {string|number} grammarId - ID của ngữ pháp
   * @returns {Promise<Object>} Chi tiết ngữ pháp
   */
  getGrammarById: async (grammarId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.GRAMMAR.BY_ID}/${grammarId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching grammar detail:', error);
      throw error;
    }
  },

  /**
   * Đánh dấu ngữ pháp đã hoàn thành
   * @param {string|number} grammarId - ID của ngữ pháp
   * @param {boolean} completed - Trạng thái hoàn thành
   * @returns {Promise<Object>} Kết quả
   */
  markGrammarAsCompleted: async (grammarId, completed = true) => {
    try {
      const response = await api.post(`${API_ENDPOINTS.GRAMMAR.COMPLETE}/${grammarId}`, {
        completed,
      });
      return response.data;
    } catch (error) {
      console.error('Error marking grammar as completed:', error);
      throw error;
    }
  },
};

export default grammarService;
