# TigerKorean - Ứng dụng học tiếng Hàn

Ứng dụng React Native học tiếng Hàn với giao diện hiện đại, kiểm tra trình độ và học theo lộ trình từng bài giống Duolingo.

## 🎯 Tính năng

- ✅ **Đăng nhập** với xác thực
- ✅ **Kiểm tra trình độ** (Placement Test) với 9 câu hỏi (bao gồm listening)
- ✅ **Học theo lộ trình** 6 cấp độ (Beginner → Advanced), mỗi cấp 15 bài học
- ✅ **Giao diện hiện đại** với đường kết nối SVG mượt mà giữa các bài học
- ✅ **Navigation chuyên nghiệp** với gradient và active states
- ✅ **Audio player** cho câu hỏi nghe

## 📁 Cấu trúc thư mục

```
TigerKorean/
├── assets/                 # Hình ảnh, fonts, icons
├── src/
│   ├── components/        # Các component tái sử dụng
│   │   ├── Cards.js       # LessonCard, CategoryCard
│   │   └── LessonNode.js  # Node bài học (completed/current/locked)
│   ├── screens/           # Các màn hình chính
│   │   ├── LoginScreen.js
│   │   ├── HomeScreen.js
│   │   ├── PlacementTestScreen.js  # Kiểm tra trình độ
│   │   └── LessonPathScreen.js     # Lộ trình học
│   ├── navigation/        # Cấu hình điều hướng
│   │   └── AppNavigator.js
│   ├── services/          # API services
│   │   ├── api.js        # Axios instance & interceptors
│   │   └── authService.js # Authentication service
│   ├── contexts/          # React Context (state management)
│   │   └── AuthContext.js
│   ├── constants/         # Hằng số và dữ liệu
│   │   ├── config.js
│   │   ├── placementTestData.js  # 9 câu hỏi kiểm tra
│   │   └── lessonData.js         # 6 cấp độ, 15 bài/cấp
│   ├── utils/             # Các hàm tiện ích
│   └── hooks/             # Custom hooks
├── App.js
├── index.js
└── package.json
```

## 📋 Yêu cầu hệ thống

- Node.js 18 trở lên
- npm hoặc yarn
- Expo Go app (trên điện thoại Android/iOS)

## 🚀 Cài đặt và Chạy ứng dụng

### Bước 1: Cài đặt Expo CLI (nếu chưa có)

```bash
npm install -g expo-cli
```

### Bước 2: Cài đặt dependencies

```bash
cd TigerKorean
npm install --legacy-peer-deps
```

### Bước 3: Chạy ứng dụng

```bash
npx expo start
```

Sau khi chạy lệnh trên, bạn sẽ thấy:
- **QR Code** hiển thị trên terminal
- **Menu các options**: Press `a` để mở Android, `w` để mở web, `r` để reload...

### Bước 4: Xem ứng dụng trên thiết bị

**Trên điện thoại thật:**
1. Cài đặt app **Expo Go** từ:
   - Android: Google Play Store
   - iOS: App Store
2. Mở Expo Go và quét QR code từ terminal
3. App sẽ tự động tải và hiển thị

**Trên máy tính:**
- Nhấn `w` trong terminal để mở trên trình duyệt web
- Nhấn `a` để mở Android Emulator (cần cài Android Studio)

## 🔐 Tài khoản Demo

Hiện tại app đang chạy ở **chế độ demo** (không kết nối backend):

- **Username:** `learner`
- **Password:** `learner123`

## 🎮 Luồng hoạt động

