import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './BrandingCustomization.css'

function BrandingCustomization() {
  const navigate = useNavigate()
  const [primaryColor, setPrimaryColor] = useState('#FF7F14')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Save branding settings
      await api.updateBranding({
        primaryColor
      })

      // Navigate to dashboard after completion
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Failed to save branding settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/return-policy-settings')
  }

  const validateColor = (color) => {
    const hexRegex = /^#[0-9A-Fa-f]{6}$/
    return hexRegex.test(color)
  }

  const handleColorChange = (e) => {
    const value = e.target.value
    setPrimaryColor(value)
    if (value && !validateColor(value)) {
      setError('Please enter a valid hex color code (e.g., #FF7F14)')
    } else {
      setError('')
    }
  }

  return (
    <div className="branding-container">
      <div className="branding-card">
        {/* BACKO Brand Badge */}
        <div className="brand-badge">BACKO</div>
        
        {/* Header */}
        <h1 className="branding-title">Welcome! Let's set up your store</h1>
        <p className="branding-subtitle">Step 3 of 3</p>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-segment filled"></div>
            <div className="progress-segment filled"></div>
            <div className="progress-segment filled"></div>
          </div>
        </div>

        {/* Branding Form */}
        <form onSubmit={handleSubmit} className="branding-form">
          {/* Branding & Customization Section */}
          <h2 className="section-heading">Branding & Customization</h2>

          {/* Primary Color Field */}
          <div className="form-group">
            <label htmlFor="primaryColor" className="form-label">
              Primary Color
            </label>
            <div className="color-input-wrapper">
              <input
                type="color"
                id="colorPicker"
                className="color-picker"
                value={primaryColor}
                onChange={(e) => {
                  setPrimaryColor(e.target.value)
                  setError('')
                }}
              />
              <label htmlFor="colorPicker" className="color-swatch-label">
                <div 
                  className="color-swatch" 
                  style={{ backgroundColor: primaryColor }}
                ></div>
              </label>
              <input
                type="text"
                id="primaryColor"
                className="form-input color-input"
                placeholder="#FF7F14"
                value={primaryColor}
                onChange={handleColorChange}
                pattern="^#[0-9A-Fa-f]{6}$"
                required
              />
            </div>
            <p className="helper-text">Choose your brand color (hex format: #RRGGBB)</p>
            {error && error.includes('color') && <span className="field-error">{error}</span>}
          </div>

          {/* Preview Section */}
          <div className="preview-section">
            <div className="preview-header">
              <svg className="preview-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#FF6B35"/>
              </svg>
              <h3 className="preview-title">Preview</h3>
            </div>
            <div className="preview-content">
              <button 
                type="button" 
                className="preview-button"
                style={{ backgroundColor: primaryColor }}
              >
                Sample Button
              </button>
              <div className="preview-box"></div>
            </div>
          </div>

          {/* Tip Section */}
          <div className="tip-section">
            <svg className="tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="#2196F3"/>
            </svg>
            <p className="tip-text">Tip: This color will be used across your customer-facing return portal.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message" style={{ 
              color: '#FF6B35', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#FFF5F0',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="navigation-buttons">
            <button 
              type="button" 
              className="back-button" 
              onClick={handleBack}
              disabled={loading}
            >
              Back
            </button>
            <button 
              type="submit" 
              className="complete-button" 
              disabled={loading}
              style={{ backgroundColor: primaryColor }}
            >
              {loading ? 'Completing...' : 'Complete Setup'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default BrandingCustomization

