# 🔧 Cập nhật Conversation Context cho ChatServiceImpl

## ⚠️ Vấn đề hiện tại
AI không nhớ context của cuộc hội thoại vì chỉ gửi 1 message mới mỗi lần, không gửi lịch sử chat.

## ✅ Giải pháp
Cập nhật `ChatServiceImpl.java` để gửi conversation history cho GroqAIService.

---

## 📝 Cập nhật ChatServiceImpl.java

### Bước 1: Tìm method `sendMessage()` trong ChatServiceImpl.java

Vị trí: `src/main/java/org/example/ktigerstudybe/service/chat/ChatServiceImpl.java`

### Bước 2: Thêm code lấy conversation history

**Tìm đoạn code hiện tại:**
```java
@Override
@Transactional
public ChatResponsePair sendMessage(Long conversationId, String content) {
    ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

    // Save user message
    ChatMessage userMessage = new ChatMessage();
    userMessage.setConversation(conversation);
    userMessage.setContent(content);
    userMessage.setMessageType(ChatMessage.MessageType.USER);
    userMessage.setTimestamp(LocalDateTime.now());
    messageRepository.save(userMessage);

    // Generate AI response
    String aiResponseKorean = groqAIService.generateKoreanResponse(
            content,
            conversation.getScenario(),
            conversation.getDifficulty()
    );
    
    // ... rest of code
}
```

**Thay thế bằng:**
```java
@Override
@Transactional
public ChatResponsePair sendMessage(Long conversationId, String content) {
    ChatConversation conversation = conversationRepository.findById(conversationId)
            .orElseThrow(() -> new RuntimeException("Conversation not found"));

    // Save user message
    ChatMessage userMessage = new ChatMessage();
    userMessage.setConversation(conversation);
    userMessage.setContent(content);
    userMessage.setMessageType(ChatMessage.MessageType.USER);
    userMessage.setTimestamp(LocalDateTime.now());
    messageRepository.save(userMessage);

    // ⭐ NEW: Get conversation history (last 10 messages)
    List<ChatMessage> history = messageRepository.findByConversationOrderByTimestampAsc(conversation);
    List<Map<String, String>> conversationHistory = new ArrayList<>();
    
    // Convert to format for Groq API (skip last message as it's current user message)
    int startIndex = Math.max(0, history.size() - 11); // -11 because we skip the last one
    for (int i = startIndex; i < history.size() - 1; i++) {
        ChatMessage msg = history.get(i);
        String role = msg.getMessageType() == ChatMessage.MessageType.USER ? "user" : "assistant";
        conversationHistory.add(Map.of("role", role, "content", msg.getContent()));
    }

    // Generate AI response WITH conversation history
    String aiResponseKorean = groqAIService.generateKoreanResponse(
            content,
            conversation.getScenario(),
            conversation.getDifficulty(),
            conversationHistory  // ⭐ Pass history here
    );
    
    // ... rest of code remains the same
}
```

### Bước 3: Thêm import cần thiết

Thêm vào đầu file `ChatServiceImpl.java`:
```java
import java.util.ArrayList;
import java.util.Map;
```

---

## 🎯 Kết quả mong đợi

### Trước (Không có context):
```
User: "김치찌개 얼마예요?"
AI: "8,000원이에요!"

User: "좋아요 주문할게요"
AI: "안녕하세요! 메뉴 추천해 드릴까요?" ❌ (Không nhớ câu trước)
```

### Sau (Có context):
```
User: "김치찌개 얼마예요?"
AI: "8,000원이에요! 매운 거 괜찮으세요? 😊"

User: "네 괜찮아요"
AI: "좋아요! 김치찌개 하나 주문해 드릴게요. 음료는 뭐로 하시겠어요?" ✅ (Nhớ context)

User: "물 주세요"
AI: "네, 물 가져다 드릴게요. 김치찌개는 5분 정도면 나올 거예요!" ✅ (Nhớ đã đặt món)
```

---

## 🧪 Testing

Sau khi update:

1. **Restart Spring Boot backend**
2. **Test conversation flow:**
   - Start new conversation
   - Send 3-4 messages liên tiếp
   - Check AI responses có reference câu trước không

3. **Check logs:**
   ```
   Calling Groq API with model: llama-3.1-8b-instant (history size: 4)
   Added 4 messages from history
   ```

---

## 📌 Notes

- History giới hạn 10 messages cuối để tiết kiệm tokens
- Mỗi message = ~50 tokens → 10 messages = ~500 tokens
- Total request: system prompt (~300) + history (~500) + new message (~50) = ~850 tokens
- Response: ~120 tokens
- **Total: ~1000 tokens/request** (rất hợp lý cho llama-3.1-8b-instant)

---

## ✅ Checklist

- [ ] Update ChatServiceImpl.java với conversation history
- [ ] Add imports (ArrayList, Map)
- [ ] Restart Spring Boot backend
- [ ] Test conversation flow
- [ ] Verify logs show history size
- [ ] Confirm AI remembers context

---

Sau khi hoàn thành, AI sẽ có khả năng nhớ và tham chiếu đến các câu nói trước đó trong cuộc hội thoại! 🎉
