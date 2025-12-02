# Hướng dẫn Tích hợp API Vocabulary

## 1. Cấu trúc Database (MySQL/XAMPP)

Bảng `vocabulary_theories` cần có các trường:

```sql
CREATE TABLE vocabulary_theories (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lesson_id INT NOT NULL,
  word VARCHAR(255) NOT NULL,
  pronunciation VARCHAR(255),
  meaning TEXT NOT NULL,
  example TEXT,
  example_meaning TEXT,
  image VARCHAR(500),  -- Link ảnh Cloudinary
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (lesson_id) REFERENCES lessons(id)
);
```

## 2. API Backend (Spring Boot)

### Controller: VocabularyTheoryController.java

```java
@RestController
@RequestMapping("/api/vocabulary-theories")
@CrossOrigin(origins = "*")
public class VocabularyTheoryController {
    
    @Autowired
    private VocabularyTheoryService vocabularyService;
    
    // Lấy danh sách từ vựng theo lessonId
    @GetMapping("/lesson/{lessonId}")
    public ResponseEntity<List<VocabularyTheoryDTO>> getVocabularyByLessonId(
            @PathVariable Long lessonId) {
        try {
            List<VocabularyTheoryDTO> vocabularies = vocabularyService.getByLessonId(lessonId);
            return ResponseEntity.ok(vocabularies);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Lấy chi tiết một từ vựng
    @GetMapping("/{id}")
    public ResponseEntity<VocabularyTheoryDTO> getVocabularyById(@PathVariable Long id) {
        try {
            VocabularyTheoryDTO vocabulary = vocabularyService.getById(id);
            return ResponseEntity.ok(vocabulary);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}
```

### DTO: VocabularyTheoryDTO.java

```java
@Data
@AllArgsConstructor
@NoArgsConstructor
public class VocabularyTheoryDTO {
    private Long id;
    private Long lessonId;
    private String word;
    private String pronunciation;
    private String meaning;
    private String example;
    private String exampleMeaning;
    private String image;  // Link Cloudinary
}
```

### Service: VocabularyTheoryService.java

```java
@Service
public class VocabularyTheoryService {
    
    @Autowired
    private VocabularyTheoryRepository vocabularyRepository;
    
    public List<VocabularyTheoryDTO> getByLessonId(Long lessonId) {
        List<VocabularyTheory> vocabularies = vocabularyRepository.findByLessonId(lessonId);
        return vocabularies.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }
    
    public VocabularyTheoryDTO getById(Long id) {
        VocabularyTheory vocabulary = vocabularyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vocabulary not found"));
        return convertToDTO(vocabulary);
    }
    
    private VocabularyTheoryDTO convertToDTO(VocabularyTheory entity) {
        VocabularyTheoryDTO dto = new VocabularyTheoryDTO();
        dto.setId(entity.getId());
        dto.setLessonId(entity.getLessonId());
        dto.setWord(entity.getWord());
        dto.setPronunciation(entity.getPronunciation());
        dto.setMeaning(entity.getMeaning());
        dto.setExample(entity.getExample());
        dto.setExampleMeaning(entity.getExampleMeaning());
        dto.setImage(entity.getImage());  // Link Cloudinary đã lưu trong DB
        return dto;
    }
}
```

### Repository: VocabularyTheoryRepository.java

```java
@Repository
public interface VocabularyTheoryRepository extends JpaRepository<VocabularyTheory, Long> {
    List<VocabularyTheory> findByLessonId(Long lessonId);
}
```

## 3. Dữ liệu mẫu (MySQL)

```sql
INSERT INTO vocabulary_theories (lesson_id, word, pronunciation, meaning, example, example_meaning, image) VALUES
(1, '깜빡하다', 'kkam-ppa-ka-da', '(động từ) quên mất', '약속을 깜빡했어요.', 'Tôi đã quên mất lời hẹn.', 'https://res.cloudinary.com/dfeefsbap/image/upload/v1234567890/vocab/sample1.jpg'),
(1, '감자기', 'gap-ja-gi', '(phó từ) đột ngột, bất thình lình, bỗng nhiên', '감자기 비가 왔어요.', 'Trời đột nhiên mưa.', 'https://res.cloudinary.com/dfeefsbap/image/upload/v1234567890/vocab/sample2.jpg'),
(1, '반복하다', 'ban-bo-ka-da', '(động từ) lặp lại', '같은 실수를 반복하다.', 'Lặp lại cùng một lỗi.', NULL);
```

