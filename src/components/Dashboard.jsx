import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { tokenService } from '../services/api'
import './Dashboard.css'

function Dashboard() {
  const navigate = useNavigate()
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      openReturns: 24,
      avgRefundTime: '2.4 days',
      returnRate: '8.5%',
      urgentActions: 3
    },
    returnsChart: [],
    returnReasons: [],
    latestReturns: []
  })
  const [loading, setLoading] = useState(true)
  const [activeMenu, setActiveMenu] = useState('Home')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.getDashboard()
      if (response.data) {
        setDashboardData({
          metrics: response.data.metrics || dashboardData.metrics,
          returnsChart: response.data.returnsChart && response.data.returnsChart.length > 0 
            ? response.data.returnsChart 
            : returnsChartData,
          returnReasons: response.data.returnReasons && response.data.returnReasons.length > 0
            ? response.data.returnReasons
            : returnReasonsData,
          latestReturns: response.data.latestReturns && response.data.latestReturns.length > 0
            ? response.data.latestReturns
            : latestReturnsData
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      // Use fallback data if API fails
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/login')
  }

  const handleMenuClick = (menu) => {
    setActiveMenu(menu)
  }

  // Fallback chart data (used if API returns empty or fails)
  const returnsChartData = [
    { date: 'Jan 15', value: 12 },
    { date: 'Jan 20', value: 18 },
    { date: 'Jan 25', value: 15 },
    { date: 'Jan 30', value: 22 },
    { date: 'Feb 5', value: 20 },
    { date: 'Feb 11', value: 24 }
  ]

  const returnReasonsData = [
    { label: 'Wrong Size', value: 28, color: '#FF6B35' },
    { label: 'Defective', value: 25, color: '#FF8C69' },
    { label: 'Not as Described', value: 22, color: '#CCCCCC' },
    { label: 'Changed Mind', value: 15, color: '#666666' },
    { label: 'Damaged', value: 10, color: '#333333' }
  ]

  const latestReturnsData = [
    { id: 'RT-001', customer: 'Sarah Johnson', product: 'Blue Sneakers', status: 'Pending Approval', date: '2025-02-14', amount: '$89.99', statusColor: '#FFC107' },
    { id: 'RT-002', customer: 'Michael Chen', product: 'Red T-Shirt', status: 'Awaiting Receipt', date: '2025-02-13', amount: '$29.99', statusColor: '#2196F3' },
    { id: 'RT-003', customer: 'Emily Davis', product: 'Black Jeans', status: 'In Inspection', date: '2025-02-12', amount: '$59.99', statusColor: '#9C27B0' },
    { id: 'RT-004', customer: 'David Wilson', product: 'White Hoodie', status: 'Refund Pending', date: '2025-02-11', amount: '$79.99', statusColor: '#FF6B35' },
    { id: 'RT-005', customer: 'Jessica Brown', product: 'Green Jacket', status: 'Completed', date: '2025-02-10', amount: '$119.99', statusColor: '#4CAF50' },
    { id: 'RT-006', customer: 'Robert Taylor', product: 'Gray Sweater', status: 'Pending Approval', date: '2025-02-09', amount: '$49.99', statusColor: '#FFC107' },
    { id: 'RT-007', customer: 'Amanda Martinez', product: 'Yellow Dress', status: 'Awaiting Receipt', date: '2025-02-08', amount: '$69.99', statusColor: '#2196F3' },
    { id: 'RT-008', customer: 'James Anderson', product: 'Brown Boots', status: 'Completed', date: '2025-02-07', amount: '$149.99', statusColor: '#4CAF50' }
  ]

  const maxChartValue = 28
  const chartHeight = 200
  const chartWidth = 600

  return (
    <div className="dashboard-container">
      {/* Left Sidebar */}
      <div className="dashboard-sidebar">
        {/* Top Section */}
        <div className="sidebar-top">
          <div className="sidebar-badge">BACKO</div>
          <p className="sidebar-subtitle">Merchant Dashboard</p>
        </div>

        {/* Navigation Menu */}
        <nav className="sidebar-nav">
          <div 
            className={`nav-item ${activeMenu === 'Home' ? 'active' : ''}`}
            onClick={() => handleMenuClick('Home')}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9 22V12H15V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Home</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'Orders' ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick('Orders')
              navigate('/orders')
            }}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M3 6H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 10C16 11.0609 15.5786 12.0783 14.8284 12.8284C14.0783 13.5786 13.0609 14 12 14C10.9391 14 9.92172 13.5786 9.17157 12.8284C8.42143 12.0783 8 11.0609 8 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Orders</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'Returns' ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick('Returns')
              navigate('/returns')
            }}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 4H5L7.68 14.39C7.77144 14.8504 8.02191 15.264 8.38755 15.5583C8.75318 15.8526 9.2107 16.009 9.68 16H19.4C19.8693 16.009 20.3268 15.8526 20.6925 15.5583C21.0581 15.264 21.3086 14.8504 21.4 14.39L23 6H6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="20" r="1" fill="currentColor"/>
              <circle cx="20" cy="20" r="1" fill="currentColor"/>
            </svg>
            <span>Returns</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'Customers' ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick('Customers')
              navigate('/customers')
            }}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Customers</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'Analytics' ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick('Analytics')
              navigate('/analytics')
            }}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M21 10H16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Analytics</span>
          </div>
          <div 
            className={`nav-item ${activeMenu === 'Settings' ? 'active' : ''}`}
            onClick={() => {
              handleMenuClick('Settings')
              navigate('/settings')
            }}
          >
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32C14.7842 19.4468 14.532 19.6572 14.3543 19.9255C14.1766 20.1938 14.0813 20.5082 14.08 20.83V21C14.08 21.5304 13.8693 22.0391 13.4942 22.4142C13.1191 22.7893 12.6104 23 12.08 23C11.5496 23 11.0409 22.7893 10.6658 22.4142C10.2907 22.0391 10.08 21.5304 10.08 21V20.91C10.0723 20.579 9.96512 20.258 9.77251 19.9887C9.5799 19.7194 9.31074 19.5143 9 19.4C8.69838 19.2669 8.36381 19.2272 8.03941 19.286C7.71502 19.3448 7.41568 19.4995 7.18 19.73L7.12 19.79C6.93425 19.976 6.71368 20.1235 6.47088 20.2241C6.22808 20.3248 5.96783 20.3766 5.705 20.3766C5.44217 20.3766 5.18192 20.3248 4.93912 20.2241C4.69632 20.1235 4.47575 19.976 4.29 19.79C4.10405 19.6043 3.95653 19.3837 3.85588 19.1409C3.75523 18.8981 3.70343 18.6378 3.70343 18.375C3.70343 18.1122 3.75523 17.8519 3.85588 17.6091C3.95653 17.3663 4.10405 17.1457 4.29 16.96L4.35 16.9C4.58054 16.6643 4.73519 16.365 4.794 16.0406C4.85282 15.7162 4.81312 15.3816 4.68 15.08C4.55324 14.7842 4.34276 14.532 4.07447 14.3543C3.80618 14.1766 3.49179 14.0813 3.17 14.08H3C2.46957 14.08 1.96086 13.8693 1.58579 13.4942C1.21071 13.1191 1 12.6104 1 12.08C1 11.5496 1.21071 11.0409 1.58579 10.6658C1.96086 10.2907 2.46957 10.08 3 10.08H3.09C3.42099 10.0723 3.742 9.96512 4.01131 9.77251C4.28062 9.5799 4.48568 9.31074 4.6 9C4.73312 8.69838 4.77282 8.36381 4.714 8.03941C4.65519 7.71502 4.50054 7.41568 4.27 7.18L4.21 7.12C4.02405 6.93425 3.87653 6.71368 3.77588 6.47088C3.67523 6.22808 3.62343 5.96783 3.62343 5.705C3.62343 5.44217 3.67523 5.18192 3.77588 4.93912C3.87653 4.69632 4.02405 4.47575 4.21 4.29C4.39575 4.10405 4.61632 3.95653 4.85912 3.85588C5.10192 3.75523 5.36217 3.70343 5.625 3.70343C5.88783 3.70343 6.14808 3.75523 6.39088 3.85588C6.63368 3.95653 6.85425 4.10405 7.04 4.29L7.1 4.35C7.33568 4.58054 7.63502 4.73519 7.95941 4.794C8.28381 4.85282 8.61838 4.81312 8.92 4.68H9C9.29577 4.55324 9.54802 4.34276 9.72569 4.07447C9.90337 3.80618 9.99872 3.49179 10 3.17V3C10 2.46957 10.2107 1.96086 10.5858 1.58579C10.9609 1.21071 11.4696 1 12 1C12.5304 1 13.0391 1.21071 13.4142 1.58579C13.7893 1.96086 14 2.46957 14 3V3.09C14.0013 3.41179 14.0966 3.72618 14.2743 3.99447C14.452 4.26276 14.7042 4.47324 15 4.6C15.3016 4.73312 15.6362 4.77282 15.9606 4.714C16.285 4.65519 16.5843 4.50054 16.82 4.27L16.88 4.21C17.0657 4.02405 17.2863 3.87653 17.5291 3.77588C17.7719 3.67523 18.0322 3.62343 18.295 3.62343C18.5578 3.62343 18.8181 3.67523 19.0609 3.77588C19.3037 3.87653 19.5243 4.02405 19.71 4.21C19.896 4.39575 20.0435 4.61632 20.1441 4.85912C20.2448 5.10192 20.2966 5.36217 20.2966 5.625C20.2966 5.88783 20.2448 6.14808 20.1441 6.39088C20.0435 6.63368 19.896 6.85425 19.71 7.04L19.65 7.1C19.4195 7.33568 19.2648 7.63502 19.206 7.95941C19.1472 8.28381 19.1869 8.61838 19.32 8.92V9C19.4468 9.29577 19.6572 9.54802 19.9255 9.72569C20.1938 9.90337 20.5082 9.99872 20.83 10H21C21.5304 10 22.0391 10.2107 22.4142 10.5858C22.7893 10.9609 23 11.4696 23 12C23 12.5304 22.7893 13.0391 22.4142 13.4142C22.0391 13.7893 21.5304 14 21 14H20.91C20.5882 14.0013 20.2738 14.0966 20.0055 14.2743C19.7372 14.452 19.5268 14.7042 19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.08 19.32V19.32Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Settings</span>
          </div>
        </nav>

        {/* Bottom Section */}
        <div className="sidebar-bottom">
          <div className="nav-item" onClick={() => {}}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Back to Modules</span>
          </div>
          <div className="nav-item" onClick={handleLogout}>
            <svg className="nav-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9M16 17L21 12M21 12L16 7M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Logout</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Dashboard Overview */}
            <section className="dashboard-section">
              <h1 className="section-title">Dashboard Overview</h1>
              <p className="section-subtitle">Welcome back! Here's what's happening with your store.</p>
              
              <div className="metrics-grid">
                <div className="metric-card orange">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6H4C2.89543 6 2 6.89543 2 8V18C2 19.1046 2.89543 20 4 20H20C21.1046 20 22 19.1046 22 18V8C22 6.89543 21.1046 6 20 6Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M2 8L12 14L22 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="metric-value">{dashboardData.metrics.openReturns}</div>
                  <div className="metric-label">Open Returns</div>
                </div>

                <div className="metric-card blue">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="metric-value">{dashboardData.metrics.avgRefundTime}</div>
                  <div className="metric-label">Avg Refund Time</div>
                </div>

                <div className="metric-card green">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3V21H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M7 16L12 11L16 15L21 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 10H16V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="metric-value">{dashboardData.metrics.returnRate}</div>
                  <div className="metric-label">Return Rate</div>
                </div>

                <div className="metric-card red">
                  <div className="metric-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="metric-value">{dashboardData.metrics.urgentActions}</div>
                  <div className="metric-label">Urgent Actions</div>
                </div>
              </div>
            </section>

            {/* Performance Charts */}
            <section className="dashboard-section">
              <div className="charts-grid">
                {/* Returns Last 30 Days */}
                <div className="chart-card">
                  <h3 className="chart-title">Returns Last 30 Days</h3>
                  <div className="chart-container">
                    <svg width={chartWidth} height={chartHeight} className="line-chart">
                      <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3"/>
                          <stop offset="100%" stopColor="#FF6B35" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      {/* Grid lines */}
                      {[0, 7, 14, 21, 28].map((val) => (
                        <line
                          key={val}
                          x1="40"
                          y1={chartHeight - 40 - (val / maxChartValue) * (chartHeight - 80)}
                          x2={chartWidth - 20}
                          y2={chartHeight - 40 - (val / maxChartValue) * (chartHeight - 80)}
                          stroke="#E0E0E0"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Area under line */}
                      {dashboardData.returnsChart.length > 0 && (
                        <path
                          d={`M 40 ${chartHeight - 40} ${dashboardData.returnsChart.map((point, i) => {
                            const x = 40 + (i / (dashboardData.returnsChart.length - 1 || 1)) * (chartWidth - 60);
                            const y = chartHeight - 40 - (point.value / maxChartValue) * (chartHeight - 80);
                            return `L ${x} ${y}`;
                          }).join(' ')} L ${chartWidth - 20} ${chartHeight - 40} Z`}
                          fill="url(#lineGradient)"
                        />
                      )}
                      {/* Line */}
                      <polyline
                        points={dashboardData.returnsChart.map((point, i) => {
                          const x = 40 + (i / (dashboardData.returnsChart.length - 1 || 1)) * (chartWidth - 60);
                          const y = chartHeight - 40 - (point.value / maxChartValue) * (chartHeight - 80);
                          return `${x},${y}`;
                        }).join(' ')}
                        fill="none"
                        stroke="#FF6B35"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />
                      {/* Data points */}
                      {dashboardData.returnsChart.map((point, i) => {
                        const x = 40 + (i / (dashboardData.returnsChart.length - 1 || 1)) * (chartWidth - 60);
                        const y = chartHeight - 40 - (point.value / maxChartValue) * (chartHeight - 80);
                        return (
                          <circle
                            key={i}
                            cx={x}
                            cy={y}
                            r="4"
                            fill="#FF6B35"
                          />
                        );
                      })}
                      {/* X-axis labels */}
                      {dashboardData.returnsChart.map((point, i) => {
                        const x = 40 + (i / (dashboardData.returnsChart.length - 1 || 1)) * (chartWidth - 60);
                        return (
                          <text
                            key={i}
                            x={x}
                            y={chartHeight - 20}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#666666"
                          >
                            {point.date}
                          </text>
                        );
                      })}
                      {/* Y-axis labels */}
                      {[0, 7, 14, 21, 28].map((val) => (
                        <text
                          key={val}
                          x="20"
                          y={chartHeight - 40 - (val / maxChartValue) * (chartHeight - 80) + 4}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#666666"
                        >
                          {val}
                        </text>
                      ))}
                    </svg>
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-color" style={{ backgroundColor: '#FF6B35' }}></span>
                      returns
                    </span>
                  </div>
                </div>

                {/* Return Reasons Distribution */}
                <div className="chart-card">
                  <h3 className="chart-title">Return Reasons Distribution</h3>
                  <div className="pie-chart-container">
                    <svg width="200" height="200" className="pie-chart">
                      {(() => {
                        let currentAngle = -90;
                        const reasonsWithColors = dashboardData.returnReasons.map((item, i) => {
                          const colors = ['#FF6B35', '#FF8C69', '#CCCCCC', '#666666', '#333333'];
                          return { ...item, color: item.color || colors[i % colors.length] };
                        });
                        return reasonsWithColors.map((item, i) => {
                          const percentage = item.value;
                          const angle = (percentage / 100) * 360;
                          const startAngle = currentAngle;
                          const endAngle = currentAngle + angle;
                          currentAngle = endAngle;

                          const startAngleRad = (startAngle * Math.PI) / 180;
                          const endAngleRad = (endAngle * Math.PI) / 180;
                          const x1 = 100 + 80 * Math.cos(startAngleRad);
                          const y1 = 100 + 80 * Math.sin(startAngleRad);
                          const x2 = 100 + 80 * Math.cos(endAngleRad);
                          const y2 = 100 + 80 * Math.sin(endAngleRad);
                          const largeArc = angle > 180 ? 1 : 0;

                          return (
                            <path
                              key={i}
                              d={`M 100 100 L ${x1} ${y1} A 80 80 0 ${largeArc} 1 ${x2} ${y2} Z`}
                              fill={item.color}
                            />
                          );
                        });
                      })()}
                    </svg>
                    <div className="pie-legend">
                      {dashboardData.returnReasons.map((item, i) => {
                        const colors = ['#FF6B35', '#FF8C69', '#CCCCCC', '#666666', '#333333'];
                        const color = item.color || colors[i % colors.length];
                        return (
                          <div key={i} className="pie-legend-item">
                            <span className="pie-legend-color" style={{ backgroundColor: color }}></span>
                            <span className="pie-legend-text">{item.label} {item.value}%</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Latest Returns */}
            <section className="dashboard-section">
              <h2 className="section-title">Latest Returns</h2>
              <div className="table-card">
                <table className="returns-table">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Customer</th>
                      <th>Product</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.latestReturns.map((returnItem, index) => (
                      <tr key={index}>
                        <td className="return-id">{returnItem.id}</td>
                        <td>{returnItem.customer}</td>
                        <td>{returnItem.product}</td>
                        <td>
                          <span className="status-badge" style={{ color: returnItem.statusColor }}>
                            {returnItem.status}
                          </span>
                        </td>
                        <td>{returnItem.date}</td>
                        <td>{returnItem.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}

export default Dashboard

