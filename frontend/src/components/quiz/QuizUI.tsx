'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useQuiz } from '@/features/quiz/hooks/quiz.hook';
import { useResults } from '@/features/results/hooks/result.hook';
import { useAuth } from '@/features/auth';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';
import { QuizQuestionDto } from '@/features/quiz/dtos/quiz.dto';

export function QuizUI() {
  const { user } = useAuth();
  const { quiz, questions, createQuiz, fetchQuizQuestions, isLoading } = useQuiz();
  const { createResult } = useResults();

  const [quizMode, setQuizMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState<any[]>([]);

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
    if (!user) return;

    try {
      const newQuiz = await createQuiz({
        user_id: user.user_id,
        difficulty_mode: 'Mixed Levels',
        total_questions: 5
      });

      await fetchQuizQuestions({ limit: 5 });
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
    const isCorrect = selectedAnswer === currentQuestion.correct_answer;

    // Save result
    try {
      await createResult({
        quiz_id: quiz.quiz_id,
        quiz_question_id: currentQuestion.quiz_question_id,
        user_id: user.user_id,
        user_answer: selectedAnswer,
        is_correct: isCorrect
      });
    } catch (error) {
      console.error('Error saving result:', error);
    }

    setAnsweredQuestions(prev => [...prev, {
      ...currentQuestion,
      userAnswer: selectedAnswer,
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

  const resetQuiz = () => {
    setQuizMode('setup');
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(false);
    setAnsweredQuestions([]);
  };

  if (isLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">Loading quiz...</div>
      </div>
    );
  }

  if (quizMode === 'setup') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Practice Quiz</h1>
          <p className="text-gray-600">Test your vocabulary knowledge with 4 question types</p>
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
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
                  <p className="text-2xl text-purple-600">4</p>
                  <p className="text-sm text-gray-600">Question Types</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <p className="font-medium">Question Types:</p>
                <ul className="text-sm text-gray-600 space-y-1 ml-4">
                  <li>• <strong>Word → Meaning:</strong> Choose the correct definition</li>
                  <li>• <strong>Meaning → Word:</strong> Choose the correct word</li>
                  <li>• <strong>Vietnamese → Word:</strong> Choose the English word</li>
                  <li>• <strong>Pronunciation → Word:</strong> Choose the word with given pronunciation</li>
                </ul>
              </div>

              <Button onClick={startQuiz} className="w-full" size="lg">
                Start Practice Quiz
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (quizMode === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Trophy className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle>Practice Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-4xl text-blue-600 mb-2">{score}/{questions.length}</p>
                <p className="text-gray-600">Correct Answers ({percentage}%)</p>
              </div>

              <div className="space-y-3">
                {answeredQuestions.map((question, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {question.question_type}
                          </Badge>
                          {question.isCorrect ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-600" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">{question.question_text}</p>
                        {!question.isCorrect && (
                          <div className="mt-2 text-sm">
                            <p className="text-red-600">Your answer: {question.userAnswer || 'No answer'}</p>
                            <p className="text-green-600">Correct answer: {question.correct_answer}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <Button onClick={resetQuiz} variant="outline" className="flex-1">
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Practice Again
                </Button>
                <Button onClick={() => window.location.href = '/dashboard/learned'} className="flex-1">
                  Back to Learned Words
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (!currentQuestion) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">No questions available</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {currentQuestion.question_type}
              </Badge>
              <span className="text-sm text-gray-600">Time:</span>
              <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>
                {timeLeft}s
              </Badge>
            </div>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{currentQuestion.question_text}</CardTitle>
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