## 4. Upload ảnh lên Cloudinary

### Cách 1: Upload trực tiếp từ web (khuyên dùng)

```javascript
// Trong React web app của bạn
const uploadImageToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', 'ktiger_unsigned');
  formData.append('cloud_name', 'dfeefsbap');
  
  try {
    const response = await axios.post(
      'https://api.cloudinary.com/v1_1/dfeefsbap/image/upload',
      formData
    );
    
    // Lưu response.data.secure_url vào database
    const imageUrl = response.data.secure_url;
    console.log('Image uploaded:', imageUrl);
    return imageUrl;
  } catch (error) {
    console.error('Upload failed:', error);
  }
};
```

### Cách 2: Upload từ Spring Boot backend

```java
// CloudinaryService.java
@Service
public class CloudinaryService {
    
    private final Cloudinary cloudinary;
    
    public CloudinaryService() {
        cloudinary = new Cloudinary(ObjectUtils.asMap(
            "cloud_name", "dfeefsbap",
            "api_key", "YOUR_API_KEY",
            "api_secret", "YOUR_API_SECRET"
        ));
    }
    
    public String uploadImage(MultipartFile file) {
        try {
            Map uploadResult = cloudinary.uploader().upload(file.getBytes(), 
                ObjectUtils.asMap("folder", "vocabulary"));
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }
}
```

## 5. Test API với Postman/Thunder Client

### GET: Lấy từ vựng theo lesson
```
GET http://localhost:8080/api/vocabulary-theories/lesson/1
```

Response mẫu:
```json
[
  {
    "id": 1,
    "lessonId": 1,
    "word": "깜빡하다",
    "pronunciation": "kkam-ppa-ka-da",
    "meaning": "(động từ) quên mất",
    "example": "약속을 깜빡했어요.",
    "exampleMeaning": "Tôi đã quên mất lời hẹn.",
    "image": "https://res.cloudinary.com/dfeefsbap/image/upload/v1234567890/vocab/sample1.jpg"
  }
]
```

## 6. React Native App đã tích hợp sẵn

Đã tạo các file:
- ✅ `src/services/vocabularyService.js` - Service gọi API
- ✅ `src/constants/config.js` - Thêm VOCABULARY endpoints
- ✅ `src/screens/learner/VocabularyTab.js` - UI hiển thị flashcard với ảnh Cloudinary

## 7. Sử dụng trong React Native

```javascript
// VocabularyTab.js đã tự động:
import vocabularyService from '../../services/vocabularyService';

// Gọi API
const data = await vocabularyService.getVocabularyByLessonId(lessonId);

// Hiển thị ảnh từ Cloudinary
<Image
  source={{ uri: vocab.image }}  // Link từ Cloudinary trong DB
  style={styles.vocabImage}
  resizeMode="cover"
/>
```

## 8. Checklist

- [ ] Tạo bảng `vocabulary_theories` trong MySQL
- [ ] Tạo Spring Boot API endpoints
- [ ] Upload ảnh lên Cloudinary, lưu link vào DB
- [ ] Chạy backend Spring Boot (port 8080)
- [ ] Test API với Postman
- [ ] Chạy React Native app và kiểm tra

## Lưu ý

1. **Ảnh Cloudinary**: Link có dạng `https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{public_id}.jpg`
2. **BASE_URL**: Đảm bảo `BASE_URL` trong `config.js` đúng với môi trường (10.0.2.2 cho Android emulator)
3. **CORS**: Backend cần enable CORS cho mobile app
4. **Fallback**: Nếu API lỗi, app sẽ hiển thị mock data
5. **Ảnh null**: Nếu không có ảnh, chỉ hiển thị text (đã xử lý trong code)
