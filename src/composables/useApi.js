// src/composables/useApi.js
// ✅ Unified API client using fetch with consistent error handling
import { ref } from 'vue'

const API_BASE = import.meta.env.DEV
  ? '/api'
  : (import.meta.env.VITE_API_URL || '/api')
const TOKEN_KEY = 'auth_token'

// Custom error class for API errors
class ApiError extends Error {
  constructor(message, status, data) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export function useApi() {
  const loading = ref(false)
  const error = ref(null)

  /**
   * Get stored authentication token
   * @returns {string|null} The auth token or null
   */
  const getToken = () => {
    try {
      return localStorage.getItem(TOKEN_KEY)
    } catch {
      console.warn('Failed to read token from localStorage')
      return null
    }
  }

  /**
   * Set authentication token in storage
   * @param {string} token - The authentication token
   */
  const setToken = (token) => {
    try {
      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
      }
    } catch {
      console.error('Failed to store token in localStorage')
    }
  }

  /**
   * Remove authentication token from storage
   */
  const removeToken = () => {
    try {
      localStorage.removeItem(TOKEN_KEY)
    } catch {
      console.error('Failed to remove token from localStorage')
    }
  }

  /**
   * Build request headers with authentication
   * @param {object} customHeaders - Additional headers to merge
   * @returns {object} Complete headers object
   */
  const buildHeaders = (customHeaders = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...customHeaders,
    }

    const token = getToken()
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  /**
   * Parse API response based on content type
   * @param {Response} response - Fetch response object
   * @returns {Promise<any>} Parsed response data
   */
  const parseResponse = async (response) => {
    const contentType = response.headers.get('content-type')

    if (contentType?.includes('application/json')) {
      return await response.json()
    } else if (contentType?.includes('text')) {
      return await response.text()
    } else {
      return null
    }
  }

  /**
   * Main request handler
   * @param {string} endpoint - API endpoint (without base URL)
   * @param {object} options - Fetch options
   * @returns {Promise<any>} API response data
   */
  const request = async (endpoint, options = {}) => {
    loading.value = true
    error.value = null

    try {
      const headers = buildHeaders(options.headers)
      const url = `${API_BASE}${endpoint}`

      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await parseResponse(response)

      // Handle authentication errors
      if (response.status === 401) {
        removeToken()
        window.location.href = '/login'
        throw new ApiError(
          'Session expired. Please login again.',
          401,
          data
        )
      }

      // Handle other errors
      if (!response.ok) {
        const errorMessage =
          data?.message ||
          data?.error ||
          `HTTP ${response.status}: ${response.statusText}`

        error.value = errorMessage
        throw new ApiError(errorMessage, response.status, data)
      }

      return data
    } catch (err) {
      if (err instanceof ApiError) {
        throw err
      }

      const errorMessage =
        err?.message === 'Failed to fetch'
          ? 'Unable to reach the backend API. Check Laravel is running and the Vite proxy is active.'
          : err.message || 'Unknown error occurred'
      error.value = errorMessage
      throw new ApiError(errorMessage, 0, null)
    } finally {
      loading.value = false
    }
  }

  /**
   * GET request helper
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  const get = (endpoint) => {
    return request(endpoint, { method: 'GET' })
  }

  /**
   * POST request helper
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} customHeaders - Custom headers
   * @returns {Promise<any>} Response data
   */
  const post = (endpoint, body, customHeaders = {}) => {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
      headers: customHeaders,
    })
  }

  /**
   * PUT request helper
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} customHeaders - Custom headers
   * @returns {Promise<any>} Response data
   */
  const put = (endpoint, body, customHeaders = {}) => {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
      headers: customHeaders,
    })
  }

  /**
   * PATCH request helper
   * @param {string} endpoint - API endpoint
   * @param {object} body - Request body
   * @param {object} customHeaders - Custom headers
   * @returns {Promise<any>} Response data
   */
  const patch = (endpoint, body, customHeaders = {}) => {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: customHeaders,
    })
  }

  /**
   * DELETE request helper
   * @param {string} endpoint - API endpoint
   * @returns {Promise<any>} Response data
   */
  const delete_ = (endpoint) => {
    return request(endpoint, { method: 'DELETE' })
  }

  return {
    // State
    loading,
    error,

    // Methods
    get,
    post,
    put,
    patch,
    delete: delete_,
    request,
    getToken,
    setToken,
    removeToken,
  }
}

export { ApiError }
