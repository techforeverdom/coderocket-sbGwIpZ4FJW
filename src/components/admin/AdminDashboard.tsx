import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Users, Target, TrendingUp, AlertCircle, Plus, Settings, BarChart3, FileText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCampaigns } from '../../contexts/CampaignContext'
import { useCampaignRequests } from '../../contexts/CampaignRequestContext'

export function AdminDashboard() {
  const { getAllUsers } = useAuth()
  const { campaigns } = useCampaigns()
  const { requests } = useCampaignRequests()
  
  const allUsers = getAllUsers()
  const activeCampaigns = campaigns.filter(c => c.status === 'active')
  const totalRaised = campaigns.reduce((sum, c) => sum + c.raised, 0)
  const pendingRequests = requests.filter(r => r.status === 'pending')

  const stats = [
    {
      title: 'Total Users',
      value: allUsers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      breakdown: [
        { label: 'Students', count: allUsers.filter(u => u.role === 'student').length },
        { label: 'Coaches', count: allUsers.filter(u => u.role === 'coach').length },
        { label: 'Parents', count: allUsers.filter(u => u.role === 'parent').length },
        { label: 'Supporters', count: allUsers.filter(u => u.role === 'supporter').length }
      ]
    },
    {
      title: 'Active Campaigns',
      value: activeCampaigns.length,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Total Raised',
      value: `$${totalRaised.toLocaleString()}`,
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Pending Requests',
      value: pendingRequests.length,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600">Manage your fundraising platform</p>
            </div>
            <div className="flex space-x-4">
              <Link to="/admin/create-campaign">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
              </div>
              {stat.breakdown && (
                <div className="mt-4 space-y-1">
                  {stat.breakdown.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-gray-600">{item.label}</span>
                      <span className="font-medium">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <div className="space-y-3">
              <Link to="/admin/create-campaign">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Create New Campaign
                </Button>
              </Link>
              <Link to="/admin/manage-users">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="w-4 h-4 mr-2" />
                  Manage Users
                </Button>
              </Link>
              <Link to="/admin/review-requests">
                <Button variant="outline" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Review Campaign Requests
                </Button>
              </Link>
              <Link to="/admin/manage-campaigns">
                <Button variant="outline" className="w-full justify-start">
                  <Target className="w-4 h-4 mr-2" />
                  Manage Campaigns
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">New user registered</p>
                  <p className="text-xs text-gray-500">2 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Campaign request submitted</p>
                  <p className="text-xs text-gray-500">15 minutes ago</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Donation received</p>
                  <p className="text-xs text-gray-500">1 hour ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Recent Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
            <Link to="/admin/manage-campaigns">
              <Button variant="outline" size="sm">
                <BarChart3 className="w-4 h-4 mr-2" />
                View All
              </Button>
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Campaign</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Team</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Progress</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.slice(0, 5).map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-sm text-gray-500">{campaign.sport}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-gray-900">{campaign.team}</div>
                      <div className="text-sm text-gray-500">{campaign.school}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm">
                        ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {((campaign.raised / campaign.goal) * 100).toFixed(1)}% funded
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                        {campaign.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Link to={`/admin/edit-campaign/${campaign.id}`}>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
    </div>
  )
}