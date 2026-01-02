//src/constants/config.js
// Cấu hình API endpoint cho Spring Boot backend
const API_CONFIG = {
  // Chọn BASE_URL phù hợp với môi trường của bạn:
  
  // 1. Máy ảo Android Studio:
  // BASE_URL: 'http://10.0.2.2:8080/api',
  
  // 2. Điện thoại thật qua Expo Go (IP máy tính của bạn):
  BASE_URL: 'http://192.168.20.123:8080/api',
  
  // 3. Localhost (iOS simulator hoặc development):
  //BASE_URL: 'http://localhost:8080/api',
  
  // Cloudinary config
  CLOUDINARY_CLOUD_NAME: 'dfeefsbap',
  CLOUDINARY_UPLOAD_PRESET: 'ktiger_unsigned',
  
  // Google OAuth
  GOOGLE_CLIENT_ID: '163931303040-f2d5b0sr9ervddgg3eceuaqqhvoifvro.apps.googleusercontent.com',
  
  // Groq AI API Key
  GROQ_API_KEY: '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',
  
  TIMEOUT: 30000, // 30 seconds
};

// Các endpoints API
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/signup',
    SIGNIN: '/auth/signin',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh-token',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  LESSONS: {
    BASE: '/lessons',
    BY_LEVEL: '/lessons/level',
    UNLOCK: '/lessons/unlock',
    PROGRESS: '/lessons/progress',
  },
  VOCABULARY: {
    BASE: '/vocabulary',
    BY_LEVEL: '/vocabulary/level',
    BY_LESSON: '/vocabulary/lesson',
  },
  GRAMMAR: {
    BASE: '/grammar',
    BY_LEVEL: '/grammar/level',
    BY_LESSON: '/grammar/lesson',
  },
  EXERCISES: {
    BASE: '/exercises',
    BY_LESSON: '/exercises/lesson',
    SUBMIT: '/exercises/submit',
  },
  LEVELS: {
    BASE: '/levels',
    PROGRESS: '/levels/progress',
  },
  CHAT: {
    BASE: '/chat',
    CONVERSATION: '/chat/conversation',
  },
  LEADERBOARD: '/leaderboard',
};

export default API_CONFIG;
