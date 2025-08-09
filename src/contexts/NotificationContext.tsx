import { createContext, useContext, ReactNode } from 'react'

interface NotificationContextType {
  sendEmailNotification: (to: string, subject: string, message: string) => Promise<void>
  sendSMSNotification: (to: string, message: string) => Promise<void>
  sendEmailVerification: (email: string, name: string) => Promise<void>
  subscribeToUpdates: (campaignId: string, email: string, phone?: string) => Promise<void>
  sendDonationConfirmation: (email: string, phone: string, amount: number, teamName: string) => Promise<void>
  sendTeamJoinNotification: (email: string, phone: string, teamName: string) => Promise<void>
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const sendEmailNotification = async (to: string, subject: string, message: string) => {
    // In a real application, this would integrate with email services like:
    // - SendGrid: https://sendgrid.com/
    // - Mailgun: https://www.mailgun.com/
    // - AWS SES: https://aws.amazon.com/ses/
    
    console.log('📧 EMAIL SENT')
    console.log('To:', to)
    console.log('Subject:', subject)
    console.log('Message:', message)
    console.log('---')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show user notification that email was sent
    if (typeof window !== 'undefined') {
      // Create a temporary notification
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-green-500 text-white p-4 rounded-lg shadow-lg z-50'
      notification.textContent = `Email sent to ${to}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  }

  const sendSMSNotification = async (to: string, message: string) => {
    // In a real application, this would integrate with SMS services like:
    // - Twilio: https://www.twilio.com/
    // - AWS SNS: https://aws.amazon.com/sns/
    // - Vonage: https://www.vonage.com/
    
    console.log('📱 SMS SENT')
    console.log('To:', to)
    console.log('Message:', message)
    console.log('---')
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Show user notification that SMS was sent
    if (typeof window !== 'undefined') {
      const notification = document.createElement('div')
      notification.className = 'fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50'
      notification.textContent = `SMS sent to ${to}`
      document.body.appendChild(notification)
      
      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    }
  }

  const sendEmailVerification = async (email: string, name: string) => {
    const subject = 'Verify Your Believe Fundraising Group Account'
    const message = `
Hi ${name},

Welcome to Believe Fundraising Group! Please verify your email address by clicking the link below:

https://believefundraising.com/verify?token=${btoa(email + Date.now())}

This link will expire in 24 hours. If you didn't create this account, please ignore this email.

Best regards,
Believe Fundraising Group Support Team

---
This is an automated message. Please do not reply to this email.
    `
    
    await sendEmailNotification(email, subject, message)
  }

  const subscribeToUpdates = async (campaignId: string, email: string, phone?: string) => {
    console.log('🔔 SUBSCRIPTION CREATED')
    console.log('Campaign ID:', campaignId)
    console.log('Email:', email)
    console.log('Phone:', phone)
    console.log('---')
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Send confirmation email
    const emailSubject = 'Subscription Confirmed - Team Updates'
    const emailMessage = `
You have successfully subscribed to team campaign updates!

You'll receive notifications about:
- Fundraising progress milestones
- Team achievements and game results
- Important announcements from the team
- Upcoming events and competitions

To unsubscribe at any time, click here: https://believefundraising.com/unsubscribe?token=${btoa(email + campaignId)}

Thank you for supporting youth sports!

Believe Fundraising Group
    `
    
    await sendEmailNotification(email, emailSubject, emailMessage)
    
    // Send confirmation SMS if phone provided
    if (phone) {
      const smsMessage = `You're subscribed to team updates! You'll get SMS notifications about fundraising progress and team news. Reply STOP to unsubscribe.`
      await sendSMSNotification(phone, smsMessage)
    }
  }

  const sendDonationConfirmation = async (email: string, phone: string, amount: number, teamName: string) => {
    const transactionId = `TXN-${Date.now()}`
    
    // Send email confirmation
    const emailSubject = `Donation Confirmation - $${amount} to ${teamName}`
    const emailMessage = `
Thank you for your generous donation of $${amount} to ${teamName}!

Your support helps the team reach their goals and compete at the highest level.

TRANSACTION DETAILS:
- Amount: $${amount}
- Team: ${teamName}
- Date: ${new Date().toLocaleDateString()}
- Transaction ID: ${transactionId}
- Payment Method: Credit Card ending in ****

WHAT HAPPENS NEXT:
- You will receive updates about the team's progress
- Your donation will be used for equipment, travel, and competition fees
- You may be eligible for a tax deduction (consult your tax advisor)

Questions? Contact us at support@believefundraising.com

Thank you for supporting youth sports!

Believe Fundraising Group
    `
    
    await sendEmailNotification(email, emailSubject, emailMessage)
    
    // Send SMS confirmation
    const smsMessage = `✅ Donation confirmed! $${amount} to ${teamName}. Transaction ID: ${transactionId}. Thank you for your support!`
    await sendSMSNotification(phone, smsMessage)
  }

  const sendTeamJoinNotification = async (email: string, phone: string, teamName: string) => {
    // Send email notification
    const emailSubject = `You're now following ${teamName}!`
    const emailMessage = `
Welcome to the ${teamName} community!

You are now following ${teamName} and will receive updates about:

📈 FUNDRAISING PROGRESS
- Milestone achievements
- Goal updates
- Supporter highlights

🏆 TEAM ACHIEVEMENTS
- Game results and highlights
- Tournament progress
- Player spotlights

📢 IMPORTANT ANNOUNCEMENTS
- Schedule changes
- Special events
- Community activities

🎯 UPCOMING EVENTS
- Games and competitions
- Fundraising events
- Team meetings

To stop following this team, click here: https://believefundraising.com/unfollow?team=${btoa(teamName)}&email=${btoa(email)}

Go ${teamName}!

Believe Fundraising Group
    `
    
    await sendEmailNotification(email, emailSubject, emailMessage)
    
    // Send SMS notification
    const smsMessage = `🏆 You're now following ${teamName}! Get ready for updates on games, fundraising progress, and team news. Reply STOP to unsubscribe.`
    await sendSMSNotification(phone, smsMessage)
  }

  return (
    <NotificationContext.Provider value={{
      sendEmailNotification,
      sendSMSNotification,
      sendEmailVerification,
      subscribeToUpdates,
      sendDonationConfirmation,
      sendTeamJoinNotification
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