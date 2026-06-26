<template>
  <main class="wishlist-page">
    <section class="wishlist-shell">
      <div class="wishlist-hero">
        <div>
          <p class="eyebrow">Saved items</p>
          <h1>Your wishlist</h1>
        </div>
        <router-link to="/products" class="btn-shop">Browse products</router-link>
      </div>

      <div v-if="wishlistLoading" class="state-box">Loading your wishlist...</div>

      <div v-else-if="wishlistError" class="state-box">
        Unable to load wishlist right now.
      </div>

      <div v-else-if="wishlistItems.length === 0" class="state-box">
        Your wishlist is empty.
      </div>

      <div v-else class="wishlist-items">
        <article v-for="item in wishlistItems" :key="item.id || item.product_id" class="wishlist-item">
          <div class="product-image-wrap">
            <img
              v-if="item.image"
              :src="imageUrl(item.image)"
              :alt="item.name"
              class="product-image"
            />
            <div v-else class="image-placeholder">No image</div>
          </div>

          <div class="product-info">
            <div class="meta-row">
              <span class="badge">Wishlist</span>
              <span v-if="item.category" class="category">{{ item.category }}</span>
            </div>
            <h3>{{ item.name }}</h3>
            <p class="description">
              Basic product summary only. Open the product page for full details.
            </p>

            <div class="price">
              <span class="current">${{ formatMoney(item.price) }}</span>
            </div>
          </div>

          <div class="actions">
            <router-link
              v-if="item.product_id"
              :to="{ name: 'ProductDetail', params: { id: item.product_id } }"
              class="btn-view"
            >
              View
            </router-link>
            <button @click="handleAddToCart(item)" class="btn-add-cart">
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
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import { useWishlist } from '@/composables/useWishlist'
import { useCart } from '@/composables/useCart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()
const {
  items: wishlistItems,
  loading: wishlistLoading,
  error: wishlistError,
  fetchWishlist,
  removeFromWishlist,
} = useWishlist()
const { addItem: addToCart } = useCart()

const imageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${path}`
}

const formatMoney = (value) => {
  const amount = Number.parseFloat(value || 0)
  return amount.toFixed(2)
}

onMounted(async () => {
  if (!authStore.isAuthenticated) {
    await Swal.fire({
      icon: 'info',
      title: 'Login required',
      text: 'Please login to view and manage your wishlist.',
      confirmButtonColor: '#ef4444',
    })
    router.push({ name: 'Login', query: { redirect: '/wishlist' } })
    return
  }

  try {
    await fetchWishlist()
  } catch (err) {
    console.error('Failed to load wishlist:', err)
  }
})

const handleRemoveFromWishlist = async (wishlistId) => {
  const confirmResult = await Swal.fire({
    icon: 'warning',
    title: 'Remove item?',
    text: 'This item will be removed from your wishlist.',
    showCancelButton: true,
    confirmButtonText: 'Remove',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
  })

  if (!confirmResult.isConfirmed) return

  try {
    await removeFromWishlist(wishlistId)
    await Swal.fire({
      icon: 'success',
      title: 'Removed',
      text: 'Item removed from wishlist.',
      confirmButtonColor: '#ef4444',
    })
  } catch (err) {
    console.error('Failed to remove from wishlist:', err)
  }
}

const handleAddToCart = async (item) => {
  try {
    if (!item?.product_id && !item?.id) {
      throw new Error('Missing product data')
    }

    addToCart({
      id: item.product_id || item.id,
      product_id: item.product_id || item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      quantity: 1,
    })

    await Swal.fire({
      icon: 'success',
      title: 'Added to cart',
      text: `${item?.name || 'Item'} moved to your cart.`,
      confirmButtonColor: '#ef4444',
    })
  } catch (err) {
    console.error('Failed to add to cart:', err)
  }
}
</script>

<style scoped>
.wishlist-page {
  min-height: 100%;
  padding: 32px 24px 72px;
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 26%),
    linear-gradient(180deg, #fffdf7 0%, #f5fff2 100%);
}

.wishlist-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.wishlist-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #25603a;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.wishlist-hero h1 {
  margin: 0;
  color: #17301c;
  font-size: clamp(2rem, 4vw, 3.5rem);
  letter-spacing: -0.04em;
}

.lead {
  margin: 10px 0 0;
  max-width: 68ch;
  color: #58705c;
  line-height: 1.7;
}

.btn-shop,
.btn-view,
.btn-add-cart,
.btn-remove {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}

.btn-shop {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
  box-shadow: 0 14px 28px rgba(249, 115, 22, 0.2);
}

.state-box {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 18px 50px rgba(24, 48, 28, 0.08);
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
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 18px 50px rgba(24, 48, 28, 0.08);
  backdrop-filter: blur(12px);
}

.product-image-wrap {
  width: 120px;
  height: 120px;
  border-radius: 18px;
  overflow: hidden;
  background: rgba(23, 48, 28, 0.06);
}

.product-image,
.image-placeholder {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #7c8d80;
  font-weight: 700;
}

.product-info h3 {
  margin: 10px 0 8px;
  color: #17301c;
  font-size: 1.2rem;
}

.meta-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.category {
  color: #58705c;
  font-weight: 700;
}

.description {
  color: #58705c;
  margin: 0 0 12px;
}

.current {
  color: #17301c;
  font-weight: 800;
  font-size: 1.15rem;
}

.actions {
  display: grid;
  gap: 10px;
  min-width: 150px;
}

.btn-view {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #17301c;
  background: rgba(23, 48, 28, 0.08);
}

.btn-add-cart,
.btn-remove {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.btn-remove {
  background: rgba(23, 48, 28, 0.08);
  color: #17301c;
}

@media (max-width: 768px) {
  .wishlist-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .wishlist-item {
    grid-template-columns: 1fr;
  }

  .product-image-wrap {
    width: 100%;
    height: 220px;
  }

  .actions {
    min-width: 0;
  }
}

@media (max-width: 480px) {
  .wishlist-page {
    padding: 20px 14px 56px;
  }
}
</style>
