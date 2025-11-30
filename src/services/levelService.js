import apiClient from './api';

export const levelService = {
  // Lấy tất cả các level
  getAllLevels: async () => {
    try {
      const res = await apiClient.get('/levels');
      return res.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy thông tin chi tiết level
  getLevelById: async (levelId) => {
    try {
      const res = await apiClient.get(`/levels/${levelId}`);
      return res.data;
    } catch (error) {
      throw error;
    }
  }
};
