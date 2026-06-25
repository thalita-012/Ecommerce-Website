import { ref, computed } from 'vue'

// Local cart state (you can also sync with API)
const cartItems = ref([])

export function useCart() {
  const loading = ref(false)
  const error = ref(null)

  // Computed properties
  const itemCount = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (item.quantity || 1), 0)
  )

  const subtotal = computed(() =>
    cartItems.value.reduce((sum, item) => sum + (item.price * item.quantity || item.price), 0)
  )

  const tax = computed(() => subtotal.value * 0.1) // Assuming 10% tax

  const total = computed(() => subtotal.value + tax.value)

  // Add item to cart
  const addItem = async (product, quantity = 1) => {
    error.value = null

    try {
      // Check if item already in cart
      const existingItem = cartItems.value.find(item => item.id === product.id)

      if (existingItem) {
        existingItem.quantity += quantity
      } else {
        cartItems.value.push({
          id: product.id,
          product_id: product.id,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
          product, // Store full product object for reference
        })
      }

      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Remove item from cart
  const removeItem = (productId) => {
    cartItems.value = cartItems.value.filter(item => item.id !== productId)
  }

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const item = cartItems.value.find(i => i.id === productId)
    if (item) {
      if (quantity <= 0) {
        removeItem(productId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // Clear entire cart
  const clearCart = () => {
    cartItems.value = []
  }

  // Get cart items
  const getCartItems = () => {
    return cartItems.value
  }

  // Check if item in cart
  const isInCart = (productId) => {
    return cartItems.value.some(item => item.id === productId)
  }

  // Get item from cart
  const getCartItem = (productId) => {
    return cartItems.value.find(item => item.id === productId)
  }

  // Prepare cart for checkout
  const prepareForCheckout = () => {
    return {
      items: cartItems.value.map(item => ({
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
      })),
      subtotal: subtotal.value,
      tax: tax.value,
      total: total.value,
    }
  }

  // Load cart from localStorage
  const loadCart = () => {
    try {
      const saved = localStorage.getItem('cart')
      if (saved) {
        cartItems.value = JSON.parse(saved)
      }
    } catch (err) {
      console.error('Failed to load cart:', err)
    }
  }

  // Save cart to localStorage
  const saveCart = () => {
    try {
      localStorage.setItem('cart', JSON.stringify(cartItems.value))
    } catch (err) {
      console.error('Failed to save cart:', err)
    }
  }

  // Watch for changes and auto-save
  const setupAutoSave = () => {
    // In a real app, you'd use a watcher
    // This is a simple version that saves on demand
    saveCart()
  }

  return {
    items: cartItems,
    itemCount,
    subtotal,
    tax,
    total,
    loading,
    error,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getCartItems,
    isInCart,
    getCartItem,
    prepareForCheckout,
    loadCart,
    saveCart,
    setupAutoSave,
  }
}