import { Link, useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Avatar } from './ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Bell, Search, Menu, Plus, LogOut, User, Settings, Shield } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'

export function Header() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Team Fundraising</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">Dashboard</Link>
            <Link to="/campaigns" className="text-gray-700 hover:text-blue-600 font-medium">Campaigns</Link>
            <Link to="/teams" className="text-gray-700 hover:text-blue-600 font-medium">Teams</Link>
            <Link to="/resources" className="text-gray-700 hover:text-blue-600 font-medium">Resources</Link>
            {isAdmin && (
              <Link to="/admin" className="text-blue-600 hover:text-blue-700 font-medium flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm">
              <Search className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm">
              <Bell className="w-4 h-4" />
            </Button>
            
            {isAdmin && (
              <Link to="/admin/create-campaign">
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </Link>
            )}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <img src={user?.profileImage || "https://picsum.photos/id/64/32/32"} alt="Profile" className="rounded-full" />
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <Link to="/profile" className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin" className="flex items-center">
                      <Shield className="mr-2 h-4 w-4" />
                      Admin Panel
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}