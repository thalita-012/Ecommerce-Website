import { ref } from 'vue'
import { useApi } from './useApi'

export function useWishlist() {
  const { get, post, delete: delete_, getToken } = useApi()
  const items = ref([])
  const loading = ref(false)
  const error = ref(null)

  const normalizeWishlistItem = (item) => {
    const product = item?.product || item?.product_info || item?.details || {}
    return {
      id: item?.id ?? product?.id ?? null,
      product_id: item?.product_id ?? product?.id ?? null,
      name: item?.name ?? product?.name ?? 'Product',
      image: item?.image ?? product?.image ?? product?.image_url ?? '',
      price: item?.price ?? product?.price ?? 0,
      category: item?.category?.name ?? product?.category?.name ?? item?.category_name ?? '',
      created_at: item?.created_at ?? item?.added_at ?? null,
      raw: item,
    }
  }

  const requireAuth = () => {
    if (!getToken()) {
      throw new Error('Please login to use wishlist.')
    }
  }

  const fetchWishlist = async () => {
    loading.value = true
    error.value = null
    try {
      requireAuth()
      const response = await get('/wishlist')
      const list =
        response?.data?.data ||
        response?.data?.wishlist ||
        response?.data ||
        response?.wishlist ||
        response ||
        []
      const array = Array.isArray(list) ? list : []
      items.value = array.map(normalizeWishlistItem)
      return items.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const addToWishlist = async (productId) => {
    error.value = null
    try {
      requireAuth()
      const response = await post('/wishlist', { product_id: productId })
      
      // Add to local state using a small normalized shape
      const newItem = normalizeWishlistItem(response?.data?.wishlist || response?.data || response)
      items.value.push(newItem)
      
      return response
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const removeFromWishlist = async (wishlistId) => {
    error.value = null
    try {
      requireAuth()
      await delete_(`/wishlist/${wishlistId}`)
      
      // Remove from local state
      items.value = items.value.filter(item => item.id !== wishlistId)
      
      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  const isInWishlist = async (productId) => {
    try {
      requireAuth()
      const response = await get(`/wishlist/check/${productId}`)
      return response.exists || response.in_wishlist || false
    } catch (err) {
      return false
    }
  }

  const toggleWishlist = async (productId, wishlistId = null) => {
    if (wishlistId) {
      await removeFromWishlist(wishlistId)
    } else {
      await addToWishlist(productId)
    }
  }

  return {
    items,
    loading,
    error,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    toggleWishlist,
  }
}
