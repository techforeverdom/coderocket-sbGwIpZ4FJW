import { useState } from 'react'
import { Card } from './ui/card'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Heart, Users, TrendingUp, CreditCard } from 'lucide-react'
import { StripePayment } from './payment/StripePayment'
import { useNotifications } from '../contexts/NotificationContext'
import { useAuth } from '../contexts/AuthContext'

interface Campaign {
  id: string
  title: string
  team: string
  school: string
  sport: string
  raised: number
  goal: number
  supporters: number
  status: 'active' | 'pending' | 'paused' | 'completed'
  image: string
  description: string
  story: string
  created: string
  deadline: string
  coachName?: string
  coachEmail?: string
}

interface TeamDonationSectionProps {
  campaign: Campaign
}

export function TeamDonationSection({ campaign }: TeamDonationSectionProps) {
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [showPayment, setShowPayment] = useState(false)
  const [subscribeUpdates, setSubscribeUpdates] = useState(false)
  const [subscribeSMS, setSubscribeSMS] = useState(false)
  const { subscribeToUpdates } = useNotifications()
  const { user } = useAuth()

  const presetAmounts = [25, 50, 100, 250, 500]
  const donationAmount = customAmount ? parseInt(customAmount) : selectedAmount

  const handleDonateClick = async () => {
    if (subscribeUpdates && user && user.email) {
      await subscribeToUpdates(
        campaign.id,
        user.email,
        subscribeSMS ? user.phone : undefined
      )
    }
    setShowPayment(true)
  }

  const handleSubscribeUpdatesChange = (checked: boolean | 'indeterminate') => {
    setSubscribeUpdates(checked === true)
  }

  const handleSubscribeSMSChange = (checked: boolean | 'indeterminate') => {
    setSubscribeSMS(checked === true)
  }

  if (showPayment) {
    return (
      <StripePayment 
        amount={donationAmount}
        campaignId={campaign.id}
        teamName={campaign.team}
        onSuccess={() => setShowPayment(false)}
        onCancel={() => setShowPayment(false)}
      />
    )
  }

  const averageDonation = campaign.supporters > 0 ? Math.round(campaign.raised / campaign.supporters) : 0

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Support {campaign.team}</h3>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            {presetAmounts.map((amount) => (
              <Button
                key={amount}
                variant={selectedAmount === amount ? "default" : "outline"}
                onClick={() => {
                  setSelectedAmount(amount)
                  setCustomAmount('')
                }}
                className="h-12"
              >
                ${amount}
              </Button>
            ))}
          </div>

          <div>
            <Input
              type="number"
              placeholder="Custom amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value)
                setSelectedAmount(0)
              }}
              className="h-12"
            />
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="updates" 
                checked={subscribeUpdates}
                onCheckedChange={handleSubscribeUpdatesChange}
              />
              <label htmlFor="updates" className="text-sm text-gray-700">
                Subscribe to team updates via email
              </label>
            </div>
            
            {subscribeUpdates && (
              <div className="flex items-center space-x-2 ml-6">
                <Checkbox 
                  id="sms" 
                  checked={subscribeSMS}
                  onCheckedChange={handleSubscribeSMSChange}
                />
                <label htmlFor="sms" className="text-sm text-gray-700">
                  Also receive SMS notifications
                </label>
              </div>
            )}
          </div>

          <Button 
            className="w-full h-12 text-lg font-semibold"
            onClick={handleDonateClick}
            disabled={campaign.status !== 'active'}
          >
            <CreditCard className="w-4 h-4 mr-2" />
            {campaign.status === 'active' 
              ? `Donate $${customAmount || selectedAmount}` 
              : 'Campaign Not Active'
            }
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Your donation helps {campaign.team} reach their championship goals.
          </p>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Campaign Stats</h3>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span className="text-gray-600">Total Raised</span>
            </div>
            <span className="font-semibold">${campaign.raised.toLocaleString()}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Users className="w-4 h-4 text-blue-500" />
              <span className="text-gray-600">Supporters</span>
            </div>
            <span className="font-semibold">{campaign.supporters}</span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-gray-600">Average Donation</span>
            </div>
            <span className="font-semibold">${averageDonation}</span>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Supporters</h3>
        
        <div className="space-y-3">
          {[
            { name: "Anonymous Supporter", amount: 100, time: "2 hours ago" },
            { name: "Team Alumni", amount: 250, time: "5 hours ago" },
            { name: "Local Business", amount: 500, time: "1 day ago" },
            { name: "Parent Association", amount: 150, time: "2 days ago" },
          ].map((supporter, index) => (
            <div key={index} className="flex items-center justify-between">
              <div>
                <div className="font-medium text-gray-900">{supporter.name}</div>
                <div className="text-sm text-gray-500">{supporter.time}</div>
              </div>
              <Badge variant="secondary">${supporter.amount}</Badge>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}