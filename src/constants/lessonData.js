// Cấu trúc 6 cấp độ học tiếng Hàn
export const LEVELS = [
  {
    id: 1,
    name: 'Cấp độ 1',
    level: 'Sơ cấp',
    color: '#10B981',
    icon: '🌱',
    description: 'Bảng chữ cái Hangeul, từ vựng cơ bản',
  },
  {
    id: 2,
    name: 'Cấp độ 2',
    level: 'Sơ cấp nâng cao',
    color: '#3B82F6',
    icon: '📚',
    description: 'Ngữ pháp cơ bản, số đếm, thời gian',
  },
  {
    id: 3,
    name: 'Cấp độ 3',
    level: 'Trung cấp',
    color: '#F59E0B',
    icon: '🗣️',
    description: 'Giao tiếp hằng ngày, mua sắm',
  },
  {
    id: 4,
    name: 'Cấp độ 4',
    level: 'Trung cấp nâng cao',
    color: '#8B5CF6',
    icon: '💭',
    description: 'Diễn tả cảm xúc, kể chuyện',
  },
  {
    id: 5,
    name: 'Cấp độ 5',
    level: 'Trung cao cấp',
    color: '#EF4444',
    icon: '🎯',
    description: 'Thảo luận chủ đề phức tạp',
  },
  {
    id: 6,
    name: 'Cấp độ 6',
    level: 'Cao cấp',
    color: '#6366F1',
    icon: '🏆',
    description: 'Ngữ pháp nâng cao, giao tiếp thành thạo',
  },
];

// Dữ liệu bài học cho Cấp 1 (15 bài)
export const LEVEL_1_LESSONS = [
  {
    id: 1,
    title: 'Tâm trạng',
    icon: '😊',
    type: 'lesson',
    status: 'completed',
    progress: 100,
    position: { top: 100, left: '50%' },
  },
  {
    id: 2,
    title: 'Bảng chữ cái Hangeul',
    icon: '🔤',
    type: 'lesson',
    status: 'completed',
    progress: 100,
    position: { top: 200, left: '20%' },
  },
  {
    id: 3,
    title: 'Chào hỏi',
    icon: '👋',
    type: 'lesson',
    status: 'current',
    progress: 60,
    position: { top: 300, left: '60%' },
  },
  {
    id: 4,
    title: 'Giới thiệu bản thân',
    icon: '👤',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 400, left: '30%' },
  },
  {
    id: 5,
    title: 'Gia đình',
    icon: '👨‍👩‍👧‍👦',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 500, left: '65%' },
  },
  {
    id: 6,
    title: 'Số đếm',
    icon: '🔢',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 600, left: '25%' },
  },
  {
    id: 7,
    title: 'Màu sắc',
    icon: '🎨',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 700, left: '55%' },
  },
  {
    id: 8,
    title: 'Đồ ăn & Đồ uống',
    icon: '🍜',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 800, left: '35%' },
  },
  {
    id: 9,
    title: 'Kiểm tra',
    icon: '📝',
    type: 'test',
    status: 'locked',
    progress: 0,
    position: { top: 900, left: '50%' },
  },
  {
    id: 10,
    title: 'Quần áo',
    icon: '👕',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 1000, left: '30%' },
  },
  {
    id: 11,
    title: 'Thời gian',
    icon: '⏰',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 1100, left: '60%' },
  },
  {
    id: 12,
    title: 'Địa điểm',
    icon: '🏠',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 1200, left: '25%' },
  },
  {
    id: 13,
    title: 'Động vật',
    icon: '🐶',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 1300, left: '55%' },
  },
  {
    id: 14,
    title: 'Thời tiết',
    icon: '☀️',
    type: 'lesson',
    status: 'locked',
    progress: 0,
    position: { top: 1400, left: '40%' },
  },
  {
    id: 15,
    title: 'Tổng kết cấp 1',
    icon: '🎓',
    type: 'test',
    status: 'locked',
    progress: 0,
    position: { top: 1500, left: '50%' },
  },
];

// Dữ liệu mẫu cho các cấp khác (có thể mở rộng)
export const LESSONS_BY_LEVEL = {
  1: LEVEL_1_LESSONS,
  2: [], // Sẽ thêm sau
  3: [],
  4: [],
  5: [],
  6: [],
};

// Lấy lessons theo level
export const getLessonsByLevel = (levelId) => {
  return LESSONS_BY_LEVEL[levelId] || [];
};

// Lấy thông tin level
export const getLevelInfo = (levelId) => {
  return LEVELS.find((level) => level.id === levelId);
};
