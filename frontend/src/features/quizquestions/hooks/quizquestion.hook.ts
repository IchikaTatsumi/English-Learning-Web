'use client';

import { useState, useCallback } from 'react';
import { quizQuestionService } from '../services/quizquestion.service';
import {
  CreateQuizQuestionDto,
  QuizQuestionResponseDto,
} from '../dtos/quizquestion.dto';

export function useQuizQuestions() {
  const [questions, setQuestions] = useState<QuizQuestionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch random questions for practice
   */
  const fetchRandomQuestions = useCallback(async (count: number = 10) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizQuestionService.getRandomQuestions(count);
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
   * Create new question (Admin only)
   */
  const createQuestion = useCallback(async (dto: CreateQuizQuestionDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const question = await quizQuestionService.createQuestion(dto);
      setQuestions(prev => [...prev, question]);
      return question;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete question (Admin only)
   */
  const deleteQuestion = useCallback(async (questionId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await quizQuestionService.deleteQuestion(questionId);
      setQuestions(prev => prev.filter(q => q.quiz_question_id !== questionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    questions,
    isLoading,
    error,
    fetchRandomQuestions,
    createQuestion,
    deleteQuestion,
  };
}

/**
 * Hook for single question operations
 */
export function useQuizQuestion(questionId?: number) {
  const [question, setQuestion] = useState<QuizQuestionResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestion = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await quizQuestionService.getQuestionById(id);
      setQuestion(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch question');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    question,
    isLoading,
    error,
    fetchQuestion,
  };
}