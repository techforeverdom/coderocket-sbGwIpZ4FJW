import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Input } from '../ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, Filter, Edit, Trash2, Shield, UserCheck, UserX } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const { getAllUsers, updateUserRole, deleteUser, toggleUserVerification } = useAuth()
  
  const allUsers = getAllUsers()

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge className="bg-red-100 text-red-800">Admin</Badge>
      case 'coach':
        return <Badge className="bg-blue-100 text-blue-800">Coach</Badge>
      case 'player':
        return <Badge className="bg-green-100 text-green-800">Player</Badge>
      case 'supporter':
        return <Badge className="bg-purple-100 text-purple-800">Supporter</Badge>
      default:
        return <Badge variant="secondary">{role}</Badge>
    }
  }

  const handleRoleChange = (userId: string, newRole: 'admin' | 'coach' | 'player' | 'supporter') => {
    updateUserRole(userId, newRole)
    alert(`User role updated to ${newRole}`)
  }

  const handleDeleteUser = (userId: string, userName: string) => {
    if (confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      deleteUser(userId)
      alert('User deleted successfully')
    }
  }

  const handleToggleVerification = (userId: string, currentStatus: boolean) => {
    toggleUserVerification(userId)
    alert(`User ${currentStatus ? 'unverified' : 'verified'} successfully`)
  }

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.team && user.team.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesRole = roleFilter === 'all' || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="w-6 h-6 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Manage Users</h1>
          </div>
          <p className="text-gray-600">
            Manage user accounts, roles, and verification status
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search users by name, email, or team..."
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
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="coach">Coach</SelectItem>
                  <SelectItem value="player">Player</SelectItem>
                  <SelectItem value="supporter">Supporter</SelectItem>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Contact</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Role</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-3">
                        <img 
                          src={user.profileImage || "https://picsum.photos/id/64/40/40"} 
                          alt={user.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{user.email}</div>
                        <div className="text-gray-500">{user.phone || 'No phone'}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        {getRoleBadge(user.role)}
                        <Select 
                          value={user.role} 
                          onValueChange={(value: 'admin' | 'coach' | 'player' | 'supporter') => 
                            handleRoleChange(user.id, value)
                          }
                        >
                          <SelectTrigger className="w-32 h-8">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="coach">Coach</SelectItem>
                            <SelectItem value="player">Player</SelectItem>
                            <SelectItem value="supporter">Supporter</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-gray-900">{user.team || 'No team'}</div>
                        {user.position && (
                          <div className="text-gray-500">{user.position}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Badge variant={user.verified ? "default" : "secondary"}>
                          {user.verified ? 'Verified' : 'Unverified'}
                        </Badge>
                        {user.twoFactorEnabled && (
                          <Badge variant="outline" className="text-xs">
                            2FA
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-1">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          title={user.verified ? "Unverify User" : "Verify User"}
                          onClick={() => handleToggleVerification(user.id, user.verified)}
                        >
                          {user.verified ? (
                            <UserX className="w-4 h-4 text-orange-600" />
                          ) : (
                            <UserCheck className="w-4 h-4 text-green-600" />
                          )}
                        </Button>
                        <Button variant="ghost" size="sm" title="Edit User">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          title="Delete User"
                          onClick={() => handleDeleteUser(user.id, user.name)}
                          disabled={user.role === 'admin'}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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

        {/* User Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {allUsers.filter(u => u.role === 'admin').length}
            </div>
            <div className="text-sm text-gray-600">Admins</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600">
              {allUsers.filter(u => u.role === 'coach').length}
            </div>
            <div className="text-sm text-gray-600">Coaches</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {allUsers.filter(u => u.role === 'player').length}
            </div>
            <div className="text-sm text-gray-600">Players</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {allUsers.filter(u => u.role === 'supporter').length}
            </div>
            <div className="text-sm text-gray-600">Supporters</div>
          </Card>
        </div>
      </main>
    </div>
  )
}