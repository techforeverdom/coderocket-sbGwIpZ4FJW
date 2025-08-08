import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Card } from '../ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '' as 'coach' | 'player' | 'supporter' | '',
    phone: '',
    team: '',
    position: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verificationSent, setVerificationSent] = useState(false)
  const { register } = useAuth()
  const { sendEmailVerification } = useNotifications()
  const navigate = useNavigate()

  const validatePhone = (phone: string) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '')
    
    // Check if it's a valid US phone number (10 digits) or international (7-15 digits)
    if (cleaned.length === 10) {
      // US format: (XXX) XXX-XXXX
      return cleaned.match(/^\d{10}$/) !== null
    } else if (cleaned.length >= 7 && cleaned.length <= 15) {
      // International format
      return cleaned.match(/^\d{7,15}$/) !== null
    }
    return false
  }

  const formatPhone = (phone: string) => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
    }
    return phone
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Full name is required')
      return false
    }
    
    if (!formData.email.trim()) {
      setError('Email is required')
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    
    if (!formData.phone.trim()) {
      setError('Phone number is required')
      return false
    }
    
    if (!validatePhone(formData.phone)) {
      setError('Please enter a valid phone number (10 digits for US, 7-15 digits for international)')
      return false
    }
    
    if (!formData.role) {
      setError('Please select your role')
      return false
    }
    
    if (!formData.password) {
      setError('Password is required')
      return false
    }
    
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long')
      return false
    }
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return false
    }
    
    if ((formData.role === 'coach' || formData.role === 'player') && !formData.team.trim()) {
      setError('Team name is required for coaches and players')
      return false
    }
    
    if (formData.role === 'player' && !formData.position.trim()) {
      setError('Position is required for players')
      return false
    }
    
    return true
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    // Allow only numbers, spaces, parentheses, and dashes
    const cleaned = value.replace(/[^\d\s\(\)\-]/g, '')
    setFormData({...formData, phone: cleaned})
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!validateForm()) {
      setLoading(false)
      return
    }

    try {
      // Format phone number before submitting
      const formattedData = {
        ...formData,
        phone: formatPhone(formData.phone)
      }
      
      await register(formattedData as any)
      
      // Send verification email
      await sendEmailVerification(formData.email, formData.name)
      setVerificationSent(true)
      
      // Auto redirect after showing verification message
      setTimeout(() => {
        navigate('/')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (verificationSent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
        <Card className="w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Created!</h1>
          <p className="text-gray-600 mb-4">
            We've sent a verification email to <strong>{formData.email}</strong>. 
            Please check your inbox and click the verification link to activate your account.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting you to the dashboard in a few seconds...
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">T</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Join Team Fundraising</h1>
          <p className="text-gray-600 mt-2">Create your account to support sports teams</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <Label htmlFor="phone">Phone Number *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={handlePhoneChange}
              placeholder="(555) 123-4567 or +1234567890"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              US: 10 digits (555) 123-4567 | International: 7-15 digits +1234567890
            </p>
          </div>

          <div>
            <Label htmlFor="role">I am a *</Label>
            <Select value={formData.role} onValueChange={(value: 'coach' | 'player' | 'supporter') => setFormData({...formData, role: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="supporter">Team Supporter</SelectItem>
                <SelectItem value="player">Team Player</SelectItem>
                <SelectItem value="coach">Coach/Staff</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(formData.role === 'player' || formData.role === 'coach') && (
            <>
              <div>
                <Label htmlFor="team">Team Name *</Label>
                <Input
                  id="team"
                  type="text"
                  value={formData.team}
                  onChange={(e) => setFormData({...formData, team: e.target.value})}
                  placeholder="Enter your team name"
                  required
                />
              </div>
              {formData.role === 'player' && (
                <div>
                  <Label htmlFor="position">Position *</Label>
                  <Input
                    id="position"
                    type="text"
                    value={formData.position}
                    onChange={(e) => setFormData({...formData, position: e.target.value})}
                    placeholder="Enter your position"
                    required
                  />
                </div>
              )}
            </>
          )}

          <div>
            <Label htmlFor="password">Password *</Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              placeholder="Create a password (min 6 characters)"
              required
            />
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              placeholder="Confirm your password"
              required
            />
          </div>

          {error && (
            <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </Card>
    </div>
  )
}