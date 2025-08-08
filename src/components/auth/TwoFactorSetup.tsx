import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { Shield, Smartphone, Mail, Key, CheckCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function TwoFactorSetup() {
  const [step, setStep] = useState(1)
  const [method, setMethod] = useState<'sms' | 'email' | null>(null)
  const [verificationCode, setVerificationCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { user, enable2FA } = useAuth()
  const { sendSMSNotification, sendEmailNotification } = useNotifications()
  const navigate = useNavigate()

  const handleMethodSelect = (selectedMethod: 'sms' | 'email') => {
    setMethod(selectedMethod)
    setStep(2)
  }

  const sendVerificationCode = async () => {
    if (!user || !method) return
    
    setLoading(true)
    setError('')
    
    try {
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      
      if (method === 'sms' && user.phone) {
        await sendSMSNotification(
          user.phone,
          `Your Team Fundraising verification code is: ${code}. This code expires in 10 minutes.`
        )
      } else if (method === 'email') {
        await sendEmailNotification(
          user.email,
          'Two-Factor Authentication Setup',
          `Your verification code is: ${code}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`
        )
      }
      
      // Store the code for verification (in real app, this would be server-side)
      sessionStorage.setItem('2fa_code', code)
      setStep(3)
    } catch (err) {
      setError('Failed to send verification code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const verifyCode = async () => {
    setLoading(true)
    setError('')
    
    try {
      const storedCode = sessionStorage.getItem('2fa_code')
      
      if (verificationCode === storedCode) {
        await enable2FA(method!)
        sessionStorage.removeItem('2fa_code')
        setStep(4)
      } else {
        setError('Invalid verification code. Please try again.')
      }
    } catch (err) {
      setError('Verification failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleComplete = () => {
    navigate('/profile')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <Card className="p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Two-Factor Authentication Setup</h1>
            <p className="text-gray-600">Add an extra layer of security to your account</p>
          </div>

          {/* Step 1: Choose Method */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Verification Method</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button
                  variant="outline"
                  className="h-24 flex-col space-y-2"
                  onClick={() => handleMethodSelect('sms')}
                  disabled={!user?.phone}
                >
                  <Smartphone className="w-6 h-6" />
                  <span>SMS Text Message</span>
                  {!user?.phone && <span className="text-xs text-red-500">Phone required</span>}
                </Button>

                <Button
                  variant="outline"
                  className="h-24 flex-col space-y-2"
                  onClick={() => handleMethodSelect('email')}
                >
                  <Mail className="w-6 h-6" />
                  <span>Email Verification</span>
                </Button>
              </div>

              <div className="text-center">
                <Button variant="ghost" onClick={() => navigate('/profile')}>
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Confirm Method */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Confirm Your Method</h2>
                <div className="flex items-center justify-center space-x-2 mb-4">
                  {method === 'sms' ? <Smartphone className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                  <span className="text-gray-600">
                    {method === 'sms' 
                      ? `SMS to ${user?.phone}` 
                      : `Email to ${user?.email}`
                    }
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  We'll send you a verification code each time you log in from a new device or location.
                </p>
              </div>

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button onClick={sendVerificationCode} disabled={loading} className="flex-1">
                  {loading ? 'Sending...' : 'Send Verification Code'}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Verify Code */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Enter Verification Code</h2>
                <p className="text-gray-600 mb-4">
                  We sent a 6-digit code to {method === 'sms' ? user?.phone : user?.email}
                </p>
              </div>

              <div>
                <Label htmlFor="code">Verification Code</Label>
                <Input
                  id="code"
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className="text-center text-lg tracking-widest"
                  maxLength={6}
                />
              </div>

              {error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-md">{error}</div>
              )}

              <div className="flex space-x-4">
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button 
                  onClick={verifyCode} 
                  disabled={loading || verificationCode.length !== 6}
                  className="flex-1"
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>
              </div>

              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={sendVerificationCode}>
                  Resend Code
                </Button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">2FA Enabled Successfully!</h2>
                <p className="text-gray-600">
                  Your account is now protected with two-factor authentication.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Key className="w-4 h-4 text-green-600" />
                  <span className="font-medium text-green-800">What happens next?</span>
                </div>
                <p className="text-sm text-green-700">
                  You'll receive a verification code via {method === 'sms' ? 'SMS' : 'email'} when logging in from new devices.
                </p>
              </div>

              <Button onClick={handleComplete} className="w-full">
                Continue to Profile
              </Button>
            </div>
          )}
        </Card>
      </main>
    </div>
  )
}