//src/constants/config.js
// Cấu hình API endpoint cho Spring Boot backend
const API_CONFIG = {
  // Chọn BASE_URL phù hợp với môi trường của bạn:
  
  // 1. Máy ảo Android Studio:
  // BASE_URL: 'http://10.0.2.2:8080/api',
  
  // 2. Điện thoại thật qua Expo Go (IP máy tính của bạn):
  BASE_URL: 'http://192.168.1.244:8080/api',
  
  // 3. Localhost (iOS simulator hoặc development):
  //BASE_URL: 'http://localhost:8080/api',
  
  // Cloudinary config
  CLOUDINARY_CLOUD_NAME: 'dfeefsbap',
  CLOUDINARY_UPLOAD_PRESET: 'ktiger_unsigned',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: '163931303040-f2d5b0sr9ervddgg3eceuaqqhvoifvro.apps.googleusercontent.com',
  
  TIMEOUT: 30000, // 30 seconds
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
    GET_WITH_PROGRESS: '/lessons/progress', // GET /lessons/progress?levelId=X&userId=Y
    COMPLETE: '/lessons/complete', // POST /lessons/complete?userId=X&lessonId=Y&score=Z (mở khóa bài tiếp)
  },
  VOCABULARY: {
    BY_LESSON: '/vocabulary-theories/lesson',
    BY_ID: '/vocabulary-theories',
  },
  GRAMMAR: {
    BY_LESSON: '/grammar-theories/lesson',
    BY_ID: '/grammar-theories',
    COMPLETE: '/grammar-theories/complete',
  },
  EXERCISES: {
    BY_LESSON: '/exercises/lesson',
    MCQ: '/mcq/exercise',
    SENTENCE_REWRITING: '/sentence-rewriting/exercise',
    SAVE_RESULT: '/user-exercise-results',
  },
  // Thêm các endpoints khác theo API của bạn
};

export default API_CONFIG;
