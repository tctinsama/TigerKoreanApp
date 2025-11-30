//src/constants/config.js
// Cấu hình API endpoint cho Spring Boot backend
const API_CONFIG = {
  // Chọn BASE_URL phù hợp với môi trường của bạn:
  
  // 1. Máy ảo Android Studio:
  BASE_URL: 'http://10.0.2.2:8080/api',
  
  // 2. Điện thoại thật qua Expo Go (thay IP máy tính):
  // BASE_URL: 'http://192.168.x.x:8080/api',
  
  // 3. Localhost (iOS simulator):
  // BASE_URL: 'http://localhost:8080/api',
  
  TIMEOUT: 10000,
};

// Các endpoints API
export const API_ENDPOINTS = {
  AUTH: {
    SIGNIN: '/auth/signin',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/update',
  },
  LEVELS: {
    GET_ALL: '/levels',
    GET_BY_ID: '/levels',
  },
  LESSONS: {
    GET_BY_LEVEL: '/lessons',
    GET_WITH_PROGRESS: '/lessons/progress',
    COMPLETE: '/lessons/complete',
  },
  // Thêm các endpoints khác theo API của bạn
};

export default API_CONFIG;
