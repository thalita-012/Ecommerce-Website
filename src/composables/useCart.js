import { ref, computed } from 'vue'

const items = ref([])

export function useCart() {
  const addToCart = (product) => {
    items.value.push(product)
  }

  const removeFromCart = (id) => {
    items.value = items.value.filter(item => item.id !== id)
  }

  const totalItems = computed(() => items.value.length)

  return {
    items,
    addToCart,
    removeFromCart,
    totalItems
  }
}