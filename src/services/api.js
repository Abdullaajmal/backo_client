const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Helper function to get token from localStorage
const getToken = () => {
  return localStorage.getItem('token');
};

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Helper function to get multipart headers (for file uploads)
const getMultipartHeaders = () => {
  const token = getToken();
  return {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API functions
export const api = {
  // Auth APIs
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }
    return data;
  },

  register: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }
    return data;
  },

  getMe: async () => {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user info');
    }
    return data;
  },

  // Store APIs
  setupStore: async (storeName, storeUrl, logoFile) => {
    const formData = new FormData();
    formData.append('storeName', storeName);
    formData.append('storeUrl', storeUrl);
    if (logoFile) {
      formData.append('storeLogo', logoFile);
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/store/setup`, {
      method: 'POST',
      headers: getMultipartHeaders(),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Store setup failed');
    }
    return data;
  },

  getStore: async () => {
    const response = await fetch(`${API_BASE_URL}/store`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get store info');
    }
    return data;
  },

  updateReturnPolicy: async (returnPolicyData) => {
    const response = await fetch(`${API_BASE_URL}/store/return-policy`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(returnPolicyData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update return policy');
    }
    return data;
  },

  updateBranding: async (brandingData) => {
    const response = await fetch(`${API_BASE_URL}/store/branding`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(brandingData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update branding');
    }
    return data;
  },

  // Shopify APIs
  connectShopify: async (shopDomain, accessToken, apiKey, apiSecretKey) => {
    const response = await fetch(`${API_BASE_URL}/store/shopify/connect`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ shopDomain, accessToken, apiKey, apiSecretKey }),
    });
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON. Check if backend API is running at ${API_BASE_URL}`);
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to connect Shopify store');
    }
    return data;
  },

  getShopifyStatus: async () => {
    const response = await fetch(`${API_BASE_URL}/store/shopify/status`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    
    // Check if response is HTML (error page) instead of JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text.substring(0, 200));
      throw new Error(`Server returned HTML instead of JSON. Check if backend API is running at ${API_BASE_URL}`);
    }
    
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get Shopify status');
    }
    return data;
  },

  syncShopifyOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to sync orders');
    }
    return data;
  },

  // Products APIs
  getProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get products');
    }
    return data;
  },

  syncProducts: async () => {
    const response = await fetch(`${API_BASE_URL}/products/sync`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to sync products');
    }
    return data;
  },

  getDashboard: async () => {
    const response = await fetch(`${API_BASE_URL}/dashboard`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get dashboard data');
    }
    return data;
  },

  getOrders: async () => {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get orders');
    }
    return data;
  },

  getOrder: async (orderId) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get order');
    }
    return data;
  },

  updateOrder: async (orderId, updateData) => {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update order');
    }
    return data;
  },

  getReturns: async () => {
    const response = await fetch(`${API_BASE_URL}/returns`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get returns');
    }
    return data;
  },

  getCustomers: async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Failed to fetch customers' }));
        throw new Error(errorData.message || `HTTP ${response.status}: Failed to get customers`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('❌ getCustomers API error:', error);
      // If it's a network error, provide a more helpful message
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Network error: Could not connect to server. Please check if the backend server is running.');
      }
      throw error;
    }
  },

  getAnalytics: async () => {
    const response = await fetch(`${API_BASE_URL}/analytics`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get analytics');
    }
    return data;
  },

  getSettings: async () => {
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get settings');
    }
    return data;
  },

  updateSettings: async (settingsData) => {
    const formData = new FormData();
    formData.append('returnWindow', settingsData.returnWindow);
    formData.append('automaticApprovalThreshold', settingsData.automaticApprovalThreshold);
    formData.append('refundMethods', JSON.stringify(settingsData.refundMethods));
    formData.append('primaryColor', settingsData.primaryColor);
    if (settingsData.storeLogo) {
      formData.append('storeLogo', settingsData.storeLogo);
    }

    const token = getToken();
    const response = await fetch(`${API_BASE_URL}/settings`, {
      method: 'PUT',
      headers: getMultipartHeaders(),
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to update settings');
    }
    return data;
  },

  // Public Return APIs
  findOrder: async (orderId, emailOrPhone, storeUrl) => {
    const response = await fetch(`${API_BASE_URL}/returns/public/orders/find`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ orderId, emailOrPhone, storeUrl }),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to find order');
    }
    return data;
  },

  createReturnRequest: async (storeUrl, returnData) => {
    const formData = new FormData();
    formData.append('orderId', returnData.orderId);
    formData.append('customer', JSON.stringify(returnData.customer));
    formData.append('product', JSON.stringify(returnData.product));
    formData.append('reason', returnData.reason);
    formData.append('preferredResolution', returnData.preferredResolution);
    formData.append('amount', returnData.amount);
    formData.append('notes', returnData.notes || '');
    
    // Append photos if any
    if (returnData.photos && returnData.photos.length > 0) {
      returnData.photos.forEach((photo, index) => {
        formData.append(`photo_${index}`, photo);
      });
    }

    const response = await fetch(`${API_BASE_URL}/returns/public/returns/${storeUrl}`, {
      method: 'POST',
      body: formData,
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to create return request');
    }
    return data;
  },

  getPublicReturn: async (storeUrl, returnId) => {
    const response = await fetch(`${API_BASE_URL}/returns/public/returns/${storeUrl}/${returnId}`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get return details');
    }
    return data;
  },
};

// Token management
export const tokenService = {
  setToken: (token) => {
    localStorage.setItem('token', token);
  },
  getToken: () => {
    return localStorage.getItem('token');
  },
  removeToken: () => {
    localStorage.removeItem('token');
  },
};

