import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '../services/api'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: true,

      // Initialize auth state from localStorage
      initialize: async () => {
        const { token, user, isAuthenticated } = get()
        
        // If we have persisted auth data, use it immediately
        if (token && user && isAuthenticated) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`
          set({ isLoading: false })
          
          // Optionally refresh user data from API in background
          try {
            const response = await api.get('/auth/me')
            if (response.data.data) {
              set({ user: response.data.data })
            }
          } catch (error) {
            // If refresh fails, check if it's an auth error
            if (error.response?.status === 401) {
              // Token is invalid, clear auth state
              set({ 
                user: null, 
                token: null, 
                isAuthenticated: false 
              })
              delete api.defaults.headers.common['Authorization']
            }
            // Otherwise keep using persisted data
          }
        } else if (token) {
          // Have token but no user - try to fetch
          try {
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`
            const response = await api.get('/auth/me')
            set({ 
              user: response.data.data, 
              isAuthenticated: true, 
              isLoading: false 
            })
          } catch (error) {
            // Token is invalid, clear auth state
            set({ 
              user: null, 
              token: null, 
              isAuthenticated: false, 
              isLoading: false 
            })
            delete api.defaults.headers.common['Authorization']
          }
        } else {
          set({ isLoading: false })
        }
      },

      // Login
      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password })
        const { token, user } = response.data
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          isLoading: false 
        })
        
        return response.data
      },

      // Register
      register: async (userData) => {
        const response = await api.post('/auth/register', userData)
        const { token, user } = response.data
        
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        set({ 
          user, 
          token, 
          isAuthenticated: true, 
          isLoading: false 
        })
        
        return response.data
      },

      // Logout
      logout: () => {
        delete api.defaults.headers.common['Authorization']
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false 
        })
      },

      // Update user profile
      updateProfile: async (userData) => {
        const response = await api.put('/auth/update', userData)
        set({ user: response.data.data })
        return response.data
      },

      // Change password
      changePassword: async (currentPassword, newPassword) => {
        const response = await api.put('/auth/password', { 
          currentPassword, 
          newPassword 
        })
        return response.data
      },

      // Set loading state
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated
      }),
    }
  )
)

// Initialize auth on app load
if (typeof window !== 'undefined') {
  useAuthStore.getState().initialize()
}
