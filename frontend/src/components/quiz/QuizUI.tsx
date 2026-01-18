'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuiz } from '@/features/quiz/hooks/quiz.hook';
import { useResults } from '@/features/results/hooks/result.hook';
import { useAuth } from '@/features/auth';
import { CheckCircle, XCircle, RotateCcw, Trophy, ArrowRight, Clock, PlayCircle, ListChecks, FileText, Mic } from 'lucide-react';
import { QuizQuestionResponseDto } from '@/features/quiz/dtos/quiz.dto';
import { toast } from '@/lib/utils/toast';

// ✅ Import Component ghi âm và Interface kết quả
import { MicroRecordingButton, RecognitionResult } from '@/components/buttons/MicroRecordingButton';

interface AnsweredQuestion extends QuizQuestionResponseDto {
  userAnswer: string;
  isCorrect: boolean;
}

export function QuizUI() {
  const router = useRouter();
  const { user } = useAuth();
  
  const { quiz, questions, createQuiz, fetchQuizQuestions, isLoading, resetQuizState } = useQuiz();
  const { createResult } = useResults();

  const [quizMode, setQuizMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const [answeredQuestions, setAnsweredQuestions] = useState<AnsweredQuestion[]>([]);

  // Timer Logic
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

  const startQuiz = async () => {
    if (!user) {
        toast.error("Please login to start quiz");
        return;
    }

    try {
      if (resetQuizState) resetQuizState();

      const newQuiz = await createQuiz({
        difficultyLevel: 'Mixed Levels',
        totalQuestions: 5
      });

      if (newQuiz) {
          await fetchQuizQuestions({ limit: 5 }); 
          setQuizMode('active');
          setCurrentQuestionIndex(0);
          setScore(0);
          setTimeLeft(30);
          setIsTimerActive(true);
          setSelectedAnswer('');
          setAnsweredQuestions([]);
      }
    } catch (error) {
      console.error('Error starting quiz:', error);
      const msg = error instanceof Error ? error.message : "Failed to start quiz";
      toast.error(msg);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  // ✅ Hàm xử lý khi ghi âm xong
  const handleRecordingComplete = (result: RecognitionResult) => {
    // Lưu text người dùng nói vào state selectedAnswer
    setSelectedAnswer(result.recognizedText);
    
    // Nếu muốn tự động Next khi đúng, có thể mở comment dưới:
    // if (result.isCorrect) { setTimeout(handleNextQuestion, 1500); }
  };

  const handleNextQuestion = async () => {
    if (!quiz || !user) return;

    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Logic kiểm tra đúng sai
    // Nếu là Pronunciation, MicroButton đã check đúng sai rồi, nhưng ta check lại text cho chắc
    // Hoặc ta so sánh string (đảm bảo lowercase để so sánh không phân biệt hoa thường)
    const isCorrect = selectedAnswer.toLowerCase().trim() === currentQuestion.correct_answer.toLowerCase().trim();

    try {
      if (selectedAnswer) { 
        await createResult({
          quiz_id: quiz.quiz_id,
          quiz_question_id: currentQuestion.quiz_question_id,
          user_id: user.id,
          user_answer: selectedAnswer,
          is_correct: isCorrect
        });
      }
    } catch (error) {
      console.error('Error saving result:', error);
    }

    setAnsweredQuestions(prev => [...prev, {
      ...currentQuestion,
      userAnswer: selectedAnswer || 'No Answer',
      isCorrect
    }]);

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

  const handleReset = () => {
    if (resetQuizState) resetQuizState();
    setQuizMode('setup');
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(false);
    setAnsweredQuestions([]);
  };

  const currentQuestion = questions[currentQuestionIndex];
  
  // Logic Options (Chỉ dùng cho trắc nghiệm)
  const questionOptions = useMemo(() => {
    if (!currentQuestion) return [];
    
    // Nếu là câu hỏi phát âm, không cần tạo options
    if (currentQuestion.question_type === 'Pronunciation' || currentQuestion.question_type === 'SpeechToWord') {
        return []; 
    }

    if (currentQuestion.options && currentQuestion.options.length > 0) {
      return currentQuestion.options;
    }
    
    if (currentQuestion.incorrect_answers && currentQuestion.incorrect_answers.length > 0) {
        const opts = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
        return opts.sort(() => Math.random() - 0.5);
    }

    return [currentQuestion.correct_answer, 'Wrong A', 'Wrong B', 'Wrong C'].sort(() => Math.random() - 0.5);
  }, [currentQuestion]);

  if (isLoading) {
    return (
      <div className="p-8 space-y-6 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-gray-500 font-medium">Preparing your random quiz...</p>
      </div>
    );
  }

  // --- RENDER: SETUP SCREEN (Giữ nguyên) ---
  if (quizMode === 'setup') {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-slate-800">Practice Quiz</h1>
          <p className="text-slate-500">Test your knowledge with 5 random questions from our bank.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlayCircle className="h-5 w-5 text-blue-600" />
                Ready to Practice?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 flex flex-col items-center">
                  <ListChecks className="h-6 w-6 text-blue-500 mb-2" />
                  <p className="text-2xl font-bold text-blue-700">5</p>
                  <p className="text-sm text-blue-600 font-medium">Random Questions</p>
                </div>
                <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex flex-col items-center">
                  <Clock className="h-6 w-6 text-green-500 mb-2" />
                  <p className="text-2xl font-bold text-green-700">30s</p>
                  <p className="text-sm text-green-600 font-medium">Per Question</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 flex flex-col items-center">
                  <FileText className="h-6 w-6 text-purple-500 mb-2" />
                  <p className="text-2xl font-bold text-purple-700">Mixed</p>
                  <p className="text-sm text-purple-600 font-medium">Difficulty</p>
                </div>
              </div>

              <Button 
                onClick={startQuiz} 
                className="w-full h-14 text-lg font-semibold bg-slate-900 hover:bg-slate-800 transition-all active:scale-[0.99]" 
                size="lg"
              >
                Start Practice Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER: RESULTS SCREEN (Giữ nguyên) ---
  if (quizMode === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-slate-200 shadow-md overflow-hidden">
            <CardHeader className="text-center bg-slate-50/50 pb-6 border-b border-slate-100">
              <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4 shadow-sm">
                <Trophy className="h-10 w-10 text-yellow-600" />
              </div>
              <CardTitle className="text-3xl font-bold text-slate-800">Quiz Complete!</CardTitle>
              <p className="text-slate-500 mt-1">Here is how you performed</p>
            </CardHeader>
            
            <CardContent className="space-y-8 pt-8">
              <div className="text-center">
                <div className="inline-flex items-baseline gap-1 mb-2">
                  <span className="text-6xl font-black text-blue-600 tracking-tight">{score}</span>
                  <span className="text-3xl font-bold text-slate-300">/{questions.length}</span>
                </div>
                <div>
                  <Badge 
                    variant={percentage >= 80 ? "default" : "secondary"} 
                    className={`text-base px-4 py-1.5 font-medium ${
                      percentage >= 80 ? 'bg-green-100 text-green-700 hover:bg-green-100' : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {percentage}% Accuracy
                  </Badge>
                </div>
              </div>

              {/* Review Section */}
              <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Review Answers</h3>
                {answeredQuestions.map((question, index) => (
                  <div key={index} className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-start gap-4">
                      <div className="mt-1 flex-shrink-0">
                        {question.isCorrect ? (
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        ) : (
                          <XCircle className="h-6 w-6 text-red-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1.5">
                          <Badge variant="outline" className="text-[10px] uppercase font-bold text-slate-500">
                            {question.question_type}
                          </Badge>
                        </div>
                        <p className="font-semibold text-slate-800 mb-3 text-lg">{question.question_text}</p>
                        
                        {!question.isCorrect && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                            <div className="p-3 bg-red-50 text-red-800 rounded-lg border border-red-100">
                              <span className="font-bold text-xs uppercase block text-red-400 mb-1">Your Answer</span>
                              {question.userAnswer}
                            </div>
                            <div className="p-3 bg-green-50 text-green-800 rounded-lg border border-green-100">
                              <span className="font-bold text-xs uppercase block text-green-400 mb-1">Correct Answer</span>
                              {question.correct_answer}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4 pt-4 border-t border-slate-100">
                <Button onClick={handleReset} variant="outline" className="flex-1 h-12 text-base font-medium">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Try Again
                </Button>
                <Button onClick={() => router.push('/dashboard/learned')} className="flex-1 h-12 text-base font-medium bg-blue-600 hover:bg-blue-700">
                  Back to Learning
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER: ACTIVE QUIZ ---
  if (!currentQuestion) {
    return <div className="p-10 text-center text-slate-400">Unable to load question. Please try refreshing.</div>;
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  // ✅ Xác định loại câu hỏi để render UI phù hợp
  const isPronunciation = currentQuestion.question_type === 'Pronunciation' || currentQuestion.question_type === 'SpeechToWord';

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Progress & Info */}
        <div className="space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-wide">Question {currentQuestionIndex + 1} of {questions.length}</p>
              <h2 className="text-lg font-bold text-slate-800 mt-1 capitalize">
                {currentQuestion.question_type.replace(/([A-Z])/g, ' $1').trim()}
              </h2>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <Clock className="h-4 w-4 text-slate-500" />
              <span className={`font-mono font-bold ${timeLeft <= 10 ? 'text-red-500' : 'text-slate-700'}`}>
                {timeLeft}s
              </span>
            </div>
          </div>
          <Progress value={progress} className="h-2 w-full bg-slate-100 [&>*]:bg-blue-600" />
        </div>

        {/* Question Card */}
        <Card className="border border-slate-200 shadow-lg overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-8 pt-8 text-center border-b border-slate-100">
            <div className="flex justify-center mb-4">
               {isPronunciation ? (
                 <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <Mic className="w-8 h-8 text-purple-600" />
                 </div>
               ) : (
                 <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <ListChecks className="w-8 h-8 text-blue-600" />
                 </div>
               )}
            </div>
            <CardTitle className="text-2xl md:text-3xl font-bold text-slate-800 leading-snug">
              {currentQuestion.question_text}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-6 md:p-8 space-y-6">
            
            {/* ✅ RENDERING LOGIC: Dựa vào loại câu hỏi */}
            {isPronunciation ? (
                // --- UI GHI ÂM ---
                <div className="flex flex-col items-center justify-center py-6 space-y-6">
                    <p className="text-gray-500 text-center">Click the button below and speak the word clearly.</p>
                    
                    <MicroRecordingButton
                        vocabId={currentQuestion.vocab_id}
                        targetWord={currentQuestion.correct_answer}
                        onRecordingComplete={handleRecordingComplete}
                        className="scale-125" // Phóng to nút ghi âm một chút
                    />

                    {selectedAnswer && (
                        <div className="mt-4 p-4 bg-slate-50 rounded-lg w-full text-center">
                            <span className="text-sm text-gray-500 uppercase font-bold block mb-1">Recognized Text</span>
                            <span className="text-xl font-medium text-slate-800">{selectedAnswer}</span>
                        </div>
                    )}
                </div>
            ) : (
                // --- UI TRẮC NGHIỆM (Giữ nguyên) ---
                <div className="grid gap-3">
                {questionOptions.map((option: string, index: number) => (
                    <button
                    key={index}
                    onClick={() => handleAnswerSelect(option)}
                    className={`
                        w-full p-4 text-left rounded-xl border-2 transition-all duration-200 flex items-center group
                        ${selectedAnswer === option 
                        ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100 ring-offset-2' 
                        : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
                        }
                    `}
                    >
                    <span className={`
                        w-8 h-8 flex items-center justify-center rounded-lg text-sm font-bold mr-4 border transition-colors
                        ${selectedAnswer === option 
                        ? 'bg-blue-600 text-white border-blue-600' 
                        : 'bg-white text-slate-500 border-slate-200 group-hover:border-blue-300 group-hover:text-blue-600'
                        }
                    `}>
                        {String.fromCharCode(65 + index)}
                    </span>
                    <span className={`font-medium text-lg ${selectedAnswer === option ? 'text-blue-900' : 'text-slate-700'}`}>
                        {option}
                    </span>
                    </button>
                ))}
                </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-6">
              <div className="text-sm font-medium text-slate-400">
                Score: <span className="text-slate-900">{score}</span>
              </div>
              <Button 
                onClick={handleNextQuestion} 
                disabled={!selectedAnswer && timeLeft > 0} 
                size="lg" 
                className="px-8 bg-blue-600 hover:bg-blue-700 h-12 text-base shadow-md shadow-blue-200 disabled:opacity-50 disabled:shadow-none"
              >
                {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}