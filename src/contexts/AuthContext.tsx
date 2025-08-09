import { createContext, useContext, useState, ReactNode, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'student' | 'coach' | 'parent' | 'supporter' | 'admin'
  team?: string
  position?: string
  phone?: string
  school?: string
  sport?: string
  profileImage?: string
  verified: boolean
  twoFactorEnabled?: boolean
}

interface RegisterData {
  name: string
  email: string
  password: string
  role: 'student' | 'coach' | 'parent' | 'supporter'
  team?: string
  position?: string
  phone?: string
}

interface LoginData {
  email: string
  password: string
}

interface AuthContextType {
  user: User | null
  login: (data: LoginData) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  isAdmin: boolean
  getAllUsers: () => User[]
  updateUserRole: (userId: string, role: User['role']) => void
  updateUser: (userId: string, updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const STORAGE_KEY = 'believefundraising_users'
const CURRENT_USER_KEY = 'believefundraising_current_user'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [users, setUsers] = useState<User[]>([])

  // Load users and current user from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem(STORAGE_KEY)
    const savedCurrentUser = localStorage.getItem(CURRENT_USER_KEY)
    
    if (savedUsers) {
      try {
        const parsedUsers = JSON.parse(savedUsers)
        setUsers(parsedUsers)
      } catch (error) {
        console.error('Error parsing saved users:', error)
        initializeDefaultUsers()
      }
    } else {
      initializeDefaultUsers()
    }

    if (savedCurrentUser) {
      try {
        const parsedUser = JSON.parse(savedCurrentUser)
        setUser(parsedUser)
      } catch (error) {
        console.error('Error parsing current user:', error)
      }
    }
  }, [])

  const initializeDefaultUsers = () => {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        name: 'Admin User',
        email: 'admin@believefundraising.com',
        role: 'admin',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/64/32/32'
      },
      {
        id: 'coach-1',
        name: 'Coach Johnson',
        email: 'coach.johnson@lincolnhigh.edu',
        role: 'coach',
        team: 'Eagles Basketball Team',
        school: 'Lincoln High School',
        sport: 'Basketball',
        phone: '(555) 123-4567',
        verified: true,
        twoFactorEnabled: true,
        profileImage: 'https://picsum.photos/id/91/32/32'
      },
      {
        id: 'student-1',
        name: 'Alex Thompson',
        email: 'alex.thompson@student.lincolnhigh.edu',
        role: 'student',
        team: 'Eagles Basketball Team',
        school: 'Lincoln High School',
        sport: 'Basketball',
        position: 'Point Guard',
        phone: '(555) 234-5678',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/22/32/32'
      },
      {
        id: 'parent-1',
        name: 'Sarah Wilson',
        email: 'sarah.wilson@email.com',
        role: 'parent',
        phone: '(555) 345-6789',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/65/32/32'
      },
      {
        id: 'supporter-1',
        name: 'Mike Chen',
        email: 'mike.chen@email.com',
        role: 'supporter',
        phone: '(555) 456-7890',
        verified: true,
        twoFactorEnabled: false,
        profileImage: 'https://picsum.photos/id/32/32/32'
      }
    ]
    
    setUsers(defaultUsers)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultUsers))
  }

  // Save users to localStorage whenever users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users))
    }
  }, [users])

  // Save current user to localStorage whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(CURRENT_USER_KEY)
    }
  }, [user])

  const login = async (data: LoginData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const foundUser = users.find(u => u.email === data.email)
    if (foundUser) {
      setUser(foundUser)
    } else {
      throw new Error('Invalid credentials')
    }
  }

  const register = async (data: RegisterData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === data.email)
    if (existingUser) {
      throw new Error('User already exists')
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: data.role,
      team: data.team,
      position: data.position,
      phone: data.phone,
      verified: false,
      twoFactorEnabled: false,
      profileImage: `https://picsum.photos/id/${Math.floor(Math.random() * 100)}/32/32`
    }

    setUsers(prev => [...prev, newUser])
    setUser(newUser)
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(CURRENT_USER_KEY)
  }

  const getAllUsers = () => {
    return users
  }

  const updateUserRole = (userId: string, role: User['role']) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, role } : null)
    }
  }

  const updateUser = (userId: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, ...updates } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      setUser(prev => prev ? { ...prev, ...updates } : null)
    }
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      isAdmin,
      getAllUsers,
      updateUserRole,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}