// src/services/examService.js
import apiClient from './api';

class ExamService {
  // Lấy danh sách đề thi đang mở
  async getActiveExams() {
    try {
      const response = await apiClient.get('/exams/active');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy chi tiết đề thi
  async getExamById(examId) {
    try {
      const response = await apiClient.get(`/exams/${examId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy danh sách sections của đề thi
  async getSectionsByExam(examId) {
    try {
      const response = await apiClient.get(`/exam-sections/exam/${examId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy lịch sử làm bài của user
  async getAttemptsByUser(userId) {
    try {
      const response = await apiClient.get(`/exam-attempts/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Tạo attempt mới (Start exam)
  async startExam(examId, userId) {
    try {
      const response = await apiClient.post('/exam-attempts/start', {
        examId: examId,
        userId: userId,
      });
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy attempt đang làm dở
  async getAttemptById(attemptId) {
    try {
      const response = await apiClient.get(`/exam-attempts/${attemptId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy kết quả bài thi
  async getExamResult(attemptId) {
    try {
      const response = await apiClient.get(`/exam-attempts/${attemptId}/result`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy câu hỏi theo section
  async getQuestionsBySection(sectionId) {
    try {
      const response = await apiClient.get(`/questions/section/${sectionId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lấy câu trả lời đã lưu
  async getAnswersByAttempt(attemptId) {
    try {
      const response = await apiClient.get(`/user-answers/attempt/${attemptId}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Lưu câu trả lời
  async saveUserAnswer(data) {
    try {
      const response = await apiClient.post('/user-answers', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  // Submit exam
  async submitExam(attemptId) {
    try {
      const response = await apiClient.post(`/exam-attempts/${attemptId}/submit`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default new ExamService();
