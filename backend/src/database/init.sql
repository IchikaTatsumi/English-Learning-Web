-- ======================================
--  ENGLISH LEARNING DATABASE INIT SCRIPT (Fixed)
-- ======================================
BEGIN;

-- ============================
-- ENUM TYPES
-- ============================
DO $$ BEGIN
  CREATE TYPE role_enum AS ENUM ('Admin', 'User');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE question_type_enum AS ENUM (
    'WordToMeaning',
    'MeaningToWord',
    'VietnameseToWord',
    'Pronunciation'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE quiz_mode_enum AS ENUM ('Beginner Only', 'Intermediate Only', 'Advanced Only', 'Mixed Levels');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ============================
-- DROP TABLES (if exists)
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
  topic_id INTEGER REFERENCES topic(topic_id) ON DELETE SET NULL,
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

CREATE TABLE quiz (
  quiz_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  difficulty_mode quiz_mode_enum DEFAULT 'Mixed Levels',
  total_questions INTEGER DEFAULT 10,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE result (
  result_id SERIAL PRIMARY KEY,
  quiz_id INTEGER NOT NULL REFERENCES quiz(quiz_id) ON DELETE CASCADE,
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

-- ✅ CRITICAL: Bảng vocabulary_progress với first_learned_at
CREATE TABLE vocabulary_progress (
  vocab_progress_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id) ON DELETE CASCADE,
  is_learned BOOLEAN DEFAULT FALSE,
  is_bookmarked BOOLEAN DEFAULT FALSE,
  
  -- ✅ Ngày học xong đầu tiên (chỉ set một lần, không đổi)
  first_learned_at TIMESTAMP WITH TIME ZONE,
  
  -- ✅ Ngày ôn tập gần nhất (update mỗi khi bookmark hoặc practice)
  last_reviewed_at TIMESTAMP WITH TIME ZONE,
  
  practice_attempts INTEGER DEFAULT 0,
  practice_correct_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, vocab_id)
);

-- ============================
-- INDEXES
-- ============================
CREATE INDEX idx_vocab_progress_user ON vocabulary_progress(user_id);
CREATE INDEX idx_vocab_progress_learned ON vocabulary_progress(is_learned);
CREATE INDEX idx_vocab_progress_bookmarked ON vocabulary_progress(is_bookmarked);
CREATE INDEX idx_vocab_progress_first_learned ON vocabulary_progress(first_learned_at);
CREATE INDEX idx_vocab_progress_last_reviewed ON vocabulary_progress(last_reviewed_at);

-- ============================
-- TRIGGER: Update progress
-- ============================
CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  -- Upsert progress record
  INSERT INTO progress (user_id, total_questions, correct_answers, accuracy_rate)
  VALUES (
    NEW.user_id,
    1,
    CASE WHEN NEW.is_correct THEN 1 ELSE 0 END,
    CASE WHEN NEW.is_correct THEN 100 ELSE 0 END
  )
  ON CONFLICT (user_id) DO UPDATE
  SET
    total_questions = progress.total_questions + 1,
    correct_answers = progress.correct_answers + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
    accuracy_rate = ROUND(
      ((progress.correct_answers::FLOAT + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)) /
      (progress.total_questions::FLOAT + 1) * 100)::NUMERIC, 2
    );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_progress ON result;
CREATE TRIGGER trg_update_progress
AFTER INSERT ON result
FOR EACH ROW
EXECUTE FUNCTION update_user_progress();

-- ============================
-- FUNCTION: get_random_question (for Quiz)
-- ============================
CREATE OR REPLACE FUNCTION get_random_question(vocab_input_id INT)
RETURNS TABLE (
  quiz_question_id INT,
  question_text TEXT,
  correct_answer TEXT,
  wrong_answers TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.quiz_question_id,
    q.question_text,
    q.correct_answer,
    ARRAY(
      SELECT v2.word
      FROM vocabulary v2
      WHERE v2.vocab_id <> vocab_input_id
      ORDER BY RANDOM()
      LIMIT 3
    ) AS wrong_answers
  FROM quiz_question q
  WHERE q.vocab_id = vocab_input_id
  ORDER BY RANDOM()
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- INITIAL DATA
-- ============================

-- 1️⃣ Users (bcrypt hashed passwords)
INSERT INTO "user" (username, email, full_name, password, role, avatar_url) VALUES
('alex', 'alex@example.com', 'Alex Chen', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/alex.png'),
('emma', 'emma@example.com', 'Emma Tran', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/emma.png'),
('admin', 'admin@example.com', 'Admin', '$2b$10$CQwU9uD4qHk0bQy9xv6DeuZK8xW0czs5bT3tT7Q4v3NHSmF6hmcUu', 'Admin', '/avatars/admin.png'),
('john', 'john@example.com', 'John Doe', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/john.png');

-- 2️⃣ Topics
INSERT INTO topic (topic_name, description) VALUES
('Greetings', 'Basic greetings and introductions'),
('Numbers', 'Learning numbers in English'),
('Colors', 'Basic color vocabulary'),
('Animals', 'Common animals'),
('Fruits', 'Fruit names'),
('Jobs', 'Common occupations'),
('Weather', 'Weather expressions'),
('Food', 'Food and meals'),
('Daily Activities', 'Common daily routines');

-- 3️⃣ Vocabulary
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, audio_path, difficulty_level)
VALUES
(1, 'Hello', 'həˈloʊ', 'Used as a greeting', 'Xin chào', 'Hello, how are you?', '/audio/hello.mp3', 'Beginner'),
(1, 'Goodbye', 'ɡʊdˈbaɪ', 'Used when parting', 'Tạm biệt', 'Goodbye, see you soon!', '/audio/goodbye.mp3', 'Beginner'),
(2, 'One', 'wʌn', 'The number 1', 'Một', 'I have one apple.', '/audio/one.mp3', 'Beginner'),
(3, 'Red', 'rɛd', 'The color of blood', 'Đỏ', 'The apple is red.', '/audio/red.mp3', 'Beginner'),
(4, 'Cat', 'kæt', 'A small domesticated animal', 'Mèo', 'The cat is sleeping.', '/audio/cat.mp3', 'Beginner');

COMMIT;