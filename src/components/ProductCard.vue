<template>
  <div class="product-card">
    <div class="product-image-wrapper">
      <router-link :to="`/products/${product.id}`" class="product-image-link">
        <img
          v-if="product.image"
          :src="product.image"
          :alt="product.name"
          class="product-image"
        />
        <div v-else class="image-placeholder">
          <i class="icon-image"></i>
        </div>
      </router-link>

      <!-- Badge -->
      <div v-if="product.discount" class="badge badge-discount">
        -{{ product.discount }}%
      </div>

      <!-- Wishlist Button -->
      <button
        @click="toggleWishlist"
        class="btn-wishlist"
        :class="{ active: isWishlisted }"
        aria-label="Add to wishlist"
      >
        <i :class="isWishlisted ? 'icon-heart-filled' : 'icon-heart'"></i>
      </button>
    </div>

    <!-- Product Info -->
    <div class="product-info">
      <div class="product-category">
        {{ product.category?.name || 'Uncategorized' }}
      </div>

      <router-link :to="`/products/${product.id}`" class="product-name">
        {{ product.name }}
      </router-link>

      <p class="product-description">
        {{ truncateText(product.description, 60) }}
      </p>

      <!-- Rating -->
      <div v-if="product.rating" class="product-rating">
        <div class="stars">
          <span
            v-for="i in 5"
            :key="i"
            class="star"
            :class="{ filled: i <= Math.round(product.rating) }"
          >
            ★
          </span>
        </div>
        <span class="rating-number">{{ product.rating.toFixed(1) }}</span>
        <span class="review-count">({{ product.reviews_count || 0 }})</span>
      </div>

      <!-- Price -->
      <div class="product-price">
        <span class="current-price">${{ product.price.toFixed(2) }}</span>
        <span v-if="product.original_price" class="original-price">
          ${{ product.original_price.toFixed(2) }}
        </span>
      </div>

      <!-- Action Buttons -->
      <div class="product-actions">
        <button
          @click="addToCart"
          class="btn btn-add-cart"
          :disabled="addingToCart"
        >
          <span v-if="!addingToCart">
            <i class="icon-cart"></i>
            Add Cart
          </span>
          <span v-else>Adding...</span>
        </button>
        <router-link :to="`/products/${product.id}`" class="btn btn-view">
          <i class="icon-eye"></i>
          View
        </router-link>
      </div>
    </div>

    <!-- Stock Status -->
    <div v-if="stockStatus" class="stock-badge" :class="stockStatus.class">
      {{ stockStatus.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCart } from '@/composables/useCart'
import { useWishlist } from '@/composables/useWishlist'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  product: {
    type: Object,
    required: true,
    default: () => ({
      id: null,
      name: 'Product Name',
      price: 0,
      description: '',
      image: null,
      rating: 0,
      reviews_count: 0,
      stock: 0,
    })
  }
})

const { addItem: addToCart_fn } = useCart()
const { addToWishlist, removeFromWishlist } = useWishlist()
const authStore = useAuthStore()
const router = useRouter()

const addingToCart = ref(false)
const isWishlisted = ref(false)

// Computed Properties
const stockStatus = computed(() => {
  if (props.product.stock > 10) {
    return { text: 'In Stock', class: 'in-stock' }
  } else if (props.product.stock > 0) {
    return { text: 'Limited Stock', class: 'limited-stock' }
  } else {
    return { text: 'Out of Stock', class: 'out-of-stock' }
  }
})

const discountPercentage = computed(() => {
  if (!props.product.original_price) return 0
  const discount = ((props.product.original_price - props.product.price) / props.product.original_price) * 100
  return Math.round(discount)
})

// Methods
const truncateText = (text, length) => {
  if (!text) return ''
  return text.length > length ? text.substring(0, length) + '...' : text
}

const addToCart = async () => {
  addingToCart.value = true
  try {
    await addToCart_fn(props.product, 1)
  } catch (error) {
    console.error('Failed to add to cart:', error)
  } finally {
    addingToCart.value = false
  }
}

