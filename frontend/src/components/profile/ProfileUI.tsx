'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { mockProfile, mockProgress } from '@/data/mockData';
import { Camera, Edit, Trophy, Calendar, User, Settings, Bell, Shield, HelpCircle } from 'lucide-react';
import { ImageWithFallback } from '@/components/figma/ImageWithFallback';

export function ProfileUI() {
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(mockProfile);
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
    quizReminder: false
  });

  const handleSaveProfile = () => {
    setIsEditing(false);
    // In a real app, this would save to backend
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const levelProgress = {
    current: 'Intermediate',
    next: 'Advanced',
    pointsNeeded: 750,
    totalPointsForNext: 2000
  };

  const progressToNext = ((profile.points) / levelProgress.totalPointsForNext) * 100;

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
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <div className="relative">
                  <ImageWithFallback
                    src={profile.avatar}
                    alt="Profile avatar"
                    className="w-20 h-20 rounded-full object-cover"
                  />
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full p-0"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg">{profile.name}</h3>
                  <p className="text-gray-600">{profile.email}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-700">{profile.level}</Badge>
                    <Badge variant="outline">{profile.points} points</Badge>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p>Member since</p>
                  <p className="text-sm text-gray-600">{formatDate(profile.joinDate)}</p>
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
                    <p>{setting.label}</p>
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
                <p className="text-2xl text-blue-600">{levelProgress.current}</p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress to {levelProgress.next}</span>
                  <span>{profile.points}/{levelProgress.totalPointsForNext}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${progressToNext}%` }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {levelProgress.pointsNeeded} points to next level
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Achievements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                  <Trophy className="h-5 w-5 text-yellow-600" />
                  <span className="text-sm">{achievement}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Learning Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Words Learned</span>
                <span>{mockProgress.learnedWords}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Current Streak</span>
                <span>{mockProgress.currentStreak} days</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quiz Accuracy</span>
                <span>{Math.round((mockProgress.correctAnswers / (mockProgress.totalQuizzes * 3)) * 100)}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Total Points</span>
                <span>{profile.points}</span>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy & Security
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <HelpCircle className="h-4 w-4 mr-2" />
                Help & Support
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                <User className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
