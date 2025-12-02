# Hướng dẫn Backend: Cơ chế mở khóa bài học

## 1. Cập nhật Entity Lesson

```java
@Entity
@Table(name = "lessons")
@Data
public class Lesson {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lesson_id")
    private Long lessonId;
    
    @Column(name = "level_id")
    private Long levelId;
    
    @Column(name = "lesson_name")
    private String lessonName;
    
    @Column(name = "lesson_description")
    private String lessonDescription;
    
    @Column(name = "lesson_order") // Thứ tự bài học
    private Integer lessonOrder;
    
    @Column(name = "is_locked")
    private Boolean isLocked = true; // Mặc định là khóa
}
```

## 2. Entity: UserLessonProgress

```java
@Entity
@Table(name = "user_lesson_progress")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserLessonProgress {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId;
    
    @Column(name = "lesson_id", nullable = false)
    private Long lessonId;
    
    @Column(name = "is_completed")
    private Boolean isCompleted = false;
    
    @Column(name = "score")
    private Integer score;
    
    @Column(name = "completed_at")
    private LocalDateTime completedAt;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}
```

## 3. Service: UserExerciseResultService.java

```java
@Service
public class UserExerciseResultService {
    
    @Autowired
    private UserExerciseResultRepository resultRepository;
    
    @Autowired
    private UserLessonProgressRepository progressRepository;
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Transactional
    public void saveResult(UserExerciseResultDTO dto) {
        // 1. Lưu kết quả exercise
        UserExerciseResult result = new UserExerciseResult();
        result.setUserId(dto.getUserId());
        result.setExerciseId(dto.getExerciseId());
        result.setScore(dto.getScore());
        result.setDateComplete(LocalDateTime.parse(dto.getDateComplete()));
        resultRepository.save(result);
        
        // 2. Lấy lessonId từ exerciseId
        Exercise exercise = exerciseRepository.findById(dto.getExerciseId())
            .orElseThrow(() -> new RuntimeException("Exercise not found"));
        Long lessonId = exercise.getLessonId();
        
        // 3. Kiểm tra tất cả exercises của lesson đã hoàn thành chưa
        List<Exercise> allExercises = exerciseRepository.findByLessonId(lessonId);
        boolean allCompleted = true;
        for (Exercise ex : allExercises) {
            boolean hasResult = resultRepository.existsByUserIdAndExerciseId(
                dto.getUserId(), ex.getExerciseId()
            );
            if (!hasResult) {
                allCompleted = false;
                break;
            }
        }
        
        // 4. Nếu tất cả exercises hoàn thành → đánh dấu lesson hoàn thành
        if (allCompleted) {
            UserLessonProgress progress = progressRepository
                .findByUserIdAndLessonId(dto.getUserId(), lessonId)
                .orElse(new UserLessonProgress());
            
            progress.setUserId(dto.getUserId());
            progress.setLessonId(lessonId);
            progress.setIsCompleted(true);
            progress.setScore(dto.getScore());
            progress.setCompletedAt(LocalDateTime.now());
            progressRepository.save(progress);
            
            // 5. ⭐ MỞ KHÓA BÀI TIẾP THEO
            unlockNextLesson(dto.getUserId(), lessonId);
        }
    }
    
    private void unlockNextLesson(Long userId, Long currentLessonId) {
        // Lấy thông tin bài hiện tại
        Lesson currentLesson = lessonRepository.findById(currentLessonId)
            .orElseThrow(() -> new RuntimeException("Lesson not found"));
        
        Long levelId = currentLesson.getLevelId();
        Integer currentOrder = currentLesson.getLessonOrder();
        
        // Tìm bài tiếp theo trong cùng level
        Lesson nextLesson = lessonRepository
            .findByLevelIdAndLessonOrder(levelId, currentOrder + 1)
            .orElse(null);
        
        if (nextLesson != null) {
            // Tạo progress cho bài tiếp theo (unlocked nhưng chưa complete)
            UserLessonProgress nextProgress = progressRepository
                .findByUserIdAndLessonId(userId, nextLesson.getLessonId())
                .orElse(new UserLessonProgress());
            
            nextProgress.setUserId(userId);
            nextProgress.setLessonId(nextLesson.getLessonId());
            nextProgress.setIsCompleted(false);
            nextProgress.setCreatedAt(LocalDateTime.now());
            progressRepository.save(nextProgress);
        }
    }
}
```

## 4. Service: LessonService.java (GET Learning Path)

