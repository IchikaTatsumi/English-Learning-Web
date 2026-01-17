-- ======================================
--  ENGLISH LEARNING DATABASE INIT SCRIPT (Full & Updated)
-- ======================================
BEGIN;

-- ============================
-- ENUM TYPES
-- ============================
DO $$ BEGIN
  CREATE TYPE role_enum AS ENUM ('Admin', 'User');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE question_type_enum AS ENUM (
    'WordToMeaning', 'MeaningToWord', 'VietnameseToWord', 
    'SentenceToWord', 'SpeechToWord', 'Pronunciation'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ============================
-- DROP TABLES (Correct order)
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
-- TABLE DEFINITIONS
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
  audio_path VARCHAR(255),
  difficulty_level difficulty_enum NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE quiz_question (
  quiz_question_id SERIAL PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id) ON DELETE CASCADE,
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  time_limit INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE result (
  result_id SERIAL PRIMARY KEY,
  quiz_id INTEGER, -- Có thể NULL nếu luyện tập tự do
  quiz_question_id INTEGER NOT NULL REFERENCES quiz_question(quiz_question_id) ON DELETE CASCADE,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  user_answer VARCHAR(255),
  is_correct BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE progress (
  progress_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  total_questions INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  accuracy_rate FLOAT DEFAULT 0,
  UNIQUE(user_id)
);

-- ============================
-- TRIGGER & HELPER FUNCTIONS (Khôi phục)
-- ============================

-- Tự động cập nhật bảng Progress khi có kết quả mới
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

-- Hàm kiểm tra trước khi xóa Topic
CREATE OR REPLACE FUNCTION check_topic_deletion(topic_id_param INT)
RETURNS TABLE (can_delete BOOLEAN, vocab_count INT, message TEXT) AS $$
BEGIN
  RETURN QUERY SELECT TRUE, COUNT(*)::INT, format('Topic có %s từ vựng sẽ bị xóa kèm.', COUNT(*))
  FROM vocabulary WHERE topic_id = topic_id_param;
END;
$$ LANGUAGE plpgsql;

-- Hàm lấy thống kê phát âm (Cho trang Profile)
CREATE OR REPLACE FUNCTION get_pronunciation_stats(user_id_param INT)
RETURNS TABLE (total_attempts BIGINT, accuracy_rate NUMERIC) AS $$
BEGIN
  RETURN QUERY SELECT COUNT(*), ROUND((COUNT(*) FILTER (WHERE is_correct)::NUMERIC / NULLIF(COUNT(*), 0) * 100), 2)
  FROM result WHERE user_id = user_id_param;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- INITIAL DATA (Phong phú)
-- ============================

INSERT INTO "user" (username, email, full_name, password, role) VALUES
('admin', 'admin@example.com', 'Admin System', '$2a$10$O0Byesj./Yq1ra6f99MOGuG0WNL6Qg9HPspKtt/9l0YDb2AKe6knG', 'Admin'),
('alex', 'alex@example.com', 'Alex Chen', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User');

INSERT INTO topic (topic_id, topic_name, description) VALUES
(1, 'Greetings', 'Chào hỏi'), (2, 'Animals', 'Động vật'), (3, 'Food', 'Thức ăn'), (4, 'Jobs', 'Nghề nghiệp');

INSERT INTO vocabulary (vocab_id, topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, difficulty_level) VALUES
(1, 1, 'Hello', 'həˈloʊ', 'Greeting', 'Xin chào', 'Hello, how are you?', 'Beginner'),
(2, 2, 'Cat', 'kæt', 'Small pet', 'Con mèo', 'The cat is on the mat.', 'Beginner'),
(3, 3, 'Apple', 'ˈæp.əl', 'A round fruit', 'Quả táo', 'An apple a day keeps the doctor away.', 'Beginner');

-- Câu hỏi được thêm thủ công (Không tự động)
INSERT INTO quiz_question (vocab_id, question_type, question_text, correct_answer) VALUES
(1, 'WordToMeaning', 'What is the meaning of "Hello"?', 'Xin chào'),
(2, 'VietnameseToWord', 'Dịch sang tiếng Anh: Con mèo', 'Cat'),
(3, 'SentenceToWord', 'I eat an ___ every morning.', 'apple');

COMMIT;