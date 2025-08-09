import { useState } from 'react'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Textarea } from '../ui/textarea'
import { Label } from '../ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
import { FileText, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useCampaignRequests } from '../../contexts/CampaignRequestContext'
import { useNotifications } from '../../contexts/NotificationContext'

export function CampaignRequestPage() {
  const { user } = useAuth()
  const { submitRequest } = useCampaignRequests()
  const { sendEmailNotification } = useNotifications()
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    teamName: user?.team || '',
    school: '',
    sport: '',
    coachName: user?.role === 'coach' ? user.name : '',
    coachEmail: user?.role === 'coach' ? user.email : '',
    coachPhone: user?.phone || '',
    campaignTitle: '',
    goalAmount: '',
    deadline: '',
    description: '',
    story: '',
    expenses: '',
    achievements: '',
    socialMedia: '',
    additionalInfo: ''
  })

  const sports = [
    'Basketball', 'Football', 'Soccer', 'Baseball', 'Softball', 'Volleyball',
    'Tennis', 'Track & Field', 'Swimming', 'Wrestling', 'Golf', 'Cross Country',
    'Lacrosse', 'Hockey', 'Cheerleading', 'Dance', 'Other'
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const required = ['teamName', 'school', 'sport', 'coachName', 'coachEmail', 'campaignTitle', 'goalAmount', 'deadline', 'description', 'story']
    
    for (const field of required) {
      if (!formData[field as keyof typeof formData]) {
        alert(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()} field`)
        return false
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.coachEmail)) {
      alert('Please enter a valid email address')
      return false
    }

    const goalAmount = parseInt(formData.goalAmount)
    if (isNaN(goalAmount) || goalAmount < 100) {
      alert('Goal amount must be at least $100')
      return false
    }

    const deadlineDate = new Date(formData.deadline)
    const today = new Date()
    if (deadlineDate <= today) {
      alert('Deadline must be in the future')
      return false
    }

    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setLoading(true)
    
    try {
      // Submit the request
      const requestId = await submitRequest({
        ...formData,
        submittedBy: user?.id || '',
        submitterName: user?.name || '',
        submitterEmail: user?.email || '',
        goalAmount: parseInt(formData.goalAmount)
      })

      // Send notification email to admins
      const subject = `New Campaign Request: ${formData.campaignTitle}`
      const message = `
A new campaign request has been submitted and is awaiting your review.

CAMPAIGN DETAILS:
- Title: ${formData.campaignTitle}
- Team: ${formData.teamName}
- School: ${formData.school}
- Sport: ${formData.sport}
- Goal: $${parseInt(formData.goalAmount).toLocaleString()}
- Deadline: ${formData.deadline}

COACH INFORMATION:
- Name: ${formData.coachName}
- Email: ${formData.coachEmail}
- Phone: ${formData.coachPhone}

SUBMITTED BY:
- Name: ${user?.name}
- Email: ${user?.email}
- Role: ${user?.role}

Please review this request in the admin panel: ${window.location.origin}/admin/review-requests

Request ID: ${requestId}
      `

      // This would normally send to all admin users
      await sendEmailNotification('admin@believefundraising.com', subject, message)

      setSubmitted(true)
    } catch (error) {
      alert('Failed to submit request. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-8">
          <Card className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Request Submitted Successfully!</h1>
            <p className="text-gray-600 mb-6">
              Your campaign request has been submitted and is now under review by our admin team. 
              You'll receive an email notification once your request has been reviewed.
            </p>
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">What happens next?</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Our team will review your campaign request within 2-3 business days</li>
                <li>• We may contact you for additional information if needed</li>
                <li>• Once approved, your campaign will go live on the platform</li>
                <li>• You'll receive setup instructions and fundraising tips</li>
              </ul>
            </div>
            <div className="space-x-4">
              <Button onClick={() => window.location.href = '/'}>
                Return to Dashboard
              </Button>
              <Button variant="outline" onClick={() => {
                setSubmitted(false)
                setFormData({
                  teamName: user?.team || '',
                  school: '',
                  sport: '',
                  coachName: user?.role === 'coach' ? user.name : '',
                  coachEmail: user?.role === 'coach' ? user.email : '',
                  coachPhone: user?.phone || '',
                  campaignTitle: '',
                  goalAmount: '',
                  deadline: '',
                  description: '',
                  story: '',
                  expenses: '',
                  achievements: '',
                  socialMedia: '',
                  additionalInfo: ''
                })
              }}>
                Submit Another Request
              </Button>
            </div>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Request a Campaign</h1>
          </div>
          <p className="text-gray-600">
            Submit a request to create a fundraising campaign for your sports team. 
            Our admin team will review your submission and help you get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Team Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Team Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="teamName">Team Name *</Label>
                <Input
                  id="teamName"
                  value={formData.teamName}
                  onChange={(e) => handleInputChange('teamName', e.target.value)}
                  placeholder="e.g., Eagles Basketball Team"
                  required
                />
              </div>
              <div>
                <Label htmlFor="school">School/Organization *</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => handleInputChange('school', e.target.value)}
                  placeholder="e.g., Lincoln High School"
                  required
                />
              </div>
              <div>
                <Label htmlFor="sport">Sport *</Label>
                <Select value={formData.sport} onValueChange={(value) => handleInputChange('sport', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    {sports.map(sport => (
                      <SelectItem key={sport} value={sport}>{sport}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </Card>

          {/* Coach Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Coach/Contact Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="coachName">Coach Name *</Label>
                <Input
                  id="coachName"
                  value={formData.coachName}
                  onChange={(e) => handleInputChange('coachName', e.target.value)}
                  placeholder="Coach full name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coachEmail">Coach Email *</Label>
                <Input
                  id="coachEmail"
                  type="email"
                  value={formData.coachEmail}
                  onChange={(e) => handleInputChange('coachEmail', e.target.value)}
                  placeholder="coach@school.edu"
                  required
                />
              </div>
              <div>
                <Label htmlFor="coachPhone">Coach Phone</Label>
                <Input
                  id="coachPhone"
                  type="tel"
                  value={formData.coachPhone}
                  onChange={(e) => handleInputChange('coachPhone', e.target.value)}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>
          </Card>

          {/* Campaign Details */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Campaign Details</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="campaignTitle">Campaign Title *</Label>
                <Input
                  id="campaignTitle"
                  value={formData.campaignTitle}
                  onChange={(e) => handleInputChange('campaignTitle', e.target.value)}
                  placeholder="e.g., Help Eagles Basketball Reach State Championships"
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="goalAmount">Fundraising Goal ($) *</Label>
                  <Input
                    id="goalAmount"
                    type="number"
                    min="100"
                    value={formData.goalAmount}
                    onChange={(e) => handleInputChange('goalAmount', e.target.value)}
                    placeholder="25000"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="deadline">Campaign Deadline *</Label>
                  <Input
                    id="deadline"
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => handleInputChange('deadline', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Short Description *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Brief description of your campaign (1-2 sentences)"
                  rows={3}
                  required
                />
              </div>
              <div>
                <Label htmlFor="story">Team Story *</Label>
                <Textarea
                  id="story"
                  value={formData.story}
                  onChange={(e) => handleInputChange('story', e.target.value)}
                  placeholder="Tell your team's story. What are your goals? What challenges are you facing? Why do you need support?"
                  rows={5}
                  required
                />
              </div>
            </div>
          </Card>

          {/* Additional Information */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Additional Information</h2>
            <div className="space-y-6">
              <div>
                <Label htmlFor="expenses">How will funds be used?</Label>
                <Textarea
                  id="expenses"
                  value={formData.expenses}
                  onChange={(e) => handleInputChange('expenses', e.target.value)}
                  placeholder="e.g., Equipment ($5,000), Travel expenses ($10,000), Tournament fees ($3,000), etc."
                  rows={4}
                />
              </div>
              <div>
                <Label htmlFor="achievements">Recent Team Achievements</Label>
                <Textarea
                  id="achievements"
                  value={formData.achievements}
                  onChange={(e) => handleInputChange('achievements', e.target.value)}
                  placeholder="Recent wins, championships, player achievements, etc."
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="socialMedia">Social Media Links</Label>
                <Textarea
                  id="socialMedia"
                  value={formData.socialMedia}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value)}
                  placeholder="Team website, Instagram, Facebook, Twitter, etc."
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="additionalInfo">Additional Information</Label>
                <Textarea
                  id="additionalInfo"
                  value={formData.additionalInfo}
                  onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                  placeholder="Any other information you'd like to share"
                  rows={3}
                />
              </div>
            </div>
          </Card>

          {/* Important Notice */}
          <Card className="p-6 bg-blue-50 border-blue-200">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-900 mb-2">Important Information</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• All campaign requests are reviewed by our admin team</li>
                  <li>• Review process typically takes 2-3 business days</li>
                  <li>• We may contact you for additional information or documentation</li>
                  <li>• Approved campaigns must comply with our fundraising guidelines</li>
                  <li>• You'll receive email notifications about your request status</li>
                </ul>
              </div>
            </div>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={loading}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Campaign Request
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  )
}