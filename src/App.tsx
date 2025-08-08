import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { NotificationProvider } from './contexts/NotificationContext'
import { CampaignProvider } from './contexts/CampaignContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminRoute } from './components/AdminRoute'
import { FundraisingDashboard } from './components/FundraisingDashboard'
import { LoginPage } from './components/auth/LoginPage'
import { RegisterPage } from './components/auth/RegisterPage'
import { TwoFactorSetup } from './components/auth/TwoFactorSetup'
import { CampaignsPage } from './components/pages/CampaignsPage'
import { TeamsPage } from './components/pages/TeamsPage'
import { TeamPage } from './components/pages/TeamPage'
import { ResourcesPage } from './components/pages/ResourcesPage'
import { ProfilePage } from './components/pages/ProfilePage'
import { AdminDashboard } from './components/admin/AdminDashboard'
import { CreateCampaignPage } from './components/admin/CreateCampaignPage'
import { EditCampaignPage } from './components/admin/EditCampaignPage'
import { ManageCampaignsPage } from './components/admin/ManageCampaignsPage'
import { PaymentSuccess } from './components/payment/PaymentSuccess'
import { PaymentCancel } from './components/payment/PaymentCancel'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <CampaignProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/2fa-setup" element={
                <ProtectedRoute>
                  <TwoFactorSetup />
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <FundraisingDashboard />
                </ProtectedRoute>
              } />
              <Route path="/campaigns" element={
                <ProtectedRoute>
                  <CampaignsPage />
                </ProtectedRoute>
              } />
              <Route path="/teams" element={
                <ProtectedRoute>
                  <TeamsPage />
                </ProtectedRoute>
              } />
              <Route path="/team/:teamId" element={
                <ProtectedRoute>
                  <TeamPage />
                </ProtectedRoute>
              } />
              <Route path="/resources" element={
                <ProtectedRoute>
                  <ResourcesPage />
                </ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/admin" element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } />
              <Route path="/admin/create-campaign" element={
                <AdminRoute>
                  <CreateCampaignPage />
                </AdminRoute>
              } />
              <Route path="/admin/edit-campaign/:campaignId" element={
                <AdminRoute>
                  <EditCampaignPage />
                </AdminRoute>
              } />
              <Route path="/admin/manage-campaigns" element={
                <AdminRoute>
                  <ManageCampaignsPage />
                </AdminRoute>
              } />
              <Route path="/payment/success" element={
                <ProtectedRoute>
                  <PaymentSuccess />
                </ProtectedRoute>
              } />
              <Route path="/payment/cancel" element={
                <ProtectedRoute>
                  <PaymentCancel />
                </ProtectedRoute>
              } />
            </Routes>
          </Router>
        </CampaignProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App