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
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get customers');
    }
    return data;
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

