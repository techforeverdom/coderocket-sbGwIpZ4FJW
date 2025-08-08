import { useState } from 'react'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { CreditCard, Lock, ArrowLeft } from 'lucide-react'
import { useNotifications } from '../../contexts/NotificationContext'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useAuth } from '../../contexts/AuthContext'

interface StripePaymentProps {
  amount: number
  campaignId: string
  teamName: string
  onSuccess: () => void
  onCancel: () => void
}

export function StripePayment({ amount, campaignId, teamName, onSuccess, onCancel }: StripePaymentProps) {
  const [loading, setLoading] = useState(false)
  const [cardNumber, setCardNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [cvv, setCvv] = useState('')
  const [name, setName] = useState('')
  const { sendDonationConfirmation } = useNotifications()
  const { updateCampaignFunding } = useCampaigns()
  const { user } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Simulate Stripe payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update campaign funding
      updateCampaignFunding(campaignId, amount)
      
      // Send confirmation notifications if user has email and phone
      if (user && user.email && user.phone) {
        await sendDonationConfirmation(user.email, user.phone, amount, teamName)
      }
      
      alert(`Payment successful! Thank you for donating $${amount} to ${teamName}.`)
      onSuccess()
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return v
    }
  }

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4)
    }
    return v
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Complete Your Donation</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-gray-700">Donation Amount:</span>
          <span className="text-2xl font-bold text-blue-600">${amount}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">Supporting:</span>
          <span className="font-medium text-gray-900">{teamName}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Cardholder Name</Label>
          <Input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            required
          />
        </div>

        <div>
          <Label htmlFor="cardNumber">Card Number</Label>
          <div className="relative">
            <Input
              id="cardNumber"
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
            <CreditCard className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiry">Expiry Date</Label>
            <Input
              id="expiry"
              type="text"
              value={expiryDate}
              onChange={(e) => setExpiryDate(formatExpiryDate(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              required
            />
          </div>
          <div>
            <Label htmlFor="cvv">CVV</Label>
            <Input
              id="cvv"
              type="text"
              value={cvv}
              onChange={(e) => setCvv(e.target.value.replace(/\D/g, ''))}
              placeholder="123"
              maxLength={4}
              required
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-gray-600 mt-4">
          <Lock className="w-4 h-4" />
          <span>Your payment information is secure and encrypted</span>
        </div>

        <Button 
          type="submit" 
          className="w-full h-12 text-lg font-semibold mt-6"
          disabled={loading}
        >
          {loading ? 'Processing...' : `Donate $${amount}`}
        </Button>
      </form>
    </Card>
  )
}