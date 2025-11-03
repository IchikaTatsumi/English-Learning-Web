'use client';

import { useState, useCallback } from 'react';
import { permissionService } from '../services/permission.service';
import { UserPermissionsDto } from '../dtos/permission.dto';

export function usePermissions(userId: string) {
  const [permissions, setPermissions] = useState<UserPermissionsDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await permissionService.getUserPermissions(userId);
      setPermissions(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch permissions');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  const checkPermission = useCallback(async (resource: string, action: string) => {
    try {
      return await permissionService.checkPermission(userId, resource, action);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check permission');
      return false;
    }
  }, [userId]);

  return {
    permissions,
    fetchPermissions,
    checkPermission,
    isLoading,
    error,
  };
}
