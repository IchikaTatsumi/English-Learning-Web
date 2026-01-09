'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Edit, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { AddButton } from '@/components/buttons/AddButton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useUsers, useUserMutations } from '@/features/users/hooks/user.hooks';
import { toast } from '@/lib/utils/toast';
// Import UserDTO để type checking (không bắt buộc nếu hook đã trả về đúng type)
import { UserDTO } from '@/features/users/dtos/user.dto';

export function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const { users, loading: isLoading, fetchAllUsers } = useUsers();
  const { deleteUser, loading: isDeleting } = useUserMutations();

  useEffect(() => {
    fetchAllUsers();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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

  const handleAddUser = () => {
    toast.info("Add user feature coming soon");
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
          <AddButton onClick={handleAddUser} label="Add User" />
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
                    {/* Bây giờ UserDTO đã có fullName và email */}
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
    </div>
  );
}