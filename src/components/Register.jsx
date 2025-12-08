import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api, tokenService } from '../services/api'
import './Register.css'

function Register() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [confirmPasswordError, setConfirmPasswordError] = useState('')

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleEmailChange = (e) => {
    const value = e.target.value.trim()
    setEmail(value)
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address')
    } else {
      setEmailError('')
    }
  }

  const handlePasswordChange = (e) => {
    const value = e.target.value
    setPassword(value)
    if (value && value.length < 6) {
      setPasswordError('Password must be at least 6 characters')
    } else {
      setPasswordError('')
    }
    // Re-validate confirm password if it exists
    if (confirmPassword && value !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value
    setConfirmPassword(value)
    if (value && value !== password) {
      setConfirmPasswordError('Passwords do not match')
    } else {
      setConfirmPasswordError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setEmailError('')
    setPasswordError('')
    setConfirmPasswordError('')

    // Validation
    if (!email.trim()) {
      setEmailError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address')
      return
    }

    if (!password) {
      setPasswordError('Password is required')
      return
    }

    if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      return
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your password')
      return
    }

    if (password !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match')
      return
    }

    setLoading(true)

    try {
      const response = await api.register(email.trim(), password)
      
      // Save token to localStorage
      if (response.data && response.data.token) {
        tokenService.setToken(response.data.token)
      }

      // Navigate to store setup after successful registration
      navigate('/store-setup')
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="register-container">
      <div className="register-card">
        {/* BACKO Brand Badge */}
        <div className="brand-badge">BACKO</div>
        
        {/* Header */}
        <h1 className="register-title">Merchant Register</h1>
        <p className="register-subtitle">Create your account to get started.</p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="register-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">Email Address</label>
            <input
              type="email"
              id="email"
              className={`form-input ${emailError ? 'error' : ''}`}
              placeholder="merchant@example.com"
              value={email}
              onChange={handleEmailChange}
              onBlur={() => {
                if (email && !validateEmail(email)) {
                  setEmailError('Please enter a valid email address')
                }
              }}
              required
              autoComplete="email"
            />
            {emailError && <span className="field-error">{emailError}</span>}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">Password</label>
            <input
              type="password"
              id="password"
              className={`form-input ${passwordError ? 'error' : ''}`}
              placeholder="Enter your password (min 6 characters)"
              value={password}
              onChange={handlePasswordChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
            {passwordError && <span className="field-error">{passwordError}</span>}
            {!passwordError && password && (
              <span className="field-hint">Password must be at least 6 characters</span>
            )}
          </div>

          {/* Confirm Password Field */}
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              className={`form-input ${confirmPasswordError ? 'error' : ''}`}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              required
              minLength={6}
              autoComplete="new-password"
            />
            {confirmPasswordError && <span className="field-error">{confirmPasswordError}</span>}
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

          {/* Sign Up Button */}
          <button type="submit" className="sign-up-button" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          {/* Sign In Link */}
          <p className="signin-text">
            Already have an account? <Link to="/login" className="signin-link">Sign in</Link>
          </p>
        </form>
      </div>
    </div>
  )
}

export default Register