const toggleWishlist = async () => {
  try {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'Login', query: { redirect: '/products' } })
      return
    }
    if (isWishlisted.value) {
      await removeFromWishlist(props.product.id)
      isWishlisted.value = false
    } else {
      await addToWishlist(props.product.id)
      isWishlisted.value = true
    }
  } catch (error) {
    console.error('Failed to toggle wishlist:', error)
  }
}
</script>

<style scoped>
.product-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  border: 1px solid #f0f0f0;
  position: relative;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.product-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.12);
  border-color: #667eea;
}

/* Product Image */
.product-image-wrapper {
  position: relative;
  width: 100%;
  overflow: hidden;
  background: #f8f9fa;
  aspect-ratio: 1;
}

.product-image-link {
  display: block;
  width: 100%;
  height: 100%;
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-card:hover .product-image {
  transform: scale(1.1);
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e8e8e8 100%);
  color: #999;
  font-size: 3rem;
}

/* Badges */
.badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 700;
  z-index: 2;
}

.badge-discount {
  background: #ff6b6b;
  color: white;
}

/* Wishlist Button */
.btn-wishlist {
  position: absolute;
  bottom: 12px;
  right: 12px;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  color: #999;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-wishlist:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-wishlist.active {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

/* Product Info */
.product-info {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.product-category {
  font-size: 0.75rem;
  font-weight: 700;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
}

.product-name {
  font-size: 1rem;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 6px;
  text-decoration: none;
  transition: color 0.3s ease;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.product-name:hover {
  color: #667eea;
}

.product-description {
  font-size: 0.85rem;
  color: #999;
  margin: 6px 0 12px;
  line-height: 1.4;
}

/* Rating */
.product-rating {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.stars {
  display: flex;
  gap: 2px;
}

.star {
  font-size: 0.9rem;
  color: #ddd;
  transition: color 0.3s ease;
}

.star.filled {
  color: #f57c00;
}

.rating-number {
  font-weight: 600;
  color: #1a1a1a;
  font-size: 0.9rem;
}

.review-count {
  font-size: 0.8rem;
  color: #999;
}

/* Price */
.product-price {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.current-price {
  font-size: 1.4rem;
  font-weight: 700;
  color: #667eea;
}

.original-price {
  font-size: 0.9rem;
  color: #999;
  text-decoration: line-through;
}

/* Action Buttons */
.product-actions {
  display: flex;
  gap: 8px;
  margin-top: auto;
}

.btn {
  flex: 1;
  padding: 10px 12px;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  white-space: nowrap;
}

.btn-add-cart {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
}

.btn-add-cart:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(102, 126, 234, 0.3);
}

.btn-add-cart:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-view {
  background: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
}

.btn-view:hover {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

/* Stock Status Badge */
.stock-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 6px;
  text-align: center;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  color: white;
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.in-stock {
  background: #4caf50;
}

.limited-stock {
  background: #ff9800;
}

.out-of-stock {
  background: #999;
}

/* Responsive */
@media (max-width: 768px) {
  .product-card {
    border-radius: 8px;
  }

  .product-info {
    padding: 12px;
  }

  .product-name {
    font-size: 0.95rem;
  }

  .product-description {
    font-size: 0.8rem;
  }

  .btn {
    padding: 8px 10px;
    font-size: 0.85rem;
  }
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
  .product-card {
    background: #1a1a1a;
    border-color: #333;
  }

  .product-card:hover {
    border-color: #667eea;
  }

  .product-image-wrapper {
    background: #2a2a2a;
  }

  .image-placeholder {
    background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  }

  .product-name {
    color: #fff;
  }

  .product-description {
    color: #999;
  }

  .product-category {
    color: #8ba3ff;
  }

  .btn-view {
    background: #2a2a2a;
    color: #fff;
    border-color: #444;
  }

  .btn-view:hover {
    background: #667eea;
    border-color: #667eea;
  }

  .btn-wishlist {
    background: #2a2a2a;
    border-color: #444;
  }
}
</style>
