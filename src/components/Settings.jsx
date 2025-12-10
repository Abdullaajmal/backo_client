import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../services/api'
import { tokenService } from '../services/api'
import JSZip from 'jszip'
import './Settings.css'

function Settings() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState({
    returnWindow: 30,
    automaticApprovalThreshold: 50,
    refundMethods: {
      bankTransfer: true,
      digitalWallets: true,
      storeCredit: true
    },
    primaryColor: '#FF9724',
    storeLogo: null
  })
  const [integrations, setIntegrations] = useState({
    shopify: {
      connected: false,
      shopDomain: '',
    },
    wooCommerce: {
      connected: false,
      storeUrl: '',
    }
  })
  const [shopifyForm, setShopifyForm] = useState({
    shopDomain: '',
    accessToken: '',
    apiKey: '',
    apiSecretKey: '',
  })
  const [shopifyConnecting, setShopifyConnecting] = useState(false)
  const [shopifySyncing, setShopifySyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)
  const [shopifyConnected, setShopifyConnected] = useState(false)
  const [wooCommerceForm, setWooCommerceForm] = useState({
    storeUrl: '',
    consumerKey: '',
    consumerSecret: '',
  })
  const [wooCommerceConnecting, setWooCommerceConnecting] = useState(false)
  const [wooCommerceError, setWooCommerceError] = useState('')
  const [wooCommerceSyncing, setWooCommerceSyncing] = useState(false)
  const [wooCommerceSyncResult, setWooCommerceSyncResult] = useState(null)
  const [wooCommerceConnectionMethod, setWooCommerceConnectionMethod] = useState('portal') // 'portal' or 'api'
  const [wooCommerceSecretKey, setWooCommerceSecretKey] = useState('')
  const [wooCommerceConnected, setWooCommerceConnected] = useState(false)
  const [couriers, setCouriers] = useState({
    tcs: { connected: true },
    leopard: { connected: true }
  })
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeMenu, setActiveMenu] = useState('Settings')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [storeInfo, setStoreInfo] = useState({ storeName: '', storeUrl: '' })
  const fileInputRef = useRef(null)

  useEffect(() => {
    fetchSettings()
    fetchStoreInfo()
    fetchShopifyStatus()
    fetchWooCommerceStatus()
  }, [])

  const fetchShopifyStatus = async () => {
    try {
      const response = await api.getShopifyStatus()
      if (response.data) {
        const isConnected = response.data.isConnected || false
        setIntegrations(prev => ({
          ...prev,
          shopify: {
            connected: isConnected,
            shopDomain: response.data.shopDomain || '',
          }
        }))
        setShopifyConnected(isConnected)
      }
    } catch (err) {
      console.error('Failed to fetch Shopify status:', err)
      setIntegrations(prev => ({
        ...prev,
        shopify: {
          connected: false,
          shopDomain: '',
        }
      }))
      setShopifyConnected(false)
    }
  }

  const fetchWooCommerceStatus = async () => {
    try {
      const response = await api.getWooCommerceStatus()
      if (response.data) {
        const isConnected = response.data.isConnected || false
        setIntegrations(prev => ({
          ...prev,
          wooCommerce: {
            connected: isConnected,
            storeUrl: response.data.storeUrl || '',
          }
        }))
        setWooCommerceConnected(isConnected)
        // Set secret key if available
        if (response.data.secretKey) {
          setWooCommerceSecretKey(response.data.secretKey)
        }
      }
    } catch (err) {
      console.error('Failed to fetch WooCommerce status:', err)
      setIntegrations(prev => ({
        ...prev,
        wooCommerce: {
          connected: false,
          storeUrl: '',
        }
      }))
      setWooCommerceConnected(false)
    }
  }

  const handleWooCommercePortalConnect = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setWooCommerceConnecting(true)
    setWooCommerceError('')
    
    // Validation
    if (!wooCommerceForm.storeUrl || !wooCommerceForm.storeUrl.trim()) {
      setWooCommerceError('Store URL is required')
      alert('Please enter your WooCommerce store URL')
      setWooCommerceConnecting(false)
      return
    }
    
    // Validate URL format
    if (!validateWooCommerceUrl(wooCommerceForm.storeUrl)) {
      setWooCommerceError('Invalid store URL format')
      alert('Please enter a valid store URL.\n\nExamples:\n- https://yourstore.com\n- yourstore.com\n- https://www.yourstore.com\n\nMake sure the URL is complete and includes the domain extension (.com, .net, etc.)')
      setWooCommerceConnecting(false)
      return
    }
    
    // Consumer Key/Secret required for direct WooCommerce API access
    if (!wooCommerceForm.consumerKey || !wooCommerceForm.consumerKey.trim()) {
      setWooCommerceError('Consumer Key is required')
      alert('Please enter your WooCommerce Consumer Key to fetch data directly from WooCommerce API')
      setWooCommerceConnecting(false)
      return
    }
    
    if (!wooCommerceForm.consumerSecret || !wooCommerceForm.consumerSecret.trim()) {
      setWooCommerceError('Consumer Secret is required')
      alert('Please enter your WooCommerce Consumer Secret to fetch data directly from WooCommerce API')
      setWooCommerceConnecting(false)
      return
    }
    
    const storeUrl = (wooCommerceForm.storeUrl || '').trim()
    const consumerKey = (wooCommerceForm.consumerKey || '').trim()
    const consumerSecret = (wooCommerceForm.consumerSecret || '').trim()
    
    try {
      const response = await api.connectWooCommercePortal(storeUrl, consumerKey, consumerSecret)
      
      if (response.success) {
        // Update integration status immediately
        const connectedStoreUrl = response.data.wooCommerce?.storeUrl || storeUrl
        const secretKey = response.data.wooCommerce?.secretKey || ''
        
        setIntegrations(prev => ({
          ...prev,
          wooCommerce: {
            connected: true,
            storeUrl: connectedStoreUrl,
          },
          // Disconnect Shopify
          shopify: {
            connected: false,
            shopDomain: '',
          }
        }))
        setWooCommerceSecretKey(secretKey)
        setWooCommerceConnected(true)
        // Disconnect Shopify state
        setShopifyConnected(false)
        setShopifyForm({ shopDomain: '', accessToken: '', apiKey: '', apiSecretKey: '' })
        // Keep storeUrl for display, clear other fields
        setWooCommerceForm({ 
          storeUrl: connectedStoreUrl, 
          consumerKey: '', 
          consumerSecret: '' 
        })
        setWooCommerceError('')
        alert('✅ WooCommerce store connected successfully! Shopify disconnected.\n\nData will be fetched directly from WooCommerce API.')
        // Refresh status from backend
        await fetchWooCommerceStatus()
        await fetchShopifyStatus()
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect WooCommerce store'
      setWooCommerceError(errorMessage)
      
      // Show detailed error message
      let errorDetails = errorMessage;
      
      // If it's a network error, show backend connection help
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        errorDetails = errorMessage;
      } else if (errorMessage.includes('\n')) {
        // Already has detailed message
        errorDetails = errorMessage;
      } else {
        // Add troubleshooting steps
        errorDetails = `Error: ${errorMessage}\n\nPlease check:\n1. Store URL is correct and complete (e.g., https://yourstore.com)\n2. Your internet connection\n3. Backend server is running`;
      }
      
      alert(errorDetails)
      console.error('WooCommerce portal connection error:', err)
    } finally {
      setWooCommerceConnecting(false)
    }
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen)
  }

  const closeSidebar = () => {
    setIsSidebarOpen(false)
  }

  const fetchSettings = async () => {
    try {
      const response = await api.getSettings()
      if (response.data) {
        setSettings({
          returnWindow: response.data.returnWindow || 30,
          automaticApprovalThreshold: response.data.automaticApprovalThreshold || 50,
          refundMethods: response.data.refundMethods || settings.refundMethods,
          primaryColor: response.data.primaryColor || '#FF9724',
          storeLogo: response.data.storeLogo
        })
      }
    } catch (err) {
      console.error('Failed to fetch settings:', err)
    }
  }

  const fetchStoreInfo = async () => {
    try {
      const response = await api.getStore()
      if (response.data) {
        setStoreInfo({
          storeName: response.data.storeName || '',
          storeUrl: response.data.storeUrl || ''
        })
      }
    } catch (err) {
      console.error('Failed to fetch store info:', err)
    }
  }

  const getReturnPortalUrl = () => {
    if (!storeInfo.storeUrl) return ''
    // Extract domain from storeUrl (remove https://, http://, www.)
    const cleanedUrl = storeInfo.storeUrl.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '')
    return `${window.location.origin}/return/${cleanedUrl}`
  }

  const handleCopyUrl = () => {
    const url = getReturnPortalUrl()
    if (url) {
      navigator.clipboard.writeText(url)
      alert('Return Portal URL copied to clipboard!')
    }
  }

  const handleOpenPortal = () => {
    const url = getReturnPortalUrl()
    if (url) {
      window.open(url, '_blank')
    }
  }

  const handleLogout = () => {
    tokenService.removeToken()
    navigate('/login')
  }

  const handleMenuClick = (menu) => {
    setActiveMenu(menu)
    if (menu === 'Home') {
      navigate('/dashboard')
    } else if (menu === 'Orders') {
      navigate('/orders')
    } else if (menu === 'Returns') {
      navigate('/returns')
    } else if (menu === 'Customers') {
      navigate('/customers')
    } else if (menu === 'Analytics') {
      navigate('/analytics')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)

    try {
      await api.updateSettings({
        returnWindow: settings.returnWindow,
        automaticApprovalThreshold: settings.automaticApprovalThreshold,
        refundMethods: settings.refundMethods,
        primaryColor: settings.primaryColor,
        storeLogo: settings.storeLogo
      })
      alert('Settings saved successfully!')
    } catch (err) {
      alert('Failed to save settings: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    fetchSettings()
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setSettings({ ...settings, storeLogo: file })
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }
      setSettings({ ...settings, storeLogo: file })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const toggleRefundMethod = (method) => {
    setSettings({
      ...settings,
      refundMethods: {
        ...settings.refundMethods,
        [method]: !settings.refundMethods[method]
      }
    })
  }

  const handleShopifyConnect = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setShopifyConnecting(true)
    setError('')
    
    // Validation
    if (!shopifyForm.shopDomain || !shopifyForm.shopDomain.trim()) {
      setError('Shop domain is required')
      alert('Please enter your shop domain')
      setShopifyConnecting(false)
      return
    }
    
    if (!shopifyForm.accessToken || !shopifyForm.accessToken.trim()) {
      setError('Access token is required')
      alert('Please enter your Admin API Access Token')
      setShopifyConnecting(false)
      return
    }
    
    const shopDomain = (shopifyForm.shopDomain || '').trim()
    const accessToken = (shopifyForm.accessToken || '').trim()
    
    try {
      const response = await api.connectShopify(
        shopDomain,
        accessToken,
        shopifyForm.apiKey?.trim() || undefined,
        shopifyForm.apiSecretKey?.trim() || undefined
      )
      
      if (response.success) {
        // Update integration status immediately
        const connectedShopDomain = response.data.shopify?.shopDomain || shopDomain
        setIntegrations(prev => ({
          ...prev,
          shopify: {
            connected: true,
            shopDomain: connectedShopDomain,
          },
          // Disconnect WooCommerce
          wooCommerce: {
            connected: false,
            storeUrl: '',
          }
        }))
        setShopifyConnected(true)
        // Disconnect WooCommerce state
        setWooCommerceConnected(false)
        setWooCommerceSecretKey('')
        setWooCommerceForm({ storeUrl: '', consumerKey: '', consumerSecret: '' })
        // Keep shopDomain for display, clear sensitive fields
        setShopifyForm({ 
          shopDomain: connectedShopDomain, 
          accessToken: '', 
          apiKey: '', 
          apiSecretKey: '' 
        })
        setError('')
        alert('✅ Shopify store connected successfully! WooCommerce disconnected.')
        // Refresh status from backend
        await fetchShopifyStatus()
        await fetchWooCommerceStatus()
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect Shopify store'
      setError(errorMessage)
      alert(`Error: ${errorMessage}\n\nPlease check:\n1. Shop domain is correct (e.g., mystore.myshopify.com)\n2. Access token is valid\n3. Your internet connection`)
      console.error('Shopify connection error:', err)
      // Don't update state on error
    } finally {
      setShopifyConnecting(false)
    }
  }

  const handleSyncOrders = async () => {
    setShopifySyncing(true)
    setSyncResult(null)
    
    try {
      const response = await api.syncShopifyOrders()
      if (response.success) {
        setSyncResult({
          success: true,
          synced: response.data.synced,
          updated: response.data.updated,
          total: response.data.totalShopifyOrders,
        })
        alert(`Orders synced successfully! ${response.data.synced} new orders, ${response.data.updated} updated.`)
      }
    } catch (err) {
      setSyncResult({ success: false, error: err.message })
      alert(err.message || 'Failed to sync orders')
    } finally {
      setShopifySyncing(false)
    }
  }

  const handleShopifyDisconnect = async () => {
    if (confirm('Kya aap Shopify ko disconnect karna chahte hain? Products aur orders ab show nahi honge.')) {
      try {
        // Call backend to disconnect Shopify
        await api.disconnectShopify()
        
        // Update local state
        setIntegrations(prev => ({
          ...prev,
          shopify: { connected: false, shopDomain: '' }
        }))
        setShopifyConnected(false)
        setShopifyForm({
          shopDomain: '',
          accessToken: '',
          apiKey: '',
          apiSecretKey: '',
        })
        
        // Trigger products update event to clear products from UI
        window.dispatchEvent(new Event('productsUpdated'))
        
        alert('✅ Shopify successfully disconnect ho gaya!')
      } catch (error) {
        console.error('Error disconnecting Shopify:', error)
        alert('❌ Shopify disconnect karne mein error: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const validateWooCommerceUrl = (url) => {
    if (!url || !url.trim()) return false;
    const trimmed = url.trim();
    
    // Check if it looks like a valid domain
    // Should have at least one dot and valid characters
    const domainPattern = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;
    const urlPattern = /^https?:\/\/([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}/;
    
    // Remove protocol for domain check
    const domain = trimmed.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
    
    return domainPattern.test(domain) || urlPattern.test(trimmed);
  }

  const handleWooCommerceConnect = async (e) => {
    if (e && e.preventDefault) {
      e.preventDefault()
    }
    setWooCommerceConnecting(true)
    setWooCommerceError('')
    
    // Validation
    if (!wooCommerceForm.storeUrl || !wooCommerceForm.storeUrl.trim()) {
      setWooCommerceError('Store URL is required')
      alert('Please enter your WooCommerce store URL')
      setWooCommerceConnecting(false)
      return
    }
    
    // Validate URL format
    if (!validateWooCommerceUrl(wooCommerceForm.storeUrl)) {
      setWooCommerceError('Invalid store URL format')
      alert('Please enter a valid store URL.\n\nExamples:\n- https://yourstore.com\n- yourstore.com\n- https://www.yourstore.com\n\nMake sure the URL is complete and includes the domain extension (.com, .net, etc.)')
      setWooCommerceConnecting(false)
      return
    }
    
    if (!wooCommerceForm.consumerKey || !wooCommerceForm.consumerKey.trim()) {
      setWooCommerceError('Consumer Key is required')
      alert('Please enter your WooCommerce Consumer Key')
      setWooCommerceConnecting(false)
      return
    }
    
    if (!wooCommerceForm.consumerSecret || !wooCommerceForm.consumerSecret.trim()) {
      setWooCommerceError('Consumer Secret is required')
      alert('Please enter your WooCommerce Consumer Secret')
      setWooCommerceConnecting(false)
      return
    }
    
    const storeUrl = (wooCommerceForm.storeUrl || '').trim()
    const consumerKey = (wooCommerceForm.consumerKey || '').trim()
    const consumerSecret = (wooCommerceForm.consumerSecret || '').trim()
    
    try {
      const response = await api.connectWooCommerce(storeUrl, consumerKey, consumerSecret)
      
      if (response.success) {
        // Update integration status immediately
        const connectedStoreUrl = response.data.wooCommerce?.storeUrl || storeUrl
        setIntegrations(prev => ({
          ...prev,
          wooCommerce: {
            connected: true,
            storeUrl: connectedStoreUrl,
          },
          // Disconnect Shopify
          shopify: {
            connected: false,
            shopDomain: '',
          }
        }))
        setWooCommerceConnected(true)
        // Disconnect Shopify state
        setShopifyConnected(false)
        setShopifyForm({ shopDomain: '', accessToken: '', apiKey: '', apiSecretKey: '' })
        // Keep storeUrl for display, clear sensitive fields
        setWooCommerceForm({ 
          storeUrl: connectedStoreUrl, 
          consumerKey: '', 
          consumerSecret: '' 
        })
        setWooCommerceError('')
        alert('✅ WooCommerce store connected successfully! Shopify disconnected.')
        // Refresh status from backend
        await fetchWooCommerceStatus()
        await fetchShopifyStatus()
      }
    } catch (err) {
      const errorMessage = err.message || 'Failed to connect WooCommerce store'
      setWooCommerceError(errorMessage)
      
      // Show detailed error message
      let errorDetails = errorMessage;
      
      // If it's a network error, show backend connection help
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        errorDetails = errorMessage;
      } else if (errorMessage.includes('\n')) {
        // Already has detailed message
        errorDetails = errorMessage;
      } else {
        // Add troubleshooting steps
        errorDetails = `Error: ${errorMessage}\n\nPlease check:\n1. Store URL is correct and complete (e.g., https://yourstore.com)\n2. Consumer Key and Secret are valid\n3. WooCommerce plugin is installed and activated\n4. REST API is enabled in WooCommerce settings\n5. Permalinks are set (not "Plain")\n6. Your internet connection\n7. Backend server is running`;
      }
      
      alert(errorDetails)
      console.error('WooCommerce connection error:', err)
    } finally {
      setWooCommerceConnecting(false)
    }
  }

  const handleWooCommerceDisconnect = async () => {
    if (confirm('Kya aap WooCommerce ko disconnect karna chahte hain? Products aur orders ab show nahi honge.')) {
      try {
        // Call backend to disconnect WooCommerce
        await api.disconnectWooCommerce()
        
        // Update local state
        setIntegrations(prev => ({
          ...prev,
          wooCommerce: { connected: false, storeUrl: '' }
        }))
        setWooCommerceConnected(false)
        setWooCommerceSecretKey('')
        setWooCommerceForm({ storeUrl: '', consumerKey: '', consumerSecret: '' })
        
        // Trigger products update event to clear products from UI
        window.dispatchEvent(new Event('productsUpdated'))
        
        alert('✅ WooCommerce successfully disconnect ho gaya!')
      } catch (error) {
        console.error('Error disconnecting WooCommerce:', error)
        alert('❌ WooCommerce disconnect karne mein error: ' + (error.message || 'Unknown error'))
      }
    }
  }

  const handleSyncWooCommerceOrders = async () => {
    setWooCommerceSyncing(true)
    setWooCommerceSyncResult(null)
    
    try {
      const response = await api.syncShopifyOrders() // Same endpoint works for both
      if (response.success) {
        setWooCommerceSyncResult({
          success: true,
          synced: response.data.synced,
          updated: response.data.updated,
          total: response.data.totalWooCommerceOrders || response.data.totalShopifyOrders,
        })
        alert(`Orders synced successfully! ${response.data.synced} new orders, ${response.data.updated} updated.`)
      }
    } catch (err) {
      setWooCommerceSyncResult({ success: false, error: err.message })
      alert(err.message || 'Failed to sync orders')
    } finally {
      setWooCommerceSyncing(false)
    }
  }

  const handleDownloadPlugin = async () => {
    try {
      // Check if WooCommerce is connected
      if (!wooCommerceConnected && !integrations.wooCommerce?.connected) {
        alert('⚠️ Pehle WooCommerce store connect karo!')
        return
      }
      
      // Get current secret key from backend
      try {
        const statusResponse = await api.getWooCommerceStatus()
        if (statusResponse.success && statusResponse.data.secretKey) {
          setWooCommerceSecretKey(statusResponse.data.secretKey)
        }
      } catch (err) {
        console.log('Could not fetch secret key, using stored value')
      }
      
      // Get secret key and portal URL for plugin
      const secretKey = wooCommerceSecretKey || integrations.wooCommerce?.secretKey || 'YOUR_SECRET_KEY_HERE'
      
      // Get backend API URL (not frontend URL)
      // In development: use backend port 5000
      // In production: use backend URL from env or default
      let portalUrl = window.location.origin
      if (window.location.origin.includes('localhost:5173') || window.location.origin.includes('localhost:3000')) {
        // Development: use backend port
        portalUrl = 'http://localhost:5000'
      } else if (import.meta.env.VITE_API_URL) {
        // Use API URL from env (remove /api suffix if present)
        portalUrl = import.meta.env.VITE_API_URL.replace('/api', '')
      } else if (import.meta.env.PROD) {
        // Production: use backend URL
        portalUrl = 'https://backo-server.vercel.app'
      }
      
      const apiUrl = portalUrl.replace(/\/$/, '') + '/api' // API base URL
      
      if (secretKey === 'YOUR_SECRET_KEY_HERE') {
        alert('⚠️ Secret key nahi mili. Pehle WooCommerce store connect karo aur secret key generate karo.')
        return
      }
      
      // Create ZIP file
      const zip = new JSZip()
      const pluginFolder = zip.folder('backo-return-management')
      
      // Create main plugin file
      const pluginContent = `<?php
/**
 * Plugin Name: BACKO Return Management
 * Plugin URI: ${portalUrl}
 * Description: Connect your WooCommerce store with BACKO portal for return management. Sync orders, products, and customers automatically.
 * Version: 1.0.0
 * Author: BACKO
 * Author URI: ${portalUrl}
 * Text Domain: backo-return-management
 * Domain Path: /languages
 * Requires at least: 5.0
 * Requires PHP: 7.2
 * WC requires at least: 3.0
 * WC tested up to: 8.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit; // Exit if accessed directly
}

// Define constants
if (!defined('BACKO_PLUGIN_VERSION')) {
    define('BACKO_PLUGIN_VERSION', '1.0.0');
}
if (!defined('BACKO_PLUGIN_DIR')) {
    define('BACKO_PLUGIN_DIR', plugin_dir_path(__FILE__));
}
if (!defined('BACKO_PLUGIN_URL')) {
    define('BACKO_PLUGIN_URL', plugin_dir_url(__FILE__));
}

// Plugin initialization
add_action('plugins_loaded', 'backo_return_management_init', 20);

function backo_return_management_init() {
    // Check if WooCommerce is active
    if (!class_exists('WooCommerce')) {
        add_action('admin_notices', 'backo_woocommerce_missing_notice');
        return;
    }
    
    // Initialize plugin only if WooCommerce is active
    add_action('admin_menu', 'backo_add_admin_menu');
    add_action('admin_init', 'backo_register_settings');
    add_action('admin_init', 'backo_handle_sync_actions');
    add_action('admin_enqueue_scripts', 'backo_admin_scripts');
    
    // Sync hooks - only if auto sync is enabled (with priority to avoid conflicts)
    add_action('woocommerce_new_order', 'backo_sync_new_order', 99, 1);
    add_action('woocommerce_update_order', 'backo_sync_order_update', 99, 1);
    add_action('woocommerce_new_product', 'backo_sync_product_save', 99, 1);
    add_action('woocommerce_update_product', 'backo_sync_product_save', 99, 1);
    add_action('woocommerce_product_set_stock', 'backo_sync_product_update', 99, 1);
}

function backo_woocommerce_missing_notice() {
    ?>
    <div class="notice notice-error">
        <p><strong>BACKO Return Management:</strong> <?php _e('WooCommerce plugin is required. Please install and activate WooCommerce.', 'backo-return-management'); ?></p>
    </div>
    <?php
}

function backo_add_admin_menu() {
    add_options_page(
        'BACKO Settings',
        'BACKO',
        'manage_options',
        'backo-settings',
        'backo_settings_page'
    );
}

function backo_register_settings() {
    // Register settings with sanitization callbacks
    register_setting('backo_settings', 'backo_portal_url', array(
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => ''
    ));
    register_setting('backo_settings', 'backo_secret_key', array(
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => ''
    ));
    register_setting('backo_settings', 'backo_store_domain', array(
        'type' => 'string',
        'sanitize_callback' => 'esc_url_raw',
        'default' => ''
    ));
    register_setting('backo_settings', 'backo_auto_sync', array(
        'type' => 'string',
        'sanitize_callback' => 'sanitize_text_field',
        'default' => '1'
    ));
}

function backo_admin_scripts($hook) {
    if ($hook !== 'settings_page_backo-settings') {
        return;
    }
    // Only enqueue if file exists (optional CSS file)
    if (file_exists(BACKO_PLUGIN_DIR . 'admin.css')) {
        wp_enqueue_style('backo-admin-style', BACKO_PLUGIN_URL . 'admin.css', array(), BACKO_PLUGIN_VERSION);
    }
}

// Handle manual sync actions
function backo_handle_sync_actions() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Check if sync action is requested
    if (isset($_GET['page']) && $_GET['page'] === 'backo-settings' && isset($_GET['action'])) {
        $action = sanitize_text_field($_GET['action']);
        
        if ($action === 'sync_orders') {
            backo_manual_sync_all_orders();
            wp_redirect(admin_url('options-general.php?page=backo-settings&synced=orders'));
            exit;
        } elseif ($action === 'sync_products') {
            backo_manual_sync_all_products();
            wp_redirect(admin_url('options-general.php?page=backo-settings&synced=products'));
            exit;
        }
    }
}

function backo_settings_page() {
    // Check user capabilities
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }
    
    // Handle form submission
    if (isset($_POST['backo_save_settings']) && check_admin_referer('backo_settings_nonce', 'backo_settings_nonce')) {
        // Settings are saved via options.php, but we can add custom handling here if needed
    }
    
    // Handle test connection
    $test_result = null;
    if (isset($_POST['backo_test_connection']) && check_admin_referer('backo_test_connection_nonce', 'backo_test_connection_nonce')) {
        $portal_url = get_option('backo_portal_url', '');
        $secret_key = get_option('backo_secret_key', '');
        $test_result = backo_test_connection($portal_url, $secret_key);
    }
    
    // Get current settings
    $portal_url = get_option('backo_portal_url', '${portalUrl}');
    $secret_key = get_option('backo_secret_key', '${secretKey}');
    $store_domain = get_option('backo_store_domain', home_url());
    $auto_sync = get_option('backo_auto_sync', '1');
    
    // Set default portal URL if not set or if it's frontend URL (backend API URL should be used)
    if (empty($portal_url) || $portal_url === '${portalUrl}' || strpos($portal_url, ':5173') !== false || strpos($portal_url, ':3000') !== false) {
        // Development: use localhost:5000, Production: use backend URL
        if (strpos(home_url(), 'localhost') !== false || strpos(home_url(), '127.0.0.1') !== false) {
            $portal_url = 'http://localhost:5000';
        } else {
            $portal_url = 'https://backo-server.vercel.app';
        }
    }
    
    ?>
    <div class="wrap">
        <h1>BACKO Return Management Settings</h1>
        
        <?php if (isset($test_result)): ?>
            <div class="notice notice-<?php echo $test_result['success'] ? 'success' : 'error'; ?> is-dismissible">
                <p><?php echo esc_html($test_result['message']); ?></p>
            </div>
        <?php endif; ?>
        
        <form method="post" action="options.php">
            <?php 
            settings_fields('backo_settings');
            wp_nonce_field('backo_settings_nonce', 'backo_settings_nonce');
            do_settings_sections('backo_settings');
            ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="backo_portal_url">Portal URL</label>
                    </th>
                    <td>
                        <input type="url" 
                               id="backo_portal_url" 
                               name="backo_portal_url" 
                               value="<?php echo esc_attr($portal_url); ?>" 
                               class="regular-text" 
                               required />
                        <p class="description">
                            <strong>Backend API URL:</strong> Development mein: <code>http://localhost:5000</code><br>
                            Production mein: <code>https://backo-server.vercel.app</code><br>
                            ⚠️ Frontend URL (localhost:5173) nahi, backend URL (localhost:5000) use karo!
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="backo_secret_key">Secret Key</label>
                    </th>
                    <td>
                        <input type="text" 
                               id="backo_secret_key" 
                               name="backo_secret_key" 
                               value="<?php echo esc_attr($secret_key); ?>" 
                               class="regular-text code" 
                               required />
                        <p class="description">Secret key generated from your BACKO portal. Copy it from the portal settings page.</p>
                        <?php if (empty($secret_key) || $secret_key === 'YOUR_SECRET_KEY_HERE'): ?>
                            <p class="description" style="color: #d63638;">
                                <strong>⚠️ Important:</strong> Please enter your secret key from the BACKO portal.
                            </p>
                        <?php endif; ?>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="backo_store_domain">Store Domain</label>
                    </th>
                    <td>
                        <input type="text" 
                               id="backo_store_domain" 
                               name="backo_store_domain" 
                               value="<?php echo esc_attr($store_domain); ?>" 
                               class="regular-text" 
                               required />
                        <p class="description">Your store domain name (e.g., <?php echo esc_html(parse_url(home_url(), PHP_URL_HOST)); ?>)</p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">
                        <label for="backo_auto_sync">Auto Sync</label>
                    </th>
                    <td>
                        <label>
                            <input type="checkbox" 
                                   id="backo_auto_sync" 
                                   name="backo_auto_sync" 
                                   value="1" 
                                   <?php checked($auto_sync, '1'); ?> />
                            Automatically sync orders and products to BACKO portal
                        </label>
                        <p class="description">When enabled, new orders and product updates will be automatically synced to your BACKO portal.</p>
                    </td>
                </tr>
            </table>
            
            <?php submit_button('Save Settings'); ?>
        </form>
        
        <hr>
        
        <h2>Connection Test</h2>
        <form method="post">
            <?php wp_nonce_field('backo_test_connection_nonce', 'backo_test_connection_nonce'); ?>
            <input type="hidden" name="backo_test_connection" value="1" />
            <p>
                <button type="submit" class="button button-secondary">
                    Test Connection to BACKO Portal
                </button>
            </p>
        </form>
        
        <hr>
        
        <h2>Manual Sync</h2>
        <p>
            <button type="button" class="button button-secondary" onclick="backoManualSync()">
                Sync Orders Now
            </button>
            <button type="button" class="button button-secondary" onclick="backoManualSyncProducts()">
                Sync Products Now
            </button>
        </p>
        
        <script>
        function backoManualSync() {
            if (confirm('This will sync all orders to BACKO portal. Continue?')) {
                window.location.href = '<?php echo admin_url('admin.php?page=backo-settings&action=sync_orders'); ?>';
            }
        }
        function backoManualSyncProducts() {
            if (confirm('This will sync all products to BACKO portal. Continue?')) {
                window.location.href = '<?php echo admin_url('admin.php?page=backo-settings&action=sync_products'); ?>';
            }
        }
        </script>
    </div>
    <?php
}

function backo_test_connection($portal_url, $secret_key) {
    if (empty($portal_url) || empty($secret_key)) {
        return array(
            'success' => false,
            'message' => 'Please enter Portal URL and Secret Key first.'
        );
    }
    
    // Validate and fix portal URL
    $portal_url = trim($portal_url);
    
    // Remove trailing slash
    $portal_url = rtrim($portal_url, '/');
    
    // Check if it's frontend URL and convert to backend
    if (strpos($portal_url, ':5173') !== false || strpos($portal_url, ':3000') !== false) {
        // Replace frontend port with backend port
        $portal_url = preg_replace('/:\d{4}$/', ':5000', $portal_url);
    }
    
    // Ensure it's a valid URL
    if (!filter_var($portal_url, FILTER_VALIDATE_URL)) {
        return array(
            'success' => false,
            'message' => 'Invalid Portal URL format. Please use: http://localhost:5000 (for development)'
        );
    }
    
    $api_url = $portal_url . '/api/store/woocommerce/verify';
    
    // Log for debugging
    error_log('BACKO: Testing connection to: ' . $api_url);
    
    $response = wp_remote_post($api_url, array(
        'method' => 'POST',
        'timeout' => 30, // Increased timeout
        'sslverify' => false, // Disable SSL verification for localhost
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-Backo-Secret-Key' => sanitize_text_field($secret_key),
        ),
        'body' => wp_json_encode(array(
            'store_domain' => home_url(),
        )),
    ));
    
    if (is_wp_error($response)) {
        $error_message = $response->get_error_message();
        error_log('BACKO: Connection error: ' . $error_message);
        
        // Provide helpful error messages
        if (strpos($error_message, 'Failed to connect') !== false) {
            return array(
                'success' => false,
                'message' => 'Connection failed: Backend server is not running. Please start the backend server at ' . $portal_url . ' and try again.'
            );
        }
        
        return array(
            'success' => false,
            'message' => 'Connection failed: ' . $error_message
        );
    }
    
    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);
    
    if ($data && isset($data['success']) && $data['success']) {
        return array(
            'success' => true,
            'message' => '✅ Successfully connected to BACKO portal!'
        );
    } else {
        $error_msg = isset($data['message']) ? $data['message'] : 'Connection failed. Please check your settings.';
        return array(
            'success' => false,
            'message' => '❌ ' . $error_msg
        );
    }
}

// Sync new order to BACKO portal
function backo_sync_new_order($order_id) {
    // Check if auto sync is enabled
    if (get_option('backo_auto_sync') !== '1') {
        return;
    }
    
    // Prevent infinite loops
    if (wp_doing_ajax() || wp_doing_cron()) {
        return;
    }
    
    // Verify WooCommerce function exists
    if (!function_exists('wc_get_order')) {
        return;
    }
    
    // Verify order exists
    $order = wc_get_order($order_id);
    if (!$order || !is_a($order, 'WC_Order')) {
        return;
    }
    
    // Sync in background to avoid blocking
    wp_schedule_single_event(time() + 5, 'backo_sync_order_background', array($order_id));
}

// Sync order update to BACKO portal
function backo_sync_order_update($order_id) {
    // Check if auto sync is enabled
    if (get_option('backo_auto_sync') !== '1') {
        return;
    }
    
    // Prevent infinite loops
    if (wp_doing_ajax() || wp_doing_cron()) {
        return;
    }
    
    // Verify WooCommerce function exists
    if (!function_exists('wc_get_order')) {
        return;
    }
    
    // Verify order exists
    $order = wc_get_order($order_id);
    if (!$order || !is_a($order, 'WC_Order')) {
        return;
    }
    
    // Sync in background to avoid blocking
    wp_schedule_single_event(time() + 5, 'backo_sync_order_background', array($order_id));
}

// Background sync handler
add_action('backo_sync_order_background', 'backo_sync_order_background_handler', 10, 1);
function backo_sync_order_background_handler($order_id) {
    if (!function_exists('wc_get_order')) {
        return;
    }
    
    $order = wc_get_order($order_id);
    if ($order && is_a($order, 'WC_Order')) {
        backo_sync_order_to_portal($order);
    }
}

// Sync order to portal
function backo_sync_order_to_portal($order) {
    // Verify order object
    if (!$order || !is_a($order, 'WC_Order')) {
        return;
    }
    
    $portal_url = get_option('backo_portal_url');
    $secret_key = get_option('backo_secret_key');
    
    // Validate settings
    if (empty($portal_url) || empty($secret_key)) {
        error_log('BACKO: Portal URL or Secret Key not configured');
        return;
    }
    
    $api_url = rtrim(esc_url_raw($portal_url), '/') . '/api/orders/sync-from-plugin';
    
    // Prepare order data with proper sanitization
    $order_data = array(
        'order_id' => absint($order->get_id()),
        'order_number' => sanitize_text_field($order->get_order_number()),
        'status' => sanitize_text_field($order->get_status()),
        'total' => floatval($order->get_total()),
        'currency' => sanitize_text_field($order->get_currency()),
        'customer' => array(
            'name' => sanitize_text_field(trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name())),
            'email' => sanitize_email($order->get_billing_email()),
            'phone' => sanitize_text_field($order->get_billing_phone()),
        ),
        'items' => array(),
        'date_created' => $order->get_date_created() ? $order->get_date_created()->date('Y-m-d H:i:s') : current_time('mysql'),
    );
    
    // Get order items
    foreach ($order->get_items() as $item_id => $item) {
        if (!is_a($item, 'WC_Order_Item_Product')) {
            continue;
        }
        
        $order_data['items'][] = array(
            'product_id' => absint($item->get_product_id()),
            'name' => sanitize_text_field($item->get_name()),
            'quantity' => absint($item->get_quantity()),
            'price' => floatval($item->get_total()),
        );
    }
    
    // Send to portal
    $response = wp_remote_post($api_url, array(
        'method' => 'POST',
        'timeout' => 15,
        'sslverify' => false, // Disable SSL verification for localhost
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-Backo-Secret-Key' => sanitize_text_field($secret_key),
        ),
        'body' => wp_json_encode($order_data),
    ));
    
    // Log errors
    if (is_wp_error($response)) {
        error_log('BACKO: Order sync failed - ' . $response->get_error_message());
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $response_body = wp_remote_retrieve_body($response);
            error_log('BACKO: Order sync failed - HTTP ' . $response_code . ': ' . substr($response_body, 0, 200));
        }
    }
}

// Sync product to portal (for new/update hooks)
function backo_sync_product_save($product_id) {
    // Check if auto sync is enabled
    if (get_option('backo_auto_sync') !== '1') {
        return;
    }
    
    // Prevent infinite loops
    if (wp_doing_ajax() || wp_doing_cron()) {
        return;
    }
    
    // Get product object safely
    if (!function_exists('wc_get_product')) {
        return;
    }
    
    $product = wc_get_product($product_id);
    if (!$product || !is_a($product, 'WC_Product')) {
        return;
    }
    
    // Sync in background to avoid blocking
    wp_schedule_single_event(time() + 5, 'backo_sync_product_background', array($product_id));
}

// Sync product update to portal (for stock update hook)
function backo_sync_product_update($product) {
    // Check if auto sync is enabled
    if (get_option('backo_auto_sync') !== '1') {
        return;
    }
    
    // Prevent infinite loops
    if (wp_doing_ajax() || wp_doing_cron()) {
        return;
    }
    
    // Verify product object
    if (!$product || !is_a($product, 'WC_Product')) {
        return;
    }
    
    // Sync in background to avoid blocking
    wp_schedule_single_event(time() + 5, 'backo_sync_product_background', array($product->get_id()));
}

// Background product sync handler
add_action('backo_sync_product_background', 'backo_sync_product_background_handler', 10, 1);
function backo_sync_product_background_handler($product_id) {
    if (!function_exists('wc_get_product')) {
        return;
    }
    
    $product = wc_get_product($product_id);
    if ($product && is_a($product, 'WC_Product')) {
        backo_sync_product_to_portal($product);
    }
}

// Main function to sync product to portal
function backo_sync_product_to_portal($product) {
    // Verify product object
    if (!$product || !is_a($product, 'WC_Product')) {
        return;
    }
    
    $portal_url = get_option('backo_portal_url');
    $secret_key = get_option('backo_secret_key');
    
    // Validate settings
    if (empty($portal_url) || empty($secret_key)) {
        error_log('BACKO: Portal URL or Secret Key not configured');
        return;
    }
    
    $api_url = rtrim(esc_url_raw($portal_url), '/') . '/api/products/sync-from-plugin';
    
    // Get product images safely
    $images = array();
    if (method_exists($product, 'get_gallery_image_ids')) {
        $attachment_ids = $product->get_gallery_image_ids();
        if (method_exists($product, 'get_image_id') && $product->get_image_id()) {
            array_unshift($attachment_ids, $product->get_image_id());
        }
        foreach ($attachment_ids as $attachment_id) {
            $image_url = wp_get_attachment_image_url($attachment_id, 'full');
            if ($image_url) {
                $images[] = array(
                    'src' => esc_url_raw($image_url),
                    'alt' => get_post_meta($attachment_id, '_wp_attachment_image_alt', true) ?: $product->get_name()
                );
            }
        }
    }
    
    // Get product categories safely
    $categories = array();
    if (method_exists($product, 'get_category_ids')) {
        $term_ids = $product->get_category_ids();
        foreach ($term_ids as $term_id) {
            $term = get_term($term_id);
            if ($term && !is_wp_error($term)) {
                $categories[] = sanitize_text_field($term->name);
            }
        }
    }
    
    // Get product tags safely
    $tags = array();
    if (method_exists($product, 'get_tag_ids')) {
        $term_ids = $product->get_tag_ids();
        foreach ($term_ids as $term_id) {
            $term = get_term($term_id);
            if ($term && !is_wp_error($term)) {
                $tags[] = sanitize_text_field($term->name);
            }
        }
    }
    
    // Prepare product data with proper sanitization
    $product_data = array(
        'product_id' => absint($product->get_id()),
        'name' => sanitize_text_field($product->get_name()),
        'sku' => sanitize_text_field($product->get_sku()),
        'price' => floatval($product->get_price()),
        'stock_quantity' => absint($product->get_stock_quantity()),
        'status' => sanitize_text_field($product->get_status()),
        'description' => wp_kses_post($product->get_description()),
        'images' => $images,
        'categories' => $categories,
        'tags' => $tags,
    );
    
    // Send to portal
    $response = wp_remote_post($api_url, array(
        'method' => 'POST',
        'timeout' => 15,
        'sslverify' => false, // Disable SSL verification for localhost
        'headers' => array(
            'Content-Type' => 'application/json',
            'X-Backo-Secret-Key' => sanitize_text_field($secret_key),
        ),
        'body' => wp_json_encode($product_data),
    ));
    
    // Log errors
    if (is_wp_error($response)) {
        error_log('BACKO: Product sync failed - ' . $response->get_error_message());
    } else {
        $response_code = wp_remote_retrieve_response_code($response);
        if ($response_code !== 200) {
            $response_body = wp_remote_retrieve_body($response);
            error_log('BACKO: Product sync failed - HTTP ' . $response_code . ': ' . substr($response_body, 0, 200));
        }
    }
}

// Manual sync all orders
function backo_manual_sync_all_orders() {
    if (!function_exists('wc_get_orders')) {
        return;
    }
    
    $orders = wc_get_orders(array(
        'limit' => -1,
        'status' => 'any',
    ));
    
    foreach ($orders as $order) {
        if ($order && is_a($order, 'WC_Order')) {
            backo_sync_order_to_portal($order);
        }
    }
}

// Manual sync all products
function backo_manual_sync_all_products() {
    if (!function_exists('wc_get_products')) {
        return;
    }
    
    $products = wc_get_products(array(
        'limit' => -1,
        'status' => 'any',
    ));
    
    foreach ($products as $product) {
        if ($product && is_a($product, 'WC_Product')) {
            backo_sync_product_to_portal($product);
        }
    }
}
`
      
      // Add main plugin file to ZIP
      pluginFolder.file('backo-return-management.php', pluginContent)
      
      // Create README.txt with installation instructions
      const readmeContent = `=== BACKO Return Management ===
Contributors: BACKO
Tags: woocommerce, returns, order management
Requires at least: 5.0
Tested up to: 6.4
Requires PHP: 7.2
Stable tag: 1.0.0
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WooCommerce store with BACKO portal for return management.

== Description ==

BACKO Return Management plugin connects your WooCommerce store with the BACKO portal to automatically sync orders, products, and customers for seamless return management.

== Installation ==

1. Download the plugin ZIP file
2. Log in to your WordPress admin panel
3. Go to Plugins > Add New
4. Click "Upload Plugin" button
5. Choose the downloaded ZIP file and click "Install Now"
6. After installation, click "Activate Plugin"

== Configuration ==

After activation, follow these steps:

1. Go to Settings > BACKO in your WordPress admin panel
2. Enter your BACKO Portal URL: ${portalUrl}
3. Enter your Secret Key: ${secretKey}
   (This secret key is generated from your BACKO portal)
4. Enter your Store Domain (usually auto-filled)
5. Enable "Auto Sync" if you want automatic syncing
6. Click "Save Settings"
7. Click "Test Connection" to verify the connection

== Secret Key Location ==

IMPORTANT: Secret Key kahan lagana hai:

1. WordPress Admin Panel mein jao
2. Settings > BACKO par click karo
3. "Secret Key" field mein apna secret key paste karo
   Secret Key: ${secretKey}
4. "Save Settings" button par click karo

Ya phir directly plugin file mein:
- File: backo-return-management.php
- Line 677: $secret_key = get_option('backo_secret_key', '${secretKey}');
- Is line ko edit karke apna secret key directly bhi daal sakte ho

== Frequently Asked Questions ==

Q: Secret key kahan se milega?
A: Secret key BACKO portal se generate hota hai. Portal ke Settings page par secret key show hota hai.

Q: Plugin activate nahi ho raha?
A: Make sure WooCommerce plugin installed aur activated hai.

Q: Connection test fail ho raha hai?
A: Check karo:
   - Portal URL sahi hai ya nahi
   - Secret key sahi paste kiya hai ya nahi
   - Internet connection active hai ya nahi

== Changelog ==

= 1.0.0 =
* Initial release
* WooCommerce integration
* Automatic order and product syncing
* Portal connection with secret key authentication

== Support ==

For support, visit: ${portalUrl}
`
      
      // Add README.txt to ZIP
      pluginFolder.file('readme.txt', readmeContent)
      
      // Create INSTALLATION.txt with detailed instructions in Roman Urdu
      const installationContent = `==========================================
BACKO PLUGIN INSTALLATION GUIDE
==========================================

YEH PLUGIN ZIP FILE HAI JO AAP WORDPRESS MEIN UPLOAD KAR SAKTE HAIN.

==========================================
STEP 1: PLUGIN UPLOAD KARNA
==========================================

1. WordPress Admin Panel mein login karo
   (Usually: https://yourdomain.com/wp-admin)

2. Left sidebar mein "Plugins" par click karo

3. "Add New" button par click karo

4. Top par "Upload Plugin" button par click karo

5. "Choose File" button par click karo aur downloaded ZIP file select karo
   File name: backo-return-management.zip

6. "Install Now" button par click karo

7. Installation complete hone ke baad "Activate Plugin" button par click karo

==========================================
STEP 2: PLUGIN CONFIGURE KARNA
==========================================

1. WordPress Admin Panel mein "Settings" menu par jao

2. "BACKO" option par click karo
   (Ya phir: Settings > BACKO)

3. Ab aapko 3 fields fill karni hain:

   a) PORTAL URL:
      ${portalUrl}
      (Ye backend API URL hai, frontend URL nahi. Development mein: http://localhost:5000)

   b) SECRET KEY (YEH BOHOT IMPORTANT HAI):
      ${secretKey}
      
      ⚠️ IMPORTANT: Ye secret key BACKO portal se generate hua hai.
      Isko sahi se copy karke paste karo. Koi space ya extra character nahi hona chahiye.

   c) STORE DOMAIN:
      Ye automatically fill ho jayega, verify karo

4. "Auto Sync" checkbox enable karo (agar automatic syncing chahiye)

5. "Save Settings" button par click karo

==========================================
STEP 3: CONNECTION TEST KARNA
==========================================

1. Settings page par hi "Test Connection to BACKO Portal" button par click karo

2. Agar success message aaye to connection sahi hai

3. Agar error aaye to:
   - Portal URL check karo
   - Secret key sahi paste kiya hai ya nahi check karo
   - Internet connection verify karo

==========================================
SECRET KEY KAISE LAGANA HAI
==========================================

METHOD 1: WordPress Admin Panel Se (RECOMMENDED)

1. Settings > BACKO par jao
2. "Secret Key" field mein ye key paste karo:
   ${secretKey}
3. "Save Settings" click karo

METHOD 2: Direct Plugin File Edit (Advanced Users)

1. WordPress file manager ya FTP se plugin folder mein jao:
   wp-content/plugins/backo-return-management/

2. backo-return-management.php file open karo

3. Line 677 par jao:
   $secret_key = get_option('backo_secret_key', '${secretKey}');

4. Is line ko edit karke apna secret key directly daal do:
   $secret_key = get_option('backo_secret_key', '${secretKey}');

5. File save karo

==========================================
TROUBLESHOOTING
==========================================

Problem: Plugin activate nahi ho raha
Solution: 
- WooCommerce plugin installed hai ya nahi check karo
- WordPress version 5.0+ hai ya nahi verify karo
- PHP version 7.2+ hai ya nahi check karo

Problem: Connection test fail ho raha hai
Solution:
- Portal URL sahi hai ya nahi verify karo
- Secret key bilkul sahi paste kiya hai ya nahi check karo
- Internet connection active hai ya nahi verify karo
- Firewall ya security plugin connection block to nahi kar raha

Problem: Orders sync nahi ho rahe
Solution:
- Auto Sync enabled hai ya nahi check karo
- Settings page par "Sync Orders Now" button manually try karo
- WordPress error logs check karo

==========================================
SUPPORT
==========================================

Agar koi problem ho to:
- Portal URL: ${portalUrl}
- Check WordPress error logs
- Contact BACKO support

==========================================
`
      
      // Add INSTALLATION.txt to ZIP
      pluginFolder.file('INSTALLATION.txt', installationContent)
      
      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: 'blob' })
      
      // Download ZIP file
      const url = window.URL.createObjectURL(zipBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'backo-return-management.zip'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      // Show success message
      alert(`✅ Plugin ZIP file download ho gaya!\n\n📦 File name: backo-return-management.zip\n\n📝 IMPORTANT:\n✅ Plugin ek baar download karo - phir dobara download ki zarurat nahi hai!\n✅ Agar secret key change ho to:\n   1. WordPress Admin > Settings > BACKO par jao\n   2. Secret Key field mein naya key paste karo:\n      ${secretKey}\n   3. Save Settings click karo\n\n📝 Installation (Pehli baar):\n1. WordPress Admin > Plugins > Add New > Upload Plugin\n2. ZIP file upload karo\n3. Activate karo\n4. Settings > BACKO mein secret key paste karo:\n   ${secretKey}`)
    } catch (error) {
      console.error('Plugin download error:', error)
      alert('❌ Plugin download mein error aaya. Please try again.')
    }
  }

  const handleIntegrationToggle = (platform) => {
    if (platform === 'shopify') {
      handleShopifyDisconnect()
    } else if (platform === 'wooCommerce') {
      handleWooCommerceDisconnect()
    }
  }

  const handleCourierToggle = (courier) => {
    setCouriers({
      ...couriers,
      [courier]: { connected: !couriers[courier].connected }
    })
  }

  return (
    <div className="settings-container">
      {/* Mobile Menu Toggle Button */}
      <button 
        className="mobile-menu-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 12H21M3 6H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      {/* Left Sidebar */}
      <div className={`settings-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        {/* Close Button for Mobile */}
        <button 
          className="sidebar-close-btn"
          onClick={closeSidebar}
          aria-label="Close menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Top Section */}
        <div className="sidebar-top">
          <div className="sidebar-badge">BACKO</div>
          <p className="sidebar-subtitle">Manage your Dashboard</p>
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
            onClick={() => handleMenuClick('Orders')}
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
            onClick={() => handleMenuClick('Returns')}
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
            onClick={() => handleMenuClick('Customers')}
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
            onClick={() => handleMenuClick('Analytics')}
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
            onClick={() => handleMenuClick('Settings')}
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
      <div className="settings-main">
        {/* Header */}
        <div className="settings-header">
          <h1 className="settings-title">Settings</h1>
          <p className="settings-subtitle">Manage your store configuration</p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Return Portal Section */}
          <div className="settings-section">
            <h2 className="section-title">Return Portal</h2>
            <p className="section-description">Share this URL with your customers to allow them to submit return requests</p>
            
            {storeInfo.storeUrl ? (
              <div className="portal-info-card">
                <div className="portal-info-item">
                  <label className="portal-label">Store URL:</label>
                  <div className="portal-url-display">
                    <span className="portal-url-text">{storeInfo.storeUrl}</span>
                  </div>
                </div>
                
                <div className="portal-info-item">
                  <label className="portal-label">Return Portal URL:</label>
                  <div className="portal-url-display">
                    <span className="portal-url-text">{getReturnPortalUrl()}</span>
                    <button 
                      type="button" 
                      className="copy-url-btn"
                      onClick={handleCopyUrl}
                      title="Copy URL"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                      </svg>
                      Copy
                    </button>
                  </div>
                </div>

                <button 
                  type="button" 
                  className="open-portal-btn"
                  onClick={handleOpenPortal}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 13V19A2 2 0 0 1 16 21H5A2 2 0 0 1 3 19V8A2 2 0 0 1 5 6H11M15 3H21M21 3V9M21 3L9 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Open Return Portal
                </button>
              </div>
            ) : (
              <div className="portal-info-card">
                <p className="portal-warning">Please complete store setup to get your Return Portal URL</p>
              </div>
            )}
          </div>

          {/* Return Policy Section */}
          <div className="settings-section">
            <h2 className="section-title">Return Policy</h2>
            
            <div className="form-group">
              <label htmlFor="returnWindow" className="form-label">
                Return Window (Days)
              </label>
              <input
                type="number"
                id="returnWindow"
                className="form-input"
                value={settings.returnWindow}
                onChange={(e) => setSettings({ ...settings, returnWindow: parseInt(e.target.value) || 0 })}
                min="1"
                required
              />
              <p className="helper-text">Number of days customers can initiate returns</p>
            </div>

            <div className="form-group">
              <label htmlFor="automaticApprovalThreshold" className="form-label">
                Automatic Approval Threshold
              </label>
              <input
                type="number"
                id="automaticApprovalThreshold"
                className="form-input"
                value={settings.automaticApprovalThreshold}
                onChange={(e) => setSettings({ ...settings, automaticApprovalThreshold: parseInt(e.target.value) || 0 })}
                min="0"
                required
              />
              <p className="helper-text">Set an approval threshold for situations with lower value than this amount</p>
            </div>
          </div>

          {/* Refund Methods Section */}
          <div className="settings-section">
            <h2 className="section-title">Refund Methods</h2>
            
            <div 
              className={`refund-method-item ${settings.refundMethods.bankTransfer ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('bankTransfer')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Bank Transfer</h3>
                <p className="refund-method-description">Direct instant reimbursement from merchant</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.refundMethods.bankTransfer}
                  onChange={() => toggleRefundMethod('bankTransfer')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${settings.refundMethods.bankTransfer ? 'active' : ''}`}></span>
              </div>
            </div>

            <div 
              className={`refund-method-item ${settings.refundMethods.digitalWallets ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('digitalWallets')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Digital Wallets</h3>
                <p className="refund-method-description">PayPal, Payoneer, and other wallets</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.refundMethods.digitalWallets}
                  onChange={() => toggleRefundMethod('digitalWallets')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${settings.refundMethods.digitalWallets ? 'active' : ''}`}></span>
              </div>
            </div>

            <div 
              className={`refund-method-item ${settings.refundMethods.storeCredit ? 'active' : ''}`}
              onClick={() => toggleRefundMethod('storeCredit')}
            >
              <div className="refund-method-info">
                <h3 className="refund-method-title">Store Credit</h3>
                <p className="refund-method-description">Credit for future purchases</p>
              </div>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={settings.refundMethods.storeCredit}
                  onChange={() => toggleRefundMethod('storeCredit')}
                  className="toggle-input"
                />
                <span className={`toggle-slider ${settings.refundMethods.storeCredit ? 'active' : ''}`}></span>
              </div>
            </div>
          </div>

          {/* Branding Section */}
          <div className="settings-section">
            <h2 className="section-title">Branding</h2>
            
            <div className="form-group">
              <label className="form-label">Store Logo</label>
              <div 
                className="logo-upload-area"
                onClick={handleUploadClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
                <svg className="upload-icon" width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p className="upload-text">Click to upload or drag and drop image, any size up to 5MB</p>
                {settings.storeLogo && (
                  <p className="file-selected">Selected: {settings.storeLogo.name || 'Logo uploaded'}</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="primaryColor" className="form-label">
                Primary Color
              </label>
              <div className="color-input-wrapper">
                <input
                  type="color"
                  id="colorPicker"
                  className="color-picker"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                />
                <label htmlFor="colorPicker" className="color-swatch-label">
                  <div 
                    className="color-swatch" 
                    style={{ backgroundColor: settings.primaryColor }}
                  ></div>
                </label>
                <input
                  type="text"
                  id="primaryColor"
                  className="form-input color-input"
                  placeholder="#FF9724"
                  value={settings.primaryColor}
                  onChange={(e) => setSettings({ ...settings, primaryColor: e.target.value })}
                  pattern="^#[0-9A-Fa-f]{6}$"
                  required
                />
              </div>
              <p className="helper-text">This color appears in your customer return portal</p>
            </div>

            <div className="reviews-banner">
              <p className="reviews-banner-text">Reviews (This page will be visible for all the customers visiting the return portal)</p>
            </div>
          </div>

          {/* Integrations Section */}
          <div className="settings-section">
            <h2 className="section-title">Integrations</h2>
            
            {/* Shopify */}
            <div className="integration-card">
              <div className="integration-header">
                <h3 className="integration-title">Shopify</h3>
                {(integrations.shopify.connected || shopifyConnected) && (
                  <div className="connection-status connected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Connected</span>
                  </div>
                )}
              </div>
              <p className="integration-description">Connect your Shopify store to sync orders and products</p>
              
              {!(integrations.shopify.connected || shopifyConnected) ? (
                <div className="shopify-connect-form">
                  <div className="form-group">
                    <label className="form-label">Shop Domain</label>
                    <input
                      type="text"
                      className={`form-input ${error && !shopifyForm.shopDomain ? 'error' : ''}`}
                      placeholder="mystore.myshopify.com"
                      value={shopifyForm.shopDomain || ''}
                      onChange={(e) => {
                        setShopifyForm({ ...shopifyForm, shopDomain: e.target.value || '' })
                        setError('')
                      }}
                      required
                    />
                    <p className="helper-text">Your Shopify store domain (e.g., mystore.myshopify.com or just mystore)</p>
                  </div>
                  {error && (
                    <div style={{ 
                      padding: '0.75rem', 
                      background: '#FEE', 
                      border: '1px solid #FCC', 
                      borderRadius: '8px', 
                      color: '#C33',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      {error}
                    </div>
                  )}
                  
                  <div className="form-group">
                    <label className="form-label">Admin API Access Token</label>
                    <input
                      type="password"
                      className={`form-input ${error && !shopifyForm.accessToken ? 'error' : ''}`}
                      placeholder="shpat_xxxxxxxxxxxxx"
                      value={shopifyForm.accessToken || ''}
                      onChange={(e) => {
                        setShopifyForm({ ...shopifyForm, accessToken: e.target.value || '' })
                        setError('')
                      }}
                      required
                    />
                    <p className="helper-text">From Settings → Apps and sales channels → Develop apps → Admin API access token</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">API Key (Optional)</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="35e08442ad689d06bbf0c984dd0642d0"
                      value={shopifyForm.apiKey || ''}
                      onChange={(e) => setShopifyForm({ ...shopifyForm, apiKey: e.target.value || '' })}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">API Secret Key (Optional)</label>
                    <input
                      type="password"
                      className="form-input"
                      placeholder="shpss_xxxxxxxxxxxxx"
                      value={shopifyForm.apiSecretKey || ''}
                      onChange={(e) => setShopifyForm({ ...shopifyForm, apiSecretKey: e.target.value || '' })}
                    />
                  </div>
                  
                  <button
                    type="button"
                    className="integration-btn connect"
                    onClick={handleShopifyConnect}
                    disabled={shopifyConnecting}
                  >
                    {shopifyConnecting ? 'Connecting...' : 'Connect Shopify'}
                  </button>
                </div>
              ) : (
                <>
                  <div className="connected-shop-info" style={{ 
                    background: '#E8F5E9', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid #4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="integration-status-text" style={{ margin: 0, color: '#2C2C2C', fontWeight: 600, fontSize: '1rem' }}>
                      Connected to: <span style={{ color: '#4CAF50', fontFamily: 'monospace' }}>{integrations.shopify.shopDomain || shopifyForm.shopDomain || 'Shopify Store'}</span>
                    </p>
                  </div>
                  {syncResult && (
                    <p className="sync-result-text" style={{ marginTop: '0.5rem' }}>
                      Last sync: {syncResult.synced} new orders, {syncResult.updated} updated
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="integration-btn connect"
                      onClick={handleSyncOrders}
                      disabled={shopifySyncing}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 2V8H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 22V16H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 11C2 14.866 5.134 18 9 18L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 13C22 9.134 18.866 6 15 6L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {shopifySyncing ? 'Syncing...' : 'Sync Orders'}
                    </button>
                    <button
                      type="button"
                      className="integration-btn disconnect"
                      onClick={handleShopifyDisconnect}
                    >
                      Disconnect
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* WooCommerce */}
            <div className="integration-card">
              <div className="integration-header">
                <h3 className="integration-title">WooCommerce</h3>
                {integrations.wooCommerce.connected && (
                  <div className="connection-status connected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Connected</span>
                  </div>
                )}
              </div>
              <p className="integration-description">Connect your WooCommerce store to sync orders and products</p>
              
              {!integrations.wooCommerce.connected ? (
                <div className="shopify-connect-form">
                  {/* Connection Method Selection */}
                  <div className="form-group">
                    <label className="form-label">Connection Method</label>
                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="wooCommerceMethod"
                          value="portal"
                          checked={wooCommerceConnectionMethod === 'portal'}
                          onChange={(e) => setWooCommerceConnectionMethod(e.target.value)}
                        />
                        <span>Portal Method (Recommended)</span>
                      </label>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                        <input
                          type="radio"
                          name="wooCommerceMethod"
                          value="api"
                          checked={wooCommerceConnectionMethod === 'api'}
                          onChange={(e) => setWooCommerceConnectionMethod(e.target.value)}
                        />
                        <span>API Keys Method</span>
                      </label>
                    </div>
                    <p className="helper-text">
                      Both methods require Consumer Key/Secret to fetch data directly from WooCommerce API. Portal method also generates a secret key for WordPress plugin features.
                    </p>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Store URL</label>
                    <input
                      type="text"
                      className={`form-input ${wooCommerceError && !wooCommerceForm.storeUrl ? 'error' : ''}`}
                      placeholder="https://yourstore.com"
                      value={wooCommerceForm.storeUrl || ''}
                      onChange={(e) => {
                        setWooCommerceForm({ ...wooCommerceForm, storeUrl: e.target.value || '' })
                        setWooCommerceError('')
                      }}
                      required
                    />
                    <p className="helper-text">Your WooCommerce store URL (e.g., https://yourstore.com)</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Consumer Key</label>
                    <input
                      type="text"
                      className={`form-input ${wooCommerceError && !wooCommerceForm.consumerKey ? 'error' : ''}`}
                      placeholder="ck_xxxxxxxxxxxxx"
                      value={wooCommerceForm.consumerKey || ''}
                      onChange={(e) => {
                        setWooCommerceForm({ ...wooCommerceForm, consumerKey: e.target.value || '' })
                        setWooCommerceError('')
                      }}
                      required
                    />
                    <p className="helper-text">From WooCommerce → Settings → Advanced → REST API → Add key (Read/Write permissions)</p>
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Consumer Secret</label>
                    <input
                      type="password"
                      className={`form-input ${wooCommerceError && !wooCommerceForm.consumerSecret ? 'error' : ''}`}
                      placeholder="cs_xxxxxxxxxxxxx"
                      value={wooCommerceForm.consumerSecret || ''}
                      onChange={(e) => {
                        setWooCommerceForm({ ...wooCommerceForm, consumerSecret: e.target.value || '' })
                        setWooCommerceError('')
                      }}
                      required
                    />
                    <p className="helper-text">Consumer Secret from your WooCommerce API key</p>
                  </div>

                  {wooCommerceError && (
                    <div style={{ 
                      padding: '0.75rem', 
                      background: '#FEE', 
                      border: '1px solid #FCC', 
                      borderRadius: '8px', 
                      color: '#C33',
                      marginBottom: '1rem',
                      fontSize: '0.875rem'
                    }}>
                      {wooCommerceError}
                    </div>
                  )}
                  
                  <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="integration-btn connect"
                      onClick={wooCommerceConnectionMethod === 'portal' ? handleWooCommercePortalConnect : handleWooCommerceConnect}
                      disabled={wooCommerceConnecting}
                    >
                      {wooCommerceConnecting ? 'Connecting...' : 'Connect WooCommerce'}
                    </button>
                    <button
                      type="button"
                      className="integration-btn connect"
                      onClick={handleDownloadPlugin}
                      style={{ background: '#2196F3' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download Plugin (ZIP)
                    </button>
                  </div>
                  <p className="helper-text" style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    📦 Plugin ZIP file download karo, WordPress Admin > Plugins > Upload Plugin se install karo, phir Settings > BACKO mein secret key paste karo.
                  </p>
                </div>
              ) : (
                <>
                  <div className="connected-shop-info" style={{ 
                    background: '#E8F5E9', 
                    padding: '1rem', 
                    borderRadius: '8px', 
                    marginTop: '1rem',
                    marginBottom: '1rem',
                    border: '1px solid #4CAF50',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p className="integration-status-text" style={{ margin: 0, color: '#2C2C2C', fontWeight: 600, fontSize: '1rem' }}>
                      Connected to: <span style={{ color: '#4CAF50', fontFamily: 'monospace' }}>{integrations.wooCommerce.storeUrl || wooCommerceForm.storeUrl || 'WooCommerce Store'}</span>
                    </p>
                  </div>

                  {/* Secret Key Display */}
                  {wooCommerceSecretKey && (
                    <div className="form-group" style={{ 
                      background: '#FFF9E6', 
                      padding: '1rem', 
                      borderRadius: '8px', 
                      border: '1px solid #FFC107',
                      marginTop: '1rem',
                      marginBottom: '1rem'
                    }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#2C2C2C', marginBottom: '0.5rem' }}>
                        Your Secret Key (Use this in WordPress Plugin)
                      </label>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <input
                          type="text"
                          readOnly
                          value={wooCommerceSecretKey}
                          className="form-input"
                          style={{ 
                            fontFamily: 'monospace', 
                            fontSize: '0.875rem',
                            background: '#FFFFFF',
                            cursor: 'text'
                          }}
                          onClick={(e) => e.target.select()}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(wooCommerceSecretKey)
                            alert('Secret Key copied to clipboard!')
                          }}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#FFC107',
                            color: '#2C2C2C',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.25rem', display: 'inline' }}>
                            <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                          </svg>
                          Copy
                        </button>
                      </div>
                      <p className="helper-text" style={{ marginTop: '0.5rem', color: '#666', fontSize: '0.8125rem' }}>
                        Copy this secret key and paste it in your WordPress plugin settings
                      </p>
                    </div>
                  )}
                  {wooCommerceSyncResult && (
                    <p className="sync-result-text" style={{ marginTop: '0.5rem' }}>
                      Last sync: {wooCommerceSyncResult.synced} new orders, {wooCommerceSyncResult.updated} updated
                    </p>
                  )}
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="integration-btn connect"
                      onClick={handleSyncWooCommerceOrders}
                      disabled={wooCommerceSyncing}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21.5 2V8H15.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2.5 22V16H8.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M2 11C2 14.866 5.134 18 9 18L7 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22 13C22 9.134 18.866 6 15 6L17 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      {wooCommerceSyncing ? 'Syncing...' : 'Sync Orders'}
                    </button>
                    <button
                      type="button"
                      className="integration-btn disconnect"
                      onClick={handleWooCommerceDisconnect}
                    >
                      Disconnect
                    </button>
                    <button
                      type="button"
                      className="integration-btn connect"
                      onClick={handleDownloadPlugin}
                      style={{ background: '#2196F3' }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: '0.5rem' }}>
                        <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15M17 8L12 3M12 3L7 8M12 3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Download Plugin (ZIP)
                    </button>
                  </div>
                  <p className="helper-text" style={{ marginTop: '0.75rem', color: '#666', fontSize: '0.875rem', lineHeight: '1.5' }}>
                    📦 Plugin ZIP file download karo, WordPress Admin > Plugins > Upload Plugin se install karo, phir Settings > BACKO mein secret key paste karo.
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Connected Couriers Section */}
          <div className="settings-section">
            <h2 className="section-title">Connected Couriers</h2>
            
            {/* TCS */}
            <div className="courier-card">
              <div className="courier-header">
                <div className="courier-logo tcs-logo">TCS</div>
                <div className="courier-info">
                  <h3 className="courier-title">TCS</h3>
                  <p className="courier-description">TCS courier service is connected</p>
                </div>
                {couriers.tcs.connected && (
                  <div className="connection-status connected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Connected</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`courier-btn ${couriers.tcs.connected ? 'disconnect' : 'connect'}`}
                onClick={() => handleCourierToggle('tcs')}
              >
                {couriers.tcs.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>

            {/* Leopard */}
            <div className="courier-card">
              <div className="courier-header">
                <div className="courier-logo leopard-logo">Leopard</div>
                <div className="courier-info">
                  <h3 className="courier-title">Leopard</h3>
                  <p className="courier-description">Leopard courier service is connected</p>
                </div>
                {couriers.leopard.connected && (
                  <div className="connection-status connected">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>Connected</span>
                  </div>
                )}
              </div>
              <button
                type="button"
                className={`courier-btn ${couriers.leopard.connected ? 'disconnect' : 'connect'}`}
                onClick={() => handleCourierToggle('leopard')}
              >
                {couriers.leopard.connected ? 'Disconnect' : 'Connect'}
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="settings-actions">
            <button type="button" className="cancel-btn" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default Settings

