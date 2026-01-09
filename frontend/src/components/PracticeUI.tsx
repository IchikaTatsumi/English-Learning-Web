'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, RotateCcw, Trophy, Loader2, AlertCircle } from 'lucide-react';
import { useVocabularyProgress } from '@/features/vocabulary-progress/hooks/vocabulary-progress.hook';
import { LearnedVocabularyDto } from '@/features/vocabulary-progress/dtos/vocabulary-progress.dto';
import { toast } from '@/lib/utils/toast';

interface PracticeQuestion {
  id: number;
  vocabId: number;
  type: 'WordToMeaning' | 'MeaningToWord';
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

  const { 
    fetchLearnedVocabularies, 
    submitPractice, 
    isLoading 
  } = useVocabularyProgress();

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

  // ✅ FIX 1: Truy cập đúng cấu trúc lồng nhau của LearnedVocabularyDto
  const generateQuestions = (vocabs: LearnedVocabularyDto[]): PracticeQuestion[] => {
    if (vocabs.length < 4) return [];

    const shuffled = [...vocabs].sort(() => 0.5 - Math.random()).slice(0, 10);

    return shuffled.map((item, index) => {
      // Truy cập vào property .vocabulary
      const targetVocab = item.vocabulary; 
      
      const otherVocabs = vocabs.filter(v => v.vocabulary.vocab_id !== targetVocab.vocab_id);
      const distractors = otherVocabs.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const isWordToMeaning = Math.random() > 0.5;
      
      // Sử dụng đúng tên trường snake_case từ DTO (meaning_en, word)
      const questionText = isWordToMeaning 
        ? `What does "${targetVocab.word}" mean?` 
        : `Which word means "${targetVocab.meaning_en}"?`;
        
      const correctAnswer = isWordToMeaning ? targetVocab.meaning_en : targetVocab.word;
      
      const options = [
        correctAnswer,
        ...distractors.map(d => isWordToMeaning ? d.vocabulary.meaning_en : d.vocabulary.word)
      ].sort(() => 0.5 - Math.random());

      return {
        id: index + 1,
        vocabId: targetVocab.vocab_id, // Lấy vocab_id
        type: isWordToMeaning ? 'WordToMeaning' : 'MeaningToWord',
        question: questionText,
        options,
        correctAnswer
      };
    });
  };

  const startPractice = async () => {
    try {
      const learnedVocabs = await fetchLearnedVocabularies();
      
      if (!learnedVocabs || learnedVocabs.length < 4) {
        toast.error("You need to learn at least 4 words to start practice!");
        return;
      }

      const generatedQuestions = generateQuestions(learnedVocabs);
      setQuestions(generatedQuestions);
      
      setMode('active');
      setCurrentIndex(0);
      setScore(0);
      setTimeLeft(30);
      setIsTimerActive(true);
      setSelectedAnswer('');
    } catch (error) {
      console.error("Failed to start practice", error);
      toast.error("Failed to load vocabulary data.");
    }
  };

  const handleNext = async () => {
    const current = questions[currentIndex];
    const answerToSubmit = selectedAnswer || ''; 
    const isCorrect = answerToSubmit === current.correctAnswer;

    // ✅ FIX 2: Cấu trúc payload khớp với SubmitPracticeDto
    if (answerToSubmit) {
        try {
            await submitPractice({
                vocab_id: current.vocabId, // snake_case
                answers: [
                  {
                    question_id: current.id,
                    question_type: current.type,
                    question_text: current.question,
                    correct_answer: current.correctAnswer,
                    user_answer: answerToSubmit,
                    is_correct: isCorrect
                  }
                ]
            });
        } catch (error) {
            console.error("Failed to submit answer", error);
        }
    }

    setQuestions(prev => prev.map((q, i) => 
      i === currentIndex ? { ...q, userAnswer: answerToSubmit, isCorrect } : q
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

  // --- RENDER SECTIONS --- (Giữ nguyên logic render)

  if (mode === 'setup') {
    return (
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-3xl mb-2 font-bold">Practice Mode</h1>
          <p className="text-gray-600">Review your learned vocabulary with interactive questions.</p>
        </div>

        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Ready to Practice?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-2xl text-blue-600 font-bold">10</p>
                  <p className="text-sm text-gray-600">Questions</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-2xl text-green-600 font-bold">30s</p>
                  <p className="text-sm text-gray-600">Per Question</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg">
                  <p className="text-2xl text-purple-600 font-bold">Mix</p>
                  <p className="text-sm text-gray-600">Types</p>
                </div>
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg flex gap-3 items-start">
                <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                <p className="text-sm text-yellow-700">
                  Questions are generated from words you have marked as "Learned". 
                  Results will update your progress statistics.
                </p>
              </div>

              <Button onClick={startPractice} className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...
                    </>
                ) : (
                    "Start Practice"
                )}
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
              <CardTitle className="text-2xl">Practice Complete!</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center">
                <p className="text-5xl font-bold text-blue-600 mb-2">{score}/{questions.length}</p>
                <p className="text-gray-600 font-medium">Correct Answers ({percentage}%)</p>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
                {questions.map((q) => (
                  <div key={q.id} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">{q.type}</Badge>
                      {q.isCorrect ? (
                        <div className="flex items-center text-green-600 text-sm font-medium">
                            <CheckCircle className="h-4 w-4 mr-1" /> Correct
                        </div>
                      ) : (
                        <div className="flex items-center text-red-600 text-sm font-medium">
                            <XCircle className="h-4 w-4 mr-1" /> Incorrect
                        </div>
                      )}
                    </div>
                    <p className="text-sm font-medium text-gray-900 mb-2">{q.question}</p>
                    {!q.isCorrect && (
                      <div className="text-sm grid grid-cols-2 gap-2 mt-2">
                        <div className="p-2 bg-red-50 text-red-700 rounded">
                            <span className="font-semibold">You:</span> {q.userAnswer || 'No answer'}
                        </div>
                        <div className="p-2 bg-green-50 text-green-700 rounded">
                            <span className="font-semibold">Answer:</span> {q.correctAnswer}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button onClick={reset} className="w-full" size="lg">
                <RotateCcw className="mr-2 h-4 w-4" />
                Practice Again
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // --- RENDER ACTIVE MODE ---
  const current = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="p-8 space-y-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                {current.type === 'WordToMeaning' ? 'Meaning' : 'Word'}
              </Badge>
              <Badge variant={timeLeft <= 10 ? "destructive" : "outline"} className="w-16 justify-center">
                {timeLeft}s
              </Badge>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <Card className="border-2 border-blue-50 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-xl md:text-2xl text-gray-800">
                {current.question}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="grid gap-3">
              {current.options.map((option, i) => (
                <Button
                  key={i}
                  variant={selectedAnswer === option ? "default" : "outline"}
                  className={`p-4 h-auto text-left justify-start text-base transition-all ${
                    selectedAnswer === option 
                        ? 'bg-blue-600 border-blue-600 ring-2 ring-blue-200' 
                        : 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200'
                  }`}
                  onClick={() => setSelectedAnswer(option)}
                >
                  <div className="flex items-center w-full">
                    <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 text-xs text-gray-500 mr-3 border">
                        {String.fromCharCode(65 + i)}
                    </span>
                    {option}
                  </div>
                </Button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm font-medium text-gray-500">
                Current Score: <span className="text-blue-600">{score}</span>
              </div>
              <Button onClick={handleNext} disabled={!selectedAnswer} size="lg" className="px-8">
                {currentIndex < questions.length - 1 ? 'Next Question' : 'Finish Practice'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}