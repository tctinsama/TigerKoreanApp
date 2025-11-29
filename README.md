# TigerKorean - Ứng dụng học tiếng Hàn

Ứng dụng React Native kết nối với Spring Boot backend để hỗ trợ học tiếng Hàn.

## 📁 Cấu trúc thư mục

```
TigerKorean/
├── assets/                 # Hình ảnh, fonts, icons
├── src/
│   ├── components/        # Các component tái sử dụng
│   ├── screens/           # Các màn hình chính
│   │   ├── LoginScreen.js
│   │   └── HomeScreen.js
│   ├── navigation/        # Cấu hình điều hướng
│   │   └── AppNavigator.js
│   ├── services/          # API services
│   │   ├── api.js        # Axios instance & interceptors
│   │   └── authService.js # Authentication service
│   ├── contexts/          # React Context (state management)
│   │   └── AuthContext.js
│   ├── constants/         # Hằng số và cấu hình
│   │   └── config.js
│   ├── utils/             # Các hàm tiện ích
│   └── hooks/             # Custom hooks
├── App.js
├── index.js
└── package.json
```

## 🚀 Cài đặt

```bash
# Cài đặt dependencies
npm install --legacy-peer-deps

# Chạy ứng dụng
npm start
```

## 🔧 Cấu hình Backend

Mở file `src/constants/config.js` và cập nhật địa chỉ backend của bạn:

```javascript
const API_CONFIG = {
  BASE_URL: 'http://YOUR_BACKEND_URL:8080/api',
  TIMEOUT: 10000,
};
```

**Lưu ý:** 
- Nếu chạy trên thiết bị thật, thay `localhost` bằng địa chỉ IP của máy tính
- Nếu chạy trên Android emulator, sử dụng `10.0.2.2` thay cho `localhost`

## 📱 Các tính năng đã hoàn thiện

- ✅ Cấu trúc thư mục chuẩn React Native
- ✅ Tích hợp React Navigation
- ✅ Kết nối API với Axios
- ✅ Xử lý authentication (login/logout)
- ✅ Tự động refresh token
- ✅ Context API cho state management
- ✅ Màn hình đăng nhập với UI đẹp
- ✅ Màn hình Home cơ bản

## 🔐 API Endpoints

Cấu hình các endpoints trong `src/constants/config.js`:

```javascript
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
};
```

## 📝 Format dữ liệu API

### Login Request
```json
{
  "username": "string",
  "password": "string"
}
```

### Login Response
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": {
    "id": "number",
    "username": "string",
    "email": "string"
  }
}
```

## 🎨 Màu sắc chính

- Primary: `#FF6B35` (Cam)
- Background: `#f5f5f5` (Xám nhạt)
- Text: `#333` (Đen xám)

## 📦 Dependencies

- React Navigation - Điều hướng
- Axios - HTTP client
- AsyncStorage - Lưu trữ local
- Expo - Framework

## 🔜 Phát triển tiếp

- [ ] Màn hình đăng ký
- [ ] Màn hình quên mật khẩu
- [ ] Màn hình danh sách khóa học
- [ ] Màn hình bài học
- [ ] Màn hình luyện tập
- [ ] Màn hình thống kê tiến độ
