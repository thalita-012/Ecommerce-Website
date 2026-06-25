import { ref } from 'vue'
import { useApi } from './useApi'

export function useCategories() {
  const { get } = useApi()
  const categories = ref([])
  const category = ref(null)
  const loading = ref(false)
  const error = ref(null)

  const fetchCategories = async () => {
    loading.value = true
    error.value = null
    try {
      const response = await get('/categories')
      categories.value = response.data || response
      return categories.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  const fetchCategory = async (categoryId) => {
    loading.value = true
    error.value = null
    try {
      const response = await get(`/categories/${categoryId}`)
      category.value = response.data || response
      return category.value
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    categories,
    category,
    loading,
    error,
    fetchCategories,
    fetchCategory,
  }
}