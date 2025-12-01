import api from './api';
import { API_ENDPOINTS } from '../constants/config';

export const exerciseService = {
  /**
   * Lấy danh sách exercises theo lessonId
   */
  getExercisesByLessonId: async (lessonId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.EXERCISES.BY_LESSON}/${lessonId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching exercises:', error);
      throw error;
    }
  },

  /**
   * Lấy câu hỏi trắc nghiệm theo exerciseId
   */
  getMultipleChoiceByExerciseId: async (exerciseId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.EXERCISES.MCQ}/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching MCQ:', error);
      throw error;
    }
  },

  /**
   * Lấy câu hỏi viết lại câu theo exerciseId
   */
  getSentenceRewritingByExerciseId: async (exerciseId) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.EXERCISES.SENTENCE_REWRITING}/${exerciseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching sentence rewriting:', error);
      throw error;
    }
  },

  /**
   * Lưu kết quả bài tập
   */
  saveUserExerciseResult: async (resultData) => {
    try {
      const response = await api.post(API_ENDPOINTS.EXERCISES.SAVE_RESULT, resultData);
      return response.data;
    } catch (error) {
      console.error('Error saving exercise result:', error);
      throw error;
    }
  },
};

export default exerciseService;
