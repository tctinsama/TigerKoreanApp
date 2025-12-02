# 🤖 AI ChatBot - Trợ lý học tiếng Hàn

## 📋 Tổng quan

ChatBot AI được tích hợp vào TigerKorean để giúp người dùng:
- Học từ vựng và ngữ pháp tiếng Hàn
- Luyện tập hội thoại
- Phân tích và sửa lỗi câu tiếng Hàn
- Nhận gợi ý bài tập cá nhân hóa

## 🚀 Cài đặt

### 1. Cài đặt dependencies

```bash
npm install axios
# hoặc
yarn add axios
```

### 2. Lấy Groq API Key

1. Truy cập: https://console.groq.com/
2. Đăng ký/Đăng nhập tài khoản
3. Vào phần "API Keys"
4. Tạo key mới
5. Copy API key

### 3. Cấu hình API Key

**Cách 1: Sửa trực tiếp trong file**

Mở file `src/services/groqService.js` và thay thế:

```javascript
const GROQ_API_KEY = 'YOUR_GROQ_API_KEY_HERE';
```

thành:

```javascript
const GROQ_API_KEY = 'gsk_...your_actual_key...';
```

**Cách 2: Sử dụng Environment Variables (Khuyến nghị)**

```bash
# Cài đặt react-native-dotenv
npm install react-native-dotenv

# Tạo file .env
cp .env.example .env

# Sửa file .env
GROQ_API_KEY=gsk_...your_actual_key...
```

## 📁 Cấu trúc Files

```
src/
├── services/
│   └── groqService.js          # Service gọi Groq API
├── screens/learner/
│   ├── ChatBotScreen.js        # Màn hình chat chính
│   └── HomeScreen.js           # Đã thêm ChatBot bubble
├── components/
│   └── ChatBotBubble.js        # Bong bóng chat nổi
└── navigation/
    └── PathStackNavigator.js   # Đã thêm ChatBot route
```

## 🎨 Tính năng

### 1. ChatBot Bubble (Bong bóng nổi)

- **Vị trí**: Xuất hiện trên HomeScreen
- **Tương tác**: 
  - Kéo thả để di chuyển
  - Tự động dính vào cạnh màn hình
  - Nhấn để mở chat
- **Animation**: Hiệu ứng pulse liên tục
- **Tooltip**: Hiển thị hướng dẫn 3 giây đầu

### 2. Chat Interface

**Quick Actions** (Gợi ý nhanh):
- 📚 Học từ vựng
- ❓ Hỏi ngữ pháp
- ✏️ Sửa câu
- 💡 Luyện tập

**Features**:
- Lịch sử hội thoại (10 tin nhắn gần nhất)
- Typing indicator khi AI đang trả lời
- Auto-scroll đến tin nhắn mới
- Timestamp cho mỗi tin nhắn

### 3. GroqService Functions

```javascript
// Gửi tin nhắn thông thường
await groqService.sendMessage("안녕하세요 nghĩa là gì?");

// Phân tích câu tiếng Hàn
await groqService.analyzeSentence("저는 학생입니다");

// Tạo bài tập theo chủ đề
await groqService.generatePractice("shopping", "beginner");

// Sửa lỗi câu
await groqService.correctSentence("저는 한국어를 공부합니다");

// Lấy từ vựng theo chủ đề
await groqService.getVocabulary("food", 10);
```

## 🎯 Cách sử dụng

### Mở ChatBot

**Từ HomeScreen**:
```javascript
// Nhấn vào bong bóng nổi
<ChatBotBubble onPress={() => navigation.navigate('ChatBot')} />
```

**Từ bất kỳ screen nào trong PathTab**:
```javascript
navigation.navigate('ChatBot');
```

### Gửi tin nhắn

1. Nhập tin nhắn vào ô input
2. Nhấn nút gửi (✈️)
3. Chờ AI phản hồi

### Sử dụng Quick Actions

Nhấn vào các nút gợi ý để tự động điền prompt phổ biến.

