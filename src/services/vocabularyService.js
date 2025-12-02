import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const vocabularyService = {
  /**
   * Lấy danh sách từ vựng theo lessonId
   * @param {string|number} lessonId - ID của bài học
   * @returns {Promise<Array>} Danh sách từ vựng
   */
  getVocabularyByLessonId: async (lessonId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.VOCABULARY.BY_LESSON}/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw error;
    }
  },

  /**
   * Lấy chi tiết một từ vựng
   * @param {string|number} vocabId - ID của từ vựng
   * @returns {Promise<Object>} Chi tiết từ vựng
   */
  getVocabularyById: async (vocabId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.VOCABULARY.BY_ID}/${vocabId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching vocabulary detail:', error);
      throw error;
    }
  },
};

export default vocabularyService;
