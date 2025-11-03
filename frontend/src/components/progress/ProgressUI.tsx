'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { mockProgress } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Target, Trophy, TrendingUp, Brain, BookOpen, Flame } from 'lucide-react';

export function ProgressUI() {
  const progressPercentage = (mockProgress.learnedWords / mockProgress.totalWords) * 100;
  const weeklyProgressPercentage = (mockProgress.learnedWords / mockProgress.weeklyGoal) * 100;
  const accuracyRate = Math.round((mockProgress.correctAnswers / (mockProgress.totalQuizzes * 3)) * 100);

  // Prepare chart data
  const weeklyData = mockProgress.dailyProgress.map(day => ({
    date: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    words: day.wordsLearned
  }));

  const statsCards = [
    {
      title: 'Total Words',
      value: mockProgress.totalWords,
      icon: BookOpen,
      color: 'bg-blue-100 text-blue-600',
      description: 'Words in vocabulary'
    },
    {
      title: 'Words Learned',
      value: mockProgress.learnedWords,
      icon: Trophy,
      color: 'bg-green-100 text-green-600',
      description: 'Successfully mastered'
    },
    {
      title: 'Current Streak',
      value: `${mockProgress.currentStreak} days`,
      icon: Flame,
      color: 'bg-orange-100 text-orange-600',
      description: 'Keep it going!'
    },
    {
      title: 'Quiz Accuracy',
      value: `${accuracyRate}%`,
      icon: Brain,
      color: 'bg-purple-100 text-purple-600',
      description: 'Correct answers'
    }
  ];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Progress</h1>
        <p className="text-gray-600">Track your learning journey and achievements</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className={`p-3 rounded-lg ${stat.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">{stat.title}</p>
                    <p className="text-2xl">{stat.value}</p>
                    <p className="text-xs text-gray-500">{stat.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Progress Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Overall Vocabulary</span>
                <span>{mockProgress.learnedWords}/{mockProgress.totalWords} words</span>
              </div>
              <Progress value={progressPercentage} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">{Math.round(progressPercentage)}% complete</p>
            </div>
            
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Weekly Goal</span>
                <span>{mockProgress.learnedWords}/{mockProgress.weeklyGoal} words</span>
              </div>
              <Progress value={Math.min(weeklyProgressPercentage, 100)} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">
                {weeklyProgressPercentage >= 100 ? 'Goal achieved!' : `${Math.round(weeklyProgressPercentage)}% of weekly goal`}
              </p>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm">Longest Streak</p>
                  <p className="text-2xl text-orange-600">{mockProgress.longestStreak} days</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">Total Quizzes</p>
                  <p className="text-2xl text-purple-600">{mockProgress.totalQuizzes}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Weekly Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`${value} words`, 'Words Learned']}
                  labelFormatter={(label) => `${label}`}
                />
                <Bar dataKey="words" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Learning Trends */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Learning Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value} words`, 'Words Learned']}
                labelFormatter={(label) => `${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="words" 
                stroke="#10b981" 
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Recent Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Trophy className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-green-800">First Word</p>
                <p className="text-sm text-green-600">Learned your first word</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-orange-50 rounded-lg">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Flame className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-orange-800">Week Streak</p>
                <p className="text-sm text-orange-600">7 days in a row</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Brain className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800">Quiz Master</p>
                <p className="text-sm text-blue-600">90% accuracy rate</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-lg">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-purple-800">Vocabulary</p>
                <p className="text-sm text-purple-600">50+ words learned</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
