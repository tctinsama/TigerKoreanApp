# Backend Integration - Groq AI Service

## ✅ Đã hoàn thành

### 1. Backend Service Files (Spring Boot)
Các file này cần copy vào Spring Boot project của bạn:

#### `GroqAIService.java` 
- Đường dẫn: `src/main/java/org/example/ktigerstudybe/service/ai/GroqAIService.java`
- Chức năng: Tích hợp Groq API thay thế Gemini
- Methods:
  - `generateKoreanResponse()` - Tạo phản hồi tiếng Hàn theo scenario/difficulty
  - `translateToVietnamese()` - Dịch text Hàn sang Việt

#### `ChatService.java` & `ChatServiceImpl.java`
- Đường dẫn: `src/main/java/org/example/ktigerstudybe/service/chat/`
- Chức năng: Quản lý conversations và messages
- Methods:
  - `createConversation()` - Tạo conversation mới
  - `sendMessage()` - Gửi message và nhận AI response + translation
  - `getConversationMessages()` - Lấy lịch sử chat
  - `getUserConversations()` - Lấy danh sách conversations của user
  - `deleteConversation()` - Xóa conversation

#### `ChatController.java`
- Đường dẫn: `src/main/java/org/example/ktigerstudybe/controller/ChatController.java`
- Không thay đổi gì (đã đúng)

### 2. React Native Frontend Files

#### `chatService.js` ✅ MỚI
- Đường dẫn: `src/services/chatService.js`
- Chức năng: Call backend API cho chat conversations
- Methods: createConversation, sendMessage, getConversationMessages, etc.

#### `ConversationPracticeScreen.js` ✅ CẬP NHẬT
- Tích hợp backend API thay vì call trực tiếp Groq
- Lưu conversationId để track chat session
- Nhận translation từ backend
- Xử lý parseAIMessage với translation có sẵn

#### `groqService.js` ✅ GIẢM CHỨC NĂNG
- Chỉ còn placeholder cho ChatBotScreen free chat
- Các chức năng conversation đã chuyển sang chatService.js

### 3. Cấu hình Backend

Cập nhật `application.properties`:

```properties
# Xóa config Gemini cũ
# gemini.api.key=...
# gemini.api.url=...

# Thêm config Groq mới
groq.api.key=gsk_your_groq_api_key_here
groq.api.url=https://api.groq.com/openai/v1/chat/completions
groq.api.model=llama-3.1-8b-instant
groq.api.mock=false
```

### 4. API Endpoints

Backend cung cấp các endpoints:

```
POST   /api/chat/conversations
POST   /api/chat/conversations/{id}/messages
GET    /api/chat/conversations/{id}/messages
GET    /api/chat/users/{userId}/conversations
DELETE /api/chat/conversations/{id}
GET    /api/chat/scenarios
GET    /api/chat/difficulties
```

## 🔄 Flow hoạt động

### Conversation Practice:
1. User chọn topic + level → `ConversationTopicsScreen`
2. Nhấn "Bắt đầu" → Call `chatService.createConversation(userId, scenario, difficulty)`
3. Backend tạo conversation mới, lưu DB
4. User gửi message → Call `chatService.sendMessage(conversationId, content)`
5. Backend:
   - Lưu user message
   - Call Groq API để sinh response tiếng Hàn
   - Call Groq API để dịch sang Việt
   - Lưu AI message
   - Trả về `ChatResponsePair` (userMessage + aiMessage với translation)
6. Frontend hiển thị message Hàn, ẩn translation
7. User nhấn "번역" → Toggle hiển thị translation

## 📦 Dependencies

### Backend (pom.xml)
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

### Frontend (package.json)
```json
{
  "expo-av": "~14.0.7",
  "@react-native-async-storage/async-storage": "^2.1.0",
  "axios": "^1.7.9"
}
```

## 🚀 Hướng dẫn Deploy

### Backend:
1. Copy 3 file Java vào đúng package structure
2. Update `application.properties` với Groq API key
3. Chạy Spring Boot: `mvn spring-boot:run`
4. Test API: `http://localhost:8080/api/chat/scenarios`

### Frontend:
1. Update `src/constants/config.js` với backend URL
2. Đảm bảo user đã login (có userId trong AuthContext)
3. Run app: `npx expo start`
4. Test conversation practice feature

## 🐛 Troubleshooting

### Lỗi "Cannot find chatService":
- Kiểm tra import: `import { chatService } from '../../services/chatService';`

### Lỗi "conversationId is null":
- Đảm bảo `startConversation()` được gọi trước khi `sendMessage()`

### Backend không trả về translation:
- Check Groq API key có hợp lệ
- Check log backend: `Groq Translate result`

### User undefined:
- Đảm bảo AuthContext có user với userId
- Fallback: `const userId = user?.userId || 1;`

## 📝 TODO

- [ ] Implement free chat endpoint cho ChatBotScreen
- [ ] Add romanization support (optional)
- [ ] Add speech-to-text cho microphone feature
- [ ] Add loading skeleton cho better UX
- [ ] Add error retry logic
- [ ] Add offline mode với cached conversations
