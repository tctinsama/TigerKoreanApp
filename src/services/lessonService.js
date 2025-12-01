import apiClient from './api';
import API_CONFIG from '../constants/config';

export const lessonService = {
  // Lấy danh sách bài học theo level
  getLessonsByLevelId: async (levelId) => {
    try {
      const res = await apiClient.get(`/lessons`, {
        params: { levelId }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy danh sách bài học theo level + kèm tiến độ user (có trạng thái khóa/mở)
  // Backend API: GET /api/lessons/progress?levelId={levelId}&userId={userId}
  // Returns: [{lessonId, lessonName, lessonDescription, isLessonCompleted, isLocked, ...}]
  getLessonsByLevelIdWithProgress: async (levelId, userId) => {
    try {
      const res = await apiClient.get('/lessons/progress', {
        params: { levelId, userId }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Gửi dữ liệu hoàn thành bài học
  completeLesson: async (userId, lessonId, score) => {
    try {
      const res = await apiClient.post('/lessons/complete', null, {
        params: { userId, lessonId, score }
      });
      return res.data;
    } catch (error) {
      throw error;
    }
  }
};
