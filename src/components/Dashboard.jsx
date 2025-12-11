import { useState, useEffect } from 'react'
import { api } from '../services/api'
import Layout from './Layout'
import './Dashboard.css'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    metrics: {
      openReturns: 0,
      avgRefundTime: '0 days',
      returnRate: '0%',
      urgentActions: 0
    },
    returnsChart: [],
    returnReasons: [],
    latestReturns: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await api.getDashboard()
      if (response.data) {
        // Only use API data - no fallback fake data
        setDashboardData({
          metrics: response.data.metrics || {
            openReturns: 0,
            avgRefundTime: '0 days',
            returnRate: '0%',
            urgentActions: 0
          },
          returnsChart: response.data.returnsChart || [],
          returnReasons: response.data.returnReasons || [],
          latestReturns: response.data.latestReturns || []
        })
      } else {
        // If no data, use empty state
        setDashboardData({
          metrics: {
            openReturns: 0,
            avgRefundTime: '0 days',
            returnRate: '0%',
            urgentActions: 0
          },
          returnsChart: [],
          returnReasons: [],
          latestReturns: []
        })
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
      // Empty state if API fails - no fake data
      setDashboardData({
        metrics: {
          openReturns: 0,
          avgRefundTime: '0 days',
          returnRate: '0%',
          urgentActions: 0
        },
        returnsChart: [],
        returnReasons: [],
        latestReturns: []
      })
    } finally {
      setLoading(false)
    }
  }

  const maxChartValue = 28
  const chartHeight = 200
  const chartWidth = 600

  return (
    <Layout>
      <div className="dashboard-content">
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
              {dashboardData.latestReturns.length > 0 ? (
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
              ) : (
                <div className="table-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <p style={{ color: '#666', fontSize: '1rem' }}>No returns yet. Returns will appear here when customers submit return requests through your return portal.</p>
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Dashboard

