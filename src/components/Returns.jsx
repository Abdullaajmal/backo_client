import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Layout from './Layout'
import './Returns.css'

function Returns() {
  const navigate = useNavigate()
  const [returns, setReturns] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Open')

  useEffect(() => {
    fetchReturns()
  }, [])

  const fetchReturns = async () => {
    try {
      const response = await api.getReturns()
      setReturns(response.data || [])
    } catch (err) {
      console.error('Failed to fetch returns:', err)
    } finally {
      setLoading(false)
    }
  }


  // Calculate status counts
  const statusCounts = {
    'Open': returns.filter(r => ['Pending Approval', 'Awaiting Receipt'].includes(r.status)).length,
    'Awaiting Receipt': returns.filter(r => r.status === 'Awaiting Receipt').length,
    'Inspection': returns.filter(r => r.status === 'In Inspection').length,
    'Refund Pending': returns.filter(r => r.status === 'Refund Pending').length,
    'Closed': returns.filter(r => ['Completed', 'Rejected'].includes(r.status)).length,
  }

  const filteredReturns = returns.filter(returnItem => {
    const matchesSearch = 
      returnItem.returnId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      returnItem.product?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    let matchesStatus = false
    if (statusFilter === 'Open') {
      matchesStatus = ['Pending Approval', 'Awaiting Receipt'].includes(returnItem.status)
    } else if (statusFilter === 'Awaiting Receipt') {
      matchesStatus = returnItem.status === 'Awaiting Receipt'
    } else if (statusFilter === 'Inspection') {
      matchesStatus = returnItem.status === 'In Inspection'
    } else if (statusFilter === 'Refund Pending') {
      matchesStatus = returnItem.status === 'Refund Pending'
    } else if (statusFilter === 'Closed') {
      matchesStatus = ['Completed', 'Rejected'].includes(returnItem.status)
    }

    return matchesSearch && matchesStatus
  })

  const getReasonColor = (reason) => {
    return '#2196F3' // Blue color for reason tags
  }

  return (
    <Layout>
      <div className="returns-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Header */}
            <div className="returns-header">
              <h1 className="returns-title">Returns Management</h1>
              <p className="returns-subtitle">Track and manage return requests</p>
            </div>

            {/* Search Bar */}
            <div className="returns-search">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by return ID, customer, or product..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Status Filters */}
            <div className="status-filters">
              <button
                className={`status-filter-btn ${statusFilter === 'Open' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Open')}
              >
                Open ({statusCounts['Open']})
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Awaiting Receipt' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Awaiting Receipt')}
              >
                Awaiting Receipt ({statusCounts['Awaiting Receipt']})
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Inspection' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Inspection')}
              >
                Inspection ({statusCounts['Inspection']})
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Refund Pending' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Refund Pending')}
              >
                Refund Pending ({statusCounts['Refund Pending']})
              </button>
              <button
                className={`status-filter-btn ${statusFilter === 'Closed' ? 'active' : ''}`}
                onClick={() => setStatusFilter('Closed')}
              >
                Closed ({statusCounts['Closed']})
              </button>
            </div>

            {/* Returns Table or Empty State */}
            {filteredReturns.length > 0 ? (
              <div className="returns-table-card">
                <table className="returns-table">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Reason</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredReturns.map((returnItem, index) => (
                      <tr key={index}>
                        <td className="return-id" data-label="Return ID">{returnItem.returnId}</td>
                        <td data-label="Customer">{returnItem.customer?.name || returnItem.customer || 'N/A'}</td>
                        <td data-label="Product">{returnItem.product?.name || returnItem.product || 'N/A'}</td>
                        <td data-label="Reason">
                          <span className="reason-tag" style={{ color: getReasonColor(returnItem.reason) }}>
                            {returnItem.reason || 'N/A'}
                          </span>
                        </td>
                        <td data-label="Date">{returnItem.date || (returnItem.createdAt ? new Date(returnItem.createdAt).toISOString().split('T')[0] : 'N/A')}</td>
                        <td data-label="Amount">${returnItem.amount?.toFixed(2) || '0.00'}</td>
                        <td data-label="Actions">
                          <button className="view-details-btn">View Details</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="returns-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                  <path d="M1 4H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="9" cy="20" r="1" fill="currentColor"/>
                  <circle cx="20" cy="20" r="1" fill="currentColor"/>
                </svg>
                <h2>No Returns Found</h2>
                <p>You don't have any return requests yet. Returns will appear here when customers submit return requests through your return portal.</p>
                <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
                  Share your return portal URL from Settings page with your customers to allow them to submit return requests.
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default Returns

