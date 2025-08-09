import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Avatar } from '../ui/avatar'
import { Search, Filter, MoreHorizontal, Shield, UserCheck, UserX, Trash2, Edit } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu'
import { useAuth } from '../../contexts/AuthContext'

export function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { getAllUsers, updateUserRole, deleteUser, toggleUserVerification } = useAuth()
  
  const allUsers = getAllUsers()

  const handleRoleChange = (userId: string, newRole: string) => {
    try {
      updateUserRole(userId, newRole as 'student' | 'coach' | 'parent' | 'supporter' | 'admin')
      alert('User role updated successfully!')
    } catch (error) {
      alert('Failed to update user role')
    }
  }

  const handleDeleteUser = (userId: string) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        deleteUser(userId)
        alert('User deleted successfully!')
      } catch (error: any) {
        alert(error.message || 'Failed to delete user')
      }
    }
  }

  const handleToggleVerification = (userId: string) => {
    try {
      toggleUserVerification(userId)
      alert('User verification status updated!')
    } catch (error) {
      alert('Failed to update verification status')
    }
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'verified' && user.verified) ||
                         (statusFilter === 'unverified' && !user.verified)
    return matchesSearch && matchesRole && matchesStatus
  })

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-red-100 text-red-800'
      case 'coach': return 'bg-blue-100 text-blue-800'
      case 'student': return 'bg-green-100 text-green-800'
      case 'parent': return 'bg-purple-100 text-purple-800'
      case 'supporter': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student'
      case 'coach': return 'Coach'
      case 'parent': return 'Parent'
      case 'supporter': return 'Supporter'
      case 'admin': return 'Admin'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Manage Users</h1>
          <p className="text-gray-600">
            View and manage all users on the platform
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{allUsers.length}</div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{allUsers.filter(u => u.role === 'student').length}</div>
              <div className="text-sm text-gray-600">Students</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{allUsers.filter(u => u.role === 'coach').length}</div>
              <div className="text-sm text-gray-600">Coaches</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{allUsers.filter(u => u.role === 'parent').length}</div>
              <div className="text-sm text-gray-600">Parents</div>
            </div>
          </Card>
          <Card className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{allUsers.filter(u => u.role === 'supporter').length}</div>
              <div className="text-sm text-gray-600">Supporters</div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger>
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="student">Students</SelectItem>
                  <SelectItem value="coach">Coaches</SelectItem>
                  <SelectItem value="parent">Parents</SelectItem>
                  <SelectItem value="supporter">Supporters</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="unverified">Unverified</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Users Table */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">User</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team/School</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">2FA</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <img src={user.profileImage} alt={user.name} className="rounded-full" />
                        </Avatar>
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                          {user.phone && (
                            <div className="text-xs text-gray-400">{user.phone}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {getRoleDisplayName(user.role)}
                      </Badge>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        {user.team && <div className="font-medium">{user.team}</div>}
                        {user.school && <div className="text-gray-500">{user.school}</div>}
                        {user.position && <div className="text-xs text-gray-400">{user.position}</div>}
                        {!user.team && !user.school && <span className="text-gray-400">-</span>}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {user.verified ? (
                          <Badge className="bg-green-100 text-green-800">
                            <UserCheck className="w-3 h-3 mr-1" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge className="bg-yellow-100 text-yellow-800">
                            <UserX className="w-3 h-3 mr-1" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {user.twoFactorEnabled ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Shield className="w-3 h-3 mr-1" />
                          Enabled
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">Disabled</span>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleToggleVerification(user.id)}>
                            {user.verified ? <UserX className="w-4 h-4 mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                            {user.verified ? 'Unverify User' : 'Verify User'}
                          </DropdownMenuItem>
                          
                          {/* Role Change Submenu */}
                          <DropdownMenuItem asChild>
                            <div className="relative group">
                              <div className="flex items-center cursor-pointer">
                                <Edit className="w-4 h-4 mr-2" />
                                Change Role
                              </div>
                              <div className="absolute left-full top-0 ml-1 hidden group-hover:block bg-white border border-gray-200 rounded-md shadow-lg py-1 min-w-[120px]">
                                {['student', 'coach', 'parent', 'supporter', 'admin'].map((role) => (
                                  <button
                                    key={role}
                                    onClick={() => handleRoleChange(user.id, role)}
                                    className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                                    disabled={user.role === role}
                                  >
                                    {getRoleDisplayName(role)}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </DropdownMenuItem>
                          
                          {user.role !== 'admin' && (
                            <DropdownMenuItem 
                              onClick={() => handleDeleteUser(user.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete User
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No users found matching your criteria.
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}