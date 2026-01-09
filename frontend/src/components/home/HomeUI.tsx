'use client';

import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useProgress } from '@/features/progress/hooks/progress.hook';
import { useTopics } from '@/features/topics/hooks/topic.hook';
import { useRouter } from 'next/navigation';
import { BookOpen, Trophy, Target, TrendingUp, Play, Book, Sparkles, Loader2 } from 'lucide-react';

export function HomeUI() {
  const router = useRouter();
  const { user } = useAuth();
  
  // ✅ 1. Sửa hook useProgress và lấy stats
  const { 
    progress, 
    stats: userStats, 
    fetchProgress, 
    fetchStats,
    isLoading 
  } = useProgress();

  const { topics, fetchTopics } = useTopics();

  // ✅ 2. Gọi API để lấy dữ liệu mới nhất
  useEffect(() => {
    fetchProgress();
    fetchStats();
    fetchTopics();
  }, [fetchProgress, fetchStats, fetchTopics]);

  // ✅ 3. Tính toán stats hiển thị
  const stats = {
    totalWords: userStats?.total_words || 0, // Lấy từ stats API thay vì fetch toàn bộ vocab
    totalTopics: topics.length,
    totalQuizzes: progress?.total_quizzes || 0,
    correctAnswers: progress?.correct_answers || 0,
    accuracyRate: progress?.accuracy_rate || 0,
  };

  if (isLoading) {
    return <div className="p-8 flex justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-blue-600"/></div>;
  }

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div className="flex justify-between items-center">
        <div>
          {/* ✅ Sửa user.fullName */}
          <h1 className="text-3xl mb-2 font-bold">Welcome back, {user?.fullName}!</h1>
          <p className="text-gray-600">Continue your English learning journey</p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-100">
          <Sparkles className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700">
            Level: {stats.accuracyRate > 80 ? 'Advanced' : stats.accuracyRate > 50 ? 'Intermediate' : 'Beginner'}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg"><BookOpen className="h-6 w-6 text-blue-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Total Words</p>
              <p className="text-2xl font-bold">{stats.totalWords}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg"><Trophy className="h-6 w-6 text-green-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Quizzes Taken</p>
              <p className="text-2xl font-bold">{stats.totalQuizzes}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg"><Target className="h-6 w-6 text-purple-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Correct Answers</p>
              <p className="text-2xl font-bold">{stats.correctAnswers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg"><TrendingUp className="h-6 w-6 text-yellow-600" /></div>
            <div>
              <p className="text-sm text-gray-600">Accuracy</p>
              <p className="text-2xl font-bold">{stats.accuracyRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader><CardTitle>Start Learning</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Ready to practice? Start a new quiz or browse vocabulary.</p>
            <div className="grid grid-cols-2 gap-3">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={() => router.push('/main/quiz')}>
                <Play className="mr-2 h-4 w-4" /> Start Quiz
              </Button>
              <Button variant="outline" className="w-full" onClick={() => router.push('/main/vocabularies')}>
                <Book className="mr-2 h-4 w-4" /> Browse Words
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <Card>
          <CardHeader><CardTitle>Your Progress</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Quiz Completion</span>
                  <span className="text-sm font-bold">{stats.totalQuizzes} quizzes</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-1000" style={{ width: `${Math.min(stats.totalQuizzes * 5, 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Accuracy Rate</span>
                  <span className="text-sm font-bold">{stats.accuracyRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className={`h-2.5 rounded-full transition-all duration-1000 ${stats.accuracyRate >= 80 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${stats.accuracyRate}%` }} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}