```
1. [Màn hình đăng nhập]
   ↓ Nhập username/password và đăng nhập
   
2. [Màn hình Home]
   - Hiển thị thống kê: Streak, EXP, Lessons
   - 3 Categories: Từ vựng, Ngữ pháp, Luyện nghe
   - Các bài học gợi ý
   ↓ Nhấn "Kiểm tra trình độ"
   
3. [Placement Test - Màn giới thiệu]
   - Giải thích về bài kiểm tra (9 câu, ~3 phút)
   ↓ Nhấn "Bắt đầu kiểm tra"
   
4. [Placement Test - Làm bài]
   - 9 câu hỏi trắc nghiệm (8 đọc, 1 nghe)
   - Progress bar hiển thị tiến độ
   - Audio player cho câu hỏi listening
   ↓ Hoàn thành 9 câu
   
5. [Placement Test - Kết quả]
   - Hiển thị điểm số và số câu đúng
   - Đề xuất cấp độ phù hợp (Level 1-6)
   - 2 options: "Bắt đầu học" hoặc "Làm lại test"
   ↓ Nhấn "Bắt đầu học cấp X"
   
6. [Lesson Path - Lộ trình học]
   - Hiển thị 15 bài học theo dạng path dọc
   - Đường kết nối SVG mượt mà giữa các bài
   - 3 trạng thái: Completed (xanh), Current (vàng), Locked (xám)
   - Progress bar: 3/15 bài hoàn thành
   - Bottom navigation: Home, Statistics, Practice, Profile
   ↓ Nhấn vào bài học
   
7. [Bài học chi tiết] (Đang phát triển)
   - Nội dung bài học: từ vựng, ngữ pháp, bài tập
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
- Hiện tại app đang chạy ở **chế độ demo**, tắt kết nối API trong `AuthContext.js`

## 📱 Cấu trúc 6 cấp độ học

| Cấp | Tên | Mô tả | Màu sắc |
|-----|-----|-------|---------|
| 1 | Cơ bản 1 | Bảng chữ cái, số đếm, chào hỏi cơ bản | 🟢 Xanh lá |
| 2 | Cơ bản 2 | Giới thiệu bản thân, gia đình | 🔵 Xanh dương |
| 3 | Trung cấp 1 | Mua sắm, đặt đồ ăn, hỏi đường | 🟣 Tím |
| 4 | Trung cấp 2 | Thời tiết, sở thích, kế hoạch | 🟠 Cam |
| 5 | Nâng cao 1 | Công việc, học tập, văn hóa | 🔴 Đỏ |
| 6 | Nâng cao 2 | Thành ngữ, văn học, giao tiếp phức tạp | 🟤 Nâu |

Mỗi cấp có **15 bài học**, tổng cộng **90 bài học**.

## 🎨 Đặc điểm giao diện

### LessonPathScreen (Lộ trình học)
- **SVG Path Rendering**: Đường kết nối mượt mà giữa các lesson nodes
- **Bezier Curves**: Đường cong tự nhiên với gradient màu
- **3 Trạng Thái Lesson**:
  - ✅ Completed: Màu xanh, icon check
  - 🌟 Current: Màu vàng, có hiệu ứng sáng
  - 🔒 Locked: Màu xám, không thể nhấn
- **Modern Header**: Icon circle, title, progress bar
- **Professional Bottom Navigation**: 4 tabs với gradient overlay

### PlacementTestScreen (Kiểm tra trình độ)
- **3-Step Flow**: Intro → Test → Result
- **Audio Player**: Hỗ trợ câu hỏi listening với play/pause
- **Progress Indicator**: Thanh tiến độ câu hỏi
- **Smart Scoring**: Tự động đề xuất cấp độ dựa trên kết quả

## 📦 Dependencies chính

```json
{
  "expo": "~54.0.25",
  "react": "19.1.0",
  "react-native": "0.81.5",
  "@react-navigation/native": "^6.1.9",
  "@react-navigation/native-stack": "^6.9.17",
  "react-native-svg": "15.12.0",
  "expo-av": "~16.0.7",
  "expo-linear-gradient": "~15.0.7",
  "axios": "^1.6.2",
  "@react-native-async-storage/async-storage": "2.2.0"
}
```

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

- [ ] Nội dung bài học chi tiết (từ vựng, ngữ pháp, bài tập)
- [ ] Thêm dữ liệu cho Level 2-6 (75 bài học còn lại)
- [ ] Màn hình thống kê (Statistics)
- [ ] Màn hình luyện tập (Practice)
- [ ] Màn hình profile người dùng
- [ ] Hệ thống Streak và EXP
- [ ] Màn hình đăng ký
- [ ] Kết nối với Spring Boot backend
- [ ] Lưu tiến độ học tập
- [ ] Chức năng ôn tập từ vựng đã học

## 📞 Liên hệ & Hỗ trợ

- Repository: [TigerKoreanApp](https://github.com/tctinsama/TigerKoreanApp)
- Issues: Báo lỗi hoặc đề xuất tính năng tại GitHub Issues

## 📄 License

MIT License - Xem file LICENSE để biết thêm chi tiết.
