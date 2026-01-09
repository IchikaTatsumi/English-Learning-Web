'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // ✅ FIX: Dùng Router của Next.js
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuiz } from '@/features/quiz/hooks/quiz.hook';
import { useResults } from '@/features/results/hooks/result.hook';
import { useAuth } from '@/features/auth';
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight } from 'lucide-react';
import { QuizQuestionResponseDto } from '@/features/quiz/dtos/quiz.dto';

// ✅ Định nghĩa kiểu dữ liệu cho lịch sử trả lời
interface AnsweredQuestion extends QuizQuestionResponseDto {
  userAnswer: string;
  isCorrect: boolean;
}

export function QuizUI() {
  const router = useRouter(); // ✅ FIX: Init router
  const { user } = useAuth();
  
  const { quiz, questions, createQuiz, fetchQuizQuestions, isLoading } = useQuiz();
  const { createResult } = useResults();

  const [quizMode, setQuizMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  // ✅ FIX: Sử dụng type cụ thể thay vì any[]
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);

  // Logic Timer giữ nguyên (đã ổn)
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && quizMode === 'active') {
      handleNextQuestion(); // Hết giờ tự động next
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, quizMode]);

  const startQuiz = async () => {
    if (!user) return;

    try {
      // Gọi API tạo Quiz mới
      await createQuiz({
        difficulty_level: 'Mixed Levels', // Có thể đưa ra state để người dùng chọn
        total_questions: 5
      });

      // Lấy câu hỏi
      await fetchQuizQuestions({ limit: 5 });
      
      // Reset trạng thái
      setQuizMode('active');
      setCurrentQuestionIndex(0);
      setScore(0);
      setTimeLeft(30);
      setIsTimerActive(true);
      setSelectedAnswer('');
      setAnsweredQuestions([]);
    } catch (error) {
      console.error('Error starting quiz:', error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = async () => {
    if (!quiz || !user) return;

    const currentQuestion = questions[currentQuestionIndex];
    // Nếu hết giờ mà chưa chọn thì coi như sai (selectedAnswer rỗng)
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // 1. Lưu kết quả ngay lập tức (Real-time submission)
    try {
      if (selectedAnswer) { // Chỉ submit nếu có câu trả lời (hoặc tùy logic business)
        await createResult({
          quiz_id: quiz.quiz_id,
          quiz_question_id: currentQuestion.quiz_question_id,
          user_id: user.id, // Đã fix ở file trước
          user_answer: selectedAnswer,
          is_correct: isCorrect
        });
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }

    // 2. Lưu vào state để hiển thị kết quả cuối cùng
    setAnsweredQuestions(prev => [...prev, {
      ...currentQuestion,
      userAnswer: selectedAnswer || 'No Answer', // Xử lý trường hợp không trả lời
      isCorrect
    }]);

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    // 3. Chuyển câu hỏi hoặc kết thúc
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTimeLeft(30); // Reset timer
    } else {
      setQuizMode('results');
      setIsTimerActive(false);
    }
  };

  const resetQuiz = () => {
    setQuizMode('setup');
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(false);
    setAnsweredQuestions([]);
  };

  // --- RENDER LOADING ---
  if (isLoading) {
    return (
      <div className="p-8 space-y-6 flex justify-center">
        <div className="text-center animate-pulse text-gray-500">Preparing your quiz...</div>
      </div>
    );
  }

  // --- RENDER SETUP ---
  if (quizMode === 'setup') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl mb-2 font-bold">Practice Quiz</h1>
          <p className="text-gray-600">Test your vocabulary knowledge with interactive questions</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-2xl text-blue-600 font-bold">5</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-2xl text-green-600 font-bold">30s</p>
                  <p className="text-sm text-gray-600">Per Question</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-2xl text-purple-600 font-bold">Mixed</p>
                  <p className="text-sm text-gray-600">Difficulty</p>
                </div>
              </div>

              <Button onClick={startQuiz} className="w-full h-12 text-lg" size="lg">
                Start Practice Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER RESULTS ---
  if (quizMode === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4 animate-bounce">
                <Trophy className="h-10 w-10 text-blue-600" />
              </div>
              <CardTitle className="text-3xl font-bold">Quiz Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-extrabold text-blue-600 mb-2">
                  {score}<span className="text-2xl text-gray-400">/{questions.length}</span>
                </p>
                <Badge variant={percentage >= 80 ? "default" : "secondary"} className="text-lg px-4 py-1">
                  {percentage}% Accuracy
                </Badge>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                {answeredQuestions.map((question, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="outline" className="text-xs uppercase">
                            {question.question_type}
                          </Badge>
                          {question.isCorrect ? (
                            <span className="flex items-center text-green-600 text-sm font-medium">
                              <CheckCircle className="h-4 w-4 mr-1" /> Correct
                            </span>
                          ) : (
                            <span className="flex items-center text-red-600 text-sm font-medium">
                              <XCircle className="h-4 w-4 mr-1" /> Incorrect
                            </span>
                          )}
                        </div>
                        <p className="font-medium text-gray-800 mb-2">{question.question_text}</p>
                        
                        {!question.isCorrect && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                            <div className="p-2 bg-red-50 text-red-700 rounded border border-red-100">
                              <span className="font-semibold block text-xs uppercase mb-1">Your Answer</span>
                              {question.userAnswer}
                            </div>
                            <div className="p-2 bg-green-50 text-green-700 rounded border border-green-100">
                              <span className="font-semibold block text-xs uppercase mb-1">Correct Answer</span>
                              {question.correct_answer}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={resetQuiz} variant="outline" className="flex-1 h-11">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                {/* ✅ FIX: Sử dụng router.push thay vì window.location */}
                <Button onClick={() => router.push('/main/learned')} className="flex-1 h-11">
                  Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER ACTIVE QUIZ ---
  const currentQuestion = questions[currentQuestionIndex];
  
  if (!currentQuestion) {
    return <div className="p-8 text-center text-gray-500">Something went wrong. Please restart the quiz.</div>;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // ✅ Logic options an toàn hơn: Nếu không có options từ API, dùng mảng rỗng để tránh lỗi
  const questionOptions = currentQuestion.options && currentQuestion.options.length > 0 
    ? currentQuestion.options 
    : [currentQuestion.correct_answer]; // Fallback tối thiểu

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-500">
              Question {currentQuestionIndex + 1} / {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {currentQuestion.question_type.replace(/([A-Z])/g, ' $1').trim()}
              </Badge>
              <Badge 
                variant={timeLeft <= 10 ? "destructive" : "secondary"} 
                className="w-16 justify-center transition-colors duration-300"
              >
                {timeLeft}s
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2 w-full" />
        </div>

        {/* Question Card */}
        <Card className="border-2 border-blue-50 shadow-lg">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-xl md:text-2xl text-gray-800 leading-relaxed">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-3">
              {questionOptions.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`p-4 h-auto text-left justify-start text-base transition-all duration-200 ${
                    selectedAnswer === option 
                      ? 'bg-blue-600 border-blue-600 ring-2 ring-blue-200' 
                      : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                  }`}
                  onClick={() => handleAnswerSelect(option)}
                >
                  <div className="flex items-center w-full">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-full text-sm mr-3 border transition-colors ${
                       selectedAnswer === option ? 'bg-blue-500 text-white border-blue-500' : 'bg-gray-50 text-gray-500 border-gray-200'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    {option}
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-6 border-t mt-4">
              <div className="text-sm font-medium text-gray-500">
                Score: <span className="text-blue-600">{score}</span>
              </div>
              <Button 
                onClick={handleNextQuestion} 
                disabled={!selectedAnswer && timeLeft > 0} // Chỉ disable khi còn giờ và chưa chọn
                size="lg" 
                className="px-8 transition-all"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}