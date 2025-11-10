'use client';

import { useState, useCallback } from 'react';
import { quizService } from '../services/quiz.service';
import { 
  CreateQuizDto, 
  QuizResponseDto, 
  SubmitQuizDto, 
  QuizResultDto,
  QuizStatisticsDto,
  QuizQuestionResponseDto 
} from '../dtos/quiz.dto';

export function useQuiz() {
  const [quizzes, setQuizzes] = useState<QuizResponseDto[]>([]);
  // ✅ ADDED: quiz (singular) for current active quiz
  const [quiz, setQuiz] = useState<QuizResponseDto | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizResponseDto | null>(null);
  const [questions, setQuestions] = useState<QuizQuestionResponseDto[]>([]);
  const [statistics, setStatistics] = useState<QuizStatisticsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Create new quiz
   */
  const createQuiz = useCallback(async (dto: CreateQuizDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newQuiz = await quizService.createQuiz(dto);
      setCurrentQuiz(newQuiz);
      // ✅ ADDED: Set quiz (singular)
      setQuiz(newQuiz);
      return newQuiz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch all user quizzes
   */
  const fetchUserQuizzes = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getUserQuizzes();
      setQuizzes(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quizzes');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch quiz by ID
   */
  const fetchQuizById = useCallback(async (quizId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedQuiz = await quizService.getQuizById(quizId);
      setCurrentQuiz(fetchedQuiz);
      setQuiz(fetchedQuiz);
      return fetchedQuiz;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * ✅ ADDED: Fetch quiz questions
   */
  const fetchQuizQuestions = useCallback(async (params?: { limit?: number }) => {
    setIsLoading(true);
    setError(null);
    try {
      const count = params?.limit || 10;
      const data = await quizService.getRandomQuestions(count);
      setQuestions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch questions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Submit quiz answers
   */
  const submitQuiz = useCallback(async (quizId: number, dto: SubmitQuizDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await quizService.submitQuiz(quizId, dto);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch quiz statistics
   */
  const fetchStatistics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const stats = await quizService.getQuizStatistics();
      setStatistics(stats);
      return stats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete quiz
   */
  const deleteQuiz = useCallback(async (quizId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await quizService.deleteQuiz(quizId);
      setQuizzes(prev => prev.filter(q => q.quiz_id !== quizId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch random questions for practice
   */
  const fetchRandomQuestions = useCallback(async (count: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getRandomQuestions(count);
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
    quizzes,
    // ✅ ADDED: Export both quiz and currentQuiz
    quiz,
    currentQuiz,
    questions,
    statistics,
    isLoading,
    error,
    createQuiz,
    fetchUserQuizzes,
    fetchQuizById,
    // ✅ ADDED: Export fetchQuizQuestions
    fetchQuizQuestions,
    submitQuiz,
    fetchStatistics,
    deleteQuiz,
    fetchRandomQuestions,
  };
}

/**
 * Hook for single quiz operations
 */
export function useQuizById(quizId?: number) {
  const [quiz, setQuiz] = useState<QuizResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuiz = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizService.getQuizById(id);
      setQuiz(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quiz');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    quiz,
    isLoading,
    error,
    fetchQuiz,
  };
}