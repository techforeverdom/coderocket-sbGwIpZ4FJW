import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Link } from 'react-router-dom'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  AlertCircle, 
  Plus, 
  Settings, 
  BarChart3,
  Eye,
  Edit,
  Trash2
} from 'lucide-react'
import { useCampaigns } from '../../contexts/CampaignContext'

export function AdminDashboard() {
  const { campaigns, deleteCampaign } = useCampaigns()
  
  const totalRaised = campaigns.reduce((sum, campaign) => sum + campaign.raised, 0)
  const totalSupporters = campaigns.reduce((sum, campaign) => sum + campaign.supporters, 0)
  const pendingCampaigns = campaigns.filter(c => c.status === 'pending').length
  
  const stats = [
    {
      title: "Total Campaigns",
      value: campaigns.length.toString(),
      change: `${campaigns.filter(c => c.status === 'active').length} active`,
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />
    },
    {
      title: "Total Raised",
      value: `$${totalRaised.toLocaleString()}`,
      change: "Across all campaigns",
      icon: <DollarSign className="w-6 h-6 text-green-600" />
    },
    {
      title: "Total Supporters",
      value: totalSupporters.toLocaleString(),
      change: "Active donors",
      icon: <Users className="w-6 h-6 text-purple-600" />
    },
    {
      title: "Pending Reviews",
      value: pendingCampaigns.toString(),
      change: pendingCampaigns > 0 ? "Requires attention" : "All reviewed",
      icon: <AlertCircle className="w-6 h-6 text-orange-600" />
    }
  ]

  const recentCampaigns = campaigns.slice(0, 5)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800">Active</Badge>
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>
      case 'paused':
        return <Badge className="bg-gray-100 text-gray-800">Paused</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleDelete = (campaignId: string, campaignTitle: string) => {
    if (confirm(`Are you sure you want to delete "${campaignTitle}"? This action cannot be undone.`)) {
      deleteCampaign(campaignId)
      alert('Campaign deleted successfully')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Admin Dashboard</h1>
          <div className="flex items-center space-x-4">
            <Link to="/admin/create-campaign">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Campaign
              </Button>
            </Link>
            <Link to="/admin/manage-campaigns">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Manage Campaigns
              </Button>
            </Link>
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
                  <p className="text-sm text-gray-500">{stat.change}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  {stat.icon}
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Recent Campaigns */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">Recent Campaigns</h2>
            <Link to="/admin/manage-campaigns">
              <Button variant="outline" size="sm">View All</Button>
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
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentCampaigns.map((campaign) => (
                  <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900">{campaign.title}</div>
                      <div className="text-sm text-gray-500">{campaign.sport}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900">{campaign.team}</div>
                      <div className="text-sm text-gray-500">{campaign.school}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        ${campaign.raised.toLocaleString()} / ${campaign.goal.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${Math.min((campaign.raised / campaign.goal) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="py-4 px-4">{getStatusBadge(campaign.status)}</td>
                    <td className="py-4 px-4 text-gray-600">{campaign.created}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center space-x-2">
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(campaign.id, campaign.title)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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