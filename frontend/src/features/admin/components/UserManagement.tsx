'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Loader2, RefreshCw, Plus, CheckCircle2 } from 'lucide-react';
import { AddButton } from '@/components/buttons/AddButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
// ✅ Import UI Components cho Popup
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { useUsers, useUserMutations } from '@/features/users/hooks/user.hooks';
import { toast } from '@/lib/utils/toast';
import { UserDTO } from '@/features/users/dtos/user.dto';
// ✅ Import Service để gọi API tạo user (hoặc bạn có thể thêm vào hook useUserMutations)
import { userService } from '@/features/users/services/user.service';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading: isLoading, fetchAllUsers } = useUsers();
  const { deleteUser, loading: isDeleting } = useUserMutations();

  // ✅ State cho Popup và Form
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    role: 'User', // Default role
    password: ''
  });

  useEffect(() => {
    fetchAllUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ✅ Xử lý Input Change
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ✅ Xử lý Submit Form Thêm User
  const handleCreateUser = async () => {
    // Validate cơ bản
    if (!formData.username || !formData.password || !formData.email) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc (Username, Email, Password)");
      return;
    }

    setIsCreating(true);
    try {
      // Gọi service tạo user
      // Lưu ý: Đảm bảo userService.createUser đã được định nghĩa, hoặc dùng fetch trực tiếp
      const response = await userService.createUser(formData);
      
      if (response.success) {
        toast.success("User created successfully!");
        setIsAddDialogOpen(false);
        // Reset form
        setFormData({
          username: '',
          fullName: '',
          email: '',
          role: 'User',
          password: ''
        });
        // Refresh danh sách
        fetchAllUsers();
      } else {
        toast.error(response.message || "Failed to create user");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteUser = async (userId: string | number) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const result = await deleteUser(userId.toString());
        if (result.success) {
          toast.success("User deleted successfully");
          fetchAllUsers();
        } else {
          toast.error(result.message || "Failed to delete user");
        }
      } catch (error) {
        console.error(error);
        toast.error("An error occurred");
      }
    }
  };

  const handleEditUser = (userId: string | number) => {
    toast.info(`Edit user ${userId} feature coming soon`);
  };

  // Safe filtering logic
  const filteredUsers = users.filter((user: UserDTO) =>
    (user.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">User Management</h1>
          <p className="text-gray-600">Manage system users and their roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => fetchAllUsers()} disabled={isLoading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {/* ✅ Mở Popup khi click */}
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Add User
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && users.length === 0 ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Username</TableHead>
                  <TableHead>Full Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.fullName || 'N/A'}</TableCell>
                    <TableCell>{user.email || 'N/A'}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'Admin' ? 'default' : 'secondary'}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditUser(user.id)}
                        >
                          <Edit className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
          
          {!isLoading && filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found.
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ ADD USER DIALOG */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {/* Username & Full Name */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Username <span className="text-red-500">*</span></Label>
                <Input 
                  placeholder="johndoe"
                  value={formData.username}
                  onChange={(e) => handleInputChange('username', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Full Name</Label>
                <Input 
                  placeholder="John Doe"
                  value={formData.fullName}
                  onChange={(e) => handleInputChange('fullName', e.target.value)}
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label>Email <span className="text-red-500">*</span></Label>
              <Input 
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
              />
            </div>

            {/* Role & Password */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Role <span className="text-red-500">*</span></Label>
                <Select 
                  value={formData.role} 
                  onValueChange={(val) => handleInputChange('role', val)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="Admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Password <span className="text-red-500">*</span></Label>
                <Input 
                  type="password"
                  placeholder="******"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
            <Button 
              className="bg-blue-600 hover:bg-blue-700" 
              onClick={handleCreateUser} 
              disabled={isCreating}
            >
              {isCreating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}