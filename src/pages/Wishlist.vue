<template>
  <main class="wishlist-page">
    <section class="wishlist-shell">
      <div class="wishlist-hero">
        <div>
          <p class="eyebrow">Saved Items</p>
          <h1 class="page-title">Your Wishlist</h1>
          <p class="subtitle">Keep track of the fresh produce you love and want to pick next.</p>
        </div>
        <router-link to="/products" class="btn-shop">Browse Products</router-link>
      </div>

      <div v-if="wishlistLoading" class="state-box">
        <div class="spinner"></div>
        <p>Loading your saved items...</p>
      </div>

      <div v-else-if="wishlistError" class="state-box error">
        <p>Unable to load wishlist right now. Please try again.</p>
      </div>

      <div v-else-if="wishlistItems.length === 0" class="state-box empty">
        <div class="empty-icon">♡</div>
        <h3>Your wishlist is empty</h3>
        <p>Explore our fresh harvest and save items you want to keep track of.</p>
        <router-link to="/products" class="btn-shop-empty">Explore Shop</router-link>
      </div>

      <div v-else class="wishlist-grid">
        <article v-for="item in wishlistItems" :key="item.id || item.product_id" class="wishlist-card">
          <div class="card-image-wrapper">
            <img
              v-if="item.image"
              :src="imageUrl(item.image)"
              :alt="item.name"
              class="product-image"
              loading="lazy"
            />
            <div v-else class="image-placeholder">Fresh pick</div>
            <button @click="handleRemoveFromWishlist(item.id)" class="btn-remove-icon" title="Remove from wishlist">
              ✕
            </button>
          </div>

          <div class="card-content">
            <div class="meta-row">
              <span v-if="item.category" class="product-category">{{ item.category }}</span>
            </div>
            <h3 class="product-name">{{ item.name }}</h3>
            
            <div class="price-row">
              <span class="product-price">${{ formatMoney(item.price) }}</span>
            </div>

            <div class="card-actions">
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
            </div>
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

    // Show a subtle confirmation toast instead of a harsh popup modal
    const Toast = Swal.mixin({
      toast: true,
      position: 'top-end',
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
    })
    Toast.fire({
      icon: 'success',
      title: `${item.name} added to cart`,
    })
  } catch (err) {
    console.error('Failed to add to cart:', err)
  }
}
</script>

<style scoped>
.wishlist-page {
  min-height: 100vh;
  padding: 60px 24px 100px;
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.12), transparent 30%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 28%),
    linear-gradient(180deg, #fffdf8 0%, #f6fff5 100%);
}

.wishlist-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.wishlist-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 40px;
}

.eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.page-title {
  margin: 0 0 8px;
  color: #112d19;
  font-size: clamp(2.2rem, 5vw, 3.8rem);
  letter-spacing: -0.04em;
  font-weight: 800;
}

.subtitle {
  color: #55755b;
  font-size: 1.05rem;
  max-width: 60ch;
  margin: 0;
}

.btn-shop {
  text-decoration: none;
  border-radius: 999px;
  padding: 14px 28px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
  box-shadow: 0 10px 25px rgba(239, 68, 68, 0.2);
  transition: all 0.25s ease;
}

.btn-shop:hover {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(239, 68, 68, 0.3);
}

.state-box {
  padding: 60px 40px;
  text-align: center;
  border-radius: 32px;
  background: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 20px 60px rgba(24, 48, 28, 0.05);
  backdrop-filter: blur(20px);
}

.state-box.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.empty-icon {
  font-size: 4rem;
  color: #22c55e;
  opacity: 0.7;
  margin-bottom: 16px;
}

.state-box h3 {
  color: #112d19;
  font-size: 1.6rem;
  font-weight: 700;
  margin-bottom: 8px;
}

.state-box p {
  color: #55755b;
  margin-bottom: 24px;
}

.btn-shop-empty {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 24px;
  font-weight: 700;
  color: #fff;
  background: #22c55e;
  transition: background-color 0.2s ease;
}

.btn-shop-empty:hover {
  background-color: #16a34a;
}

.wishlist-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 28px;
}

.wishlist-card {
  border-radius: 28px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.06);
  box-shadow: 0 16px 45px rgba(24, 48, 28, 0.05);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.3s ease;
}

.wishlist-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 25px 60px rgba(24, 48, 28, 0.12);
}

.card-image-wrapper {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: linear-gradient(135deg, #dcfce7 0%, #fed7aa 100%);
}

.product-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.wishlist-card:hover .product-image {
  transform: scale(1.08);
}

.image-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #55755b;
  font-weight: 700;
}

.btn-remove-icon {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: rgba(255, 255, 255, 0.9);
  color: #ef4444;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.btn-remove-icon:hover {
  background: #ef4444;
  color: #fff;
  transform: scale(1.1);
}

.card-content {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}

.meta-row {
  margin-bottom: 6px;
}

.product-category {
  color: #f97316;
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.product-name {
  margin: 0 0 10px;
  color: #112d19;
  font-size: 1.25rem;
  font-weight: 700;
}

.price-row {
  margin-bottom: 18px;
}

.product-price {
  color: #112d19;
  font-weight: 800;
  font-size: 1.35rem;
}

.card-actions {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 10px;
  margin-top: auto;
}

.btn-view,
.btn-add-cart {
  border-radius: 16px;
  padding: 12px 10px;
  font-weight: 700;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-view {
  background: #f1f5f9;
  color: #475569;
}

.btn-view:hover {
  background: #e2e8f0;
  color: #0f172a;
}

.btn-add-cart {
  background: #22c55e;
  color: #fff;
}

.btn-add-cart:hover {
  background-color: #16a34a;
}

@media (max-width: 768px) {
  .wishlist-hero {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
