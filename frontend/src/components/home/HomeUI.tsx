'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { mockProgress, mockVocabulary } from '@/data/mockData';
import { BookOpen, Brain, Target, Trophy, TrendingUp } from 'lucide-react';

export function HomeUI() {
  const router = useRouter();
  const progressPercentage = (mockProgress.learnedWords / mockProgress.totalWords) * 100;
  const weeklyProgressPercentage = (mockProgress.learnedWords / mockProgress.weeklyGoal) * 100;
  
  const recentWords = mockVocabulary.slice(0, 3);

  const handleNavigate = (path: string) => {
    router.push(`/dashboard/${path}`);
  };

  return (
    <div className="p-8 space-y-6">
      {/* Welcome Section */}
      <div>
        <h1 className="text-3xl mb-2">Welcome back!</h1>
        <p className="text-gray-600">Continue your vocabulary learning journey</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Words</p>
                <p className="text-xl">{mockProgress.totalWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Learned</p>
                <p className="text-xl">{mockProgress.learnedWords}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Current Streak</p>
                <p className="text-xl">{mockProgress.currentStreak}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Brain className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Quiz Score</p>
                <p className="text-xl">{Math.round((mockProgress.correctAnswers / (mockProgress.totalQuizzes * 3)) * 100)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Progress</span>
                <span>{mockProgress.learnedWords}/{mockProgress.totalWords} words</span>
              </div>
              <Progress value={progressPercentage} />
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Weekly Goal</span>
                <span>{mockProgress.learnedWords}/{mockProgress.weeklyGoal} words</span>
              </div>
              <Progress value={weeklyProgressPercentage} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Words</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentWords.map((word) => (
              <div key={word.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p>{word.word}</p>
                  <p className="text-sm text-gray-600">{word.definition.slice(0, 50)}...</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs ${
                  word.isLearned ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {word.isLearned ? 'Learned' : 'Learning'}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => handleNavigate('vocabularies')} className="flex-1">
              <BookOpen className="mr-2 h-4 w-4" />
              Study Vocabulary
            </Button>
            <Button onClick={() => handleNavigate('quiz')} variant="outline" className="flex-1">
              <Brain className="mr-2 h-4 w-4" />
              Take Quiz
            </Button>
            <Button onClick={() => handleNavigate('progress')} variant="outline" className="flex-1">
              <TrendingUp className="mr-2 h-4 w-4" />
              View Progress
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
