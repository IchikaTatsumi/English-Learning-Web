'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Trophy } from 'lucide-react';

interface PracticeQuestion {
  id: number;
  type: 'WordToMeaning' | 'MeaningToWord' | 'VietnameseToWord' | 'Pronunciation';
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

export function PracticeUI() {
  const [mode, setMode] = useState<'setup' | 'active' | 'results'>('setup');
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimerActive, setIsTimerActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(time => time - 1);
      }, 1000);
    } else if (timeLeft === 0 && mode === 'active') {
      handleNext();
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, mode]);

  const startPractice = () => {
    // In a real app, this would fetch questions from API
    const mockQuestions: PracticeQuestion[] = [
      {
        id: 1,
        type: 'WordToMeaning',
        question: 'What does "Hello" mean?',
        options: ['Used as a greeting', 'Used when parting', 'Expression of gratitude', 'Used to express apology'],
        correctAnswer: 'Used as a greeting'
      },
      // Add more mock questions here
    ];

    setQuestions(mockQuestions);
    setMode('active');
    setCurrentIndex(0);
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(true);
    setSelectedAnswer('');
  };

  const handleNext = () => {
    const current = questions[currentIndex];
    const isCorrect = selectedAnswer === current.correctAnswer;

    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex ? { ...q, userAnswer: selectedAnswer, isCorrect } : q
    ));

    if (isCorrect) setScore(prev => prev + 1);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedAnswer('');
      setTimeLeft(30);
    } else {
      setMode('results');
      setIsTimerActive(false);
    }
  };

  const reset = () => {
    setMode('setup');
    setQuestions([]);
    setCurrentIndex(0);
    setSelectedAnswer('');
    setScore(0);
    setTimeLeft(30);
    setIsTimerActive(false);
  };

  if (mode === 'setup') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl mb-2">Practice Mode</h1>
          <p className="text-gray-600">Practice learned vocabulary with interactive questions</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
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

              <Button onClick={startPractice} className="w-full" size="lg">
                Start Practice
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (mode === 'results') {
    const percentage = questions.length > 0 ? Math.round((score / questions.length) * 100) : 0;

    return (
      <div className="p-8 space-y-6">
        <div className="max-w-2xl mx-auto">
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
                {questions.map((q) => (
                  <div key={q.id} className="p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline">{q.type}</Badge>
                      {q.isCorrect ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{q.question}</p>
                    {!q.isCorrect && (
                      <div className="text-sm">
                        <p className="text-red-600">Your answer: {q.userAnswer || 'No answer'}</p>
                        <p className="text-green-600">Correct: {q.correctAnswer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={reset} className="w-full">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const current = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{current.type}</Badge>
              <Badge variant={timeLeft <= 10 ? "destructive" : "secondary"}>
                {timeLeft}s
              </Badge>
            </div>
          </div>
          <Progress value={progress} />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">{current.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3">
              {current.options.map((option, i) => (
                <Button
                  key={i}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className="p-4 h-auto text-left justify-start"
                  onClick={() => setSelectedAnswer(option)}
                >
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4">
              <div className="text-sm text-gray-500">
                Score: {score}/{currentIndex}
              </div>
              <Button onClick={handleNext} disabled={!selectedAnswer}>
                {currentIndex < questions.length - 1 ? 'Next' : 'Finish'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
