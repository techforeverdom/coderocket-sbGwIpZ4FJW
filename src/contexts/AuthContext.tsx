import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: 'coach' | 'player' | 'supporter' | 'admin'
  profileImage?: string
  phone?: string
  team?: string
  position?: string
  school?: string
  sport?: string
  verified: boolean
  twoFactorEnabled?: boolean
  twoFactorMethod?: 'sms' | 'email'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  loading: boolean
  isAdmin: boolean
  enable2FA: (method: 'sms' | 'email') => Promise<void>
  getAllUsers: () => User[]
  updateUserRole: (userId: string, role: 'admin' | 'coach' | 'player' | 'supporter') => void
  deleteUser: (userId: string) => void
  toggleUserVerification: (userId: string) => void
}

interface RegisterData {
  email: string
  password: string
  name: string
  role: 'coach' | 'player' | 'supporter'
  phone?: string
  team?: string
  position?: string
}

interface MockUser {
  id: string
  email: string
  password: string
  name: string
  role: 'coach' | 'player' | 'supporter' | 'admin'
  team?: string
  position?: string
  school?: string
  sport?: string
  verified: boolean
  twoFactorEnabled?: boolean
  twoFactorMethod?: 'sms' | 'email'
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const USERS_STORAGE_KEY = 'believefundraising_users'

// Initialize with admin account
const getInitialUsers = (): MockUser[] => {
  const savedUsers = localStorage.getItem(USERS_STORAGE_KEY)
  if (savedUsers) {
    return JSON.parse(savedUsers)
  }
  
  const defaultUsers: MockUser[] = [
    {
      id: '1',
      email: 'admin@believefundraising.com',
      password: 'admin123',
      name: 'System Administrator',
      role: 'admin',
      verified: true,
      phone: '(555) 123-4567'
    }
  ]
  
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers))
  return defaultUsers
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [mockUsers, setMockUsers] = useState<MockUser[]>(getInitialUsers)

  // Save users to localStorage whenever mockUsers changes
  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(mockUsers))
  }, [mockUsers])

  useEffect(() => {
    // Check for existing session
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Find user in mock database
      const foundUser = mockUsers.find(u => u.email === email && u.password === password)
      
      if (!foundUser) {
        throw new Error('Invalid email or password')
      }
      
      // Remove password from user object and create User type
      const userData: User = {
        id: foundUser.id,
        email: foundUser.email,
        name: foundUser.name,
        role: foundUser.role,
        team: foundUser.team,
        position: foundUser.position,
        school: foundUser.school,
        sport: foundUser.sport,
        verified: foundUser.verified,
        twoFactorEnabled: foundUser.twoFactorEnabled,
        twoFactorMethod: foundUser.twoFactorMethod,
        phone: foundUser.phone
      }
      
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    setLoading(true)
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Check if user already exists
      const existingUser = mockUsers.find(u => u.email === userData.email)
      if (existingUser) {
        throw new Error('User with this email already exists')
      }
      
      const newUser: User = {
        id: Date.now().toString(),
        email: userData.email,
        name: userData.name,
        role: userData.role,
        phone: userData.phone,
        team: userData.team,
        position: userData.position,
        verified: false
      }
      
      // Add to mock database
      const newMockUser: MockUser = {
        ...newUser,
        password: userData.password
      }
      
      setMockUsers(prev => [...prev, newMockUser])
      setUser(newUser)
      localStorage.setItem('user', JSON.stringify(newUser))
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }

  const enable2FA = async (method: 'sms' | 'email') => {
    if (!user) return
    
    const updatedUser = {
      ...user,
      twoFactorEnabled: true,
      twoFactorMethod: method
    }
    
    // Update mock database
    setMockUsers(prev => prev.map(u => 
      u.id === user.id 
        ? { ...u, twoFactorEnabled: true, twoFactorMethod: method }
        : u
    ))
    
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const getAllUsers = (): User[] => {
    return mockUsers.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      team: u.team,
      position: u.position,
      school: u.school,
      sport: u.sport,
      verified: u.verified,
      twoFactorEnabled: u.twoFactorEnabled,
      twoFactorMethod: u.twoFactorMethod,
      phone: u.phone
    }))
  }

  const updateUserRole = (userId: string, role: 'admin' | 'coach' | 'player' | 'supporter') => {
    setMockUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, role } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      const updatedUser = { ...user, role }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const deleteUser = (userId: string) => {
    setMockUsers(prev => prev.filter(u => u.id !== userId))
    
    // If deleting current user, logout
    if (user && user.id === userId) {
      logout()
    }
  }

  const toggleUserVerification = (userId: string) => {
    setMockUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, verified: !u.verified } : u
    ))
    
    // Update current user if it's the same user
    if (user && user.id === userId) {
      const updatedUser = { ...user, verified: !user.verified }
      setUser(updatedUser)
      localStorage.setItem('user', JSON.stringify(updatedUser))
    }
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      loading, 
      isAdmin, 
      enable2FA,
      getAllUsers,
      updateUserRole,
      deleteUser,
      toggleUserVerification
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