'use client';

import { useEffect } from 'react'; // ✅ Import useEffect
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProgress, useVocabProgress } from '@/features/progress/hooks/progress.hook';
import { useAuth } from '@/features/auth';
import { Trophy, Target, TrendingUp, Calendar, Loader2 } from 'lucide-react';

export function ProgressUI() {
  const { user } = useAuth();
  
  // ✅ 1. Lấy thêm hàm fetchProgress
  const { 
    progress, 
    isLoading: progressLoading, 
    fetchProgress 
  } = useProgress();

  const userId = user?.id || 0;
  
  // ✅ 2. Lấy thêm hàm fetchVocabProgress
  const { 
    vocabProgress, 
    isLoading: vocabLoading, 
    fetchVocabProgress 
  } = useVocabProgress(userId);

  // ✅ 3. Gọi API khi component mount
  useEffect(() => {
    fetchProgress();
    if (userId) {
      fetchVocabProgress();
    }
  }, [fetchProgress, fetchVocabProgress, userId]);

  if (progressLoading || vocabLoading) {
    return (
      <div className="p-8 space-y-6 flex justify-center items-center min-h-[400px]">
        <div className="flex flex-col items-center gap-2 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span>Loading progress...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-bold">Learning Progress</h1>
        <p className="text-gray-600">Track your vocabulary learning journey</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Trophy className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Total Quizzes</p>
                <p className="text-2xl font-bold">{progress?.total_quizzes || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Questions Answered</p>
                <p className="text-2xl font-bold">{progress?.total_questions || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Correct Answers</p>
                <p className="text-2xl font-bold">{progress?.correct_answers || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Calendar className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600 font-medium">Accuracy Rate</p>
                <p className="text-2xl font-bold">{progress?.accuracy_rate?.toFixed(1) || 0}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vocabulary Progress */}
        {vocabProgress && (
          <Card className="border-t-4 border-t-blue-500">
            <CardHeader>
              <CardTitle>Vocabulary Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-700">Total Questions</span>
                  {/* Note: Map theo field của mock data hiện tại */}
                  <span className="font-bold text-lg">{vocabProgress.total_questions || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                  <span className="text-green-700">Correct Answers</span>
                  <span className="font-bold text-lg text-green-700">{vocabProgress.correct_answers || 0}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-blue-700">Accuracy</span>
                  <span className="font-bold text-lg text-blue-700">
                    {vocabProgress.accuracy_rate?.toFixed(1) || 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Overall Progress */}
        <Card className="border-t-4 border-t-green-500">
          <CardHeader>
            <CardTitle>Overall Goals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Quiz Completion Goal (10)</span>
                  <span className="text-sm font-bold">{progress?.total_quizzes || 0}/10</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min(((progress?.total_quizzes || 0) / 10) * 100, 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Target Accuracy (80%)</span>
                  <span className="text-sm font-bold">{progress?.accuracy_rate?.toFixed(1) || 0}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${
                      (progress?.accuracy_rate || 0) >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                    }`}
                    style={{ width: `${Math.min(progress?.accuracy_rate || 0, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}