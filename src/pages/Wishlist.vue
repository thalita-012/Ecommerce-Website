<template>
  <main class="wishlist-page">
    <section class="wishlist-shell">
      <h1>Wishlist</h1>

      <div v-if="wishlistLoading" class="state-box">Loading your wishlist...</div>

      <div v-else-if="wishlistError" class="state-box error">
        {{ wishlistError }}
      </div>

      <div v-else-if="wishlistItems.length === 0" class="state-box">
        Your wishlist is empty.
      </div>

      <div v-else class="wishlist-items">
        <article v-for="item in wishlistItems" :key="item.id" class="wishlist-item">
          <img
            v-if="item.product?.image"
            :src="imageUrl(item.product.image)"
            :alt="item.product.name"
            class="product-image"
          />

          <div class="product-info">
            <h3>{{ item.product?.name }}</h3>
            <p class="description">{{ item.product?.description }}</p>

            <div class="price">
              <span class="current">${{ item.product?.price }}</span>
              <span v-if="item.product?.original_price" class="original">
                ${{ item.product.original_price }}
              </span>
            </div>
          </div>

          <div class="actions">
            <button @click="handleAddToCart(item.product)" class="btn-add-cart">
              Add to Cart
            </button>
            <button @click="handleRemoveFromWishlist(item.id)" class="btn-remove">
              Remove
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import { useWishlist } from '@/composables/useWishlist'
import { useCart } from '@/composables/useCart'

const { items: wishlistItems, loading: wishlistLoading, error: wishlistError, fetchWishlist, removeFromWishlist } = useWishlist()
const { addItem: addToCart } = useCart()

const imageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${path}`
}

onMounted(async () => {
  try {
    await fetchWishlist()
  } catch (err) {
    console.error('Failed to load wishlist:', err)
  }
})

const handleRemoveFromWishlist = async (wishlistId) => {
  try {
    await removeFromWishlist(wishlistId)
  } catch (err) {
    console.error('Failed to remove from wishlist:', err)
  }
}

const handleAddToCart = async (product) => {
  try {
    await addToCart(product)
  } catch (err) {
    console.error('Failed to add to cart:', err)
  }
}
</script>

<style scoped>
.wishlist-page {
  min-height: 100%;
  padding: 40px 24px 72px;
}

.wishlist-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.wishlist-shell h1 {
  margin-bottom: 20px;
}

.state-box {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.08);
}

.state-box.error {
  color: #b91c1c;
}

.wishlist-items {
  display: grid;
  gap: 18px;
}

.wishlist-item {
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 18px;
  padding: 18px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(23, 48, 28, 0.08);
}

.product-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 18px;
}

.description {
  color: #58705c;
}

.actions {
  display: grid;
  gap: 10px;
}

.btn-add-cart,
.btn-remove {
  border: 0;
  border-radius: 14px;
  padding: 12px 16px;
  font-weight: 700;
}

.btn-add-cart {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.btn-remove {
  background: rgba(23, 48, 28, 0.08);
  color: #17301c;
}

@media (max-width: 768px) {
  .wishlist-item {
    grid-template-columns: 1fr;
  }
}
</style>
