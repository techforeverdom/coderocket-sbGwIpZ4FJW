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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Mock user database - only admin account exists by default
const mockUsers: MockUser[] = [
  {
    id: '1',
    email: 'admin@teamfundraising.com',
    password: 'admin123',
    name: 'System Administrator',
    role: 'admin',
    verified: true
  }
]

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

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
        twoFactorMethod: foundUser.twoFactorMethod
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
      mockUsers.push(newMockUser)
      
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
    const userIndex = mockUsers.findIndex(u => u.id === user.id)
    if (userIndex !== -1) {
      mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        twoFactorEnabled: true,
        twoFactorMethod: method
      }
    }
    
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const isAdmin = user?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading, isAdmin, enable2FA }}>
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