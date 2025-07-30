'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react';
import { 
  getAllUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  toggleUserStatus,
  searchUsers,
  type User,
  type UserFormData 
} from '@/services/userService';

// Type definitions are now imported from userService

export default function AdminUsersPage(): JSX.Element {
  // const auth = useAuth(); // Uncomment if auth is needed
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    username: '',
    email: '',
    fullName: '',
    role: 'viewer',
    password: ''
  });

  // Mock data untuk development
  const mockUsers: User[] = useMemo(() => [
    {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      fullName: 'Administrator',
      role: 'admin' as const,
      isActive: true,
      lastLogin: '2024-01-15T10:30:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      username: 'manager1',
      email: 'manager@example.com',
      fullName: 'John Manager',
      role: 'manager' as const,
      isActive: true,
      lastLogin: '2024-01-14T15:45:00Z',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      username: 'staff1',
      email: 'staff@example.com',
      fullName: 'Jane Staff',
      role: 'staff' as const,
      isActive: false,
      lastLogin: '2024-01-10T09:15:00Z',
      createdAt: '2024-01-03T00:00:00Z',
      updatedAt: '2024-01-10T09:15:00Z'
    }
  ], []);

  // Load users function dengan useCallback
  const loadUsers = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError('');
      
      const response = await getAllUsers();
      
      if (response.success) {
        setUsers(response.data);
      } else {
        // Fallback to mock data if API is not available
        setUsers(mockUsers);
      }
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load users';
      setError(errorMessage);
      // Use mock data as fallback
      setUsers(mockUsers);
    } finally {
      setLoading(false);
    }
  }, [mockUsers]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleSearch = async (): Promise<void> => {
    if (!searchTerm.trim()) {
      await loadUsers();
      return;
    }

    try {
      setLoading(true);
      const response = await searchUsers(searchTerm);
      
      if (response.success) {
        setUsers(response.data);
      } else {
        // Fallback to local filtering
        const filtered = users.filter(user =>
          user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setUsers(filtered);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users;

  const handleAddUser = (): void => {
    setEditingUser(null);
    setFormData({
      username: '',
      email: '',
      fullName: '',
      role: 'viewer',
      password: ''
    });
    setShowAddForm(true);
  };

  const handleEditUser = (user: User): void => {
    setEditingUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      password: ''
    });
    setShowAddForm(true);
  };

  const handleSubmitUser = async (): Promise<void> => {
    try {
      if (editingUser) {
        const response = await updateUser(editingUser.id, formData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to update user');
        }
      } else {
        const response = await createUser(formData);
        if (!response.success) {
          throw new Error(response.message || 'Failed to create user');
        }
      }
      
      setShowAddForm(false);
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save user';
      setError(errorMessage);
    }
  };

  const handleToggleUserStatus = async (userId: string): Promise<void> => {
    try {
      const response = await toggleUserStatus(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to toggle user status');
      }
      
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user status';
      setError(errorMessage);
    }
  };

  const handleDeleteUser = async (userId: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this user?')) {
      return;
    }
    
    try {
      const response = await deleteUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Failed to delete user');
      }
      
      await loadUsers();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete user';
      setError(errorMessage);
    }
  };

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800';
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'staff': return 'bg-green-100 text-green-800';
      case 'viewer': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Users Management</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Loading users...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Users Management</h1>
          <p className="text-gray-600">Manage admin users and their permissions</p>
        </div>
        <Button onClick={handleAddUser} className="flex items-center gap-2">
          <Plus size={16} />
          Add User
        </Button>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>
            Manage admin users, their roles, and access permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch}>Search</Button>
            <Button variant="outline" onClick={loadUsers}>Refresh</Button>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-gray-500">
                          @{user.username} • {user.email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.isActive ? "default" : "secondary"}>
                        {user.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.lastLogin)}
                    </TableCell>
                    <TableCell className="text-sm text-gray-500">
                      {formatDate(user.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleUserStatus(user.id)}
                        >
                          {user.isActive ? <UserX size={16} /> : <UserCheck size={16} />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit User Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>
                {editingUser ? 'Edit User' : 'Add New User'}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Username</label>
                <Input
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter username"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <Input
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  placeholder="Enter full name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as UserFormData['role'] })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="viewer">Viewer</option>
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              {!editingUser && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="Enter password"
                  />
                </div>
              )}
              <div className="flex gap-2 pt-4">
                <Button onClick={handleSubmitUser} className="flex-1">
                  {editingUser ? 'Update' : 'Create'} User
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}