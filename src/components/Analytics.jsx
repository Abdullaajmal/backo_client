import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import Layout from './Layout'
import './Analytics.css'

function Analytics() {
  const navigate = useNavigate()
  const [analyticsData, setAnalyticsData] = useState({
    metrics: {
      totalReturns: 28,
      approvalRate: 85.7,
      avgProcessingTime: 2.4,
      refundAmount: 4200,
      changes: {
        totalReturns: -4.7,
        approvalRate: 2.3,
        avgProcessingTime: -0.3,
        refundAmount: 1.8
      }
    },
    returnRateTrend: [],
    returnReasonsCount: [],
    returnReasonsDistribution: [],
    resolutionMethods: [],
    approvalVsRejection: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const response = await api.getAnalytics()
      if (response.data) {
        setAnalyticsData({
          metrics: response.data.metrics || analyticsData.metrics,
          returnRateTrend: response.data.returnRateTrend && response.data.returnRateTrend.length > 0
            ? response.data.returnRateTrend
            : returnRateTrendData,
          returnReasonsCount: response.data.returnReasonsCount && response.data.returnReasonsCount.length > 0
            ? response.data.returnReasonsCount
            : returnReasonsCountData,
          returnReasonsDistribution: response.data.returnReasonsDistribution && response.data.returnReasonsDistribution.length > 0
            ? response.data.returnReasonsDistribution
            : returnReasonsDistributionData,
          resolutionMethods: response.data.resolutionMethods && response.data.resolutionMethods.length > 0
            ? response.data.resolutionMethods
            : resolutionMethodsData,
          approvalVsRejection: response.data.approvalVsRejection && response.data.approvalVsRejection.length > 0
            ? response.data.approvalVsRejection
            : approvalVsRejectionData
        })
      }
    } catch (err) {
      console.error('Failed to fetch analytics:', err)
      // Use fallback data if API fails
    } finally {
      setLoading(false)
    }
  }


  const handleExport = () => {
    // Export functionality
    alert('Export functionality will be implemented')
  }

  // Fallback data for charts (used if API returns empty or fails)
  const returnRateTrendData = [
    { month: 'Jul', value: 6.5 },
    { month: 'Aug', value: 7.2 },
    { month: 'Sep', value: 8.1 },
    { month: 'Oct', value: 9.5 },
    { month: 'Nov', value: 9.8 },
    { month: 'Dec', value: 8.9 },
    { month: 'Jan', value: 8.5 },
    { month: 'Feb', value: 8.5 }
  ]

  const returnReasonsCountData = [
    { reason: 'Wrong Size', count: 12 },
    { reason: 'Not as Described', count: 8 },
    { reason: 'Item Damaged', count: 5 },
    { reason: 'Refund Item', count: 2 },
    { reason: 'Other', count: 1 }
  ]

  const returnReasonsDistributionData = [
    { label: 'Wrong Size', value: 35, color: '#FF6B35' },
    { label: 'Not as Described', value: 25, color: '#FF8C69' },
    { label: 'Refund Item', value: 15, color: '#FFA07A' },
    { label: 'Item Damaged', value: 15, color: '#666666' },
    { label: 'Other', value: 10, color: '#CCCCCC' }
  ]

  const resolutionMethodsData = [
    { label: 'Refund', value: 70, color: '#FF6B35' },
    { label: 'Exchange', value: 20, color: '#FF8C69' },
    { label: 'Store Credit', value: 10, color: '#666666' }
  ]

  const approvalVsRejectionData = [
    { month: 'Aug', approved: 18, rejected: 3 },
    { month: 'Sep', approved: 22, rejected: 4 },
    { month: 'Oct', approved: 25, rejected: 5 },
    { month: 'Nov', approved: 28, rejected: 6 },
    { month: 'Dec', approved: 24, rejected: 4 },
    { month: 'Jan', approved: 26, rejected: 3 },
    { month: 'Feb', approved: 24, rejected: 4 }
  ]

  const maxReturnRate = 12
  const chartHeight = 200
  const chartWidth = 600
  const barChartHeight = 200
  const maxBarValue = 30

  return (
    <Layout>
      <div className="analytics-main">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : (
          <>
            {/* Header */}
            <div className="analytics-header">
              <div>
                <h1 className="analytics-title">Analytics & Reports</h1>
                <p className="analytics-subtitle">Insights and trends for your returns.</p>
              </div>
              <button className="export-btn" onClick={handleExport}>
                Export Data
              </button>
            </div>

            {/* Key Metrics */}
            <div className="metrics-grid">
              <div className="metric-card">
                <div className="metric-label">Total Returns (Feb)</div>
                <div className="metric-value">{analyticsData.metrics.totalReturns}</div>
                <div className="metric-change positive">
                  ↓ {Math.abs(analyticsData.metrics.changes.totalReturns)}% from Jan
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Approval Rate</div>
                <div className="metric-value">{analyticsData.metrics.approvalRate}%</div>
                <div className="metric-change positive">
                  ↑ {analyticsData.metrics.changes.approvalRate}% from Jan
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Avg Processing Time</div>
                <div className="metric-value">{analyticsData.metrics.avgProcessingTime}d</div>
                <div className="metric-change positive">
                  ↓ {Math.abs(analyticsData.metrics.changes.avgProcessingTime)}d from Jan
                </div>
              </div>
              <div className="metric-card">
                <div className="metric-label">Refund Amount (Feb)</div>
                <div className="metric-value">${(analyticsData.metrics.refundAmount / 1000).toFixed(1)}K</div>
                <div className="metric-change negative">
                  ↑ {analyticsData.metrics.changes.refundAmount}% from Jan
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="charts-grid">
              {/* Return Rate Trend */}
              <div className="chart-card">
                <h3 className="chart-title">Return Rate Trend</h3>
                <div className="chart-container">
                  <svg width={chartWidth} height={chartHeight} className="line-chart">
                    <defs>
                      <linearGradient id="returnRateGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#FF6B35" stopOpacity="0.3"/>
                        <stop offset="100%" stopColor="#FF6B35" stopOpacity="0"/>
                      </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0, 3, 6, 9, 12].map((val) => (
                      <line
                        key={val}
                        x1="40"
                        y1={chartHeight - 40 - (val / maxReturnRate) * (chartHeight - 80)}
                        x2={chartWidth - 20}
                        y2={chartHeight - 40 - (val / maxReturnRate) * (chartHeight - 80)}
                        stroke="#E0E0E0"
                        strokeWidth="1"
                      />
                    ))}
                    {/* Area under line */}
                    {analyticsData.returnRateTrend.length > 0 && (
                      <path
                        d={`M 40 ${chartHeight - 40} ${analyticsData.returnRateTrend.map((point, i) => {
                          const x = 40 + (i / (analyticsData.returnRateTrend.length - 1 || 1)) * (chartWidth - 60);
                          const y = chartHeight - 40 - (point.value / maxReturnRate) * (chartHeight - 80);
                          return `L ${x} ${y}`;
                        }).join(' ')} L ${chartWidth - 20} ${chartHeight - 40} Z`}
                        fill="url(#returnRateGradient)"
                      />
                    )}
                    {/* Line */}
                    <polyline
                      points={analyticsData.returnRateTrend.map((point, i) => {
                        const x = 40 + (i / (analyticsData.returnRateTrend.length - 1 || 1)) * (chartWidth - 60);
                        const y = chartHeight - 40 - (point.value / maxReturnRate) * (chartHeight - 80);
                        return `${x},${y}`;
                      }).join(' ')}
                      fill="none"
                      stroke="#FF6B35"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    {/* Data points */}
                    {analyticsData.returnRateTrend.map((point, i) => {
                      const x = 40 + (i / (analyticsData.returnRateTrend.length - 1 || 1)) * (chartWidth - 60);
                      const y = chartHeight - 40 - (point.value / maxReturnRate) * (chartHeight - 80);
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
                    {analyticsData.returnRateTrend.map((point, i) => {
                      const x = 40 + (i / (analyticsData.returnRateTrend.length - 1 || 1)) * (chartWidth - 60);
                      return (
                        <text
                          key={i}
                          x={x}
                          y={chartHeight - 20}
                          textAnchor="middle"
                          fontSize="12"
                          fill="#666666"
                        >
                          {point.month}
                        </text>
                      );
                    })}
                    {/* Y-axis labels */}
                    {[0, 3, 6, 9, 12].map((val) => (
                      <text
                        key={val}
                        x="20"
                        y={chartHeight - 40 - (val / maxReturnRate) * (chartHeight - 80) + 4}
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
                    Return Rate (%)
                  </span>
                </div>
              </div>

              {/* Return Reasons (Count) */}
              <div className="chart-card">
                <h3 className="chart-title">Return Reasons (Count)</h3>
                <div className="chart-container">
                  <svg width={chartWidth} height={barChartHeight} className="bar-chart">
                    {analyticsData.returnReasonsCount.map((item, i) => {
                      const barWidth = (chartWidth - 100) / analyticsData.returnReasonsCount.length;
                      const barHeight = (item.count / maxBarValue) * (barChartHeight - 80);
                      const x = 50 + i * barWidth + (barWidth - 60) / 2;
                      const y = barChartHeight - 40 - barHeight;
                      return (
                        <g key={i}>
                          <rect
                            x={x}
                            y={y}
                            width="60"
                            height={barHeight}
                            fill="#FF6B35"
                            rx="4"
                          />
                          <text
                            x={x + 30}
                            y={y - 5}
                            textAnchor="middle"
                            fontSize="12"
                            fill="#2C2C2C"
                            fontWeight="600"
                          >
                            {item.count}
                          </text>
                          <text
                            x={x + 30}
                            y={barChartHeight - 25}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#666666"
                          >
                            {item.reason}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Return Reasons Distribution */}
              <div className="chart-card">
                <h3 className="chart-title">Return Reasons Distribution</h3>
                <div className="pie-chart-container">
                  <svg width="200" height="200" className="pie-chart">
                    {(() => {
                      let currentAngle = -90;
                      const reasonsWithColors = analyticsData.returnReasonsDistribution.map((item, i) => {
                        const colors = ['#FF6B35', '#FF8C69', '#FFA07A', '#666666', '#CCCCCC'];
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
                    {analyticsData.returnReasonsDistribution.map((item, i) => {
                      const colors = ['#FF6B35', '#FF8C69', '#FFA07A', '#666666', '#CCCCCC'];
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

              {/* Resolution Methods */}
              <div className="chart-card">
                <h3 className="chart-title">Resolution Methods</h3>
                <div className="pie-chart-container">
                  <svg width="200" height="200" className="pie-chart">
                    {(() => {
                      let currentAngle = -90;
                      const methodsWithColors = analyticsData.resolutionMethods.map((item, i) => {
                        const colors = ['#FF6B35', '#FF8C69', '#666666'];
                        return { ...item, color: item.color || colors[i % colors.length] };
                      });
                      return methodsWithColors.map((item, i) => {
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
                    {analyticsData.resolutionMethods.map((item, i) => {
                      const colors = ['#FF6B35', '#FF8C69', '#666666'];
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

              {/* Approval vs Rejection */}
              <div className="chart-card">
                <h3 className="chart-title">Approval vs Rejection</h3>
                <div className="chart-container">
                  <svg width={chartWidth} height={barChartHeight} className="bar-chart">
                    {analyticsData.approvalVsRejection.map((item, i) => {
                      const barWidth = (chartWidth - 100) / analyticsData.approvalVsRejection.length;
                      const approvedHeight = (item.approved / maxBarValue) * (barChartHeight - 80);
                      const rejectedHeight = (item.rejected / maxBarValue) * (barChartHeight - 80);
                      const x = 50 + i * barWidth;
                      const approvedX = x + (barWidth - 40) / 2;
                      const rejectedX = x + (barWidth - 40) / 2 + 20;
                      return (
                        <g key={i}>
                          <rect
                            x={approvedX}
                            y={barChartHeight - 40 - approvedHeight}
                            width="20"
                            height={approvedHeight}
                            fill="#FF6B35"
                            rx="2"
                          />
                          <rect
                            x={rejectedX}
                            y={barChartHeight - 40 - rejectedHeight}
                            width="20"
                            height={rejectedHeight}
                            fill="#666666"
                            rx="2"
                          />
                          <text
                            x={x + barWidth / 2}
                            y={barChartHeight - 25}
                            textAnchor="middle"
                            fontSize="11"
                            fill="#666666"
                          >
                            {item.month}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
                <div className="chart-legend">
                  <span className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#FF6B35' }}></span>
                    Approved
                  </span>
                  <span className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: '#666666' }}></span>
                    Rejected
                  </span>
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="insights-section">
              <h2 className="insights-title">Key Insights</h2>
              <div className="insights-grid">
                <div className="insight-card">
                  <h4 className="insight-card-title">Most Common Reason</h4>
                  <p className="insight-card-text">
                    "Wrong Size" accounts for 35% of all returns. Consider adding a size guide to product pages.
                  </p>
                </div>
                <div className="insight-card">
                  <h4 className="insight-card-title">High Approval Rate</h4>
                  <p className="insight-card-text">
                    {analyticsData.metrics.approvalRate}% approval rate indicates good quality control and fair return policies.
                  </p>
                </div>
                <div className="insight-card">
                  <h4 className="insight-card-title">Processing Improvement</h4>
                  <p className="insight-card-text">
                    Average refund time has lowered by {Math.abs(analyticsData.metrics.changes.avgProcessingTime)} days this month. Focus on efficiency.
                  </p>
                </div>
                <div className="insight-card">
                  <h4 className="insight-card-title">Refund Preference</h4>
                  <p className="insight-card-text">
                    {analyticsData.resolutionMethods[0]?.value || 70}% of customers prefer refunds over exchanges. Consider promoting store credit with incentives.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </Layout>
  )
}

export default Analytics

