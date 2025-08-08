import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import { Search, Filter, Heart, Users } from 'lucide-react'

export function CampaignsPage() {
  const campaigns = [
    {
      id: 1,
      title: "Help Eagles Basketball Reach State Championships",
      team: "Eagles Basketball",
      school: "Lincoln High School",
      sport: "Basketball",
      raised: 18750,
      goal: 35000,
      supporters: 247,
      image: "https://picsum.photos/id/431/400/200",
      category: "Basketball"
    },
    {
      id: 2,
      title: "Warriors Football Championship Fund",
      team: "Warriors Football",
      school: "Central High School",
      sport: "Football",
      raised: 52750,
      goal: 60000,
      supporters: 428,
      image: "https://picsum.photos/id/342/400/200",
      category: "Football"
    },
    {
      id: 3,
      title: "Lions Soccer Team Equipment Drive",
      team: "Lions Soccer",
      school: "Westside Academy",
      sport: "Soccer",
      raised: 38200,
      goal: 45000,
      supporters: 312,
      image: "https://picsum.photos/id/244/400/200",
      category: "Soccer"
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">All Team Campaigns</h1>
          <div className="flex items-center space-x-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search team campaigns..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filter by Sport
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <img 
                src={campaign.image} 
                alt={campaign.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="secondary">{campaign.category}</Badge>
                  <Button variant="ghost" size="sm">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {campaign.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {campaign.team} • {campaign.school}
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold">${campaign.raised.toLocaleString()}</span>
                    <span className="text-gray-500">of ${campaign.goal.toLocaleString()}</span>
                  </div>
                  
                  <Progress value={(campaign.raised / campaign.goal) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>{campaign.supporters} supporters</span>
                    </div>
                    <span>{((campaign.raised / campaign.goal) * 100).toFixed(0)}% funded</span>
                  </div>
                </div>

                <Button className="w-full mt-4">
                  Support Team
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}