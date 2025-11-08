'use client';

import { useState, useCallback } from 'react';
import { topicService } from '../services/topic.service';
import { TopicDto, CreateTopicDto, UpdateTopicDto } from '../dtos/topic.dto';

export function useTopics() {
  const [topics, setTopics] = useState<TopicDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

export function useTopic(id: number) {
  const [topic, setTopic] = useState<TopicDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTopic = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await topicService.getTopicById(id);
      setTopic(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch topic';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  return {
    topic,
    isLoading,
    error,
    fetchTopic,
  };
}