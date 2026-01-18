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
  
  // ✅ Loading states riêng biệt cho từng hành động
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
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
      // throw err; // Có thể comment lại để tránh crash UI nếu lỗi mạng
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new topic (Admin only)
   */
  const createTopic = useCallback(async (dto: CreateTopicDto) => {
    setIsCreating(true); // ✅ Bắt đầu state loading tạo mới
    setError(null);
    try {
      const newTopic = await topicService.createTopic(dto);
      // Cập nhật list local ngay lập tức (thêm vào đầu danh sách)
      setTopics(prev => [newTopic, ...prev]); 
      return newTopic;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create topic';
      setError(message);
      throw err; // Ném lỗi ra để component hiển thị Toast
    } finally {
      setIsCreating(false); // ✅ Kết thúc loading
    }
  }, []);

  /**
   * Update topic (Admin only)
   */
  const updateTopic = useCallback(async (id: number, dto: UpdateTopicDto) => {
    setIsUpdating(true); // ✅ Bắt đầu state loading cập nhật
    setError(null);
    try {
      const updated = await topicService.updateTopic(id, dto);
      // Cập nhật item trong danh sách local
      setTopics(prev => prev.map(t => t.topic_id === id ? updated : t));
      return updated;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update topic';
      setError(message);
      throw err;
    } finally {
      setIsUpdating(false); // ✅ Kết thúc loading
    }
  }, []);

  /**
   * Delete topic (Admin only)
   */
  const deleteTopic = useCallback(async (id: number) => {
    setIsDeleting(true); // ✅ Bắt đầu state loading xóa
    setError(null);
    try {
      await topicService.deleteTopic(id);
      // Xóa item khỏi danh sách local
      setTopics(prev => prev.filter(t => t.topic_id !== id));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete topic';
      setError(message);
      throw err;
    } finally {
      setIsDeleting(false); // ✅ Kết thúc loading
    }
  }, []);

  // ✅ Return đầy đủ state và hàm
  return {
    topics,
    isLoading,
    isCreating, // Export state
    isUpdating, // Export state
    isDeleting, // Export state
    error,
    fetchTopics,
    createTopic,
    updateTopic,
    deleteTopic,
  };
}

// ==========================================
// CÁC HOOK PHỤ (GIỮ NGUYÊN ĐỂ DÙNG SAU)
// ==========================================

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