## 🔧 Tùy chỉnh

### Thay đổi AI Model

Trong `groqService.js`:

```javascript
this.model = 'mixtral-8x7b-32768'; // Mặc định
// Hoặc
this.model = 'llama2-70b-4096';    // Nhanh hơn
```

### Tùy chỉnh System Prompt

```javascript
{
  role: 'system',
  content: `Your custom prompt here...`
}
```

### Thay đổi màu sắc bubble

Trong `ChatBotBubble.js`:

```javascript
backgroundColor: COLORS.primary, // Thay đổi màu chính
backgroundColor: COLORS.accent,  // Thay đổi màu badge
```

### Điều chỉnh vị trí khởi tạo

```javascript
const pan = useRef(new Animated.ValueXY({ 
  x: SCREEN_WIDTH - 80,  // Vị trí X
  y: SCREEN_HEIGHT - 200 // Vị trí Y
})).current;
```

## 📊 Models Groq

| Model | Tokens | Tốc độ | Khuyến nghị |
|-------|--------|--------|-------------|
| mixtral-8x7b-32768 | 32K | Trung bình | ✅ Tốt nhất cho Việt-Hàn |
| llama2-70b-4096 | 4K | Nhanh | Hội thoại ngắn |
| gemma-7b-it | 8K | Nhanh | Câu hỏi đơn giản |

## 🐛 Troubleshooting

### Lỗi: "Không thể kết nối với AI"

**Nguyên nhân**:
- API key không đúng
- Hết quota miễn phí
- Lỗi mạng

**Giải pháp**:
```javascript
// Kiểm tra API key
console.log('API Key:', GROQ_API_KEY.substring(0, 10) + '...');

// Kiểm tra response
console.log('Error:', error.response?.data);
```

### Bubble không hiển thị

**Kiểm tra**:
1. Import đúng component
2. Component ở đúng vị trí (trong View container)
3. zIndex đủ cao

### Tin nhắn không gửi được

**Kiểm tra**:
1. Input không rỗng
2. isLoading = false
3. API key hợp lệ

## 🔐 Bảo mật

⚠️ **QUAN TRỌNG**:

1. **KHÔNG commit API key** lên Git
2. Thêm `.env` vào `.gitignore`
3. Sử dụng environment variables cho production
4. Giới hạn rate limiting nếu cần

```gitignore
# .gitignore
.env
.env.local
```

## 📈 Giới hạn API

**Groq Free Tier**:
- 14,400 requests/day
- ~6,000 requests/hour
- Rate limit: 30 RPM

**Tips tiết kiệm**:
- Cache kết quả thường dùng
- Limit conversation history (10 tin nhắn)
- Sử dụng model nhỏ hơn cho task đơn giản

## 🚀 Nâng cao

### Thêm Speech-to-Text

```bash
npm install expo-speech
```

```javascript
import * as Speech from 'expo-speech';

const speakResponse = (text) => {
  Speech.speak(text, { language: 'ko-KR' });
};
```

### Lưu lịch sử chat

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Lưu
await AsyncStorage.setItem('chatHistory', JSON.stringify(messages));

// Đọc
const history = await AsyncStorage.getItem('chatHistory');
```

### Thêm typing animation

```javascript
const [isTyping, setIsTyping] = useState(false);

// Hiển thị "AI đang nhập..."
{isTyping && <TypingIndicator />}
```

## 📝 TODO

- [ ] Voice input/output
- [ ] Lưu lịch sử chat persistent
- [ ] Chế độ học từ vựng tương tác
- [ ] Flash cards tự động từ hội thoại
- [ ] Đánh giá phát âm
- [ ] Multi-language UI
- [ ] Dark mode
- [ ] Share chat transcript

## 📞 Support

Nếu gặp vấn đề:
1. Check console logs
2. Verify API key
3. Test với Postman/curl
4. Check Groq status: https://status.groq.com/

## 📄 License

MIT License - TigerKorean 2024
