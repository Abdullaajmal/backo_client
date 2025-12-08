import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './CreateReturnRequest.css'

function CreateReturnRequest() {
  const { storeUrl, orderId } = useParams()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)
  
  const [order, setOrder] = useState(null)
  const [selectedItem, setSelectedItem] = useState('')
  const [reason, setReason] = useState('')
  const [preferredResolution, setPreferredResolution] = useState('refund')
  const [additionalNotes, setAdditionalNotes] = useState('')
  const [uploadedPhotos, setUploadedPhotos] = useState([])
  const [consentAccepted, setConsentAccepted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchOrderDetails()
  }, [storeUrl, orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      
      // Get order data from sessionStorage
      const storedOrder = sessionStorage.getItem('orderData')
      if (storedOrder) {
        const orderData = JSON.parse(storedOrder)
        setOrder({
          orderNumber: orderData.orderNumber || orderId,
          orderDate: orderData.orderDate ? new Date(orderData.orderDate).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }) : new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          }),
          items: orderData.items || [],
          total: orderData.total || 0,
          customer: orderData.customer
        })
        setLoading(false)
      } else {
        // If no stored data, use test/demo data for development
        // In production, redirect to return portal
        if (import.meta.env.DEV) {
          console.warn('⚠️ No order data in sessionStorage, using test data')
          setOrder({
            orderNumber: orderId || 'ORD-2001',
            orderDate: new Date().toLocaleDateString('en-US', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            }),
            items: [
              { productName: 'Blue Sneakers', quantity: 1, price: 99.99 },
              { productName: 'White T-Shirt', quantity: 2, price: 45.00 }
            ],
            total: 189.99,
            customer: { name: 'Test Customer', email: 'test@example.com' }
          })
          setLoading(false)
        } else {
          // Production: redirect to return portal
          setError('Order data not found. Please start from the beginning.')
          setLoading(false)
          setTimeout(() => {
            navigate(`/return/${storeUrl}`)
          }, 2000)
        }
      }
    } catch (err) {
      console.error('Failed to fetch order:', err)
      setError('Failed to load order details')
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (uploadedPhotos.length + files.length > 5) {
      setError('Maximum 5 photos allowed')
      return
    }
    setUploadedPhotos([...uploadedPhotos, ...files])
    setError('')
  }

  const handleRemovePhoto = (index) => {
    setUploadedPhotos(uploadedPhotos.filter((_, i) => i !== index))
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type.startsWith('image/')
    )
    if (uploadedPhotos.length + files.length > 5) {
      setError('Maximum 5 photos allowed')
      return
    }
    setUploadedPhotos([...uploadedPhotos, ...files])
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!selectedItem) {
      setError('Please select an item to return')
      return
    }

    if (!reason) {
      setError('Please select a reason for return')
      return
    }

    if (!consentAccepted) {
      setError('Please accept the return policy')
      return
    }

    setSubmitting(true)

    try {
      const selectedItemIndex = parseInt(selectedItem)
      const selectedItemData = order.items[selectedItemIndex]
      
      const returnData = {
        orderId: order.orderNumber,
        customer: {
          name: order.customer?.name || 'Customer',
          email: order.customer?.email || 'customer@example.com',
          phone: order.customer?.phone || ''
        },
        product: {
          name: selectedItemData.productName,
          price: selectedItemData.price || 0,
          quantity: selectedItemData.quantity || 1
        },
        reason: reason,
        preferredResolution: preferredResolution,
        amount: selectedItemData.price || (selectedItemData.quantity > 1 ? selectedItemData.price * selectedItemData.quantity : selectedItemData.price),
        notes: additionalNotes,
        photos: uploadedPhotos
      }

      // Create FormData for file uploads
      const formData = new FormData()
      formData.append('orderId', returnData.orderId)
      formData.append('customer', JSON.stringify(returnData.customer))
      formData.append('product', JSON.stringify(returnData.product))
      formData.append('reason', returnData.reason)
      formData.append('preferredResolution', returnData.preferredResolution)
      formData.append('amount', returnData.amount)
      formData.append('notes', returnData.notes || '')
      
      // Append photos if any - multer expects 'photos' field name
      if (returnData.photos && returnData.photos.length > 0) {
        returnData.photos.forEach((photo) => {
          formData.append('photos', photo) // Field name must match multer config
        })
      }

      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
      const response = await fetch(`${API_BASE_URL}/returns/public/returns/${storeUrl}`, {
        method: 'POST',
        body: formData,
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to create return request')
      }
      
      // Use the response data
      if (data.success && data.data) {
        // Store return ID for success page
        sessionStorage.setItem('returnId', data.data.returnId)
        // Clear order data
        sessionStorage.removeItem('orderData')
        // Navigate to success page
        navigate(`/return/${storeUrl}/success/${orderId}`)
      }
    } catch (err) {
      setError(err.message || 'Failed to submit return request')
      setSubmitting(false)
    }
  }

  const getItemsDisplay = () => {
    if (!order?.items) return ''
    return order.items.map(item => 
      item.quantity > 1 
        ? `${item.productName} (x${item.quantity})`
        : item.productName
    ).join(', ')
  }

  if (loading) {
    return (
      <div className="create-return-container">
        <div className="loading-message">Loading order details...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="create-return-container">
        <div className="error-message">Order not found</div>
      </div>
    )
  }

  return (
    <div className="create-return-container">
      <div className="create-return-card">
        {/* Header */}
        <div className="return-header">
          <button 
            className="back-button"
            onClick={() => navigate(`/return/${storeUrl}`)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <h1 className="return-title">Create Return Request</h1>
        </div>

        <p className="order-number">Order #{order.orderNumber}</p>

        {/* Order Summary */}
        <div className="order-summary">
          <h2 className="summary-title">Order Summary</h2>
          {order.customer?.name && (
            <div className="summary-row">
              <span className="summary-label">Customer:</span>
              <span className="summary-value">{order.customer.name}</span>
            </div>
          )}
          {order.customer?.email && (
            <div className="summary-row">
              <span className="summary-label">Email:</span>
              <span className="summary-value">{order.customer.email}</span>
            </div>
          )}
          <div className="summary-row">
            <span className="summary-label">Order Date:</span>
            <span className="summary-value">{order.orderDate}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Items:</span>
            <span className="summary-value">{getItemsDisplay()}</span>
          </div>
          <div className="summary-row">
            <span className="summary-label">Total:</span>
            <span className="summary-value">${order.total.toFixed(2)}</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="return-form">
          {/* Select Item */}
          <div className="form-group">
            <label htmlFor="selectedItem" className="form-label">
              Select Item to Return <span className="required">*</span>
            </label>
            <div className="form-select-wrapper">
              <select
                id="selectedItem"
                className="form-select"
                value={selectedItem}
                onChange={(e) => setSelectedItem(e.target.value)}
                required
              >
                <option value="">Choose an item</option>
                {order.items?.map((item, index) => {
                  const itemPrice = item.price || (order.total / order.items.reduce((sum, i) => sum + i.quantity, 0))
                  const displayPrice = item.price || itemPrice
                  return (
                    <option key={index} value={index}>
                      {item.productName} {item.quantity > 1 ? `(x${item.quantity})` : ''} - ${displayPrice.toFixed(2)}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>

          {/* Reason for Return */}
          <div className="form-group">
            <label htmlFor="reason" className="form-label">
              Reason for Return <span className="required">*</span>
            </label>
            <div className="form-select-wrapper">
              <select
                id="reason"
                className="form-select"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              >
                <option value="">Select a reason</option>
                <option value="Wrong Size">Wrong Size</option>
                <option value="Defective / Damaged">Defective / Damaged</option>
                <option value="Not as Described">Not as Described</option>
                <option value="Changed Mind">Changed Mind</option>
                <option value="Received Wrong Item">Received Wrong Item</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          {/* Preferred Resolution */}
          <div className="form-group">
            <label className="form-label">
              Preferred Resolution <span className="required">*</span>
            </label>
            <div className="resolution-options">
              <label className={`resolution-option ${preferredResolution === 'refund' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="resolution"
                  value="refund"
                  checked={preferredResolution === 'refund'}
                  onChange={(e) => setPreferredResolution(e.target.value)}
                  required
                />
                <div className="resolution-content">
                  <div className="resolution-title">Refund</div>
                  <div className="resolution-description">Get your money back</div>
                </div>
              </label>

              <label className={`resolution-option ${preferredResolution === 'exchange' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="resolution"
                  value="exchange"
                  checked={preferredResolution === 'exchange'}
                  onChange={(e) => setPreferredResolution(e.target.value)}
                />
                <div className="resolution-content">
                  <div className="resolution-title">Exchange</div>
                  <div className="resolution-description">Exchange for different size/item</div>
                </div>
              </label>

              <label className={`resolution-option ${preferredResolution === 'store-credit' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="resolution"
                  value="store-credit"
                  checked={preferredResolution === 'store-credit'}
                  onChange={(e) => setPreferredResolution(e.target.value)}
                />
                <div className="resolution-content">
                  <div className="resolution-title">Store Credit</div>
                  <div className="resolution-description">Credit for future purchases</div>
                </div>
              </label>
            </div>
          </div>

          {/* Additional Notes */}
          <div className="form-group">
            <label htmlFor="additionalNotes" className="form-label">
              Additional Notes
            </label>
            <textarea
              id="additionalNotes"
              className="form-textarea"
              placeholder="Please provide any additional details about your return..."
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              rows={4}
            />
          </div>

          {/* Upload Photos */}
          <div className="form-group">
            <label className="form-label">
              Upload Photos (Optional - Max 5)
            </label>
            <p className="upload-hint-text">Photos help us process your return faster</p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <div
              className="upload-area"
              onClick={handleUploadClick}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="upload-icon">
                <path d="M7 18L17 8M17 8H12M17 8V13" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            
            {/* Display uploaded photos */}
            {uploadedPhotos.length > 0 && (
              <div className="uploaded-photos">
                {uploadedPhotos.map((photo, index) => (
                  <div key={index} className="photo-preview">
                    <img src={URL.createObjectURL(photo)} alt={`Preview ${index + 1}`} />
                    <button
                      type="button"
                      className="remove-photo"
                      onClick={() => handleRemovePhoto(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Consent Checkbox */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                required
              />
              <span className="checkbox-text">
                I accept the return policy and understand that items must be returned in original condition within 30 days
              </span>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <button type="submit" className="submit-button" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Return Request'}
          </button>
        </form>

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

export default CreateReturnRequest

