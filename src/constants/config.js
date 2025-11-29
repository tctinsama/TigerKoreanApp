// Cấu hình API endpoint cho Spring Boot backend
const API_CONFIG = {
  BASE_URL: 'http://localhost:8080/api', // Thay đổi địa chỉ này theo backend của bạn
  TIMEOUT: 10000,
};

// Các endpoints API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
  },
  // Thêm các endpoints khác theo API của bạn
};

export default API_CONFIG;
