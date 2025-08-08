import { useParams } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Share2, Heart, Flag, Trophy, MapPin, Calendar, Users } from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { useAuth } from '../../contexts/AuthContext'
import { TeamDonationSection } from '../TeamDonationSection'

export function TeamPage() {
  const { teamId } = useParams<{ teamId: string }>()
  const { getCampaignById } = useCampaigns()
  const { sendTeamJoinNotification } = useNotifications()
  const { user } = useAuth()
  
  const campaign = getCampaignById(teamId || '')

  if (!campaign) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Team Not Found</h1>
            <p className="text-gray-600">The team you're looking for doesn't exist or has been removed.</p>
          </Card>
        </main>
      </div>
    )
  }

  const percentage = (campaign.raised / campaign.goal) * 100
  const daysRemaining = Math.ceil((new Date(campaign.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))

  const handleFollowTeam = async () => {
    if (user && user.email && user.phone) {
      await sendTeamJoinNotification(user.email, user.phone, campaign.team)
      alert(`You are now following ${campaign.team}! You'll receive updates via email and SMS.`)
    } else {
      alert('Please ensure your email and phone number are set in your profile to receive updates.')
    }
  }

  const handleShare = () => {
    const url = window.location.href
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: `Support ${campaign.team} - ${campaign.description}`,
        url: url
      })
    } else {
      navigator.clipboard.writeText(url)
      alert('Team link copied to clipboard!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Hero Section */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="aspect-video bg-gradient-to-r from-blue-600 to-green-600 relative">
                <img 
                  src={campaign.image}
                  alt={campaign.team}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
                  <div className="p-6 text-white">
                    <div className="flex items-center space-x-2 mb-2">
                      <Trophy className="w-6 h-6 text-yellow-400" />
                      <Badge className="bg-yellow-400 text-black">{campaign.sport}</Badge>
                    </div>
                    <h1 className="text-3xl font-bold mb-2">{campaign.title}</h1>
                    <p className="text-lg opacity-90">{campaign.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-4">
                    <Button variant="outline" size="sm" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleFollowTeam}>
                      <Heart className="w-4 h-4 mr-2" />
                      Follow Team
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Flag className="w-4 h-4 mr-2" />
                    Report
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-3xl font-bold text-gray-900">${campaign.raised.toLocaleString()}</div>
                      <div className="text-gray-600">raised of ${campaign.goal.toLocaleString()} goal</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold text-gray-900">{campaign.supporters}</div>
                      <div className="text-gray-600">supporters</div>
                    </div>
                  </div>

                  <Progress value={percentage} className="h-3" />

                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>{percentage.toFixed(1)}% funded</span>
                    <span>{daysRemaining > 0 ? `${daysRemaining} days remaining` : 'Campaign ended'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Team Profile */}
            <Card className="p-6">
              <div className="flex items-start space-x-6">
                <img 
                  src={campaign.image} 
                  alt={campaign.team}
                  className="w-20 h-20 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{campaign.team}</h2>
                      <p className="text-gray-600">{campaign.school}</p>
                    </div>
                    <Badge variant="secondary">Verified Team</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Users className="w-4 h-4" />
                      <span>{campaign.sport} Team</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span>{campaign.school}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Goal: {campaign.deadline}</span>
                    </div>
                  </div>

                  {campaign.coachName && (
                    <div className="mb-6">
                      <div className="flex items-center space-x-2 mb-3">
                        <Trophy className="w-5 h-5 text-yellow-500" />
                        <h3 className="font-semibold text-gray-900">Team Leadership</h3>
                      </div>
                      <p className="text-gray-700">Coach: {campaign.coachName}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">About Our Team</h3>
                    <p className="text-gray-700 leading-relaxed">
                      {campaign.story}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Campaign Updates */}
            <Card className="p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Team Updates</h3>
              
              <div className="space-y-6">
                <div className="border-b border-gray-200 pb-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="text-lg font-semibold text-gray-900">
                      Campaign Launch - Let's Reach Our Goal!
                    </h4>
                    <Badge variant="outline" className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{campaign.created}</span>
                    </Badge>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    We're excited to launch our fundraising campaign! Your support will help us achieve our goals and compete at the highest level. Every donation, no matter the size, makes a difference in our journey.
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <TeamDonationSection campaign={campaign} />
          </div>
        </div>
      </main>
    </div>
  )
}