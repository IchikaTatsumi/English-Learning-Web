'use client';

import { useState, useCallback } from 'react';
import { quizService } from '../services/quiz.service';
import { 
  CreateQuizDto, 
  QuizResponseDto, 
  SubmitQuizDto, 
  QuizStatisticsDto,
  QuizQuestionResponseDto 
} from '../dtos/quiz.dto';

export function useQuiz() {
  const [quizzes, setQuizzes] = useState<QuizResponseDto[]>([]);
  // ✅ FIX: Hợp nhất 'quiz' và 'currentQuiz' thành 1 state duy nhất để tránh nhầm lẫn
  const [quiz, setQuiz] = useState<QuizResponseDto | null>(null);
  
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
      setQuiz(newQuiz);
      return newQuiz;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create quiz';
      setError(message);
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
      const message = err instanceof Error ? err.message : 'Failed to fetch quizzes';
      setError(message);
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
      setQuiz(fetchedQuiz);
      return fetchedQuiz;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch quiz';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Fetch quiz questions (Random practice)
   * ✅ FIX: Map tham số 'limit' thành 'count' cho khớp với Service
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
      const message = err instanceof Error ? err.message : 'Failed to fetch questions';
      setError(message);
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
      const message = err instanceof Error ? err.message : 'Failed to submit quiz';
      setError(message);
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
      const message = err instanceof Error ? err.message : 'Failed to fetch statistics';
      setError(message);
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
      if (quiz?.quiz_id === quizId) {
        setQuiz(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete quiz';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [quiz]);

  /**
   * Reset state (Dùng khi rời khỏi trang quiz)
   */
  const resetQuizState = useCallback(() => {
    setQuiz(null);
    setQuestions([]);
    setError(null);
  }, []);

  return {
    quizzes,
    quiz,         // State chính chứa Quiz hiện tại
    questions,
    statistics,
    isLoading,
    error,
    createQuiz,
    fetchUserQuizzes,
    fetchQuizById,
    fetchQuizQuestions, // Hàm này gọi API random questions
    submitQuiz,
    fetchStatistics,
    deleteQuiz,
    resetQuizState,     // Hàm dọn dẹp state
  };
}

/**
 * Hook for single quiz operations (Dùng cho trang Detail nếu cần)
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
      const message = err instanceof Error ? err.message : 'Failed to fetch quiz';
      setError(message);
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