```java
@Service
public class LessonService {
    
    @Autowired
    private LessonRepository lessonRepository;
    
    @Autowired
    private UserLessonProgressRepository progressRepository;
    
    public List<LessonWithProgressDTO> getLessonsByLevelIdWithProgress(Long levelId, Long userId) {
        List<Lesson> lessons = lessonRepository.findByLevelIdOrderByLessonOrder(levelId);
        List<LessonWithProgressDTO> result = new ArrayList<>();
        
        boolean previousCompleted = true; // Bài đầu tiên luôn mở
        
        for (int i = 0; i < lessons.size(); i++) {
            Lesson lesson = lessons.get(i);
            
            // Lấy progress của user cho bài này
            UserLessonProgress progress = progressRepository
                .findByUserIdAndLessonId(userId, lesson.getLessonId())
                .orElse(null);
            
            LessonWithProgressDTO dto = new LessonWithProgressDTO();
            dto.setLessonId(lesson.getLessonId());
            dto.setLessonName(lesson.getLessonName());
            dto.setLessonDescription(lesson.getLessonDescription());
            dto.setLessonOrder(lesson.getLessonOrder());
            
            // ⭐ LOGIC MỞ KHÓA
            if (i == 0) {
                // Bài đầu tiên luôn mở
                dto.setIsLocked(false);
            } else {
                // Bài tiếp theo chỉ mở nếu bài trước đã hoàn thành
                dto.setIsLocked(!previousCompleted);
            }
            
            // Trạng thái hoàn thành
            dto.setIsLessonCompleted(progress != null && progress.getIsCompleted());
            dto.setScore(progress != null ? progress.getScore() : null);
            
            // Cập nhật trạng thái cho vòng lặp tiếp theo
            previousCompleted = dto.getIsLessonCompleted();
            
            result.add(dto);
        }
        
        return result;
    }
}
```

## 5. DTO: LessonWithProgressDTO.java

```java
@Data
public class LessonWithProgressDTO {
    private Long lessonId;
    private String lessonName;
    private String lessonDescription;
    private Integer lessonOrder;
    private Boolean isLocked;          // ⭐ Có khóa không
    private Boolean isLessonCompleted; // ⭐ Đã hoàn thành chưa
    private Integer score;
}
```

## 6. Controller: LessonController.java

```java
@RestController
@RequestMapping("/api/lessons")
@CrossOrigin(origins = "*")
public class LessonController {
    
    @Autowired
    private LessonService lessonService;
    
    // API lấy danh sách lessons với trạng thái khóa/mở
    @GetMapping("/level/{levelId}/progress")
    public ResponseEntity<List<LessonWithProgressDTO>> getLessonsWithProgress(
            @PathVariable Long levelId,
            @RequestParam Long userId) {
        List<LessonWithProgressDTO> lessons = lessonService
            .getLessonsByLevelIdWithProgress(levelId, userId);
        return ResponseEntity.ok(lessons);
    }
}
```

## 7. Database Schema

```sql
-- Bảng lessons
CREATE TABLE lessons (
  lesson_id INT PRIMARY KEY AUTO_INCREMENT,
  level_id INT NOT NULL,
  lesson_name VARCHAR(255) NOT NULL,
  lesson_description TEXT,
  lesson_order INT NOT NULL, -- Thứ tự bài học
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (level_id) REFERENCES levels(id)
);

-- Bảng user_lesson_progress
CREATE TABLE user_lesson_progress (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  lesson_id INT NOT NULL,
  is_completed BOOLEAN DEFAULT FALSE,
  score INT,
  completed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (lesson_id) REFERENCES lessons(lesson_id),
  UNIQUE KEY unique_user_lesson (user_id, lesson_id)
);

-- Insert dữ liệu mẫu (Level 1 có 5 bài)
INSERT INTO lessons (level_id, lesson_name, lesson_description, lesson_order) VALUES
(1, 'Bài 1: Chào hỏi', 'Học cách chào hỏi cơ bản', 1),
(1, 'Bài 2: Giới thiệu bản thân', 'Giới thiệu tên, tuổi', 2),
(1, 'Bài 3: Gia đình', 'Từ vựng về gia đình', 3),
(1, 'Bài 4: Trường học', 'Từ vựng về trường học', 4),
(1, 'Bài 5: Sở thích', 'Nói về sở thích', 5);

-- User đầu tiên mở khóa bài 1
INSERT INTO user_lesson_progress (user_id, lesson_id, is_completed, created_at) VALUES
(3, 1, FALSE, NOW());
```

## 8. Repositories

```java
@Repository
public interface UserLessonProgressRepository extends JpaRepository<UserLessonProgress, Long> {
    Optional<UserLessonProgress> findByUserIdAndLessonId(Long userId, Long lessonId);
    List<UserLessonProgress> findByUserId(Long userId);
}

@Repository
public interface LessonRepository extends JpaRepository<Lesson, Long> {
    List<Lesson> findByLevelIdOrderByLessonOrder(Long levelId);
    Optional<Lesson> findByLevelIdAndLessonOrder(Long levelId, Integer lessonOrder);
}

@Repository
public interface UserExerciseResultRepository extends JpaRepository<UserExerciseResult, Long> {
    boolean existsByUserIdAndExerciseId(Long userId, Long exerciseId);
}
```

## ✅ Tóm tắt Flow:

1. User làm xong exercise → gọi `POST /api/user-exercise-results`
2. Backend:
   - Lưu kết quả exercise
   - Kiểm tra tất cả exercises của lesson đã xong chưa
   - Nếu xong → đánh dấu lesson completed
   - **Tự động mở khóa bài tiếp theo** bằng cách tạo `user_lesson_progress`
