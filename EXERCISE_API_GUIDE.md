# Hướng dẫn API Backend cho Exercise (Bài tập)

## 1. Cấu trúc Database

### Bảng `exercises`
```sql
CREATE TABLE exercises (
  exercise_id INT PRIMARY KEY AUTO_INCREMENT,
  lesson_id INT NOT NULL,
  exercise_type ENUM('multiple_choice', 'sentence_rewriting', 'mixed') DEFAULT 'mixed',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

### Bảng `multiple_choice_questions`
```sql
CREATE TABLE multiple_choice_questions (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  exercise_id INT NOT NULL,
  question_text TEXT NOT NULL,
  option_a VARCHAR(500),
  option_b VARCHAR(500),
  option_c VARCHAR(500),
  option_d VARCHAR(500),
  correct_answer CHAR(1) NOT NULL, -- 'A', 'B', 'C', 'D'
  link_media VARCHAR(500), -- Link audio/video từ Cloudinary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);
```

### Bảng `sentence_rewriting_questions`
```sql
CREATE TABLE sentence_rewriting_questions (
  question_id INT PRIMARY KEY AUTO_INCREMENT,
  exercise_id INT NOT NULL,
  original_sentence TEXT NOT NULL,
  rewritten_sentence TEXT NOT NULL,
  link_media VARCHAR(500), -- Link audio/video
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);
```

### Bảng `user_exercise_results`
```sql
CREATE TABLE user_exercise_results (
  result_id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  score INT NOT NULL, -- 0-100
  date_complete TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(exercise_id)
);
```

## 2. Spring Boot Backend

### Entity: Exercise.java
```java
@Entity
@Table(name = "exercises")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Exercise {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "exercise_id")
    private Long exerciseId;
    
    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "exercise_type")
    private ExerciseType exerciseType;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

