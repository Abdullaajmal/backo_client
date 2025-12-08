import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import './ReturnSuccess.css'

function ReturnSuccess() {
  const { storeUrl, orderId } = useParams()
  const navigate = useNavigate()
  const [returnTicketId, setReturnTicketId] = useState('')

  useEffect(() => {
    // Get return ID from sessionStorage
    const storedReturnId = sessionStorage.getItem('returnId')
    if (storedReturnId) {
      setReturnTicketId(storedReturnId)
    } else {
      // If no return ID found, redirect back to portal
      navigate(`/return/${storeUrl}`)
    }
  }, [storeUrl, navigate])

  const handleTrackReturn = () => {
    // Navigate to track return page
    navigate(`/return/${storeUrl}/track/${returnTicketId}`)
  }

  const handleSubmitAnother = () => {
    // Navigate back to return portal
    navigate(`/return/${storeUrl}`)
  }

  return (
    <div className="return-success-container">
      <div className="return-success-card">
        {/* Success Icon */}
        <div className="success-icon">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#4CAF50"/>
            <path d="M8 12L11 15L16 9" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        {/* Title */}
        <h1 className="success-title">Return Request Submitted!</h1>
        <p className="success-description">
          Your return request has been successfully submitted and is being reviewed by the merchant.
        </p>

        {/* Return Ticket ID Card */}
        <div className="ticket-id-card">
          <p className="ticket-label">Your Return Ticket ID</p>
          <p className="ticket-id">{returnTicketId}</p>
          <p className="ticket-instruction">Save this ID to track your return status</p>
        </div>

        {/* What Happens Next Section */}
        <div className="next-steps-card">
          <h2 className="next-steps-title">What happens next?</h2>
          <ul className="next-steps-list">
            <li>The merchant will review your return request</li>
            <li>You'll receive an update via email once approved</li>
            <li>Ship the item back using the provided instructions</li>
            <li>Get your refund once the item is inspected</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button 
            className="track-button"
            onClick={handleTrackReturn}
          >
            Track Return Status
          </button>
          <button 
            className="submit-another-button"
            onClick={handleSubmitAnother}
          >
            Submit Another Return
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="portal-footer">
        <p className="powered-by-text">
          Powered by <span className="backo-brand">BACKO</span>
        </p>
      </div>
    </div>
  )
}

export default ReturnSuccess