3. Frontend reload → gọi `GET /api/lessons/level/1/progress?userId=3`
4. Backend trả về danh sách với `isLocked` và `isLessonCompleted`
5. Frontend chỉ render theo trạng thái từ API

---

# React Native Implementation

## 1. Service đã sẵn sàng

File: `src/services/lessonService.js`

```javascript
getLessonsByLevelIdWithProgress: async (levelId, userId) => {
  const res = await apiClient.get(`/lessons/level/${levelId}/progress`, {
    params: { userId }
  });
  return res.data;
}
```

## 2. LessonPathScreen xử lý logic

File: `src/screens/learner/LessonPathScreen.js`

```javascript
// Transform API response
const transformedLessons = lessonsData.map((lesson, index) => ({
  id: lesson.lessonId,
  title: lesson.lessonName,
  description: lesson.lessonDescription || '',
  status: lesson.isLocked ? 'locked' : (lesson.isLessonCompleted ? 'completed' : 'available'),
  type: 'lesson',
  stars: lesson.stars || 0,
}));

// Xử lý khi click vào bài khóa
const handleLessonPress = (lesson) => {
  if (lesson.status === 'locked') {
    Alert.alert('Bài học bị khóa', 'Hoàn thành bài học trước để mở khóa bài này');
    return;
  }
  // ... mở modal
};
```

## 3. LessonNode Component hiển thị

File: `src/components/LessonNode.js`

- Đã có logic hiển thị 3 trạng thái: `locked`, `completed`, `available`
- Icon khóa 🔒 cho bài bị khóa
- Checkmark ✓ cho bài đã hoàn thành
- Progress ring cho bài đang học

## 4. ExerciseTab lưu kết quả

File: `src/screens/learner/ExerciseTab.js`

```javascript
// Khi hoàn thành tất cả exercises
await exerciseService.saveUserExerciseResult({
  userId,
  exerciseId: eid,
  score: exerciseScore,
  dateComplete: new Date().toISOString(),
});

// Complete lesson (backend sẽ tự động unlock bài tiếp theo)
await lessonService.completeLesson(userId, lessonId, lessonScore);
```

## 5. Reload để cập nhật UI

Sau khi complete lesson, bạn có thể:

**Option 1: Navigate back và reload**
```javascript
// Trong ExerciseTab sau khi complete
navigation.goBack(); // Về LessonPath
// LessonPath sẽ tự reload khi focus lại
```

**Option 2: Thêm refresh listener**
```javascript
// Trong LessonPathScreen
useEffect(() => {
  const unsubscribe = navigation.addListener('focus', () => {
    loadData(); // Reload khi màn hình được focus
  });
  return unsubscribe;
}, [navigation]);
```

**Option 3: Dùng Event Emitter**
```javascript
// Trong ExerciseTab sau complete
import { DeviceEventEmitter } from 'react-native';
DeviceEventEmitter.emit('lessonCompleted', { lessonId });

// Trong LessonPathScreen
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener('lessonCompleted', () => {
    loadData(); // Reload data
  });
  return () => subscription.remove();
}, []);
```

---

## 🔑 Điểm quan trọng:

- Bài đầu tiên (order = 1) **luôn mở**
- Bài tiếp theo chỉ mở khi bài trước **đã hoàn thành**
- Backend **tự động** mở khóa, frontend **không tự ý** thay đổi
- Dùng `lesson_order` để xác định thứ tự bài học
- React Native chỉ cần gọi API và render theo `isLocked`, `isLessonCompleted`

## 📱 UI Mapping:

| Backend Response | React Native Status | Icon | Có thể click |
|-----------------|---------------------|------|--------------|
| `isLocked: true` | `'locked'` | 🔒 Lock | ❌ Không |
| `isLocked: false, isLessonCompleted: false` | `'available'` | Số thứ tự | ✅ Có |
| `isLocked: false, isLessonCompleted: true` | `'completed'` | ✓ Checkmark | ✅ Có (review) |

## ✅ Checklist Implementation:

### Backend:
- [ ] Tạo bảng `user_lesson_progress`
- [ ] Implement `UserExerciseResultService.saveResult()` với logic unlock
- [ ] Implement `LessonService.getLessonsByLevelIdWithProgress()`
- [ ] API endpoint: `GET /api/lessons/level/{levelId}/progress?userId={userId}`
- [ ] Test với Postman

### Frontend (React Native):
- [x] Service `lessonService.getLessonsByLevelIdWithProgress()` ✅
- [x] `LessonPathScreen` transform data với `isLocked` ✅
- [x] `LessonNode` hiển thị 3 trạng thái ✅
- [x] `ExerciseTab` save result và complete lesson ✅
- [ ] Thêm reload mechanism sau complete
- [ ] Test flow: Làm bài → Complete → Reload → Bài tiếp mở khóa

---

**Kết luận:** React Native app đã sẵn sàng! Chỉ cần backend implement đúng API theo hướng dẫn trên là sẽ hoạt động ngay. Frontend không cần thay đổi logic, chỉ render theo data từ API.
