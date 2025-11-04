-- ======================================
--  ENGLISH LEARNING DATABASE INIT SCRIPT
-- ======================================
BEGIN;

-- ============================
-- ENUM TYPES
-- ============================
CREATE TYPE role_enum AS ENUM ('Admin', 'User');
CREATE TYPE difficulty_enum AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE question_type_enum AS ENUM (
  'WordToMeaning',
  'MeaningToWord',
  'VietnameseToWord',
  'Pronunciation'
);
CREATE TYPE quiz_mode_enum AS ENUM ('Beginner Only', 'Intermediate Only', 'Advanced Only', 'Mixed Levels');

-- ============================
-- TABLE DEFINITIONS
-- ============================

CREATE TABLE "user" (
  user_id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================
-- TRIGGER: Update progress
-- ============================

CREATE OR REPLACE FUNCTION update_user_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE progress
  SET
    total_questions = total_questions + 1,
    correct_answers = correct_answers + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
    accuracy_rate = ROUND(
      (correct_answers::FLOAT + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)) /
      (total_questions::FLOAT + 1) * 100, 2
    )
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_progress
AFTER INSERT ON result
FOR EACH ROW
EXECUTE FUNCTION update_user_progress();

-- ============================
-- VIEW: user_vocab_progress
-- ============================
CREATE OR REPLACE VIEW user_vocab_progress AS
SELECT
  u.user_id,
  u.username,
  COUNT(DISTINCT r.quiz_question_id) AS total_answered,
  SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END) AS total_correct,
  ROUND(
    (SUM(CASE WHEN r.is_correct THEN 1 ELSE 0 END)::FLOAT /
    NULLIF(COUNT(DISTINCT r.quiz_question_id), 0)) * 100, 2
  ) AS accuracy_percent
FROM "user" u
LEFT JOIN result r ON u.user_id = r.user_id
GROUP BY u.user_id, u.username;

-- ============================
-- FUNCTION: get_random_question
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
  WHERE q.vocab_id = vocab_input_id;
END;
$$ LANGUAGE plpgsql;

-- ============================
-- INITIAL DATA
-- ============================

