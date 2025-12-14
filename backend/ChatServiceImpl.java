package org.example.ktigerstudybe.service.chat;

import org.example.ktigerstudybe.dto.req.CreateChatConversationRequest;
import org.example.ktigerstudybe.dto.req.SendChatMessageRequest;
import org.example.ktigerstudybe.dto.resp.ChatConversationResponse;
import org.example.ktigerstudybe.dto.resp.ChatMessageResponse;
import org.example.ktigerstudybe.dto.resp.ChatResponsePair;
import org.example.ktigerstudybe.model.ChatConversation;
import org.example.ktigerstudybe.model.ChatMessage;
import org.example.ktigerstudybe.model.User;
import org.example.ktigerstudybe.repository.ChatConversationRepository;
import org.example.ktigerstudybe.repository.ChatMessageRepository;
import org.example.ktigerstudybe.repository.UserRepository;
import org.example.ktigerstudybe.service.ai.GroqAIService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatConversationRepository conversationRepository;

    @Autowired
    private ChatMessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GroqAIService groqAIService;

    @Override
    public ChatConversationResponse createConversation(CreateChatConversationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("사용자를 찾을 수 없습니다: " + request.getUserId()));

        String title = getScenarioTitle(request.getScenario(), request.getDifficulty());

        ChatConversation conversation = new ChatConversation(user, title, request.getScenario(), request.getDifficulty());
        conversation = conversationRepository.save(conversation);

        return toConversationResponse(conversation);
    }

    @Override
    public ChatResponsePair sendMessage(Long conversationId, SendChatMessageRequest request) {
        ChatConversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new IllegalArgumentException("대화를 찾을 수 없습니다: " + conversationId));

        // 1) Lưu userMessage
        ChatMessage userMessage = new ChatMessage(conversation, request.getContent(), "user");
        userMessage = messageRepository.save(userMessage);

        // ⭐ NEW: Lấy conversation history (10 messages cuối, trừ message vừa lưu)
        List<ChatMessage> allMessages = messageRepository.findByConversation_ConversationIdOrderByTimestamp(conversationId);
        List<Map<String, String>> conversationHistory = new ArrayList<>();
        
        // Lấy 10 messages cuối (không bao gồm message vừa gửi)
        int startIndex = Math.max(0, allMessages.size() - 11); // -11 vì message cuối là user message vừa lưu
        for (int i = startIndex; i < allMessages.size() - 1; i++) {
            ChatMessage msg = allMessages.get(i);
            String role = msg.getMessageType().equals("user") ? "user" : "assistant";
            conversationHistory.add(Map.of("role", role, "content", msg.getContent()));
        }

        // 2) Gọi AI sinh phản hồi tiếng Hàn WITH conversation history
        String aiResponse = groqAIService.generateKoreanResponse(
                request.getContent(),
                conversation.getScenario(),
                conversation.getDifficulty(),
                conversationHistory  // ⭐ Pass history here
        );

        // 3) Dịch sang tiếng Việt
        String viTranslation = groqAIService.translateToVietnamese(aiResponse);

        // 4) Lưu AI message (tiếng Hàn)
        ChatMessage aiMessage = new ChatMessage(conversation, aiResponse, "ai");
        aiMessage = messageRepository.save(aiMessage);

        // 5) Tạo ChatResponsePair trả về
        ChatMessageResponse userResp = toMessageResponse(userMessage);
        ChatMessageResponse aiResp = toMessageResponse(aiMessage);
        aiResp.setTranslation(viTranslation); // Gắn bản dịch tiếng Việt

        return new ChatResponsePair(userResp, aiResp);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getConversationMessages(Long conversationId) {
        List<ChatMessage> messages = messageRepository.findByConversation_ConversationIdOrderByTimestamp(conversationId);
        return messages.stream()
                .map(this::toMessageResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatConversationResponse> getUserConversations(Long userId) {
        List<ChatConversation> conversations = conversationRepository.findByUser_UserIdOrderByCreatedAtDesc(userId);
        return conversations.stream()
                .map(this::toConversationResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteConversation(Long conversationId) {
        if (!conversationRepository.existsById(conversationId)) {
            throw new IllegalArgumentException("대화를 찾을 수 없습니다: " + conversationId);
        }
        conversationRepository.deleteById(conversationId);
    }

    // Helper methods
    private String getScenarioTitle(String scenario, String difficulty) {
        String scenarioTitle = switch (scenario) {
            case "restaurant" -> "식당에서 주문하기";
            case "shopping" -> "쇼핑하기";
            case "direction" -> "길 묻기";
            case "introduction" -> "인사 나누기";
            case "daily" -> "일상 대화";
            default -> "한국어 대화";
        };

        String difficultyLabel = switch (difficulty) {
            case "beginner" -> "초급";
            case "intermediate" -> "중급";
            case "advanced" -> "고급";
            default -> "";
        };

        return scenarioTitle + " (" + difficultyLabel + ")";
    }

    private ChatConversationResponse toConversationResponse(ChatConversation conversation) {
        int messageCount = conversationRepository.countMessagesByConversationId(conversation.getConversationId());

        return new ChatConversationResponse(
                conversation.getConversationId(),
                conversation.getUser().getUserId(),
                conversation.getTitle(),
                conversation.getScenario(),
                conversation.getDifficulty(),
                conversation.getCreatedAt(),
                messageCount
        );
    }

    private ChatMessageResponse toMessageResponse(ChatMessage message) {
        ChatMessageResponse resp = new ChatMessageResponse(
                message.getMessageId(),
                message.getConversation().getConversationId(),
                message.getContent(),
                message.getMessageType(),
                message.getTimestamp()
        );
        // Khởi tạo translation để tránh null
        resp.setTranslation(null);
        return resp;
    }
}
