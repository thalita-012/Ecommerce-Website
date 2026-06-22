<template>
  <div class="card h-100">
    <img v-if="product.image" :src="`http://localhost:8000/storage/${product.image}`" class="card-img-top" :alt="product.name" style="height: 250px; object-fit: cover;">
    <img v-else src="https://via.placeholder.com/250" class="card-img-top" :alt="product.name">
    
    <div class="card-body">
      <h5 class="card-title">{{ product.name }}</h5>
      <p class="card-text text-muted">{{ product.description.substring(0, 100) }}...</p>
      <p class="card-text">
        <strong class="text-primary">${{ product.price }}</strong>
        <span v-if="product.stock <= 0" class="badge bg-danger ms-2">Out of Stock</span>
        <span v-else class="badge bg-success ms-2">In Stock</span>
      </p>
    </div>
    <div class="card-footer bg-white">
      <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="btn btn-outline-primary btn-sm w-100">
        View Details
      </router-link>
      <button 
        @click="toggleWishlist" 
        :class="['btn', 'btn-sm', 'w-100', 'mt-2', inWishlist ? 'btn-danger' : 'btn-outline-danger']"
      >
        {{ inWishlist ? '❤️ Remove from Wishlist' : '🤍 Add to Wishlist' }}
      </button>
      <button 
        @click="addToCart"
        :disabled="product.stock <= 0"
        class="btn btn-primary btn-sm w-100 mt-2"
      >
        Add to Cart
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useCart } from '../composables/useCart'
import { useApi } from '../composables/useApi'
import { useAuthStore } from '../stores/auth'

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
})

const { api } = useApi()
const { addToCart } = useCart()
const authStore = useAuthStore()
const inWishlist = ref(false)

const toggleWishlist = async () => {
  if (!authStore.isAuthenticated) {
    alert('Please login first')
    return
  }

  try {
    if (inWishlist.value) {
      // Remove from wishlist (need to store wishlist id)
      // This requires fetching the wishlist item first
      const wishlist = await api.get('/wishlist')
      const item = wishlist.data.data.find(w => w.product_id === props.product.id)
      if (item) {
        await api.delete(`/wishlist/${item.id}`)
      }
    } else {
      // Add to wishlist
      await api.post('/wishlist', { product_id: props.product.id })
    }
    inWishlist.value = !inWishlist.value
  } catch (error) {
    console.error('Error updating wishlist:', error)
  }
}

const checkWishlist = async () => {
  if (!authStore.isAuthenticated) return

  try {
    const response = await api.get(`/wishlist/check/${props.product.id}`)
    inWishlist.value = response.data.in_wishlist
  } catch (error) {
    console.error('Error checking wishlist:', error)
  }
}

onMounted(() => {
  checkWishlist()
})
</script>