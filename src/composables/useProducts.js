// ============================================================================
// src/composables/useProducts.js - ✅ Fixed response structure handling
// ============================================================================
import { ref, computed } from 'vue'
import { useApi } from './useApi'

export function useProducts() {
  const api = useApi()
  const products = ref([])
  const product = ref(null)
  const pagination = ref({ total: 0, perPage: 12, currentPage: 1 })

  /**
   * Normalize API response to consistent structure
   * @param {object} response - Raw API response
   * @returns {object} Normalized data object
   */
  const normalizeResponse = (response) => {
    // If response has nested data.data structure
    if (response.data && Array.isArray(response.data.data)) {
      return response.data
    }
    // If response is already normalized
    if (Array.isArray(response.data)) {
      return response
    }
    // If response is the data array itself
    if (Array.isArray(response)) {
      return { data: response }
    }
    return response
  }

  /**
   * Fetch products list with filters and pagination
   * @param {object} filters - Filter options
   * @returns {Promise<array>} Array of products
   */
  const getProducts = async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.category) params.append('category', filters.category)
      if (filters.category_id) {
        params.append('category_id', filters.category_id)
        params.append('category', filters.category_id)
      }
      if (filters.min_price) params.append('min_price', filters.min_price)
      if (filters.max_price) params.append('max_price', filters.max_price)
      if (filters.sort) params.append('sort', filters.sort)
      if (filters.page) params.append('page', filters.page)
      if (filters.per_page) params.append('per_page', filters.per_page)

      const response = await api.get(`/products?${params.toString()}`)
      const data = normalizeResponse(response)

      products.value = data.data || []
      pagination.value = {
        total: data.total || 0,
        perPage: data.per_page || 12,
        currentPage: data.current_page || 1,
        lastPage: data.last_page || 1,
      }

      return products.value
    } catch (err) {
      console.error('Error loading products:', err)
      throw err
    }
  }

  /**
   * Fetch single product by ID
   * @param {number} id - Product ID
   * @returns {Promise<object>} Product data
   */
  const getProduct = async (id) => {
    try {
      const response = await api.get(`/products/${id}`)
      product.value = response.data || response
      return product.value
    } catch (err) {
      console.error('Error loading product:', err)
      throw err
    }
  }

  /**
   * Search products by query
   * @param {string} query - Search query
   * @returns {Promise<array>} Search results
   */
  const searchProducts = async (query) => {
    try {
      const response = await api.get(`/products/search?q=${encodeURIComponent(query)}`)
      const data = normalizeResponse(response)
      products.value = data.data || []
      return products.value
    } catch (err) {
      console.error('Error searching products:', err)
      throw err
    }
  }

  return {
    // State
    products,
    product,
    pagination,
    loading: computed(() => api.loading.value),
    error: computed(() => api.error.value),

    // Methods
    getProducts,
    getProduct,
    searchProducts,
  }
}

// ============================================================================
// src/composables/useWishlist.js - ✅ Complete implementation
// ============================================================================
export function useWishlist() {
  const api = useApi()
  const wishlist = ref([])

  /**
   * Get user's wishlist
   * @returns {Promise<array>} Wishlist items
   */
  const getWishlist = async () => {
    try {
      const response = await api.get('/wishlist')
      const data = response.data || response
      wishlist.value = Array.isArray(data) ? data : data.data || []
      return wishlist.value
    } catch (err) {
      console.error('Error loading wishlist:', err)
      throw err
    }
  }

  /**
   * Add product to wishlist
   * @param {number} productId - Product ID
   * @returns {Promise<object>} Response from API
   */
  const addToWishlist = async (productId) => {
    try {
      const response = await api.post('/wishlist', { product_id: productId })
      await getWishlist() // Refresh wishlist
      return response
    } catch (err) {
      console.error('Error adding to wishlist:', err)
      throw err
    }
  }

  /**
   * Remove product from wishlist
   * @param {number} productId - Product ID
   * @returns {Promise<object>} Response from API
   */
  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete_(`/wishlist/${productId}`)
      await getWishlist() // Refresh wishlist
      return response
    } catch (err) {
      console.error('Error removing from wishlist:', err)
      throw err
    }
  }

  /**
   * Check if product is in wishlist
   * @param {number} productId - Product ID
   * @returns {Promise<boolean>}
   */
  const isInWishlist = async (productId) => {
    try {
      const response = await api.get(`/wishlist/${productId}`)
      return response.in_wishlist || response.data?.in_wishlist || false
    } catch (err) {
      // Item probably not in wishlist
      return false
    }
  }

  return {
    wishlist,
    loading: computed(() => api.loading.value),
    error: computed(() => api.error.value),
    getWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
  }
}

