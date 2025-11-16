-- ======================================
--  ENGLISH LEARNING DATABASE INIT SCRIPT (Enhanced with CASCADE + Pronunciation)
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
-- DROP TABLES (if exists) - Correct order
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

-- ✅ CRITICAL: vocabulary với ON DELETE CASCADE
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

COMMENT ON COLUMN vocabulary.topic_id IS 
  'ON DELETE CASCADE: When topic is deleted, all vocabularies in that topic will be deleted automatically';

COMMENT ON COLUMN vocabulary.audio_path IS 
  'MinIO URL for TTS audio. Auto-generated when vocabulary is created. Format: http://minio:9000/vocabulary-audio/tts/vocab_{id}_{hash}.mp3';

-- ✅ quiz_question với ON DELETE CASCADE
CREATE TABLE quiz_question (
  quiz_question_id SERIAL PRIMARY KEY,
  vocab_id INTEGER NOT NULL REFERENCES vocabulary(vocab_id) ON DELETE CASCADE,
  question_type question_type_enum NOT NULL,
  question_text TEXT NOT NULL,
  correct_answer VARCHAR(255) NOT NULL,
  time_limit INTEGER DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

COMMENT ON COLUMN quiz_question.vocab_id IS 
  'ON DELETE CASCADE: When vocabulary is deleted, all quiz questions for that vocab will be deleted automatically';

CREATE TABLE quiz (
  quiz_id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES "user"(user_id) ON DELETE CASCADE,
  difficulty_mode quiz_mode_enum DEFAULT 'Mixed Levels',
  total_questions INTEGER DEFAULT 10,
  score INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ✅ result với ON DELETE CASCADE
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

COMMENT ON COLUMN result.quiz_question_id IS 
  'ON DELETE CASCADE: When quiz_question is deleted, all results for that question will be deleted automatically';

COMMENT ON COLUMN result.user_speech_text IS 
  'For pronunciation questions: stores the recognized text from STT. For other questions: NULL';

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

-- ✅ vocabulary_progress với ON DELETE CASCADE
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

COMMENT ON COLUMN vocabulary_progress.vocab_id IS 
  'ON DELETE CASCADE: When vocabulary is deleted, all progress records for that vocab will be deleted automatically';

-- ============================
-- INDEXES
-- ============================
CREATE INDEX idx_vocab_progress_user ON vocabulary_progress(user_id);
CREATE INDEX idx_vocab_progress_learned ON vocabulary_progress(is_learned);
CREATE INDEX idx_vocab_progress_bookmarked ON vocabulary_progress(is_bookmarked);
CREATE INDEX idx_vocab_progress_first_learned ON vocabulary_progress(first_learned_at);
CREATE INDEX idx_vocab_progress_last_reviewed ON vocabulary_progress(last_reviewed_at);

-- ✅ Additional indexes for performance
CREATE INDEX idx_vocabulary_topic ON vocabulary(topic_id);
CREATE INDEX idx_vocabulary_difficulty ON vocabulary(difficulty_level);
CREATE INDEX idx_quiz_question_vocab ON quiz_question(vocab_id);
CREATE INDEX idx_result_quiz ON result(quiz_id);
CREATE INDEX idx_result_user ON result(user_id);

-- ✅ NEW: Index for pronunciation questions
CREATE INDEX IF NOT EXISTS idx_quiz_question_type 
  ON quiz_question(question_type);

COMMENT ON INDEX idx_quiz_question_type IS 
  'Index for filtering questions by type (e.g., Pronunciation queries)';

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
-- ✅ HELPER FUNCTION: Check if topic can be deleted safely
-- ============================
CREATE OR REPLACE FUNCTION check_topic_deletion(topic_id_param INT)
RETURNS TABLE (
  can_delete BOOLEAN,
  vocab_count INT,
  question_count INT,
  result_count INT,
  warning_message TEXT
) AS $$
DECLARE
  v_count INT;
  q_count INT;
  r_count INT;
BEGIN
  -- Count vocabularies
  SELECT COUNT(*) INTO v_count
  FROM vocabulary
  WHERE topic_id = topic_id_param;
  
  -- Count quiz questions
  SELECT COUNT(*) INTO q_count
  FROM quiz_question qq
  INNER JOIN vocabulary v ON qq.vocab_id = v.vocab_id
  WHERE v.topic_id = topic_id_param;
  
  -- Count results
  SELECT COUNT(*) INTO r_count
  FROM result res
  INNER JOIN quiz_question qq ON res.quiz_question_id = qq.quiz_question_id
  INNER JOIN vocabulary v ON qq.vocab_id = v.vocab_id
  WHERE v.topic_id = topic_id_param;
  
  RETURN QUERY
  SELECT 
    TRUE,
    v_count,
    q_count,
    r_count,
    format('⚠️  Deleting this topic will also delete: %s vocabularies, %s quiz questions, %s results', 
           v_count, q_count, r_count);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_topic_deletion IS 
  'Helper function to check what will be deleted when removing a topic. Usage: SELECT * FROM check_topic_deletion(1);';

-- ============================
-- ✅ VALIDATION FUNCTION: Check minimum vocabulary count
-- ============================
CREATE OR REPLACE FUNCTION validate_quiz_generation(
  topic_id_param INT DEFAULT NULL,
  difficulty_param difficulty_enum DEFAULT NULL
)
RETURNS TABLE (
  can_generate BOOLEAN,
  vocab_count INT,
  message TEXT
) AS $$
DECLARE
  v_count INT;
BEGIN
  -- Count available vocabularies
  IF topic_id_param IS NOT NULL THEN
    IF difficulty_param IS NOT NULL THEN
      SELECT COUNT(*) INTO v_count
      FROM vocabulary
      WHERE topic_id = topic_id_param 
        AND difficulty_level = difficulty_param;
    ELSE
      SELECT COUNT(*) INTO v_count
      FROM vocabulary
      WHERE topic_id = topic_id_param;
    END IF;
  ELSIF difficulty_param IS NOT NULL THEN
    SELECT COUNT(*) INTO v_count
    FROM vocabulary
    WHERE difficulty_level = difficulty_param;
  ELSE
    SELECT COUNT(*) INTO v_count
    FROM vocabulary;
  END IF;
  
  -- Check if enough vocabularies (minimum 4 for multiple choice)
  IF v_count >= 4 THEN
    RETURN QUERY
    SELECT 
      TRUE,
      v_count,
      format('✅ Can generate quiz: %s vocabularies available', v_count);
  ELSE
    RETURN QUERY
    SELECT 
      FALSE,
      v_count,
      format('❌ Cannot generate quiz: Need at least 4 vocabularies, but only %s available', v_count);
  END IF;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION validate_quiz_generation IS 
  'Check if there are enough vocabularies to generate a quiz. Usage: SELECT * FROM validate_quiz_generation(topic_id := 1);';

-- ============================
-- ✅ NEW: PRONUNCIATION HELPER FUNCTIONS
-- ============================

-- Function 1: Get pronunciation practice statistics
CREATE OR REPLACE FUNCTION get_pronunciation_stats(user_id_param INT)
RETURNS TABLE (
  total_attempts BIGINT,
  correct_attempts BIGINT,
  accuracy_rate NUMERIC,
  most_practiced_word TEXT,
  avg_confidence NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) AS total_attempts,
    COUNT(*) FILTER (WHERE r.is_correct) AS correct_attempts,
    ROUND(
      (COUNT(*) FILTER (WHERE r.is_correct)::NUMERIC / 
       NULLIF(COUNT(*), 0) * 100),
      2
    ) AS accuracy_rate,
    (
      SELECT v.word
      FROM result r2
      INNER JOIN quiz_question qq2 ON r2.quiz_question_id = qq2.quiz_question_id
      INNER JOIN vocabulary v ON qq2.vocab_id = v.vocab_id
      WHERE r2.user_id = user_id_param
        AND qq2.question_type = 'Pronunciation'
      GROUP BY v.word
      ORDER BY COUNT(*) DESC
      LIMIT 1
    ) AS most_practiced_word,
    0.0 AS avg_confidence
  FROM result r
  INNER JOIN quiz_question qq ON r.quiz_question_id = qq.quiz_question_id
  WHERE r.user_id = user_id_param
    AND qq.question_type = 'Pronunciation';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_pronunciation_stats IS 
  'Get pronunciation practice statistics from result table. Usage: SELECT * FROM get_pronunciation_stats(1);';

-- Function 2: Get vocabulary pronunciation history
CREATE OR REPLACE FUNCTION get_vocab_pronunciation_history(
  vocab_id_param INT, 
  user_id_param INT
)
RETURNS TABLE (
  attempt_id INT,
  user_answer TEXT,
  is_correct BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.result_id AS attempt_id,
    r.user_answer,
    r.is_correct,
    r.created_at
  FROM result r
  INNER JOIN quiz_question qq ON r.quiz_question_id = qq.quiz_question_id
  WHERE qq.vocab_id = vocab_id_param
    AND r.user_id = user_id_param
    AND qq.question_type = 'Pronunciation'
  ORDER BY r.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_vocab_pronunciation_history IS 
  'Get pronunciation practice history for a specific vocabulary. Usage: SELECT * FROM get_vocab_pronunciation_history(1, 1);';

-- ============================
-- INITIAL DATA
-- ============================

-- 1️⃣ Users (bcrypt hashed passwords)
INSERT INTO "user" (username, email, full_name, password, role, avatar_url) VALUES
('alex', 'alex@example.com', 'Alex Chen', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/alex.png'),
('emma', 'emma@example.com', 'Emma Tran', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/emma.png'),
('admin', 'admin@example.com', 'Admin', '$2a$10$O0Byesj./Yq1ra6f99MOGuG0WNL6Qg9HPspKtt/9l0YDb2AKe6knG', 'Admin', '/avatars/admin.png'),
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

-- 3️⃣ Vocabulary (audio_path will be auto-generated by backend)
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, audio_path, difficulty_level)
VALUES
-- Greetings (Topic 1)
(1, 'Hello', 'həˈloʊ', 'Used as a greeting', 'Xin chào', 'Hello, how are you?', NULL, 'Beginner'),
(1, 'Goodbye', 'ɡʊdˈbaɪ', 'Used when parting', 'Tạm biệt', 'Goodbye, see you soon!', NULL, 'Beginner'),
(1, 'Thank you', 'θæŋk juː', 'Expression of gratitude', 'Cảm ơn', 'Thank you for your help!', NULL, 'Beginner'),
(1, 'Welcome', 'ˈwɛlkəm', 'Greeting to receive someone', 'Chào mừng', 'Welcome to our home!', NULL, 'Beginner'),

-- Numbers (Topic 2)
(2, 'One', 'wʌn', 'The number 1', 'Một', 'I have one apple.', NULL, 'Beginner'),
(2, 'Two', 'tuː', 'The number 2', 'Hai', 'Two plus two equals four.', NULL, 'Beginner'),
(2, 'Three', 'θriː', 'The number 3', 'Ba', 'I have three books.', NULL, 'Beginner'),
(2, 'Four', 'fɔːr', 'The number 4', 'Bốn', 'There are four seasons.', NULL, 'Beginner'),

-- Colors (Topic 3)
(3, 'Red', 'rɛd', 'The color of blood', 'Đỏ', 'The apple is red.', NULL, 'Beginner'),
(3, 'Blue', 'bluː', 'The color of the sky', 'Xanh dương', 'The sky is blue.', NULL, 'Beginner'),
(3, 'Green', 'ɡriːn', 'The color of grass', 'Xanh lá', 'The grass is green.', NULL, 'Beginner'),
(3, 'Yellow', 'ˈjɛloʊ', 'The color of the sun', 'Vàng', 'The sun is yellow.', NULL, 'Beginner'),

-- Animals (Topic 4)
(4, 'Cat', 'kæt', 'A small domesticated animal', 'Mèo', 'The cat is sleeping.', NULL, 'Beginner'),
(4, 'Dog', 'dɔɡ', 'A common pet animal', 'Chó', 'The dog is barking.', NULL, 'Beginner'),
(4, 'Bird', 'bɜːrd', 'An animal with feathers', 'Chim', 'The bird can fly.', NULL, 'Beginner'),
(4, 'Fish', 'fɪʃ', 'An animal that lives in water', 'Cá', 'Fish swim in the ocean.', NULL, 'Beginner');

-- ============================
-- ✅ DEMO QUERIES
-- ============================

-- Check what will be deleted when removing a topic
-- SELECT * FROM check_topic_deletion(1);

-- Validate if we can generate quiz for a topic
-- SELECT * FROM validate_quiz_generation(topic_id := 1);

-- Get pronunciation stats for a user
-- SELECT * FROM get_pronunciation_stats(1);

-- Get pronunciation history for a vocabulary
-- SELECT * FROM get_vocab_pronunciation_history(1, 1);

COMMIT;

-- ============================
-- ✅ PRINT SUMMARY
-- ============================
DO $$
DECLARE
  topic_count INT;
  vocab_count INT;
BEGIN
  SELECT COUNT(*) INTO topic_count FROM topic;
  SELECT COUNT(*) INTO vocab_count FROM vocabulary;
  
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Database initialized successfully!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Topics created: %', topic_count;
  RAISE NOTICE 'Vocabularies created: %', vocab_count;
  RAISE NOTICE '';
  RAISE NOTICE '🔗 CASCADE Delete Rules:';
  RAISE NOTICE '  • Delete Topic → Delete Vocabularies → Delete Quiz Questions → Delete Results';
  RAISE NOTICE '  • Delete Vocabulary → Delete Quiz Questions → Delete Results';
  RAISE NOTICE '';
  RAISE NOTICE '🎤 Pronunciation Practice:';
  RAISE NOTICE '  • Using existing quiz_question + result tables';
  RAISE NOTICE '  • Question type: "Pronunciation"';
  RAISE NOTICE '  • Audio path: Auto-generated via TTS (stored in MinIO)';
  RAISE NOTICE '';
  RAISE NOTICE '✅ Helper Functions:';
  RAISE NOTICE '  • check_topic_deletion(topic_id)';
  RAISE NOTICE '  • validate_quiz_generation(topic_id, difficulty)';
  RAISE NOTICE '  • get_pronunciation_stats(user_id)';
  RAISE NOTICE '  • get_vocab_pronunciation_history(vocab_id, user_id)';
  RAISE NOTICE '========================================';
END $$;