-- 1️⃣ Users (bcrypt: '123456' / 'admin')
INSERT INTO "user" (username, full_name, password, role, avatar_url) VALUES
('alex', 'Alex Chen', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/alex.png'),
('emma', 'Emma Tran', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/emma.png'),
('admin', 'Admin', '$2b$10$CQwU9uD4qHk0bQy9xv6DeuZK8xW0czs5bT3tT7Q4v3NHSmF6hmcUu', 'Admin', '/avatars/admin.png'),
('john', 'John Doe', '$2b$10$VQwG.4FzEIXZ0bVQhZL8EOwY/3D1YQG4rQbM81wKPb4bE4sWbcEzi', 'User', '/avatars/john.png');

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

-- 3️⃣ Vocabulary (36 từ)
INSERT INTO vocabulary (topic_id, word, ipa, meaning_en, meaning_vi, example_sentence, audio_path, difficulty_level)
VALUES
-- Greetings
(1, 'Hello', 'həˈloʊ', 'Used as a greeting', 'Xin chào', 'Hello, how are you?', '/audio/hello.mp3', 'Beginner'),
(1, 'Goodbye', 'ɡʊdˈbaɪ', 'Used when parting', 'Tạm biệt', 'Goodbye, see you soon!', '/audio/goodbye.mp3', 'Beginner'),
(1, 'Thanks', 'θæŋks', 'Expression of gratitude', 'Cảm ơn', 'Thanks for your help!', '/audio/thanks.mp3', 'Beginner'),
(1, 'Sorry', 'ˈsɑːri', 'Used to express apology', 'Xin lỗi', 'I am sorry for being late.', '/audio/sorry.mp3', 'Beginner'),

-- Numbers
(2, 'One', 'wʌn', 'The number 1', 'Một', 'I have one apple.', '/audio/one.mp3', 'Beginner'),
(2, 'Two', 'tuː', 'The number 2', 'Hai', 'Two cats are playing.', '/audio/two.mp3', 'Beginner'),
(2, 'Three', 'θriː', 'The number 3', 'Ba', 'Three people are waiting.', '/audio/three.mp3', 'Beginner'),
(2, 'Ten', 'ten', 'The number 10', 'Mười', 'He counted to ten.', '/audio/ten.mp3', 'Beginner'),

-- Colors
(3, 'Red', 'rɛd', 'The color of blood', 'Đỏ', 'The apple is red.', '/audio/red.mp3', 'Beginner'),
(3, 'Blue', 'bluː', 'The color of the sky', 'Xanh dương', 'The sky is blue.', '/audio/blue.mp3', 'Beginner'),
(3, 'Green', 'ɡriːn', 'The color of grass', 'Xanh lá cây', 'Grass is green.', '/audio/green.mp3', 'Beginner'),
(3, 'Yellow', 'ˈjɛloʊ', 'The color of the sun', 'Vàng', 'The sun is yellow.', '/audio/yellow.mp3', 'Beginner'),

-- Animals
(4, 'Cat', 'kæt', 'A small domesticated animal', 'Mèo', 'The cat is sleeping.', '/audio/cat.mp3', 'Beginner'),
(4, 'Dog', 'dɔːɡ', 'A loyal domestic animal', 'Chó', 'Dogs are friendly.', '/audio/dog.mp3', 'Beginner'),
(4, 'Bird', 'bɜːd', 'An animal that can fly', 'Chim', 'A bird is singing.', '/audio/bird.mp3', 'Beginner'),
(4, 'Fish', 'fɪʃ', 'An animal that lives in water', 'Cá', 'Fish swim in the water.', '/audio/fish.mp3', 'Beginner'),

-- Fruits
(5, 'Apple', 'ˈæpəl', 'A sweet fruit', 'Táo', 'I eat an apple every day.', '/audio/apple.mp3', 'Beginner'),
(5, 'Banana', 'bəˈnænə', 'A long yellow fruit', 'Chuối', 'Bananas are yellow.', '/audio/banana.mp3', 'Beginner'),
(5, 'Orange', 'ˈɒrɪndʒ', 'A citrus fruit', 'Cam', 'I like orange juice.', '/audio/orange.mp3', 'Beginner'),
(5, 'Grape', 'ɡreɪp', 'A small round fruit', 'Nho', 'Grapes are purple.', '/audio/grape.mp3', 'Beginner'),

-- Jobs
(6, 'Teacher', 'ˈtiːtʃər', 'A person who teaches', 'Giáo viên', 'My teacher is kind.', '/audio/teacher.mp3', 'Intermediate'),
(6, 'Doctor', 'ˈdɒktər', 'A person who treats people', 'Bác sĩ', 'The doctor is working.', '/audio/doctor.mp3', 'Intermediate'),
(6, 'Engineer', 'ˌɛn.dʒəˈnɪər', 'A technical professional', 'Kỹ sư', 'He is an engineer.', '/audio/engineer.mp3', 'Intermediate'),
(6, 'Nurse', 'nɜːrs', 'A person who assists doctors', 'Y tá', 'The nurse is helping.', '/audio/nurse.mp3', 'Intermediate'),

-- Weather
(7, 'Rain', 'reɪn', 'Water falling from the sky', 'Mưa', 'It is raining today.', '/audio/rain.mp3', 'Beginner'),
(7, 'Sun', 'sʌn', 'The star that gives us light', 'Mặt trời', 'The sun is hot.', '/audio/sun.mp3', 'Beginner'),
(7, 'Cloud', 'klaʊd', 'Visible mass of vapor', 'Mây', 'The cloud is white.', '/audio/cloud.mp3', 'Beginner'),
(7, 'Wind', 'wɪnd', 'Moving air', 'Gió', 'The wind is strong.', '/audio/wind.mp3', 'Beginner'),

-- Food
(8, 'Rice', 'raɪs', 'Staple food grain', 'Cơm', 'I eat rice for lunch.', '/audio/rice.mp3', 'Beginner'),
(8, 'Bread', 'brɛd', 'Baked food made of flour', 'Bánh mì', 'Bread is delicious.', '/audio/bread.mp3', 'Beginner'),
(8, 'Meat', 'miːt', 'Animal flesh for food', 'Thịt', 'I like eating meat.', '/audio/meat.mp3', 'Beginner'),
(8, 'Soup', 'suːp', 'Liquid food', 'Súp', 'Hot soup tastes good.', '/audio/soup.mp3', 'Beginner'),

-- Daily Activities
(9, 'Sleep', 'sliːp', 'To rest at night', 'Ngủ', 'I sleep eight hours a day.', '/audio/sleep.mp3', 'Beginner'),
(9, 'Eat', 'iːt', 'To consume food', 'Ăn', 'We eat dinner at 7 PM.', '/audio/eat.mp3', 'Beginner'),
(9, 'Read', 'riːd', 'To look at and understand words', 'Đọc', 'I read a book.', '/audio/read.mp3', 'Beginner'),
(9, 'Write', 'raɪt', 'To form words with pen or pencil', 'Viết', 'He writes a letter.', '/audio/write.mp3', 'Beginner');

COMMIT;
