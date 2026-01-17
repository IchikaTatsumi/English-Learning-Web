-- ======================================
--  ENGLISH LEARNING DATABASE INIT SCRIPT (Quiz Management UI Compatible)
-- ======================================
BEGIN;

-- ============================
-- 1. ENUM TYPES
-- ============================
DO $$ BEGIN
  CREATE TYPE role_enum AS ENUM ('Admin', 'User');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  -- Giữ nguyên Enum để code không lỗi, nhưng data chỉ dùng 3 loại đầu
  CREATE TYPE question_type_enum AS ENUM (
    'WordToMeaning',     -- Từ -> Nghĩa
    'MeaningToWord',     -- Nghĩa -> Từ
    'VietnameseToWord',  -- Việt -> Anh
    'SentenceToWord',    -- Điền từ (Có thể dùng dạng trắc nghiệm)
    'SpeechToWord',      -- (Dành cho tính năng Practice Pronounce)
    'Pronunciation'      -- (Dành cho tính năng Practice Pronounce)
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE quiz_mode_enum AS ENUM ('Beginner Only', 'Intermediate Only', 'Advanced Only', 'Mixed Levels');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================
-- 2. DROP TABLES
-- ============================
DROP TABLE IF EXISTS vocabulary_progress CASCADE;
DROP TABLE IF EXISTS result CASCADE;
DROP TABLE IF EXISTS progress CASCADE;
DROP TABLE IF EXISTS quiz CASCADE;
DROP TABLE IF EXISTS quiz_question CASCADE;
DROP TABLE IF EXISTS vocabulary CASCADE;
DROP TABLE IF EXISTS topic CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;

-- ============================
-- 3. TABLE DEFINITIONS
-- ============================

CREATE TABLE "user" (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  role role_enum NOT NULL DEFAULT 'User',
  avatar_url VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE topic (
  topic_id SERIAL PRIMARY KEY,
  topic_name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vocabulary (
  vocab_id SERIAL PRIMARY KEY,
  topic_id INTEGER REFERENCES topic(topic_id) ON DELETE CASCADE,
  word VARCHAR(100) NOT NULL,
  ipa VARCHAR(100),
  meaning_en TEXT NOT NULL,
  meaning_vi TEXT NOT NULL,
  example_sentence TEXT,
  difficulty_level difficulty_enum NOT NULL DEFAULT 'Beginner',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE vocabulary_progress (
  vocab_progress_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id) ON DELETE CASCADE,
  is_learned BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  first_learned_at TIMESTAMP WITH TIME ZONE,
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  practice_attempts INTEGER DEFAULT 0,
  practice_correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);

-- Bảng câu hỏi: Phù hợp với UI nhập 4 đáp án
CREATE TABLE quiz_question (
  quiz_question_id SERIAL PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id) ON DELETE CASCADE,
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(255) NOT NULL, 
  -- Lưu ý: Trong thực tế, bạn có thể cần thêm cột lưu 3 đáp án sai (wrong_answers) 
  -- hoặc backend tự random từ các từ vựng khác cùng Topic.
  -- Ở script này, ta giả định backend sẽ random đáp án sai từ DB khi lấy câu hỏi.
  time_limit INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz (
  quiz_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  difficulty_mode VARCHAR(50) DEFAULT 'Mixed Levels',
  total_questions INTEGER DEFAULT 10,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE result (
  result_id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quiz(quiz_id) ON DELETE CASCADE, 
  quiz_question_id INTEGER NOT NULL REFERENCES quiz_question(quiz_question_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  user_answer VARCHAR(255),
  user_speech_text TEXT,
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress (
  progress_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  total_quizzes INTEGER DEFAULT 0,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate FLOAT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================
-- 4. INDEXES & TRIGGERS
-- ============================
CREATE INDEX idx_vocab_progress_user ON vocabulary_progress(user_id);
CREATE INDEX idx_vocab_progress_learned ON vocabulary_progress(is_learned);
CREATE INDEX idx_vocab_progress_bookmarked ON vocabulary_progress(is_bookmarked);
CREATE INDEX idx_vocabulary_topic ON vocabulary(topic_id);
CREATE INDEX idx_result_quiz ON result(quiz_id);
CREATE INDEX idx_result_user ON result(user_id);

CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO progress (user_id, total_questions, correct_answers, accuracy_rate)
  VALUES (NEW.user_id, 1, CASE WHEN NEW.is_correct THEN 1 ELSE 0 END, CASE WHEN NEW.is_correct THEN 100 ELSE 0 END)
  ON CONFLICT (user_id) DO UPDATE SET
    total_questions = progress.total_questions + 1,
    correct_answers = progress.correct_answers + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
    accuracy_rate = ROUND(((progress.correct_answers::FLOAT + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)) / (progress.total_questions::FLOAT + 1) * 100)::NUMERIC, 2);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_progress AFTER INSERT ON result FOR EACH ROW EXECUTE FUNCTION update_user_progress();

-- ============================
-- 5. INITIAL DATA
-- ============================

-- 1. Users
INSERT INTO "user" (username, email, full_name, password, role) VALUES
('admin', 'admin@example.com', 'Admin System', '$2a$10$O0Byesj./Yq1ra6f99MOGuG0WNL6Qg9HPspKtt/9l0YDb2AKe6knG', 'Admin'),
('alex', 'alex@example.com', 'Alex Chen', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User');

-- 2. Topics (10 Topics)
INSERT INTO topic (topic_name, description) VALUES
('Daily Life', 'Everyday activities'),
('Travel', 'Tourism and transport'),
('Food', 'Dishes and ingredients'),
('Job', 'Work and professions'),
('Health', 'Medical terms'),
('Technology', 'Computers and gadgets'),
('Education', 'School and learning'),
('Environment', 'Nature and ecology'),
('Sports', 'Games and activities'),
('Emotions', 'Feelings and moods');

-- 3. Vocabulary (50 words: 3 Beginner, 1 Intermediate, 1 Advanced per Topic)

-- Topic 1: Daily Life
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(1, 'House', 'haʊs', 'A building for human habitation', 'Ngôi nhà', 'I live in a big house.', 'Beginner'),
(1, 'Key', 'kiː', 'A small metal object to open locks', 'Chìa khóa', 'I lost my car key.', 'Beginner'),
(1, 'Watch', 'wɒtʃ', 'A small clock worn on the wrist', 'Đồng hồ', 'Look at your watch.', 'Beginner'),
(1, 'Routine', 'ruːˈtiːn', 'A sequence of actions regularly followed', 'Thói quen', 'My morning routine.', 'Intermediate'),
(1, 'Chore', 'tʃɔːr', 'A routine task', 'Việc vặt', 'Cleaning is a chore.', 'Advanced');

-- Topic 2: Travel
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(2, 'Bus', 'bʌs', 'A large motor vehicle', 'Xe buýt', 'Take the bus.', 'Beginner'),
(2, 'Map', 'mæp', 'A diagram of an area', 'Bản đồ', 'Read the map.', 'Beginner'),
(2, 'Hotel', 'hoʊˈtɛl', 'A place that provides lodging', 'Khách sạn', 'Book a hotel.', 'Beginner'),
(2, 'Luggage', 'ˈlʌɡɪdʒ', 'Suitcases or bags', 'Hành lý', 'Pack your luggage.', 'Intermediate'),
(2, 'Excursion', 'ɪkˈskɜːrʒən', 'A short journey', 'Chuyến đi chơi', 'A day excursion.', 'Advanced');

-- Topic 3: Food
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(3, 'Apple', 'ˈæpəl', 'A round fruit', 'Quả táo', 'Eat an apple.', 'Beginner'),
(3, 'Bread', 'brɛd', 'Food made of flour', 'Bánh mì', 'Fresh bread.', 'Beginner'),
(3, 'Rice', 'raɪs', 'A grain used for food', 'Cơm', 'Steamed rice.', 'Beginner'),
(3, 'Recipe', 'ˈrɛsɪpi', 'Cooking instructions', 'Công thức', 'Follow the recipe.', 'Intermediate'),
(3, 'Cuisine', 'kwɪˈziːn', 'Style of cooking', 'Ẩm thực', 'Local cuisine.', 'Advanced');

-- Topic 4: Job
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(4, 'Work', 'wɜːrk', 'Activity involving effort', 'Công việc', 'Hard work.', 'Beginner'),
(4, 'Boss', 'bɒs', 'A person in charge', 'Sếp', 'Talk to the boss.', 'Beginner'),
(4, 'Office', 'ˈɒfɪs', 'A room where people work', 'Văn phòng', 'Go to the office.', 'Beginner'),
(4, 'Salary', 'ˈsæləri', 'Regular payment', 'Tiền lương', 'Monthly salary.', 'Intermediate'),
(4, 'Resignation', 'ˌrɛzɪɡˈneɪʃən', 'Act of giving up a position', 'Sự từ chức', 'Letter of resignation.', 'Advanced');

-- Topic 5: Health
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(5, 'Sick', 'sɪk', 'Affected by illness', 'Ốm', 'I feel sick.', 'Beginner'),
(5, 'Head', 'hɛd', 'Upper part of body', 'Đầu', 'My head hurts.', 'Beginner'),
(5, 'Leg', 'lɛɡ', 'Limb for walking', 'Chân', 'Broken leg.', 'Beginner'),
(5, 'Medicine', 'ˈmɛdɪsɪn', 'Drug for treatment', 'Thuốc', 'Take medicine.', 'Intermediate'),
(5, 'Diagnosis', 'ˌdaɪəɡˈnoʊsɪs', 'Identification of illness', 'Chẩn đoán', 'Medical diagnosis.', 'Advanced');

-- Topic 6: Technology
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(6, 'Phone', 'foʊn', 'Telephone', 'Điện thoại', 'Call me on the phone.', 'Beginner'),
(6, 'Game', 'ɡeɪm', 'Activity for amusement', 'Trò chơi', 'Play a game.', 'Beginner'),
(6, 'Click', 'klɪk', 'Press a button', 'Nhấn chuột', 'Click the link.', 'Beginner'),
(6, 'Network', 'ˈnɛtwɜːrk', 'Interconnected group', 'Mạng lưới', 'Social network.', 'Intermediate'),
(6, 'Artificial', 'ˌɑːrtɪˈfɪʃəl', 'Made by humans', 'Nhân tạo', 'Artificial intelligence.', 'Advanced');

-- Topic 7: Education
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(7, 'Book', 'bʊk', 'Written work', 'Sách', 'Read a book.', 'Beginner'),
(7, 'Pen', 'pɛn', 'Writing instrument', 'Bút', 'Blue pen.', 'Beginner'),
(7, 'School', 'skuːl', 'Place for education', 'Trường học', 'Go to school.', 'Beginner'),
(7, 'Degree', 'dɪˈɡriː', 'Academic rank', 'Bằng cấp', 'University degree.', 'Intermediate'),
(7, 'Scholarship', 'ˈskɒlərʃɪp', 'Academic award', 'Học bổng', 'Win a scholarship.', 'Advanced');

-- Topic 8: Environment
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(8, 'Sun', 'sʌn', 'Star orbiting earth', 'Mặt trời', 'Bright sun.', 'Beginner'),
(8, 'Rain', 'reɪn', 'Condensed moisture', 'Mưa', 'Heavy rain.', 'Beginner'),
(8, 'Tree', 'triː', 'Woody plant', 'Cây', 'Green tree.', 'Beginner'),
(8, 'Pollution', 'pəˈluːʃən', 'Harmful substances', 'Ô nhiễm', 'Air pollution.', 'Intermediate'),
(8, 'Sustainability', 'səˌsteɪnəˈbɪləti', 'Avoidance of depletion', 'Sự bền vững', 'Environmental sustainability.', 'Advanced');

-- Topic 9: Sports
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(9, 'Ball', 'bɔːl', 'Spherical object', 'Bóng', 'Kick the ball.', 'Beginner'),
(9, 'Run', 'rʌn', 'Move fast', 'Chạy', 'Run away.', 'Beginner'),
(9, 'Win', 'wɪn', 'Be victorious', 'Thắng', 'We will win.', 'Beginner'),
(9, 'Athlete', 'ˈæθliːt', 'Sports person', 'Vận động viên', 'Pro athlete.', 'Intermediate'),
(9, 'Tournament', 'ˈtʊrnəmənt', 'Series of contests', 'Giải đấu', 'Golf tournament.', 'Advanced');

-- Topic 10: Emotions
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(10, 'Happy', 'ˈhæpi', 'Showing pleasure', 'Vui vẻ', 'I am happy.', 'Beginner'),
(10, 'Sad', 'sæd', 'Showing sorrow', 'Buồn', 'Don''t be sad.', 'Beginner'),
(10, 'Angry', 'ˈæŋɡri', 'Strong annoyance', 'Tức giận', 'He is angry.', 'Beginner'),
(10, 'Nervous', 'ˈnɜːrvəs', 'Easily alarmed', 'Lo lắng', 'Feeling nervous.', 'Intermediate'),
(10, 'Melancholy', 'ˈmɛlənkɒli', 'Pensive sadness', 'U sầu', 'Deep melancholy.', 'Advanced');

-- 4. Quiz Questions (20 Questions - 100% Trắc nghiệm A/B/C/D)
-- Backend sẽ tự động lấy 3 từ vựng khác để làm đáp án sai (Wrong Answers) khi hiển thị

-- Q1 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'What is the meaning of "House"?', 'Ngôi nhà' FROM vocabulary WHERE word = 'House';

-- Q2 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Which word means "A small metal object to open locks"?', 'Key' FROM vocabulary WHERE word = 'Key';

-- Q3 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Tiếng Anh của "Xe buýt" là gì?', 'Bus' FROM vocabulary WHERE word = 'Bus';

-- Q4 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'What does "Apple" mean?', 'Quả táo' FROM vocabulary WHERE word = 'Apple';

-- Q5 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Choose the word for "Food made of flour":', 'Bread' FROM vocabulary WHERE word = 'Bread';

-- Q6 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Từ "Sếp" trong tiếng Anh là:', 'Boss' FROM vocabulary WHERE word = 'Boss';

-- Q7 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'Definition of "Sick":', 'Ốm' FROM vocabulary WHERE word = 'Sick';

-- Q8 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'What is "A telephone"?', 'Phone' FROM vocabulary WHERE word = 'Phone';

-- Q9 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Dịch "Quyển sách" sang tiếng Anh:', 'Book' FROM vocabulary WHERE word = 'Book';

-- Q10 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'Meaning of "Sun":', 'Mặt trời' FROM vocabulary WHERE word = 'Sun';

-- Q11 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Which word means "Spherical object"?', 'Ball' FROM vocabulary WHERE word = 'Ball';

-- Q12 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Tiếng Anh của "Vui vẻ" là:', 'Happy' FROM vocabulary WHERE word = 'Happy';

-- Q13 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'What does "Routine" mean?', 'Thói quen' FROM vocabulary WHERE word = 'Routine';

-- Q14 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Choose the word for "Suitcases or bags":', 'Luggage' FROM vocabulary WHERE word = 'Luggage';

-- Q15 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Dịch "Tiền lương" sang tiếng Anh:', 'Salary' FROM vocabulary WHERE word = 'Salary';

-- Q16 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'What is "Medicine"?', 'Thuốc' FROM vocabulary WHERE word = 'Medicine';

-- Q17 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Which word means "Artificial"?', 'Nhân tạo' FROM vocabulary WHERE word = 'Artificial';

-- Q18 (VietnameseToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'VietnameseToWord', 'Từ "Học bổng" trong tiếng Anh là:', 'Scholarship' FROM vocabulary WHERE word = 'Scholarship';

-- Q19 (WordToMeaning)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'WordToMeaning', 'Meaning of "Sustainability":', 'Sự bền vững' FROM vocabulary WHERE word = 'Sustainability';

-- Q20 (MeaningToWord)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) 
SELECT vocab_id, 'MeaningToWord', 'Choose the word for "Pensive sadness":', 'Melancholy' FROM vocabulary WHERE word = 'Melancholy';

COMMIT;