import apiClient from './api';

export const getLeaderboard = async () => {
  try {
    const response = await apiClient.get('/user-xp/leaderboard');
    return response.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    throw error;
  }
};
