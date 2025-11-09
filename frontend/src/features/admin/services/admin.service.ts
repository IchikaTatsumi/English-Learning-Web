import { ServerResponseModel } from '@/lib/typedefs/server-response';

/**
 * Admin Service
 * Provides admin-specific operations and dashboard data
 * Note: Uses existing services (UserService, TopicService, VocabularyService)
 */
export class AdminService {
  private baseUrl = process.env.NEXT_PUBLIC_API_ENDPOINT || 'http://localhost:4000/api';

  private getAuthHeaders(): HeadersInit {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    return {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
  }

  /**
   * Get dashboard statistics (Admin only)
   * Aggregates data from multiple endpoints
   */
  async getDashboardStats(): Promise<ServerResponseModel<{
    totalUsers: number;
    totalTopics: number;
    totalVocabularies: number;
    totalQuizzes: number;
  }>> {
    try {
      // Call multiple endpoints to get statistics
      const [usersRes, topicsRes, vocabRes] = await Promise.all([
        fetch(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() }),
        fetch(`${this.baseUrl}/topics`, { headers: this.getAuthHeaders() }),
        fetch(`${this.baseUrl}/vocabularies`, { headers: this.getAuthHeaders() }),
      ]);

      if (!usersRes.ok || !topicsRes.ok || !vocabRes.ok) {
        throw new Error('Failed to fetch dashboard statistics');
      }

      const users = await usersRes.json();
      const topics = await topicsRes.json();
      const vocabularies = await vocabRes.json();

      return {
        success: true,
        statusCode: 200,
        data: {
          totalUsers: Array.isArray(users) ? users.length : 0,
          totalTopics: Array.isArray(topics) ? topics.length : 0,
          totalVocabularies: Array.isArray(vocabularies) ? vocabularies.length : 0,
          totalQuizzes: 0, // Would need quiz endpoint
        }
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch dashboard stats'
      };
    }
  }

  /**
   * Get recent activity (Admin only)
   * Aggregates recent data from multiple endpoints
   */
  async getRecentActivity(): Promise<ServerResponseModel<{
    recentUsers: any[];
    recentTopics: any[];
    recentVocabularies: any[];
  }>> {
    try {
      const [usersRes, topicsRes, vocabRes] = await Promise.all([
        fetch(`${this.baseUrl}/users`, { headers: this.getAuthHeaders() }),
        fetch(`${this.baseUrl}/topics`, { headers: this.getAuthHeaders() }),
        fetch(`${this.baseUrl}/vocabularies`, { headers: this.getAuthHeaders() }),
      ]);

      if (!usersRes.ok || !topicsRes.ok || !vocabRes.ok) {
        throw new Error('Failed to fetch recent activity');
      }

      const users = await usersRes.json();
      const topics = await topicsRes.json();
      const vocabularies = await vocabRes.json();

      return {
        success: true,
        statusCode: 200,
        data: {
          recentUsers: Array.isArray(users) ? users.slice(0, 5) : [],
          recentTopics: Array.isArray(topics) ? topics.slice(0, 5) : [],
          recentVocabularies: Array.isArray(vocabularies) ? vocabularies.slice(0, 5) : [],
        }
      };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return {
        success: false,
        statusCode: 500,
        message: error instanceof Error ? error.message : 'Failed to fetch recent activity'
      };
    }
  }

  /**
   * Validate admin access
   * Checks if current user has admin role
   */
  async validateAdminAccess(): Promise<ServerResponseModel<boolean>> {
    try {
      const response = await fetch(`${this.baseUrl}/users/me`, {
        headers: this.getAuthHeaders()
      });

      if (!response.ok) {
        return {
          success: false,
          statusCode: response.status,
          message: 'Unauthorized'
        };
      }

      const user = await response.json();
      const isAdmin = user.role === 'Admin';

      return {
        success: isAdmin,
        statusCode: isAdmin ? 200 : 403,
        data: isAdmin,
        message: isAdmin ? undefined : 'Admin access required'
      };
    } catch (error) {
      console.error('Error validating admin access:', error);
      return {
        success: false,
        statusCode: 500,
        message: 'Failed to validate admin access'
      };
    }
  }
}

export const adminService = new AdminService();