// ============================================================================
// src/composables/useReviews.js - ✅ Complete implementation
// ============================================================================
export function useReviews() {
  const api = useApi()
  const reviews = ref([])

  /**
   * Fetch reviews for a product
   * @param {number} productId - Product ID
   * @returns {Promise<array>} Product reviews
   */
  const getReviews = async (productId) => {
    try {
      const response = await api.get(`/products/${productId}/reviews`)
      const data = response.data || response
      reviews.value = Array.isArray(data) ? data : data.data || []
      return reviews.value
    } catch (err) {
      console.error('Error loading reviews:', err)
      throw err
    }
  }

  /**
   * Create new review for product
   * @param {number} productId - Product ID
   * @param {object} data - Review data { rating, title, text }
   * @returns {Promise<object>} Created review
   */
  const createReview = async (productId, data) => {
    try {
      const response = await api.post(`/products/${productId}/reviews`, {
        rating: data.rating,
        title: data.title,
        text: data.text,
      })
      await getReviews(productId) // Refresh reviews
      return response
    } catch (err) {
      console.error('Error creating review:', err)
      throw err
    }
  }

  /**
   * Update existing review
   * @param {number} reviewId - Review ID
   * @param {object} data - Review data { rating, title, text }
   * @returns {Promise<object>} Updated review
   */
  const updateReview = async (reviewId, data) => {
    try {
      const response = await api.put(`/reviews/${reviewId}`, {
        rating: data.rating,
        title: data.title,
        text: data.text,
      })
      return response
    } catch (err) {
      console.error('Error updating review:', err)
      throw err
    }
  }

  /**
   * Delete review
   * @param {number} reviewId - Review ID
   * @returns {Promise<object>} Response
   */
  const deleteReview = async (reviewId) => {
    try {
      const response = await api.delete_(`/reviews/${reviewId}`)
      return response
    } catch (err) {
      console.error('Error deleting review:', err)
      throw err
    }
  }

  return {
    reviews,
    loading: computed(() => api.loading.value),
    error: computed(() => api.error.value),
    getReviews,
    createReview,
    updateReview,
    deleteReview,
  }
}

// ============================================================================
// src/composables/useCategories.js - ✅ Complete implementation
// ============================================================================
export function useCategories() {
  const api = useApi()
  const categories = ref([])

  /**
   * Fetch all product categories
   * @returns {Promise<array>} List of categories
   */
  const getCategories = async () => {
    try {
      const response = await api.get('/categories')
      const data = response.data || response
      categories.value = Array.isArray(data) ? data : data.data || []
      return categories.value
    } catch (err) {
      console.error('Error loading categories:', err)
      throw err
    }
  }

  /**
   * Fetch single category
   * @param {number} id - Category ID
   * @returns {Promise<object>} Category data
   */
  const getCategory = async (id) => {
    try {
      const response = await api.get(`/categories/${id}`)
      return response.data || response
    } catch (err) {
      console.error('Error loading category:', err)
      throw err
    }
  }

  return {
    categories,
    loading: computed(() => api.loading.value),
    error: computed(() => api.error.value),
    getCategories,
    getCategory,
  }
}

// ============================================================================
// src/composables/useOrders.js - ✅ Complete implementation
// ============================================================================
export function useOrders() {
  const api = useApi()
  const orders = ref([])
  const order = ref(null)
  const pagination = ref({ total: 0, perPage: 10, currentPage: 1 })

  /**
   * Fetch user's orders list
   * @param {object} filters - Filter options (page, per_page, status, etc.)
   * @returns {Promise<array>} Orders list
   */
  const getOrders = async (filters = {}) => {
    try {
      const params = new URLSearchParams()
      if (filters.page) params.append('page', filters.page)
      if (filters.per_page) params.append('per_page', filters.per_page)
      if (filters.status) params.append('status', filters.status)

      const response = await api.get(`/orders?${params.toString()}`)
      const data = response.data || response

      orders.value = Array.isArray(data) ? data : data.data || []
      if (data.total) {
        pagination.value = {
          total: data.total || 0,
          perPage: data.per_page || 10,
          currentPage: data.current_page || 1,
          lastPage: data.last_page || 1,
        }
      }

      return orders.value
    } catch (err) {
      console.error('Error loading orders:', err)
      throw err
    }
  }

  /**
   * Fetch single order details
   * @param {number} orderId - Order ID
   * @returns {Promise<object>} Order data
   */
  const getOrder = async (orderId) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      order.value = response.data || response
      return order.value
    } catch (err) {
      console.error('Error loading order:', err)
      throw err
    }
  }

  /**
   * Create new order from cart
   * @param {object} data - Order data { items, shipping_address, payment_method }
   * @returns {Promise<object>} Created order
   */
  const createOrder = async (data) => {
    try {
      const response = await api.post('/orders', {
        items: data.items,
        shipping_address: data.shipping_address,
        payment_method: data.payment_method,
        notes: data.notes,
      })
      return response
    } catch (err) {
      console.error('Error creating order:', err)
      throw err
    }
  }

  /**
   * Cancel order
   * @param {number} orderId - Order ID
   * @returns {Promise<object>} Response
   */
  const cancelOrder = async (orderId) => {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`, {})
      return response
    } catch (err) {
      console.error('Error canceling order:', err)
      throw err
    }
  }

  /**
   * Update order status (admin only typically)
   * @param {number} orderId - Order ID
   * @param {string} status - New status
   * @returns {Promise<object>} Response
   */
  const updateOrderStatus = async (orderId, status) => {
    try {
      const response = await api.patch(`/orders/${orderId}`, { status })
      return response
    } catch (err) {
      console.error('Error updating order:', err)
      throw err
    }
  }

  return {
    orders,
    order,
    pagination,
    loading: computed(() => api.loading.value),
    error: computed(() => api.error.value),
    getOrders,
    getOrder,
    createOrder,
    cancelOrder,
    updateOrderStatus,
  }
}
