//src/constants/config.js
// Cấu hình API endpoint cho Spring Boot backend
const API_CONFIG = {
  // Chọn BASE_URL phù hợp với môi trường của bạn:
  
  // 1. Máy ảo Android Studio:
  // BASE_URL: 'http://10.0.2.2:8080/api',
  
  // 2. Điện thoại thật qua Expo Go (IP máy tính của bạn):
  BASE_URL: 'http://172.16.0.62:8080/api',
  
  // 3. Localhost (iOS simulator):
  // BASE_URL: 'http://localhost:8080/api',
  
  // Cloudinary config
  CLOUDINARY_CLOUD_NAME: 'dfeefsbap',
  CLOUDINARY_UPLOAD_PRESET: 'ktiger_unsigned',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: '163931303040-f2d5b0sr9ervddgg3eceuaqqhvoifvro.apps.googleusercontent.com',
  
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
