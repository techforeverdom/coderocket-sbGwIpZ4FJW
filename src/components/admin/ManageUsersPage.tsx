import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Badge } from '../ui/badge'
import { Avatar } from '../ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { Search, Filter, MoreHorizontal, UserCheck, UserX, Trash2, Shield, Users } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

export function ManageUsersPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const { getAllUsers, updateUserRole, deleteUser, toggleUserVerification, user: currentUser } = useAuth()
  
  const allUsers = getAllUsers()

  const handleRoleChange = (userId: string, newRole: string) => {
    if (userId === currentUser?.id && newRole !== 'admin') {
      alert('You cannot change your own admin role')
      return
    }
    updateUserRole(userId, newRole as 'student' | 'coach' | 'parent' | 'supporter' | 'admin')
  }

  const handleDeleteUser = (userId: string) => {
    if (userId === currentUser?.id) {
      alert('You cannot delete your own account')
      return
    }
    
    if (userI