import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './ReturnPolicySettings.css'

function ReturnPolicySettings() {
  const navigate = useNavigate()
  const [returnWindow, setReturnWindow] = useState(30)
  const [bankTransfer, setBankTransfer] = useState(true)
  const [digitalWallet, setDigitalWallet] = useState(true)
  const [storeCredit, setStoreCredit] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [returnWindowError, setReturnWindowError] = useState('')

  const handleReturnWindowChange = (e) => {
    const value = parseInt(e.target.value) || 0
    setReturnWindow(value)
    if (value < 1) {
      setReturnWindowError('Return window must be at least 1 day')
    } else if (value > 365) {
      setReturnWindowError('Return window cannot exceed 365 days')
    } else {
      setReturnWindowError('')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setReturnWindowError('')

    // Validation
    if (returnWindow < 1) {
      setReturnWindowError('Return window must be at least 1 day')
      return
    }

    if (returnWindow > 365) {
      setReturnWindowError('Return window cannot exceed 365 days')
      return
    }

    if (!bankTransfer && !digitalWallet && !storeCredit) {
      setError('Please select at least one refund method')
      return
    }

    setLoading(true)

    try {
      // Save return policy settings
      await api.updateReturnPolicy({
        returnWindow,
        refundMethods: {
          bankTransfer,
          digitalWallet,
          storeCredit
        }
      })

      // Navigate to branding customization page
      navigate('/branding-customization')
    } catch (err) {
      setError(err.message || 'Failed to save return policy settings. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/store-setup')
  }

  const toggleRefundMethod = (method) => {
    if (method === 'bankTransfer') {
      setBankTransfer(!bankTransfer)
    } else if (method === 'digitalWallet') {
      setDigitalWallet(!digitalWallet)
    } else if (method === 'storeCredit') {
      setStoreCredit(!storeCredit)
    }
  }

  return (
    <div className="return-policy-container">
      <div className="return-policy-card">
        {/* BACKO Brand Badge */}
        <div className="brand-badge">BACKO</div>
        
        {/* Header */}
        <h1 className="return-policy-title">Welcome! Let's set up your store</h1>
        <p className="return-policy-subtitle">Step 2 of 3</p>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-segment filled"></div>
            <div className="progress-segment filled"></div>
            <div className="progress-segment"></div>
          </div>
        </div>

        {/* Return Policy Form */}
        <form onSubmit={handleSubmit} className="return-policy-form">
          {/* Return Window Field */}
          <div className="form-group">
            <label htmlFor="returnWindow" className="form-label">
              Return Window (Days) <span className="required">*</span>
            </label>
            <input
              type="number"
              id="returnWindow"
              className={`form-input ${returnWindowError ? 'error' : ''}`}
              placeholder="30"
              value={returnWindow}
              onChange={handleReturnWindowChange}
              min="1"
              max="365"
              required
            />
            <p className="helper-text">Number of days customers can initiate returns (1-365 days)</p>
            {returnWindowError && <span className="field-error">{returnWindowError}</span>}
          </div>

          {/* Refund Methods Section */}
          <div className="refund-methods-section">
            <h2 className="section-heading">Refund Methods</h2>
            
            {/* Bank Transfer */}
            <div 
              className={`refund-method-item ${bankTransfer ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('bankTransfer')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Bank Transfer</h3>
                <p className="refund-method-description">Direct refund to customer's bank.</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={bankTransfer}
                  onChange={() => toggleRefundMethod('bankTransfer')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${bankTransfer ? 'active' : ''}`}></span>
              </div>
            </div>

            {/* Digital Wallet */}
            <div 
              className={`refund-method-item ${digitalWallet ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('digitalWallet')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Digital Wallet</h3>
                <p className="refund-method-description">PayPal, Venmo, etc.</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={digitalWallet}
                  onChange={() => toggleRefundMethod('digitalWallet')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${digitalWallet ? 'active' : ''}`}></span>
              </div>
            </div>

            {/* Store Credit */}
            <div 
              className={`refund-method-item ${storeCredit ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('storeCredit')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Store Credit</h3>
                <p className="refund-method-description">Credit for future purchases.</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={storeCredit}
                  onChange={() => toggleRefundMethod('storeCredit')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${storeCredit ? 'active' : ''}`}></span>
              </div>
            </div>
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
              className="next-button" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Next'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReturnPolicySettings

