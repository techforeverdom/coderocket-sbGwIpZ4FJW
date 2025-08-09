import { createContext, useContext, useState, ReactNode, useEffect } from 'react'
import { useAuth } from './AuthContext'

interface Notification {
  id: string
  userId: string
  type: 'donation' | 'milestone' | 'team_update' | 'account' | 'system' | 'contact_response'
  title: string
  message: string
  relatedId?: string // campaign ID, team ID, etc.
  timestamp: string
  read: boolean
  actionUrl?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void
  markAsRead: (notificationId: string) => void
  removeNotification: (notificationId: string) => void
  markAllAsRead: () => void
  getUserNotifications: (userId: string) => Notification[]
  sendTeamJoinNotification: (email: string, phone: string, teamName: string) => Promise<void>
  sendEmailNotification: (email: string, subject: string, message: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

const STORAGE_KEY = 'believefundraising_notifications'

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { user } = useAuth()

  // Load notifications from localStorage on mount
  useEffect(() => {
    const savedNotifications = localStorage.getItem(STORAGE_KEY)
    if (savedNotifications) {
      try {
        setNotifications(JSON.parse(savedNotifications))
      } catch (error) {
        console.error('Error parsing saved notifications:', error)
        initializeUserNotifications()
      }
    } else {
      initializeUserNotifications()
    }
  }, [user])

  const initializeUserNotifications = () => {
    if (!user) return

    const defaultNotifications: Notification[] = [
      {
        id: `notif-${Date.now()}-1`,
        userId: user.id,
        type: 'account',
        title: 'Welcome to Believe Fundraising Group!',
        message: 'Your account has been successfully created. Start exploring campaigns and supporting teams.',
        timestamp: new Date().toISOString(),
        read: false,
        actionUrl: '/profile'
      },
      {
        id: `notif-${Date.now()}-2`,
        userId: user.id,
        type: 'system',
        title: 'Complete your profile',
        message: 'Add your phone number and profile information to get the most out of our platform.',
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        read: false,
        actionUrl: '/profile'
      }
    ]

    // Add team-specific notifications if user has a team
    if (user.team) {
      defaultNotifications.push({
        id: `notif-${Date.now()}-3`,
        userId: user.id,
        type: 'team_update',
        title: `${user.team} Campaign Update`,
        message: 'Your team campaign is performing well! Keep sharing to reach your goal.',
        timestamp: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        read: false,
        relatedId: 'eagles-basketball-2024'
      })
    }

    setNotifications(defaultNotifications)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultNotifications))
  }

  // Save notifications to localStorage whenever notifications change
  useEffect(() => {
    if (notifications.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications))
    }
  }, [notifications])

  const getUserNotifications = (userId: string) => {
    return notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }

  const unreadCount = user ? getUserNotifications(user.id).filter(n => !n.read).length : 0

  const addNotification = (notificationData: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString()
    }

    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(notification => 
      notification.id === notificationId 
        ? { ...notification, read: true }
        : notification
    ))
  }

  const removeNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== notificationId))
  }

  const markAllAsRead = () => {
    if (!user) return
    setNotifications(prev => prev.map(notification => 
      notification.userId === user.id 
        ? { ...notification, read: true }
        : notification
    ))
  }

  const sendTeamJoinNotification = async (email: string, phone: string, teamName: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    
    if (user) {
      addNotification({
        userId: user.id,
        type: 'team_update',
        title: `Following ${teamName}`,
        message: `You are now following ${teamName}. You'll receive updates about their campaign progress.`,
        read: false,
        relatedId: 'eagles-basketball-2024'
      })
    }
  }

  const sendEmailNotification = async (email: string, subject: string, message: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log(`Email sent to ${email}: ${subject}`)
  }

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      removeNotification,
      markAllAsRead,
      getUserNotifications,
      sendTeamJoinNotification,
      sendEmailNotification
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}