import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './ReturnPortal.css'

function ReturnPortal() {
  const { storeUrl } = useParams()
  const navigate = useNavigate()
  const [orderId, setOrderId] = useState('')
  const [emailOrPhone, setEmailOrPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeInfo, setStoreInfo] = useState(null)
  const [loadingStoreInfo, setLoadingStoreInfo] = useState(true)
  const [formVisible, setFormVisible] = useState(true) // Form visibility state

  useEffect(() => {
    // Fetch store info by store URL
    if (storeUrl) {
      fetchStoreInfo()
    }
  }, [storeUrl])

  const fetchStoreInfo = async () => {
    try {
      setLoadingStoreInfo(true)
      setError('') // Clear any previous errors
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      
      // Extract domain from storeUrl (if it's a full URL, extract just the domain)
      let urlToSearch = storeUrl
      try {
        // If it's a full URL, extract the domain part
        if (storeUrl.includes('://')) {
          const urlObj = new URL(storeUrl)
          urlToSearch = urlObj.hostname.replace('www.', '')
        } else {
          // Remove protocol and www if present
          urlToSearch = storeUrl.replace(/^https?:\/\//, '').replace(/^www\./, '')
        }
      } catch (e) {
        // If URL parsing fails, use as is
        urlToSearch = storeUrl
      }
      
      const apiUrl = `${API_BASE_URL}/public/store/${encodeURIComponent(urlToSearch)}`
      console.log('Fetching store from:', apiUrl)
      
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        if (response.status === 404) {
          setError(`This store return portal is not available. Please verify the URL is correct, or contact the store directly for return assistance.`)
          setStoreInfo(null)
          setFormVisible(false) // Hide form only for store not found
          setLoadingStoreInfo(false)
          return
        }
        throw new Error(`Failed to load store information`)
      }
      
      const data = await response.json()
      console.log('Store info response:', data)
      if (data.success && data.data) {
        console.log('Store info loaded:', data.data.storeName)
        setStoreInfo(data.data)
        setError('')
        setFormVisible(true) // Show form when store info is loaded
      } else {
        console.error('Store info not available in response')
        // Don't hide form, just show warning
        setError('Store information not available. Please contact support.')
        setStoreInfo(null)
        setFormVisible(true) // Still show form
      }
      setLoadingStoreInfo(false)
    } catch (err) {
      console.error('Failed to fetch store info:', err)
      // Network errors - still show form but with warning
      if (err.message && err.message.includes('Failed to fetch')) {
        setError('') // Clear error, let form be visible
        setFormVisible(true)
      } else {
        setError(err.message || 'Failed to load store information. Please try again later.')
        setFormVisible(true) // Still show form
      }
      setStoreInfo(null)
      setLoadingStoreInfo(false)
    }
  }

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!orderId.trim() || !emailOrPhone.trim()) {
      setError('Please fill in all required fields')
      return
    }

    const trimmedOrderId = orderId.trim()
    const trimmedEmailOrPhone = emailOrPhone.trim()

    // Validate order ID format
    if (trimmedOrderId.length < 3) {
      setError('Order ID must be at least 3 characters')
      return
    }

    // Validate email or phone
    const isEmail = trimmedEmailOrPhone.includes('@')
    if (isEmail && !validateEmail(trimmedEmailOrPhone)) {
      setError('Please enter a valid email address')
      return
    }

    if (!isEmail && !validatePhone(trimmedEmailOrPhone)) {
      setError('Please enter a valid email address or phone number')
      return
    }

    setLoading(true)

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await api.findOrder(trimmedOrderId, trimmedEmailOrPhone, storeUrl)
      
      if (response.success && response.data) {
        // Store order data in sessionStorage for next page
        sessionStorage.setItem('orderData', JSON.stringify(response.data))
        // Navigate to create return request page
        navigate(`/return/${storeUrl}/order/${trimmedOrderId}/create`)
      }
    } catch (err) {
      setError(err.message || 'Failed to find order. Please check your details.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="return-portal-container">
      <div className="return-portal-card">
        {/* Store Logo Badge */}
        {storeInfo?.storeLogo ? (
          <div className="store-logo-badge">
            <img 
              src={`http://localhost:5000${storeInfo.storeLogo}`} 
              alt={storeInfo.storeName || 'Store'} 
              className="store-logo-image"
            />
          </div>
        ) : (
          <div className="store-icon-badge">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7 4V2C7 1.73478 7.10536 1.48043 7.29289 1.29289C7.48043 1.10536 7.73478 1 8 1H16C16.2652 1 16.5196 1.10536 16.7071 1.29289C16.8946 1.48043 17 1.73478 17 2V4H20C20.2652 4 20.5196 4.10536 20.7071 4.29289C20.8946 4.48043 21 4.73478 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.73478 3.10536 4.48043 3.29289 4.29289C3.48043 4.10536 3.73478 4 4 4H7ZM9 3V4H15V3H9Z" fill="#FF6B35"/>
              <path d="M9 8C8.44772 8 8 8.44772 8 9C8 9.55228 8.44772 10 9 10C9.55228 10 10 9.55228 10 9C10 8.44772 9.55228 8 9 8Z" fill="#FF6B35"/>
              <path d="M15 8C14.4477 8 14 8.44772 14 9C14 9.55228 14.4477 10 15 10C15.5523 10 16 9.55228 16 9C16 8.44772 15.5523 8 15 8Z" fill="#FF6B35"/>
            </svg>
          </div>
        )}

        {/* Store Name - Only show if store info is loaded */}
        {storeInfo?.storeName && (
          <h1 className="store-name">
            {storeInfo.storeName}
          </h1>
        )}
        
        {/* Portal Title */}
        <p className="portal-subtitle">Return Request Portal</p>

        {/* Form Section - Always show form */}
        <div className="form-section">
          <h2 className="form-section-title">Find Your Order</h2>
          <p className="form-section-description">
            Enter your order details to start a return request.
          </p>

          {/* Error Message - Store Not Found (Show before form) */}
          {error && error.includes('not available') && (
            <div className="error-message store-not-found" style={{ marginBottom: '1.5rem' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem', flexShrink: 0 }}>
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 8V12M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <div>
                <p style={{ margin: 0, fontWeight: 600 }}>Store Return Portal Not Available</p>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>{error.replace('This store return portal is not available. ', '')}</p>
              </div>
            </div>
          )}

          {/* Always show form - show even if store info not loaded */}
          {formVisible && (
          <form onSubmit={handleSubmit} className="return-form">
            {/* Order ID Field */}
            <div className="form-group">
              <label htmlFor="orderId" className="form-label">
                Order ID <span className="required">*</span>
              </label>
              <input
                type="text"
                id="orderId"
                className={`form-input ${orderId && orderId.trim().length < 3 && orderId.trim().length > 0 ? 'error' : ''}`}
                placeholder="ORD-1001"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                required
                minLength={3}
                autoComplete="off"
              />
              <p className="form-helper-text">
                Found in your order confirmation email.
              </p>
            </div>

            {/* Email or Phone Field */}
            <div className="form-group">
              <label htmlFor="emailOrPhone" className="form-label">
                Email or Phone Number <span className="required">*</span>
              </label>
              <input
                type="text"
                id="emailOrPhone"
                className="form-input"
                placeholder="your@email.com or +1 555 0000"
                value={emailOrPhone}
                onChange={(e) => setEmailOrPhone(e.target.value)}
                required
              />
            </div>

            {/* Error Message - Form Validation Errors */}
            {error && !error.includes('not available') && (
              <div className={`error-message ${error.includes('only delivered orders') || error.includes('currently') ? 'info-message' : ''}`}>
                {error.includes('only delivered orders') ? (
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, marginBottom: '0.5rem' }}>
                      Order Not Ready for Return
                    </p>
                    <p style={{ margin: 0, fontSize: '0.875rem', opacity: 0.9 }}>
                      {error}
                    </p>
                  </div>
                ) : (
                  error
                )}
              </div>
            )}

            {/* Find Order Button */}
            <button type="submit" className="find-order-button" disabled={loading}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="button-icon">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loading ? 'Finding...' : 'Find My Order'}
            </button>
          </form>
          )}
        </div>

        {/* Footer */}
        <div className="portal-footer">
          <p className="powered-by-text">
            Powered by <span className="backo-brand">BACKO</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default ReturnPortal

