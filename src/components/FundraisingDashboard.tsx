import { Header } from './Header'
import { TeamCampaignHero } from './TeamCampaignHero'
import { TeamProfile } from './TeamProfile'
import { DonationSection } from './DonationSection'
import { CampaignUpdates } from './CampaignUpdates'
import { Leaderboard } from './Leaderboard'

export function FundraisingDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <TeamCampaignHero />
            <TeamProfile />
            <Leaderboard />
            <CampaignUpdates />
          </div>
          <div className="lg:col-span-1">
            <DonationSection />
          </div>
        </div>
      </main>
    </div>
  )
}