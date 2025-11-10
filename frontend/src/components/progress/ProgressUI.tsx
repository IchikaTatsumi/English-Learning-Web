'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// ✅ FIXED: Import useVocabProgress
import { useProgress, useVocabProgress } from '@/features/progress/hooks/progress.hook';
import { useAuth } from '@/features/auth';
import { Trophy, Target, TrendingUp, Calendar } from 'lucide-react';

export function ProgressUI() {
  const { user } = useAuth();
  // ✅ FIXED: useProgress takes no parameters
  const { progress, isLoading: progressLoading } = useProgress();
  // ✅ FIXED: Pass user_id or user.id
  const userId = user?.id || user?.id || 0;
  const { vocabProgress, isLoading: vocabLoading } = useVocabProgress(userId);

  if (progressLoading || vocabLoading) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">Loading progress...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Learning Progress</h1>
        <p className="text-gray-600">Track your vocabulary learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Quizzes</p>
                <p className="text-2xl">{progress?.total_quizzes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Questions Answered</p>
                <p className="text-2xl">{progress?.total_questions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl">{progress?.correct_answers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Accuracy Rate</p>
                <p className="text-2xl">{progress?.accuracy_rate?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Vocabulary Progress */}
      {vocabProgress && (
        <Card>
          <CardHeader>
            <CardTitle>Vocabulary Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Total Answered</span>
                <span className="font-medium">{vocabProgress.total_answered || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Correct Answers</span>
                <span className="font-medium text-green-600">{vocabProgress.total_correct || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Accuracy</span>
                <span className="font-medium text-blue-600">
                  {vocabProgress.accuracy_percent?.toFixed(1) || 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Quiz Completion</span>
                <span className="text-sm font-medium">{progress?.total_quizzes || 0} quizzes</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min((progress?.total_quizzes || 0) * 10, 100)}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="text-sm font-medium">{progress?.accuracy_rate?.toFixed(1) || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${progress?.accuracy_rate || 0}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}