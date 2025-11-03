// src/components/quiz/QuizUI.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
// Import DTOs và Hooks
import { QuizQuestionDto } from '@/features/quiz/dtos/quiz.dto'; 
// Giả định mockVocabulary đã được cập nhật ở VocabularyService
// import { mockVocabulary } from '@/data/mockData'; 
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

// Định nghĩa lại QuizQuestion để phù hợp với QuizQuestionDto và mock
interface MockQuizQuestion extends QuizQuestionDto {
    word: { word: string, id: number };
    userAnswer?: string;
    isCorrect?: boolean;
}

// Mock Vocabulary (cần đồng bộ với service)
const mockVocabulary = [
  { id: 1, word: 'Nocturnal', definition: 'Active during the night...', difficulty: 'B1', topicId: 1 },
  { id: 2, word: 'Hibemate', definition: 'To spend the winter in a dormant state...', difficulty: 'A2', topicId: 1 },
  { id: 3, word: 'Apple', definition: 'A common, round fruit...', difficulty: 'A1', topicId: 2 },
  { id: 4, word: 'Predator', definition: 'An animal that hunts and kills other animals for food', difficulty: 'B1', topicId: 1 },
  { id: 5, word: 'Erosion', definition: 'The wearing away of soil or rock by wind or water', difficulty: 'B2', topicId: 2 },
];


export function QuizUI() {
  const [quizMode, setQuizMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [questions, setQuestions] = useState<MockQuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  // Timer effect (Giữ nguyên)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizMode === 'active') {
      handleNextQuestion();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, quizMode]);

  const generateQuestions = (count: number = 5) => {
    const shuffledWords = [...mockVocabulary].sort(() => Math.random() - 0.5).slice(0, count);
    
    const newQuestions: MockQuizQuestion[] = shuffledWords.map((word, index) => {
      // Logic tạo câu hỏi giả lập (multiple-choice)
      const wrongAnswers = mockVocabulary
        .filter(w => w.id !== word.id)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3)
        .map(w => w.definition);
      
      const options = [word.definition, ...wrongAnswers].sort(() => Math.random() - 0.5);
      
      return {
        id: `q${index}`,
        quizId: 'mock-quiz-1',
        type: 'multiple-choice',
        word: { word: word.word, id: word.id }, // Lưu trữ word cho mục đích hiển thị
        question: `What does "${word.word}" mean?`,
        options,
        correctAnswer: word.definition,
        vocabularyId: word.id.toString() // Dùng ID number
      };
    });
    
    setQuestions(newQuestions);
  };

  const startQuiz = () => {
    generateQuestions();
    setQuizMode('active');
    setCurrentQuestionIndex(0);
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(true);
    setSelectedAnswer('');
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    
    // Update question with user answer
    setQuestions(prev => prev.map((q, index) => 
      index === currentQuestionIndex 
        ? { ...q, userAnswer: selectedAnswer, isCorrect }
        : q
    ));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
    } else {
      setQuizMode('results');
      setIsTimerActive(false);
    }
  };

  const resetQuiz = () => {
    setQuizMode('setup');
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  // UI Setup (Giữ nguyên)
  if (quizMode === 'setup') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Quiz</h1>
          <p className="text-gray-600">Test your vocabulary knowledge</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Start?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl text-blue-600">5</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl text-green-600">30s</p>
                  <p className="text-sm text-gray-600">Per Question</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl text-purple-600">Mixed</p>
                  <p className="text-sm text-gray-600">Difficulty</p>
                </div>
              </div>
              <Button onClick={startQuiz} className="w-full" size="lg">
                Start Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // UI Results (Giữ nguyên)
  if (quizMode === 'results') {
    const percentage = Math.round((score / questions.length) * 100);
    
    return (
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl text-blue-600 mb-2">{score}/{questions.length}</p>
                <p className="text-gray-600">Correct Answers ({percentage}%)</p>
              </div>
              
              <div className="space-y-3">
                {questions.map((question) => (
                  <div key={question.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p>{question.word.word}</p>
                      <p className="text-sm text-gray-600">{question.question}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {question.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Take Another Quiz
                </Button>
                <Button onClick={() => {}} className="flex-1">
                  Review Mistakes
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // UI Active Quiz (Giữ nguyên)
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress Header */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Time:</span>
              <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>
                {timeLeft}s
              </Badge>
            </div>
          </div>
          <Progress value={progress} />
        </div>
        {/*  */}

        {/* Question Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-center">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {currentQuestion.options?.map((option, index) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className="p-4 h-auto text-left justify-start"
                  onClick={() => handleAnswerSelect(option)}
                >
                  {option}
                </Button>
              ))}
            </div>
            
            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                Score: {score}/{currentQuestionIndex}
              </div>
              <Button 
                onClick={handleNextQuestion}
                disabled={!selectedAnswer}
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}