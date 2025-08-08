import { Link } from 'react-router-dom'
import { Header } from '../Header'
import { Card } from '../ui/card'
import { Button } from '../ui/button'
import { Input } from '../ui/input'
import { Label } from '../ui/label'
import { Badge } from '../ui/badge'
import { useAuth } from '../../contexts/AuthContext'
import { Camera, Mail, Phone, Users, Trophy, Shield, Smartphone } from 'lucide-react'

export function ProfilePage() {
  const { user } = useAuth()

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Profile Settings</h1>
          <p className="text-gray-600">
            Manage your account information and security settings
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="p-6 text-center">
              <div className="relative inline-block mb-4">
                <img 
                  src={user.profileImage || "https://picsum.photos/id/64/120/120"} 
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover"
                />
                <Button 
                  size="sm" 
                  className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0"
                >
                  <Camera className="w-4 h-4" />
                </Button>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">{user.name}</h2>
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Badge variant={user.verified ? "default" : "secondary"}>
                  {user.verified ? `Verified ${user.role}` : 'Pending Verification'}
                </Badge>
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center justify-center space-x-2">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                {user.phone && (
                  <div className="flex items-center justify-center space-x-2">
                    <Phone className="w-4 h-4" />
                    <span>{user.phone}</span>
                  </div>
                )}
                {user.team && (
                  <div className="flex items-center justify-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{user.team}</span>
                  </div>
                )}
                {user.position && (
                  <div className="flex items-center justify-center space-x-2">
                    <Trophy className="w-4 h-4" />
                    <span>{user.position}</span>
                  </div>
                )}
              </div>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h3>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    <Input id="firstName" defaultValue={user.name.split(' ')[0]} />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input id="lastName" defaultValue={user.name.split(' ')[1] || ''} />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue={user.email} />
                </div>
                
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" defaultValue={user.phone || ''} />
                </div>
                
                <Button>Save Changes</Button>
              </form>
            </Card>

            {(user.role === 'player' || user.role === 'coach') && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Information</h3>
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="team">Team Name</Label>
                    <Input id="team" defaultValue={user.team || ''} />
                  </div>
                  
                  <div>
                    <Label htmlFor="school">School/Organization</Label>
                    <Input id="school" defaultValue={user.school || ''} />
                  </div>
                  
                  <div>
                    <Label htmlFor="sport">Sport</Label>
                    <Input id="sport" defaultValue={user.sport || ''} />
                  </div>
                  
                  {user.role === 'player' && (
                    <div>
                      <Label htmlFor="position">Position</Label>
                      <Input id="position" defaultValue={user.position || ''} />
                    </div>
                  )}
                  
                  <Button>Update Team Info</Button>
                </form>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">
                        {user.twoFactorEnabled 
                          ? `Enabled via ${user.twoFactorMethod === 'sms' ? 'SMS' : 'Email'}`
                          : 'Add an extra layer of security to your account'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {user.twoFactorEnabled && (
                      <Badge className="bg-green-100 text-green-800">
                        <Smartphone className="w-3 h-3 mr-1" />
                        Enabled
                      </Badge>
                    )}
                    <Link to="/2fa-setup">
                      <Button variant="outline" size="sm">
                        {user.twoFactorEnabled ? 'Manage' : 'Setup'}
                      </Button>
                    </Link>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">Password</p>
                    <p className="text-sm text-gray-600">Change your account password</p>
                  </div>
                  <Button variant="outline" size="sm">Change Password</Button>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-gray-600">Receive updates about team campaigns and donations</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">SMS Notifications</p>
                    <p className="text-sm text-gray-600">Get text messages for important team updates</p>
                  </div>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}