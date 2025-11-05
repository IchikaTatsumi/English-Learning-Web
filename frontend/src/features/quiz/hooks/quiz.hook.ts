'use client';

import { useState, useCallback } from 'react';
import { quizService } from '../services/quiz.service';
import { QuizDto, QuizQuestionDto } from '../dto/quiz.dto';

export function useQuiz(quizId?: string) {
  const [quiz, setQuiz] = useState<QuizDto | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuiz(id);
      setQuiz(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchQuestions = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuizQuestions(id);
      setQuestions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    quiz,
    questions,
    fetchQuiz,
    fetchQuestions,
    isLoading,
    error
  };
}
