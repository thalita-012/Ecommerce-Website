import { ref, computed } from 'vue'

// Local cart state (you can also sync with API)
const cartItems = ref([])
let cartHydrated = false

const normalizeId = (value) => (value == null ? null : String(value))

const readCartFromStorage = () => {
  try {
    if (typeof window === 'undefined') return []

    const saved = localStorage.getItem('cart')
    if (!saved) return []

    const parsed = JSON.parse(saved)
    return Array.isArray(parsed) ? parsed : []
  } catch (err) {
    console.error('Failed to load cart:', err)
    return []
  }
}

const persistCartToStorage = () => {
  try {
    if (typeof window === 'undefined') return
    localStorage.setItem('cart', JSON.stringify(cartItems.value))
  } catch (err) {
    console.error('Failed to save cart:', err)
  }
}

const hydrateCart = () => {
  if (cartHydrated) return
  cartItems.value = readCartFromStorage()
  cartHydrated = true
}

export function useCart() {
  hydrateCart()

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
      const maxStock = Number(product?.stock ?? product?.available_stock ?? Infinity)
      const requestedQuantity = Number(quantity || 1)
      if (Number.isFinite(maxStock) && maxStock >= 0 && requestedQuantity > maxStock) {
        throw new Error('Requested quantity exceeds available stock.')
      }

      // Check if item already in cart
      const productId = normalizeId(product.id ?? product.product_id)
      const existingItem = cartItems.value.find(item => normalizeId(item.id) === productId)

      if (existingItem) {
        const nextQuantity = existingItem.quantity + requestedQuantity
        if (Number.isFinite(maxStock) && maxStock >= 0 && nextQuantity > maxStock) {
          throw new Error('Cart quantity exceeds available stock.')
        }

        existingItem.quantity = nextQuantity
      } else {
        cartItems.value.push({
          id: productId,
          product_id: productId,
          name: product.name,
          price: product.price,
          image: product.image,
          quantity: requestedQuantity,
          stock: Number.isFinite(maxStock) ? maxStock : null,
          product, // Store full product object for reference
        })
      }

      persistCartToStorage()

      return true
    } catch (err) {
      error.value = err.message
      throw err
    }
  }

  // Remove item from cart
  const removeItem = (productId) => {
    const normalizedId = normalizeId(productId)
    cartItems.value = cartItems.value.filter(item => normalizeId(item.id) !== normalizedId)
    persistCartToStorage()
  }

  // Update item quantity
  const updateQuantity = (productId, quantity) => {
    const normalizedId = normalizeId(productId)
    const item = cartItems.value.find(i => normalizeId(i.id) === normalizedId)
    if (item) {
      const maxStock = Number(item.stock ?? item.product?.stock ?? item.product?.available_stock ?? Infinity)
      if (quantity <= 0) {
        removeItem(normalizedId)
      } else if (Number.isFinite(maxStock) && maxStock >= 0 && quantity > maxStock) {
        throw new Error('Cart quantity exceeds available stock.')
      } else {
        item.quantity = quantity
        persistCartToStorage()
      }
    }
  }

  // Clear entire cart
  const clearCart = () => {
    cartItems.value = []
    persistCartToStorage()
  }

  // Get cart items
  const getCartItems = () => {
    return cartItems.value
  }

  // Check if item in cart
  const isInCart = (productId) => {
    const normalizedId = normalizeId(productId)
    return cartItems.value.some(item => normalizeId(item.id) === normalizedId)
  }

  // Get item from cart
  const getCartItem = (productId) => {
    const normalizedId = normalizeId(productId)
    return cartItems.value.find(item => normalizeId(item.id) === normalizedId)
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
    hydrateCart()
    return cartItems.value
  }

  // Save cart to localStorage
  const saveCart = () => {
    persistCartToStorage()
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
