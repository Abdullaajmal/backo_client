import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './TrackReturn.css'

function TrackReturn() {
  const { storeUrl, returnId } = useParams()
  const navigate = useNavigate()
  const [returnData, setReturnData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchReturnData()
  }, [returnId])

  const fetchReturnData = async () => {
    try {
      setLoading(true)
      
      try {
        const response = await api.getPublicReturn(storeUrl, returnId)
        if (response.success && response.data) {
          const returnItem = response.data
          
          // Determine status button text
          let statusButton = 'In Progress'
          if (returnItem.status === 'Pending Approval') {
            statusButton = 'Pending'
          } else if (returnItem.status === 'Awaiting Receipt') {
            statusButton = 'In Progress'
          } else if (returnItem.status === 'Completed') {
            statusButton = 'Completed'
          }
          
          setReturnData({
            returnId: returnItem.returnId,
            status: returnItem.status,
            statusButton: statusButton,
            product: returnItem.product?.name || 'Product',
            reason: returnItem.reason,
            resolution: returnItem.preferredResolution === 'refund' ? 'Refund' : 
                       returnItem.preferredResolution === 'exchange' ? 'Exchange' : 'Store Credit',
            amount: returnItem.amount,
            returnAddress: returnItem.returnAddress || 'My Amazing Store, 123 Warehouse St, New York, NY 10002',
            refundMethod: returnItem.refundMethod || 'Bank Transfer',
            timeline: returnItem.timeline || []
          })
        }
      } catch (apiErr) {
        // If API fails, show error
        console.error('Failed to fetch return data:', apiErr)
        setError(apiErr.message || 'Return not found. Please check your return ID.')
        setReturnData(null)
      }
      
      setLoading(false)
    } catch (err) {
      console.error('Failed to fetch return data:', err)
      setLoading(false)
    }
  }

  const handleEmailShare = () => {
    const subject = `Return Tracking: ${returnData?.returnId}`
    const body = `Track your return: ${window.location.href}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const handleWhatsAppShare = () => {
    const text = `Track your return: ${returnData?.returnId} - ${window.location.href}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  if (loading) {
    return (
      <div className="track-return-container">
        <div className="loading-message">Loading return details...</div>
      </div>
    )
  }

  if (error && !returnData) {
    return (
      <div className="track-return-container">
        <div className="track-return-card">
          <div className="error-message" style={{ textAlign: 'center', padding: '2rem' }}>
            <h2>Return Not Found</h2>
            <p>{error}</p>
            <button 
              className="back-button"
              onClick={() => navigate(`/return/${storeUrl}`)}
              style={{ marginTop: '1rem' }}
            >
              Back to Portal
            </button>
          </div>
        </div>
      </div>
    )
  }


  return (
    <div className="track-return-container">
      <div className="track-return-card">
        {/* Header */}
        <div className="track-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/return/${storeUrl}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <div className="header-content">
            <h1 className="track-title">Track Your Return</h1>
            <p className="return-id-text">Return ID: {returnData.returnId}</p>
          </div>
        </div>

        {/* Current Status Card */}
        <div className="status-card">
          <div className="status-left">
            <p className="status-label">Current Status</p>
            <p className="status-value">{returnData.status}</p>
          </div>
          <button className="status-button">{returnData.statusButton}</button>
        </div>

        {/* Return Details Card */}
        <div className="details-card">
          <h2 className="details-title">Return Details</h2>
          <div className="detail-row">
            <span className="detail-label">Product:</span>
            <span className="detail-value">{returnData.product}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Reason:</span>
            <span className="detail-value">{returnData.reason}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Resolution:</span>
            <span className="detail-value">{returnData.resolution}</span>
          </div>
          <div className="detail-row">
            <span className="detail-label">Amount:</span>
            <span className="detail-value amount-value">${returnData.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Return Progress Timeline */}
        <div className="progress-section">
          <h2 className="progress-title">Return Progress</h2>
          <div className="timeline">
            {returnData.timeline.map((item, index) => (
              <div key={index} className={`timeline-item ${item.completed ? 'completed' : ''}`}>
                <div className="timeline-icon">
                  {item.completed ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#FF6B35"/>
                      <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" fill="#E0E0E0"/>
                    </svg>
                  )}
                </div>
                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-step">{item.step}</span>
                    {item.date && <span className="timeline-date">{item.date}</span>}
                  </div>
                  <p className="timeline-description">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shipping Instructions Card */}
        <div className="shipping-card">
          <div className="shipping-header">
            <h2 className="shipping-title">Shipping Instructions</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="shipping-icon">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="shipping-address">
            <span className="address-label">Return Address:</span>
            <span className="address-value">{returnData.returnAddress}</span>
          </div>
          <p className="shipping-instruction">
            Please, pack the item securely in its original packaging and ship to the address above. Use a trackable shipping method.
          </p>
        </div>

        {/* Refund Information Card */}
        <div className="refund-card">
          <div className="refund-header">
            <h2 className="refund-title">Refund Information</h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="refund-icon">
              <circle cx="12" cy="12" r="10" stroke="#FF6B35" strokeWidth="2"/>
              <path d="M12 8V12M12 16H12.01" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="refund-detail-row">
            <span className="refund-label">Method:</span>
            <span className="refund-value">{returnData.refundMethod}</span>
          </div>
          <div className="refund-detail-row">
            <span className="refund-label">Amount:</span>
            <span className="refund-value">${returnData.amount.toFixed(2)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="share-buttons">
          <button className="email-share-button" onClick={handleEmailShare}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M22 6L12 13L2 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Email Share
          </button>
          <button className="whatsapp-share-button" onClick={handleWhatsAppShare}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17.472 14.382C17.024 14.103 15.358 13.261 15.024 13.148C14.7 13.028 14.478 12.969 14.257 13.416C14.035 13.863 13.356 14.741 13.131 15.038C12.906 15.335 12.682 15.382 12.234 15.103C11.786 14.824 10.61 14.428 9.163 13.101C7.976 12.026 7.185 10.745 6.96 10.298C6.734 9.851 6.965 9.661 7.19 9.442C7.396 9.244 7.624 8.952 7.85 8.696C8.074 8.442 8.133 8.256 8.261 8.027C8.39 7.798 8.332 7.605 8.234 7.436C8.136 7.267 7.507 5.68 7.26 5.021C7.014 4.363 6.765 4.466 6.565 4.453C6.365 4.44 6.134 4.441 5.926 4.441C5.718 4.441 5.416 4.51 5.152 4.789C4.888 5.068 4.163 5.729 4.163 7.087C4.163 8.445 5.073 9.748 5.221 9.939C5.37 10.13 7.286 12.879 9.896 13.84C10.581 14.103 11.097 14.276 11.467 14.403C12.007 14.595 12.495 14.571 12.879 14.516C13.312 14.455 14.452 13.852 14.709 13.216C14.966 12.58 15.173 12.016 15.274 11.769C15.375 11.522 15.531 11.414 15.739 11.297C15.947 11.18 16.64 10.724 16.866 10.298C17.092 9.872 17.318 9.958 17.466 10.067C17.614 10.176 18.06 10.452 18.246 10.615C18.432 10.778 18.589 10.898 18.662 11.015C18.735 11.132 18.792 11.322 18.69 11.51C18.588 11.698 17.919 14.382 17.472 14.382Z" fill="currentColor"/>
            </svg>
            Whatsapp
          </button>
        </div>
      </div>

      {/* Footer - Outside Card */}
      <div className="portal-footer">
        <p className="powered-by-text">
          Powered by <span className="backo-brand">BACKO</span>
        </p>
      </div>
    </div>
  )
}

export default TrackReturn

