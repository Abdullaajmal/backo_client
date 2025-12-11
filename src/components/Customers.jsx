import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Layout from './Layout'
import './Customers.css'

function Customers() {
  const navigate = useNavigate()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      console.log('🔄 Fetching customers...')
      const response = await api.getCustomers()
      console.log('📥 Customers API response:', response)
      console.log('   Response keys:', Object.keys(response))
      console.log('   Response.success:', response.success)
      console.log('   Response.data:', response.data)
      console.log('   Response.data type:', Array.isArray(response.data) ? 'Array' : typeof response.data)
      console.log('   Response.data length:', Array.isArray(response.data) ? response.data.length : 'N/A')
      
      // Handle different response structures
      if (response && response.success !== false) {
        // If response.data exists and is an array
        if (response.data && Array.isArray(response.data)) {
          setCustomers(response.data)
          console.log(`✅ Loaded ${response.data.length} customers`)
        } 
        // If response is directly an array (some APIs return this)
        else if (Array.isArray(response)) {
          setCustomers(response)
          console.log(`✅ Loaded ${response.length} customers (direct array)`)
        }
        // If response has data but it's not an array
        else {
          console.warn('⚠️ Response.data is not an array:', response.data)
          setCustomers([])
        }
      } else {
        console.error('❌ Failed to fetch customers:', response.message || 'Unknown error')
        setCustomers([])
        if (response.message) {
          alert(response.message)
        }
      }
    } catch (err) {
      console.error('❌ Error fetching customers:', err)
      console.error('   Error details:', err.message)
      console.error('   Error stack:', err.stack)
      
      // Show user-friendly error message
      const errorMessage = err.message || 'Failed to fetch customers. Please check your Shopify connection.'
      alert(errorMessage)
      
      // Set empty array to show empty state
      setCustomers([])
      
      // Re-throw to show in console
      throw err
    } finally {
      setLoading(false)
    }
  }


  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer?.phone?.toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  // Debug: Log customers state changes
  useEffect(() => {
    console.log('📊 Customers state updated:', {
      totalCustomers: customers.length,
      filteredCustomers: filteredCustomers.length,
      searchQuery: searchQuery,
      sampleCustomer: customers[0],
      allCustomers: customers
    })
    
    if (customers.length > 0 && filteredCustomers.length === 0 && searchQuery) {
      console.warn('⚠️ Customers exist but filteredCustomers is empty - search query might be filtering all out')
    }
  }, [customers, filteredCustomers, searchQuery])

  const getTrustScoreColor = (score) => {
    return score >= 85 ? '#4CAF50' : '#FFC107' // Green if >= 85, Yellow if < 85
  }

  return (
    <Layout>
      <div className="customers-main">
        {loading ? (
          <div className="loading">
            <p>Loading customers from Shopify...</p>
            <p style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.5rem' }}>
              Fetching real-time data...
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="customers-header">
              <h1 className="customers-title">Customers</h1>
              <p className="customers-subtitle">View and manage customer information</p>
            </div>

            {/* Search Bar */}
            <div className="customers-search">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Search by name, email, or phone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Customers Table */}
            <div className="customers-table-card">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Contact</th>
                    <th>Trust Score</th>
                    <th>Total Orders</th>
                    <th>Total Returns</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers && filteredCustomers.length > 0 ? (
                    filteredCustomers.map((customer, index) => {
                      // Debug: Log first customer being rendered
                      if (index === 0) {
                        console.log('🎨 Rendering customers table:', {
                          total: filteredCustomers.length,
                          firstCustomer: customer
                        })
                      }
                      return (
                      <tr key={index || customer.email || `customer-${index}`}>
                        <td data-label="Customer">
                          <div className="customer-name-cell">
                            <svg className="customer-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <circle cx="12" cy="7" r="4" stroke="#FF6B35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            <span>{customer?.name || 'N/A'}</span>
                          </div>
                        </td>
                        <td data-label="Contact">
                          <div className="contact-cell">
                            <div className="contact-email">{customer?.email || 'N/A'}</div>
                            <div className="contact-phone">{customer?.phone || 'N/A'}</div>
                          </div>
                        </td>
                        <td data-label="Trust Score">
                          <span className="trust-score" style={{ color: getTrustScoreColor(customer?.trustScore || 50) }}>
                            {customer?.trustScore || 0}/100
                          </span>
                        </td>
                        <td data-label="Total Orders">{customer?.totalOrders || 0}</td>
                        <td data-label="Total Returns">{customer?.totalReturns || 0}</td>
                        <td data-label="Actions">
                          <button className="view-details-btn">View Details</button>
                        </td>
                      </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td colSpan="6" className="no-customers">
                        <div style={{ padding: '2rem', textAlign: 'center' }}>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                            <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                          <h3 style={{ marginBottom: '0.5rem', fontWeight: 600 }}>No customers found</h3>
                          <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '1rem' }}>
                            {customers.length === 0 
                              ? 'No customers in your Shopify store yet. Customers will appear here once you have orders.'
                              : 'No customers match your search criteria.'}
                          </p>
                          <button 
                            onClick={fetchCustomers}
                            style={{ 
                              marginTop: '0.5rem', 
                              padding: '0.5rem 1rem',
                              background: '#FF6B35',
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.875rem'
                            }}
                          >
                            🔄 Refresh
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Customers

