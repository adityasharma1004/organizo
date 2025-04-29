const API_URL = import.meta.env.VITE_API_URL;

// Helper function to handle API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Server error: ${response.status}`);
  }
  return response.json();
};

// Add authentication headers
const getHeaders = (userId) => ({
  'Content-Type': 'application/json',
  'user-id': userId,
});

// Generic API call function with authentication
const apiCall = async (endpoint, options = {}) => {
  // Get user ID from Clerk
  try {
    const clerk = window.Clerk;
    await clerk?.load();
    const userId = clerk?.user?.id;
    
    if (!userId) {
      console.error('Authentication error: No user ID available');
      throw new Error('Authentication required');
    }
  
    console.log('Making API call with user ID:', userId, 'to endpoint:', endpoint);

    const headers = {
      ...getHeaders(userId),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for cross-site requests
    });

    return handleResponse(response);
  } catch (error) {
    console.error('API call error:', error);
    
    // Check if it's a Clerk-related error
    if (error.message?.includes('Clerk') || !window.Clerk?.user) {
      console.error('Possible Clerk authentication issue');
      // Force refresh the page if it might be a token issue
      if (error.message?.includes('token') || error.message?.includes('expired')) {
        window.location.reload();
        return null;
      }
    }
    
    throw error;
  }
};

// Tasks API
export const tasksApi = {
  getAll: () => apiCall('/api/tasks'),
  
  create: (task) => apiCall('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(task),
  }),
  
  update: (id, updates) => apiCall(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id) => apiCall(`/api/tasks/${id}`, {
    method: 'DELETE',
  }),
};

// Transactions API
export const transactionsApi = {
  getAll: () => apiCall('/api/transactions'),
  
  create: (transaction) => apiCall('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(transaction),
  }),
  
  update: (id, updates) => apiCall(`/api/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }),
  
  delete: (id) => apiCall(`/api/transactions/${id}`, {
    method: 'DELETE',
  }),
};

// User settings API
export const userSettingsApi = {
  get: () => apiCall('/api/user-settings'),
  
  update: (settings) => apiCall('/api/user-settings', {
    method: 'PUT',
    body: JSON.stringify(settings),
  }),
};

export default {
  tasks: tasksApi,
  transactions: transactionsApi,
  userSettings: userSettingsApi,
};