enum ExerciseType {
    MULTIPLE_CHOICE,
    SENTENCE_REWRITING,
    MIXED
}
```

### Entity: MultipleChoiceQuestion.java
```java
@Entity
@Table(name = "multiple_choice_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MultipleChoiceQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;
    
    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;
    
    @Column(name = "question_text", columnDefinition = "TEXT")
    private String questionText;
    
    @Column(name = "option_a")
    private String optionA;
    
    @Column(name = "option_b")
    private String optionB;
    
    @Column(name = "option_c")
    private String optionC;
    
    @Column(name = "option_d")
    private String optionD;
    
    @Column(name = "correct_answer", length = 1)
    private String correctAnswer;
    
    @Column(name = "link_media")
    private String linkMedia;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### Entity: SentenceRewritingQuestion.java
```java
@Entity
@Table(name = "sentence_rewriting_questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SentenceRewritingQuestion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "question_id")
    private Long questionId;
    
    @Column(name = "exercise_id", nullable = false)
    private Long exerciseId;
    
    @Column(name = "original_sentence", columnDefinition = "TEXT")
    private String originalSentence;
    
    @Column(name = "rewritten_sentence", columnDefinition = "TEXT")
    private String rewrittenSentence;
    
    @Column(name = "link_media")
    private String linkMedia;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

### DTOs
```java
@Data
public class ExerciseDTO {
    private Long exerciseId;
    private Long lessonId;
    private String exerciseType;
}

@Data
public class MultipleChoiceQuestionDTO {
    private Long questionId;
    private Long exerciseId;
    private String questionText;
    private String optionA;
    private String optionB;
    private String optionC;
    private String optionD;
    private String correctAnswer;
    private String linkMedia;
}

@Data
public class SentenceRewritingQuestionDTO {
    private Long questionId;
    private Long exerciseId;
    private String originalSentence;
    private String rewrittenSentence;
    private String linkMedia;
}

@Data
public class UserExerciseResultDTO {
    private Long userId;
    private Long exerciseId;
    private Integer score;
    private String dateComplete;
}
```

### Controller: ExerciseController.java
```java
@RestController
@RequestMapping("/api/exercises")
@CrossOrigin(origins = "*")
public class ExerciseController {
    
    @Autowired
    private ExerciseService exerciseService;
    
    // Lấy danh sách exercises theo lessonId
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<ExerciseDTO>> getExercisesByLessonId(@PathVariable Long lessonId) {
        List<ExerciseDTO> exercises = exerciseService.getExercisesByLessonId(lessonId);
        return ResponseEntity.ok(exercises);
    }
}
```

### Controller: MultipleChoiceController.java
```java
@RestController
@RequestMapping("/api/mcq")
@CrossOrigin(origins = "*")
public class MultipleChoiceController {
    
    @Autowired
    private MultipleChoiceService mcqService;
    
    // Lấy câu hỏi trắc nghiệm theo exerciseId
    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<MultipleChoiceQuestionDTO>> getMCQByExerciseId(
            @PathVariable Long exerciseId) {
        List<MultipleChoiceQuestionDTO> questions = mcqService.getByExerciseId(exerciseId);
        return ResponseEntity.ok(questions);
    }
}
```

### Controller: SentenceRewritingController.java
```java
@RestController
@RequestMapping("/api/sentence-rewriting")
@CrossOrigin(origins = "*")
public class SentenceRewritingController {
    
    @Autowired
    private SentenceRewritingService sentenceService;
    
    // Lấy câu hỏi viết lại câu theo exerciseId
    @GetMapping("/exercise/{exerciseId}")
    public ResponseEntity<List<SentenceRewritingQuestionDTO>> getSentenceRewritingByExerciseId(
            @PathVariable Long exerciseId) {
        List<SentenceRewritingQuestionDTO> questions = sentenceService.getByExerciseId(exerciseId);
        return ResponseEntity.ok(questions);
    }
}
```

### Controller: UserExerciseResultController.java
```java
@RestController
@RequestMapping("/api/user-exercise-results")
@CrossOrigin(origins = "*")
public class UserExerciseResultController {
    
    @Autowired
    private UserExerciseResultService resultService;
    
    // Lưu kết quả bài tập
    @PostMapping
    public ResponseEntity<String> saveResult(@RequestBody UserExerciseResultDTO dto) {
        resultService.saveResult(dto);
        return ResponseEntity.ok("Result saved successfully");
    }
}
```

## 3. Dữ liệu mẫu

```sql
-- Insert exercises
INSERT INTO exercises (lesson_id, exercise_type) VALUES
(1, 'mixed'),
(2, 'mixed');

-- Insert multiple choice questions
INSERT INTO multiple_choice_questions 
(exercise_id, question_text, option_a, option_b, option_c, option_d, correct_answer, link_media) 
VALUES
(1, '빈칸에 들어갈 알맞은 말을 고르세요.\n_____ 공부해야 시험을 잘 볼 수 있어요.', 
 '열심히', '조용히', '빠르게', '천천히', 'A', NULL),

(1, '다음 문장의 의미로 맞는 것을 고르세요.\n친구가 깜빡하고 약속 시간을 잊어버렸어요.', 
 '친구가 일부러 안 왔어요', '친구가 잊어버렸어요', '친구가 바빴어요', '친구가 늦게 왔어요', 'B', 
 'https://res.cloudinary.com/dfeefsbap/audio/sample.mp3');

-- Insert sentence rewriting questions
INSERT INTO sentence_rewriting_questions 
(exercise_id, original_sentence, rewritten_sentence, link_media) 
VALUES
(1, '저는 한국어를 배우다.', '저는 한국어를 배워요.', NULL),
(1, '친구가 책을 읽다.', '친구가 책을 읽어요.', NULL);
```

## 4. Test API với Postman

### GET: Lấy exercises theo lesson
```
GET http://localhost:8080/api/exercises/lesson/1
```

### GET: Lấy MCQ theo exercise
```
GET http://localhost:8080/api/mcq/exercise/1
```

### GET: Lấy sentence rewriting theo exercise
```
GET http://localhost:8080/api/sentence-rewriting/exercise/1
```

### POST: Lưu kết quả
```
POST http://localhost:8080/api/user-exercise-results
Content-Type: application/json

{
  "userId": 3,
  "exerciseId": 1,
  "score": 85,
  "dateComplete": "2025-12-01T10:30:00"
}
```

## 5. Checklist

- [ ] Tạo các bảng trong MySQL
- [ ] Tạo Entities, DTOs, Repositories
- [ ] Implement Services và Controllers
- [ ] Insert dữ liệu mẫu
- [ ] Test API với Postman
- [ ] Tích hợp với React Native app
