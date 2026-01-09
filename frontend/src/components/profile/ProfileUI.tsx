'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAuth } from '@/features/auth';
import { useProgress } from '@/features/progress/hooks/progress.hook';
import { Edit, Trophy, Calendar, User, Settings, Bell, Loader2 } from 'lucide-react';

export function ProfileUI() {
  const { user } = useAuth();
  
  // ✅ 1. Lấy hàm fetchProgress từ hook
  const { progress, fetchProgress, isLoading } = useProgress();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || ''
  });
  
  const [notifications, setNotifications] = useState({
    dailyReminder: true,
    weeklyProgress: true,
    achievements: true,
    quizReminder: false
  });

  // ✅ 2. Gọi API khi component mount
  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  // Cập nhật form khi user load xong
  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || ''
      });
    }
  }, [user]);

  const handleSaveProfile = async () => {
    setIsEditing(false);
    console.log('Saving profile:', formData);
    // TODO: Call API update profile here
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
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

  const progressToNext = Math.min((totalPoints / levelProgress.totalPointsForNext) * 100, 100);

  if (!user) return null;

  if (isLoading && !progress) {
     return (
        <div className="p-8 flex justify-center items-center h-64">
           <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
        </div>
     )
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl mb-2 font-bold">Profile</h1>
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
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shrink-0">
                  <span className="text-3xl font-bold text-white">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  {/* ✅ Sửa user.fullName */}
                  <h3 className="text-xl font-semibold">{user.fullName}</h3>
                  <p className="text-gray-600">@{user.username}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <Badge className="bg-blue-100 text-blue-700">{levelProgress.current}</Badge>
                    <Badge variant="outline">{totalPoints} points</Badge>
                    <Badge variant="secondary" className="capitalize">{user.role.toLowerCase()}</Badge>
                  </div>
                </div>
              </div>

              {/* Form fields... giữ nguyên logic hiển thị */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input value={formData.fullName} disabled={!isEditing} onChange={(e) => setFormData({...formData, fullName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={formData.email} disabled={!isEditing} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                <Calendar className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-sm">Member since</p>
                  {/* ✅ Sửa user.createdAt */}
                  <p className="text-sm text-gray-600">{formatDate(user.createdAt)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          {/* ... Các phần Settings và Notification giữ nguyên ... */}
        </div>

        {/* Sidebar Level Progress */}
        <div className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Trophy className="h-5 w-5 text-yellow-500"/> Level Progress</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Current Level</p>
                <p className="text-3xl font-bold text-blue-600">{levelProgress.current}</p>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-2">
                  <span>Progress to {levelProgress.next}</span>
                  <span>{totalPoints}/{levelProgress.totalPointsForNext}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${progressToNext}%` }} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}