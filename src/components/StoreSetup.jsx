import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import './StoreSetup.css'

function StoreSetup() {
  const navigate = useNavigate()
  const [storeName, setStoreName] = useState('')
  const [storeUrl, setStoreUrl] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const fileInputRef = useRef(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const response = await api.setupStore(storeName, storeUrl, selectedFile)
      setSuccess('Store setup completed successfully!')
      
      // Navigate to return policy settings page
      setTimeout(() => {
        navigate('/return-policy-settings')
      }, 500)
    } catch (err) {
      setError(err.message || 'Store setup failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Check file size (2MB limit)
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }
      // Check file type
      if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
        alert('Please upload PNG or JPG file only')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB')
        return
      }
      if (!file.type.match(/^image\/(png|jpg|jpeg)$/)) {
        alert('Please upload PNG or JPG file only')
        return
      }
      setSelectedFile(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        {/* BACKO Brand Badge */}
        <div className="brand-badge">BACKO</div>
        
        {/* Header */}
        <h1 className="setup-title">Welcome! Let's set up your store</h1>
        <p className="setup-subtitle">Step 1 of 3</p>

        {/* Progress Bar */}
        <div className="progress-bar-container">
          <div className="progress-bar">
            <div className="progress-segment filled"></div>
            <div className="progress-segment"></div>
            <div className="progress-segment"></div>
          </div>
        </div>

        {/* Store Setup Form */}
        <form onSubmit={handleSubmit} className="setup-form">
          {/* Store Information Heading */}
          <h2 className="section-heading">Store Information</h2>

          {/* Store Name Field */}
          <div className="form-group">
            <label htmlFor="storeName" className="form-label">
              Store Name <span className="required">*</span>
            </label>
            <input
              type="text"
              id="storeName"
              className="form-input"
              placeholder="My Amazing Store"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              required
            />
          </div>

          {/* Store URL Field */}
          <div className="form-group">
            <label htmlFor="storeUrl" className="form-label">
              Store URL / Domain <span className="required">*</span>
            </label>
            <input
              type="url"
              id="storeUrl"
              className="form-input"
              placeholder="https://mystore.com"
              value={storeUrl}
              onChange={(e) => setStoreUrl(e.target.value)}
              required
            />
          </div>

          {/* Store Logo Upload */}
          <div className="form-group">
            <label className="form-label">Store Logo</label>
            <div 
              className="file-upload-area"
              onClick={handleUploadClick}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpg,image/jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M7 18L17 8M17 8H12M17 8V13" stroke="#2C2C2C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="upload-text">Click to upload or drag and drop</p>
              <p className="upload-hint">PNG, JPG up to 2MB</p>
              {selectedFile && (
                <p className="file-selected">Selected: {selectedFile.name}</p>
              )}
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

          {/* Success Message */}
          {success && (
            <div className="success-message" style={{ 
              color: '#28a745', 
              fontSize: '0.875rem', 
              marginBottom: '1rem',
              padding: '0.75rem',
              backgroundColor: '#d4edda',
              borderRadius: '8px',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          {/* Next Button */}
          <button type="submit" className="next-button" disabled={loading}>
            {loading ? 'Setting Up...' : 'Next'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default StoreSetup

