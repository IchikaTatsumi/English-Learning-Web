'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/features/auth';
import { useProgress } from '@/features/progress/hooks/progress.hook';
import { Edit, Trophy, Calendar, User, Settings, Bell } from 'lucide-react';

export function ProfileUI() {
  const { user } = useAuth();
  
  // ✅ FIXED: useProgress() takes no parameters
  const { progress } = useProgress();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    // ✅ FIXED: Use camelCase (fullName instead of full_name)
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
    quizReminder: false
  });

  const handleSaveProfile = async () => {
    setIsEditing(false);
    // TODO: Call API to update profile
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const totalPoints = (progress?.correct_answers || 0) * 10;
  const levelProgress = {
    current: totalPoints < 500 ? 'Beginner' : totalPoints < 1000 ? 'Intermediate' : 'Advanced',
    next: totalPoints < 500 ? 'Intermediate' : totalPoints < 1000 ? 'Advanced' : 'Master',
    pointsNeeded: totalPoints < 500 ? 500 - totalPoints : totalPoints < 1000 ? 1000 - totalPoints : 2000 - totalPoints,
    totalPointsForNext: totalPoints < 500 ? 500 : totalPoints < 1000 ? 1000 : 2000
  };

  const progressToNext = ((totalPoints) / levelProgress.totalPointsForNext) * 100;

  if (!user) {
    return (
      <div className="p-8 space-y-6">
        <div className="text-center">Please login to view profile</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2">Profile</h1>
        <p className="text-gray-600">Manage your account and learning preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Personal Information
                <Button
                  variant={isEditing ? "default" : "outline"}
                  size="sm"
                  onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
                >
                  {isEditing ? 'Save Changes' : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-linear-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">
                    {/* ✅ FIXED: Use fullName instead of full_name */}
                    {user.fullName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  {/* ✅ FIXED: Use fullName instead of full_name */}
                  <h3 className="text-xl font-semibold">{user.fullName}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-700">{levelProgress.current}</Badge>
                    <Badge variant="outline">{totalPoints} points</Badge>
                    <Badge variant="secondary">{user.role}</Badge>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={user.username}
                    disabled
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Input
                    id="role"
                    value={user.role}
                    disabled
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium">Member since</p>
                  {/* ✅ FIXED: Use createdAt instead of created_at */}
                  <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Learning Preferences */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Learning Preferences
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Daily Goal</Label>
                  <Select defaultValue="5">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 words per day</SelectItem>
                      <SelectItem value="5">5 words per day</SelectItem>
                      <SelectItem value="10">10 words per day</SelectItem>
                      <SelectItem value="15">15 words per day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Difficulty Preference</Label>
                  <Select defaultValue="mixed">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner Only</SelectItem>
                      <SelectItem value="intermediate">Intermediate Only</SelectItem>
                      <SelectItem value="advanced">Advanced Only</SelectItem>
                      <SelectItem value="mixed">Mixed Levels</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { key: 'dailyReminder', label: 'Daily Learning Reminder', description: 'Get reminded to practice vocabulary daily' },
                { key: 'weeklyProgress', label: 'Weekly Progress Report', description: 'Receive weekly summaries of your progress' },
                { key: 'achievements', label: 'Achievement Notifications', description: 'Get notified when you earn new achievements' },
                { key: 'quizReminder', label: 'Quiz Reminders', description: 'Reminders to take quizzes and practice' }
              ].map((setting) => (
                <div key={setting.key} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{setting.label}</p>
                    <p className="text-sm text-gray-600">{setting.description}</p>
                  </div>
                  <Switch
                    checked={notifications[setting.key as keyof typeof notifications]}
                    onCheckedChange={(checked) => 
                      setNotifications(prev => ({ ...prev, [setting.key]: checked }))
                    }
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Level Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                Level Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-3xl font-bold text-blue-600">{levelProgress.current}</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to {levelProgress.next}</span>
                  <span>{totalPoints}/{levelProgress.totalPointsForNext}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-linear-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {levelProgress.pointsNeeded} points to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Quizzes</span>
                <span className="font-semibold">{progress?.total_quizzes || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Questions Answered</span>
                <span className="font-semibold">{progress?.total_questions || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Correct Answers</span>
                <span className="font-semibold text-green-600">{progress?.correct_answers || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Accuracy Rate</span>
                <span className="font-semibold text-blue-600">{progress?.accuracy_rate?.toFixed(1) || 0}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Points</span>
                <span className="font-semibold">{totalPoints}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                <User className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )};