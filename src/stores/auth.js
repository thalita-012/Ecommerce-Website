// src/stores/auth.js
// ✅ Complete auth store with all methods and proper error handling
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useApi } from '@/composables/useApi'

export const useAuthStore = defineStore('auth', () => {
  const api = useApi()

  // State
  const user = ref(JSON.parse(localStorage.getItem('user') || 'null'))
  const loading = ref(false)
  const error = ref(null)

  // Computed
  const isAuthenticated = computed(() => !!user.value)

  /**
   * Set authentication state
   * @param {object} userData - User data from backend
   * @param {string} authToken - Authentication token
   */
  const setAuth = (userData, authToken) => {
    user.value = userData
    api.setToken(authToken)

    try {
      localStorage.setItem('user', JSON.stringify(userData))
    } catch (err) {
      console.error('Failed to save user data:', err)
    }
  }

  /**
   * Clear authentication state
   */
  const clearAuth = () => {
    user.value = null
    api.removeToken()

    try {
      localStorage.removeItem('user')
    } catch (err) {
      console.error('Failed to clear user data:', err)
    }
  }

  /**
   * Register new user
   * @param {object} data - Registration data { name, email, password, password_confirmation }
   * @returns {Promise<object>} User and token
   */
  const register = async (data) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/register', {
        name: data.name,
        email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      // Handle response based on backend structure
      const token = response.token || response.data?.token
      const userData = response.user || response.data?.user

      if (token && userData) {
        setAuth(userData, token)
      }

      return response
    } catch (err) {
      error.value = err.message || 'Registration failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Login user
   * @param {object} data - Login credentials { email, password }
   * @returns {Promise<object>} User and token
   */
  const login = async (data) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/login', {
        email: typeof data.email === 'string' ? data.email.trim().toLowerCase() : data.email,
        password: data.password,
      })

      // Handle response based on backend structure
      const token = response.token || response.data?.token
      const userData = response.user || response.data?.user

      if (!token || !userData) {
        throw new Error('Invalid login response from server')
      }

      setAuth(userData, token)
      return response
    } catch (err) {
      error.value = err.message || 'Login failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout user
   * @returns {Promise<void>}
   */
  const logout = async () => {
    loading.value = true
    error.value = null

    try {
      // Call logout endpoint if your backend has one
      try {
        await api.post('/auth/logout', {})
      } catch (err) {
        // Continue even if logout endpoint fails
        console.warn('Logout endpoint failed:', err)
      }

      clearAuth()
    } catch (err) {
      error.value = err.message || 'Logout failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<object>} User profile data
   */
  const getProfile = async () => {
    loading.value = true
    error.value = null

    try {
      const response = await api.get('/auth/profile')

      // Extract user from response
      const userData = response.user || response.data || response

      user.value = userData
      return userData
    } catch (err) {
      error.value = err.message || 'Failed to load profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Update user profile
   * @param {object} data - Profile data { name, email }
   * @returns {Promise<object>} Updated user data
   */
  const updateProfile = async (data) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.put('/auth/profile', {
        name: data.name,
        email: data.email,
      })

      // Extract updated user from response
      const userData = response.user || response.data || response

      user.value = userData
      try {
        localStorage.setItem('user', JSON.stringify(userData))
      } catch {
        console.error('Failed to update user in localStorage')
      }

      return userData
    } catch (err) {
      error.value = err.message || 'Failed to update profile'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Change user password
   * @param {object} data - Password data { current_password, password, password_confirmation }
   * @returns {Promise<object>} Response from server
   */
  const changePassword = async (data) => {
    loading.value = true
    error.value = null

    try {
      const response = await api.post('/auth/change-password', {
        current_password: data.current_password,
        password: data.password,
        password_confirmation: data.password_confirmation,
      })

      return response
    } catch (err) {
      error.value = err.message || 'Failed to change password'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Check if user is authenticated by verifying token
   * @returns {Promise<boolean>}
   */
  const verifyAuth = async () => {
    const token = api.getToken()

    if (!token) {
      clearAuth()
      return false
    }

    try {
      await getProfile()
      return true
    } catch (err) {
      clearAuth()
      return false
    }
  }

  return {
    // State
    user,
    loading,
    error,

    // Computed
    isAuthenticated,

    // Methods
    register,
    login,
    logout,
    getProfile,
    updateProfile,
    changePassword,
    verifyAuth,
    setAuth,
    clearAuth,
  }
})
