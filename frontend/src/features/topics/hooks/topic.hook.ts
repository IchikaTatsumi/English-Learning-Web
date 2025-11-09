'use client';

import { useState, useCallback } from 'react';
import { topicService } from '../services/topic.service';
import {
  TopicDto,
  CreateTopicDto,
  UpdateTopicDto,
  TopicSearchDto,
  TopicSearchResultDto,
  TopicListResponseDto,
  TopicProgressDto,
} from '../dtos/topic.dto';

export function useTopics() {
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all topics
   */
  const fetchTopics = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await topicService.getTopics();
      setTopics(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new topic (Admin only)
   */
  const createTopic = useCallback(async (dto: CreateTopicDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const newTopic = await topicService.createTopic(dto);
      setTopics(prev => [...prev, newTopic]);
      return newTopic;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create topic';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update topic (Admin only)
   */
  const updateTopic = useCallback(async (id: number, dto: UpdateTopicDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const updated = await topicService.updateTopic(id, dto);
      setTopics(prev => prev.map(t => t.topic_id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update topic';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Delete topic (Admin only)
   * ⚠️ Warning: This will CASCADE delete all related data
   */
  const deleteTopic = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await topicService.deleteTopic(id);
      setTopics(prev => prev.filter(t => t.topic_id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete topic';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    topics,
    isLoading,
    error,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}

/**
 * Hook for single topic operations
 */
export function useTopic(id?: number) {
  const [topic, setTopic] = useState<TopicDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopic = useCallback(async (topicId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await topicService.getTopicById(topicId);
      setTopic(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topic';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    topic,
    isLoading,
    error,
    fetchTopic,
  };
}

/**
 * Hook for topic search (autocomplete)
 */
export function useTopicSearch() {
  const [searchResults, setSearchResults] = useState<TopicSearchResultDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchTopics = useCallback(async (dto?: TopicSearchDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const results = await topicService.searchTopics(dto);
      setSearchResults(results);
      return results;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to search topics';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    searchResults,
    isLoading,
    error,
    searchTopics,
  };
}

/**
 * Hook for topics filter dropdown
 */
export function useTopicsFilter() {
  const [filterData, setFilterData] = useState<TopicListResponseDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicsForFilter = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await topicService.getTopicsForFilter();
      setFilterData(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topics for filter';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    filterData,
    isLoading,
    error,
    fetchTopicsForFilter,
  };
}

/**
 * Hook for topics with learning progress
 */
export function useTopicsProgress() {
  const [topicsProgress, setTopicsProgress] = useState<TopicProgressDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopicsProgress = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await topicService.getTopicsWithProgress();
      setTopicsProgress(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topics progress';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    topicsProgress,
    isLoading,
    error,
    fetchTopicsProgress,
  };
}