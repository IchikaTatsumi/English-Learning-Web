'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAdmin } from '@/features/admin/hooks/admin.hook';
import { Users, BookOpen, Brain, FolderTree, Activity, Loader2 } from 'lucide-react';

export default function AdminDashboardPage() {
  const { 
    dashboardStats, 
    recentActivity, 
    fetchDashboardStats, 
    fetchRecentActivity, 
    isLoading 
  } = useAdmin();

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, [fetchDashboardStats, fetchRecentActivity]);

  if (isLoading && !dashboardStats) {
    return (
      <div className="w-full h-screen flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">System overview and statistics</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <h3 className="text-2xl font-bold">{dashboardStats?.totalUsers || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg text-purple-600">
              <FolderTree className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Topics</p>
              <h3 className="text-2xl font-bold">{dashboardStats?.totalTopics || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg text-green-600">
              <BookOpen className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Vocabularies</p>
              <h3 className="text-2xl font-bold">{dashboardStats?.totalVocabularies || 0}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg text-yellow-600">
              <Brain className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Quizzes</p>
              <h3 className="text-2xl font-bold">{dashboardStats?.totalQuizzes || 0}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" /> Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.recentUsers.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent users.</p>
              ) : (
                recentActivity?.recentUsers.map((user: any) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{user.fullName || user.username}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt || user.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" /> Recent Topics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity?.recentTopics.length === 0 ? (
                <p className="text-gray-500 text-sm">No recent topics.</p>
              ) : (
                recentActivity?.recentTopics.map((topic: any) => (
                  <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-sm">{topic.topicName || topic.topic_name}</p>
                      <p className="text-xs text-gray-500">{topic.description || 'No description'}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(topic.createdAt || topic.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}