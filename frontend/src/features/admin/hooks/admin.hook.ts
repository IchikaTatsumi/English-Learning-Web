'use client';

import { useState, useCallback } from 'react';
import { adminService } from '../services/admin.service';
import {
  DashboardStatsDto,
  RecentActivityDto,
  AdminAccessDto,
} from '../dtos/admin-response.dto';

export function useAdmin() {
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsDto | null>(null);
  const [recentActivity, setRecentActivity] = useState<RecentActivityDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardStats = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getDashboardStats();
      if (response.success && response.data) {
        setDashboardStats(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch dashboard stats');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stats');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchRecentActivity = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.getRecentActivity();
      if (response.success && response.data) {
        setRecentActivity(response.data);
        return response.data;
      } else {
        throw new Error(response.message || 'Failed to fetch recent activity');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch activity');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateAdminAccess = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await adminService.validateAdminAccess();
      return response.success && response.data === true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to validate access');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    dashboardStats,
    recentActivity,
    isLoading,
    error,
    fetchDashboardStats,
    fetchRecentActivity,
    validateAdminAccess,
  };
}