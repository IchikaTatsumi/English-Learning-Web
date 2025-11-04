'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/features/auth';
import { useProgress } from '@/features/progress/hooks/progress.hook';
import { useVocabularies } from '@/features/vocabularies/hooks/vocabulary.hook';
import { useRouter } from 'next/navigation';
import { BookOpen, Trophy, Target, TrendingUp, Play, Book } from 'lucide-react';

export function HomeUI() {
  const router = useRouter();
  const { user } = useAuth();
  const { progress } = useProgress(user?.user_id || 0);
  const { vocabularies } = useVocabularies();

  const stats = {
    totalWords: vocabularies.length,
    totalQuizzes: progress?.total_quizzes || 0,
    correctAnswers: progress?.correct_answers || 0,
    accuracyRate: progress?.accuracy_rate || 0,
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-gray-600">Continue your English learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <BookOpen className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Words</p>
                <p className="text-2xl">{stats.totalWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Trophy className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quizzes Taken</p>
                <p className="text-2xl">{stats.totalQuizzes}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl">{stats.correctAnswers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy</p>
                <p className="text-2xl">{stats.accuracyRate.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Start Learning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600">Ready to practice? Start a new quiz or browse vocabulary.</p>
            <div className="flex gap-3">
              <Button className="flex-1" onClick={() => router.push('/dashboard/quiz')}>
                <Play className="mr-2 h-4 w-4" />
                Start Quiz
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => router.push('/dashboard/vocabularies')}>
                <Book className="mr-2 h-4 w-4" />
                Browse Words
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Quiz Completion</span>
                  <span className="text-sm font-medium">{stats.totalQuizzes} quizzes</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(stats.totalQuizzes * 10, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Accuracy Rate</span>
                  <span className="text-sm font-medium">{stats.accuracyRate.toFixed(1)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${stats.accuracyRate}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Goal */}
      <Card>
        <CardHeader>
          <CardTitle>Daily Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">Practice 5 words per day to maintain your streak</p>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-600">Today's Progress</span>
                  <span className="text-sm font-medium">0/5 words</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div className="bg-blue-600 h-3 rounded-full" style={{ width: '0%' }} />
                </div>
              </div>
              <Button onClick={() => router.push('/dashboard/vocabularies')}>
                Start Learning
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
