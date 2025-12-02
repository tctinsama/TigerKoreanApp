# 🚀 Hướng dẫn nhanh - AI ChatBot

## Bước 1: Lấy API Key từ Groq

1. Truy cập: **https://console.groq.com/**
2. Đăng ký tài khoản miễn phí
3. Vào mục **"API Keys"** 
4. Nhấn **"Create API Key"**
5. Copy key (dạng: `gsk_...`)

## Bước 2: Cấu hình API Key

Mở file: `src/services/groqService.js`

Tìm dòng:
```javascript
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
```

Thay thế bằng key của bạn:
```javascript
const GROQ_API_KEY = 'gsk_abc123...your_key_here';
```

## Bước 3: Chạy ứng dụng

```bash
npm start
```

## Bước 4: Sử dụng ChatBot

### Cách 1: Từ HomeScreen
1. Mở ứng dụng
2. Nhìn thấy **bong bóng AI** màu cam ở góc màn hình
3. **Kéo thả** để di chuyển bong bóng (nếu muốn)
4. **Nhấn vào** bong bóng để mở chat

### Cách 2: Navigation trực tiếp
```javascript
navigation.navigate('ChatBot');
```

## 🎯 Thử nghiệm nhanh

Sau khi mở chat, thử các câu hỏi sau:

### Tiếng Việt:
```
- "안녕하세요 nghĩa là gì?"
- "Giải thích ngữ pháp -습니다/ㅂ니다"
- "Cho tôi 10 từ vựng về đồ ăn"
```

### Tiếng Hàn:
```
- "이것은 무엇입니까?"
- "저는 한국어를 공부하고 싶어요"
```

### Sửa câu:
```
- "Kiểm tra câu này giúp tôi: 저는 학교에 가요"
```

## 🎨 Tính năng có sẵn

✅ **Bong bóng chat nổi** - Kéo thả được, tự động dính vào cạnh  
✅ **Quick Actions** - 4 nút gợi ý nhanh  
✅ **Lịch sử hội thoại** - Lưu 10 tin nhắn gần nhất  
✅ **Loading indicator** - Hiển thị khi AI đang suy nghĩ  
✅ **Auto-scroll** - Tự động cuộn xuống tin nhắn mới  

## ⚙️ Tùy chỉnh màu sắc

### Thay đổi màu bubble (trong `ChatBotBubble.js`):

```javascript
// Dòng 113
backgroundColor: '#FF6B35', // Màu cam mặc định
// Thay bằng:
backgroundColor: '#4CAF50', // Màu xanh lá
// hoặc
backgroundColor: '#2196F3', // Màu xanh dương
```

### Thay đổi vị trí khởi tạo:

```javascript
// Dòng 15 trong ChatBotBubble.js
const pan = useRef(new Animated.ValueXY({ 
  x: SCREEN_WIDTH - 80,   // Bên phải
  y: SCREEN_HEIGHT - 200  // Gần đáy
})).current;

// Ví dụ: Đặt ở góc trái trên
x: 20,
y: 100
```

## 🐛 Xử lý lỗi thường gặp

### ❌ "Không thể kết nối với AI"

**Nguyên nhân**: API key chưa đúng  
**Giải pháp**: 
1. Kiểm tra lại key trong `groqService.js`
2. Đảm bảo key bắt đầu bằng `gsk_`
3. Thử tạo key mới từ Groq console

### ❌ Bubble không hiển thị

**Kiểm tra**:
1. File `HomeScreen.js` đã import `ChatBotBubble`?
2. Component `<ChatBotBubble />` đã được thêm?
3. Reload app: Nhấn `R` trong terminal

### ❌ "Module not found: axios"

**Giải pháp**:
```bash
npm install
# hoặc
npm install axios
```

## 📱 Demo Features

### 1. Học từ vựng
```
User: "Cho tôi 5 từ vựng về gia đình"
AI: Sẽ trả về danh sách từ tiếng Hàn với phiên âm và nghĩa
```

### 2. Giải thích ngữ pháp
```
User: "Giải thích cách dùng 이/가"
AI: Giải thích chi tiết với ví dụ
```

### 3. Phân tích câu
```
User: "Phân tích câu: 저는 학생입니다"
AI: 
- Phiên âm: jeoneun haksaeng-ibnida
- Nghĩa: Tôi là học sinh
- Phân tích từng từ
```

### 4. Luyện hội thoại
```
User: "Tạo hội thoại đặt đồ ăn ở nhà hàng"
AI: Tạo 5-10 câu hội thoại mẫu
```

## 🎓 Tips học hiệu quả

1. **Hỏi cụ thể**: "Giải thích -고 싶다" thay vì "Ngữ pháp"
2. **Yêu cầu ví dụ**: "Cho 3 ví dụ với từ..."
3. **Sửa câu**: Viết câu tiếng Hàn và nhờ AI kiểm tra
4. **Luyện từng chủ đề**: Hỏi từ vựng theo topic cụ thể

## 📞 Cần giúp đỡ?

**Tài liệu đầy đủ**: `docs/CHATBOT_README.md`

**Test API key trực tiếp**:
```bash
curl https://api.groq.com/openai/v1/chat/completions \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{...}'
```

**Groq Status**: https://status.groq.com/

---

**Chúc bạn học tốt! 화이팅! 🎉**
