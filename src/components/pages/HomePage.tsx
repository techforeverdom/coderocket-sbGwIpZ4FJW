import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Link } from 'react-router-dom'
import { 
  TrendingUp, 
  Users, 
  Target, 
  Heart,
  Plus,
  Calendar,
  MapPin,
  DollarSign
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCampaigns } from '../../contexts/CampaignContext'

export function HomePage() {
  const { user, isAdmin } = useAuth()
  const { campaigns } = useCampaigns()

  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const userCampaigns = campaigns.filter(c => c.createdBy === user?.id)
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0)
  const totalGoal = campaigns.reduce((sum, campaign) => sum + campaign.goal, 0)

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return 'Student Athlete'
      case 'coach': return 'Coach'
      case 'parent': return 'Parent'
      case 'supporter': return 'Community Supporter'
      case 'admin': return 'Administrator'
      default: return role
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="text-gray-600">
            Welcome to your Believe Fundraising dashboard as a {getRoleDisplayName(user?.role || '')}
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{activeCampaigns.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Raised</p>
                <p className="text-3xl font-bold text-gray-900">${totalRaised.toLocaleString()}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">My Campaigns</p>
                <p className="text-3xl font-bold text-gray-900">{userCampaigns.length}</p>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Supporters</p>
                <p className="text-3xl font-bold text-gray-900">
                  {campaigns.reduce((sum, c) => sum + c.supporters, 0)}
                </p>
              </div>
              <Users className="w-8 h-8 text-orange-600" />
            </div>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Active Campaigns</h2>
              {(user?.role === 'coach' || user?.role === 'student' || isAdmin) && (
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              )}
            </div>

            <div className="space-y-6">
              {activeCampaigns.length > 0 ? (
                activeCampaigns.slice(0, 3).map((campaign) => (
                  <Card key={campaign.id} className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {campaign.title}
                        </h3>
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {campaign.description}
                        </p>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {campaign.team}
                          </div>
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-1" />
                            {new Date(campaign.endDate).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <Badge className={
                        campaign.status === 'active' ? 'bg-green-100 text-green-800' :
                        campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }>
                        {campaign.status}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progress</span>
                        <span className="font-medium">
                          ${campaign.raised.toLocaleString()} of ${campaign.goal.toLocaleString()}
                        </span>
                      </div>
                      <Progress 
                        value={(campaign.raised / campaign.goal) * 100} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{campaign.supporters} supporters</span>
                        <span>{Math.round((campaign.raised / campaign.goal) * 100)}% funded</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        <Heart className="w-4 h-4 mr-2" />
                        Support
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <Card className="p-8 text-center">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Active Campaigns</h3>
                  <p className="text-gray-600 mb-4">
                    There are currently no active fundraising campaigns.
                  </p>
                  {(user?.role === 'coach' || user?.role === 'student' || isAdmin) && (
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Create Your First Campaign
                    </Button>
                  )}
                </Card>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link to="/profile">
                  <Button variant="outline" className="w-full justify-start">
                    View Profile
                  </Button>
                </Link>
                {(user?.role === 'coach' || user?.role === 'student') && (
                  <Button variant="outline" className="w-full justify-start">
                    Request Campaign
                  </Button>
                )}
                <Button variant="outline" className="w-full justify-start">
                  Browse Campaigns
                </Button>
                {isAdmin && (
                  <Link to="/admin">
                    <Button variant="outline" className="w-full justify-start">
                      Admin Dashboard
                    </Button>
                  </Link>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">New supporter joined</p>
                    <p className="text-xs text-gray-500">Eagles Basketball - 2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Campaign milestone reached</p>
                    <p className="text-xs text-gray-500">Warriors Football - 5 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-purple-600 rounded-full mt-2"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Profile updated</p>
                    <p className="text-xs text-gray-500">Your account - 1 day ago</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Platform Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Impact</h3>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ${totalRaised.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600">Total Raised</div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">{campaigns.length}</div>
                    <div className="text-xs text-gray-600">Campaigns</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {campaigns.reduce((sum, c) => sum + c.supporters, 0)}
                    </div>
                    <div className="text-xs text-gray-600">Supporters</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}