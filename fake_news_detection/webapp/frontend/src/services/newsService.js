import api from './api'

export const newsService = {
  // Classify news article
  classify: async (text, title = '') => {
    const response = await api.post('/news/classify', { text, title })
    return response.data
  },

  // Get explanation for classification
  explain: async (text, title = '') => {
    const response = await api.post('/news/explain', { text, title })
    return response.data
  },

  // Get classification history
  getHistory: async (params = {}) => {
    const response = await api.get('/news/history', { params })
    return response.data
  },

  // Get single classification
  getClassification: async (id) => {
    const response = await api.get(`/news/history/${id}`)
    return response.data
  },

  // Delete classification
  deleteClassification: async (id) => {
    const response = await api.delete(`/news/history/${id}`)
    return response.data
  },

  // Delete all history
  deleteAllHistory: async () => {
    const response = await api.delete('/news/history')
    return response.data
  },

  // Get user statistics
  getStats: async () => {
    const response = await api.get('/news/stats')
    return response.data
  },
}

export const userService = {
  // Get user profile
  getProfile: async () => {
    const response = await api.get('/user/profile')
    return response.data
  },

  // Get dashboard data
  getDashboard: async () => {
    const response = await api.get('/user/dashboard')
    return response.data
  },

  // Update profile
  updateProfile: async (data) => {
    const response = await api.put('/user/profile', data)
    return response.data
  },

  // Delete account
  deleteAccount: async (password) => {
    const response = await api.delete('/user/account', { data: { password } })
    return response.data
  },
}
