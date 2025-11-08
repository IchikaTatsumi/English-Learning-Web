'use client';

import { useState, useCallback } from 'react';
import { topicService } from '../services/topic.service';
import { TopicDto } from '../dtos/topic.dto';

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
      setError(err instanceof Error ? err.message : 'Failed to fetch topics');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    topics,
    fetchTopics,
    isLoading,
    error
  };
}
