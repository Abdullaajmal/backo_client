import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../services/api'
import Layout from './Layout'
import './Orders.css'

function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const [paymentFilter, setPaymentFilter] = useState('All Payment')
  const [syncing, setSyncing] = useState(false)
  const [shopifyConnected, setShopifyConnected] = useState(false)

  useEffect(() => {
    fetchOrders()
    checkShopifyStatus()
  }, [])

  const checkShopifyStatus = async () => {
    try {
      const response = await api.getShopifyStatus()
      setShopifyConnected(response.data?.isConnected || false)
    } catch (err) {
      console.error('Failed to check Shopify status:', err)
    }
  }

  const handleRefreshOrders = async () => {
    setSyncing(true)
    setLoading(true)
    try {
      await fetchOrders() // Fetch fresh orders from Shopify
    } catch (err) {
      alert(err.message || 'Failed to refresh orders')
    } finally {
      setSyncing(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await api.getOrders()
      setOrders(response.data || [])
    } catch (err) {
      console.error('Failed to fetch orders:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleViewOrder = (orderNumber) => {
    // Find order in the list
    const order = orders.find(o => o.orderNumber === orderNumber)
    if (order) {
      const customer = order.customer || {}
      const shippingAddress = order.shippingAddress || {}
      const billingAddress = order.billingAddress || {}
      
      let details = `Order Details:\n\n`
      details += `Order #: ${order.orderNumber}\n`
      details += `Customer: ${customer.name || 'N/A'}\n`
      details += `Email: ${customer.email || 'N/A'}\n`
      details += `Phone: ${customer.phone || 'N/A'}\n`
      details += `Amount: $${order.amount?.toFixed(2) || '0.00'}\n`
      details += `Status: ${order.status}\n`
      details += `Payment: ${order.paymentMethod}\n`
      details += `Placed Date: ${order.placedDate || 'N/A'}\n`
      details += `Delivered Date: ${order.deliveredDate || 'Not delivered yet'}\n\n`
      
      if (shippingAddress.street || shippingAddress.city) {
        details += `Shipping Address:\n`
        details += `${shippingAddress.street || ''}\n`
        details += `${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}\n`
        details += `${shippingAddress.country || ''}\n\n`
      }
      
      if (billingAddress.street || billingAddress.city) {
        details += `Billing Address:\n`
        details += `${billingAddress.street || ''}\n`
        details += `${billingAddress.city || ''}, ${billingAddress.state || ''} ${billingAddress.zipCode || ''}\n`
        details += `${billingAddress.country || ''}\n\n`
      }
      
      if (order.items && order.items.length > 0) {
        details += `Items (${order.items.length}):\n`
        order.items.forEach((item, idx) => {
          details += `${idx + 1}. ${item.productName} - Qty: ${item.quantity} - $${item.price?.toFixed(2) || '0.00'}\n`
        })
      }
      
      alert(details)
    }
  }

  const handleUpdateOrder = (orderNumber) => {
    // Find order in the list
    const order = orders.find(o => o.orderNumber === orderNumber)
    if (order) {
      const newStatus = prompt(`Update order status for ${orderNumber}:\n\nCurrent Status: ${order.status}\n\nEnter new status (Pending, Processing, In Transit, Delivered, Cancelled):`, order.status)
      if (newStatus && newStatus !== order.status) {
        handleUpdateOrderStatus(orderNumber, newStatus)
      }
    }
  }

  const handleConfirmOrder = async (orderNumber) => {
    if (!confirm(`Are you sure you want to mark order ${orderNumber} as Delivered?`)) {
      return
    }
    await handleUpdateOrderStatus(orderNumber, 'Delivered')
  }

  const handleUpdateOrderStatus = async (orderNumber, newStatus) => {
    try {
      // Find the order first to get its ID
      const order = orders.find(o => o.orderNumber === orderNumber)
      if (!order || !order._id) {
        alert('Order ID not found. Please refresh the page.')
        return
      }

      const response = await api.updateOrder(order._id, { status: newStatus })
      
      if (response.success) {
        alert(`Order ${orderNumber} updated to ${newStatus} successfully!`)
        fetchOrders() // Refresh orders list
      }
    } catch (err) {
      alert(err.message || 'Failed to update order status')
    }
  }


  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'All Status' || order.status === statusFilter
    const matchesPayment = paymentFilter === 'All Payment' || order.paymentMethod === paymentFilter

    return matchesSearch && matchesStatus && matchesPayment
  })

  const getStatusColor = (status) => {
    const colors = {
      'Delivered': '#4CAF50',
      'In Transit': '#2196F3',
      'Processing': '#FF6B35',
      'Pending': '#FFC107',
      'Cancelled': '#F44336'
    }
    return colors[status] || '#666666'
  }

  return (
    <Layout>
      <div className="orders-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Header */}
            <div className="orders-header">
              <div>
                <h1 className="orders-title">Orders</h1>
                <p className="orders-subtitle">Manage and track all orders</p>
              </div>
                     {shopifyConnected && (
                       <button 
                         className="sync-orders-btn"
                         onClick={handleRefreshOrders}
                         disabled={syncing}
                         title="Refresh orders from Shopify"
                       >
                         <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                           <path d="M21.5 2V8H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M2.5 22V16H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M2 11C2 14.866 5.134 18 9 18L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                           <path d="M22 13C22 9.134 18.866 6 15 6L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                         </svg>
                         {syncing ? 'Refreshing...' : 'Refresh Orders'}
                       </button>
                     )}
            </div>

            {/* Empty State or Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="orders-empty-state">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, marginBottom: '1rem' }}>
                  <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <h2>No Orders Found</h2>
                {shopifyConnected ? (
                  <>
                    <p>No orders found in your Shopify store. Orders are fetched automatically when you have orders in Shopify.</p>
                    <button 
                      className="sync-orders-btn large"
                      onClick={handleRefreshOrders}
                      disabled={syncing}
                      style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 2V8H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 22V16H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 11C2 14.866 5.134 18 9 18L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 13C22 9.134 18.866 6 15 6L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {syncing ? 'Refreshing...' : 'Refresh Orders'}
                    </button>
                  </>
                ) : (
                  <>
                    <p>Connect your Shopify store in <Link to="/settings" className="link-text">Settings</Link> to view orders.</p>
                    <button 
                      className="sync-orders-btn large"
                      onClick={() => navigate('/settings')}
                      style={{ marginTop: '1rem', padding: '0.75rem 1.5rem', fontSize: '1rem' }}
                    >
                      Go to Settings
                    </button>
                  </>
                )}
              </div>
            ) : (
              <>
            {/* Search and Filters */}
            <div className="orders-filters">
              <div className="search-box">
                <svg className="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <input
                  type="text"
                  className="search-input"
                  placeholder="Q Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="filters-group">
                <select 
                  className="filter-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option>All Status</option>
                  <option>Delivered</option>
                  <option>In Transit</option>
                  <option>Processing</option>
                  <option>Pending</option>
                  <option>Cancelled</option>
                </select>
                <select 
                  className="filter-select"
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                >
                  <option>All Payment</option>
                  <option>COD</option>
                  <option>Prepaid</option>
                </select>
                <button className="more-filters-btn">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22 3H2L10 12.46V19L14 21V12.46L22 3Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  More Filters
                </button>
              </div>
            </div>

            {/* Orders Table */}
            <div className="orders-table-card">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Amount</th>
                    <th>Payment</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th>Delivered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length > 0 ? (
                    filteredOrders.map((order, index) => (
                      <tr key={index}>
                        <td className="order-number" data-label="Order #">{order.orderNumber}</td>
                        <td data-label="Customer">{order.customer?.name || order.customer || 'N/A'}</td>
                        <td data-label="Email">{order.customer?.email || 'N/A'}</td>
                        <td data-label="Phone">{order.customer?.phone || 'N/A'}</td>
                        <td data-label="Amount">${order.amount?.toFixed(2) || '0.00'}</td>
                        <td data-label="Payment">
                          <span className={`payment-badge ${order.paymentMethod === 'COD' ? 'cod' : 'prepaid'}`}>
                            {order.paymentMethod || 'N/A'}
                          </span>
                        </td>
                        <td data-label="Status">
                          <span className="status-badge" style={{ color: getStatusColor(order.status) }}>
                            {order.status}
                          </span>
                        </td>
                        <td data-label="Placed">{order.placedDate || order.date || '-'}</td>
                        <td data-label="Delivered">{order.deliveredDate ? order.deliveredDate : '-'}</td>
                        <td data-label="Actions">
                          <div className="action-buttons">
                            <button 
                              className="action-btn" 
                              title="View"
                              onClick={() => handleViewOrder(order.orderNumber)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className="action-btn" 
                              title="Update Status"
                              onClick={() => handleUpdateOrder(order.orderNumber)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M3 12C3 4.5885 4.5885 3 12 3C19.4115 3 21 4.5885 21 12C21 19.4115 19.4115 21 12 21C4.5885 21 3 19.4115 3 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                <path d="M12 8V16M8 12H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                            <button 
                              className={`action-btn ${order.status === 'Delivered' ? 'confirmed' : ''}`} 
                              title={order.status === 'Delivered' ? 'Already Delivered' : 'Confirm as Delivered'}
                              onClick={() => handleConfirmOrder(order.orderNumber)}
                              disabled={order.status === 'Delivered'}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="no-orders">No orders found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
              </>
            )}
          </>
        )}
      </div>
    </Layout>
  )
}

export default Orders

