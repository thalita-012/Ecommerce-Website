import { ref } from 'vue'
import { useApi } from './useApi'

export function useReviews() {
  const { get, post, put, delete: delete_ } = useApi()
  const reviews = ref([])
  const loading = ref(false)
  const error = ref(null)

  const fetchProductReviews = async (productId) => {
    loading.value = true
    error.value = null
    try {
      const response = await get(`/products/${productId}/reviews`)
      reviews.value = response.data || response
      return reviews.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const createReview = async (productId, reviewData) => {
    error.value = null
    try {
      const response = await post(`/products/${productId}/reviews`, reviewData)
      const newReview = response.data || response
      reviews.value.push(newReview)
      return newReview
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const updateReview = async (reviewId, reviewData) => {
    error.value = null
    try {
      const response = await put(`/reviews/${reviewId}`, reviewData)
      const updatedReview = response.data || response
      
      // Update local state
      const index = reviews.value.findIndex(r => r.id === reviewId)
      if (index !== -1) {
        reviews.value[index] = updatedReview
      }
      
      return updatedReview
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const deleteReview = async (reviewId) => {
    error.value = null
    try {
      await delete_(`/reviews/${reviewId}`)
      
      // Remove from local state
      reviews.value = reviews.value.filter(r => r.id !== reviewId)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  return {
    reviews,
    loading,
    error,
    fetchProductReviews,
    createReview,
    updateReview,
    deleteReview,
  }
}