import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom'
import { tokenService, api } from './services/api'
import Login from './components/Login'
import Register from './components/Register'
import StoreSetup from './components/StoreSetup'
import ReturnPolicySettings from './components/ReturnPolicySettings'
import BrandingCustomization from './components/BrandingCustomization'
import Dashboard from './components/Dashboard'
import Orders from './components/Orders'
import Products from './components/Products'
import Returns from './components/Returns'
import Customers from './components/Customers'
import Analytics from './components/Analytics'
import Settings from './components/Settings'
import ReturnPortal from './components/ReturnPortal'
import CreateReturnRequest from './components/CreateReturnRequest'
import ReturnSuccess from './components/ReturnSuccess'
import TrackReturn from './components/TrackReturn'
import './App.css'

// Protected Route Component
function ProtectedRoute({ children }) {
  const token = tokenService.getToken()
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) {
      navigate('/login')
    }
  }, [token, navigate])

  if (!token) {
    return null
  }

  return children
}

// Route Guard Component - checks store setup status
function StoreSetupGuard({ children }) {
  const [isChecking, setIsChecking] = useState(true)
  const [shouldRedirect, setShouldRedirect] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const checkStoreSetup = async () => {
      const token = tokenService.getToken()
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await api.getMe()
        if (response.data && response.data.isStoreSetup) {
          // Store is setup, redirect to dashboard
          setShouldRedirect(true)
          navigate('/dashboard')
        } else {
          // Store not setup, allow access to setup pages
          setIsChecking(false)
        }
      } catch (error) {
        tokenService.removeToken()
        navigate('/login')
      }
    }

    checkStoreSetup()
  }, [navigate])

  if (isChecking || shouldRedirect) {
    return null
  }

  return children
}

// Dashboard Guard - redirects to store setup if not complete
function DashboardGuard({ children }) {
  const [isChecking, setIsChecking] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkStoreSetup = async () => {
      const token = tokenService.getToken()
      if (!token) {
        navigate('/login')
        return
      }

      try {
        const response = await api.getMe()
        if (response.data && response.data.isStoreSetup) {
          // Store is setup, allow access
          setIsChecking(false)
        } else {
          // Store not setup, redirect to setup
          navigate('/store-setup')
        }
      } catch (error) {
        tokenService.removeToken()
        navigate('/login')
      }
    }

    checkStoreSetup()
  }, [navigate])

  if (isChecking) {
    return null
  }

  return children
}

function App() {
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    // Check if user is already logged in on app load
    const checkAuth = async () => {
      const token = tokenService.getToken()
      
      // Check if current path is a return portal route (public)
      const isReturnPortalRoute = location.pathname.startsWith('/return/')
      
      // Allow return portal routes without authentication
      if (isReturnPortalRoute) {
        return
      }
      
      if (token && location.pathname === '/') {
        try {
          const response = await api.getMe()
          if (response.data && response.data.isStoreSetup) {
            navigate('/dashboard')
          } else {
            navigate('/store-setup')
          }
        } catch (error) {
          tokenService.removeToken()
          navigate('/login')
        }
      } else if (!token && location.pathname !== '/login' && location.pathname !== '/register') {
        navigate('/login')
      }
    }
    checkAuth()
  }, [navigate, location.pathname])

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Return Portal - Public Routes */}
      <Route path="/return/:storeUrl" element={<ReturnPortal />} />
      <Route path="/return/:storeUrl/order/:orderId/create" element={<CreateReturnRequest />} />
      <Route path="/return/:storeUrl/success/:orderId" element={<ReturnSuccess />} />
      <Route path="/return/:storeUrl/track/:returnId" element={<TrackReturn />} />

      {/* Store Setup Routes (Protected, but store not setup yet) */}
      <Route
        path="/store-setup"
        element={
          <ProtectedRoute>
            <StoreSetupGuard>
              <StoreSetup />
            </StoreSetupGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/return-policy-settings"
        element={
          <ProtectedRoute>
            <StoreSetupGuard>
              <ReturnPolicySettings />
            </StoreSetupGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/branding-customization"
        element={
          <ProtectedRoute>
            <StoreSetupGuard>
              <BrandingCustomization />
            </StoreSetupGuard>
          </ProtectedRoute>
        }
      />

      {/* Dashboard Routes (Protected, store must be setup) */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Dashboard />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Orders />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/products"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Products />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/returns"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Returns />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/customers"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Customers />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/analytics"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Analytics />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <DashboardGuard>
              <Settings />
            </DashboardGuard>
          </ProtectedRoute>
        }
      />

      {/* Default Route */}
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
