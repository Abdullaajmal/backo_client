import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, tokenService } from '../services/api'
import './Login.css'

function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await api.login(email, password)
      
      // Save token to localStorage
      if (response.data && response.data.token) {
        tokenService.setToken(response.data.token)
      }

      // Navigate based on store setup status
      // Check if store is already setup
      if (response.data.isStoreSetup) {
        // Navigate to dashboard if setup is complete
        navigate('/dashboard')
      } else {
        // Navigate to store setup if not complete
        navigate('/store-setup')
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* BACKO Brand Badge */}
        <div className="brand-badge">BACKO</div>
        
        {/* Header */}
        <h1 className="login-title">Merchant Login</h1>
        <p className="login-subtitle">Access your dashboard.</p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className="form-input"
              placeholder="merchant@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className="form-input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ 
              color: '#FF6B35', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              padding: '0.5rem',
              backgroundColor: '#FFF5F0',
              borderRadius: '4px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Forgot Password Link */}
          <a href="#" className="forgot-password-link">Forgot Password?</a>

          {/* Sign In Button */}
          <button type="submit" className="sign-in-button" disabled={loading}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

          {/* Sign Up Link */}
          <p className="signup-text">
            Don't have an account? <Link to="/register" className="signup-link">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Login

