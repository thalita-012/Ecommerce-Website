<template>
  <main class="products-page">
    <section class="page-hero">
      <div>
        <p class="eyebrow">Market fresh</p>
        <h1>Vegetables with serious flavor.</h1>
        <p class="subtitle">
          Browse spicy peppers, crisp greens, roots, herbs, and everything you need to make the
          basket feel alive.
        </p>
      </div>
    </section>

    <section class="filters-panel">
      <div class="search-section">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search vegetables..."
          @keyup.enter="handleSearch"
          class="search-input"
        />
        <button @click="handleSearch" class="btn-search">Search</button>
      </div>

      <div class="categories-filter" v-if="categories.length">
        <button
          type="button"
          class="category-btn"
          :class="{ active: selectedCategory === null }"
          @click="selectedCategory = null"
        >
          All
        </button>
        <button
          v-for="cat in categories"
          :key="cat.id"
          type="button"
          @click="selectedCategory = cat.id"
          :class="['category-btn', { active: selectedCategory === cat.id }]"
        >
          {{ cat.name }}
        </button>
      </div>
    </section>

    <div v-if="loading" class="loading-state">Loading fresh produce...</div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadProducts" class="btn-retry">Try Again</button>
    </div>

    <section v-else>
      <div v-if="displayProducts.length === 0" class="empty-state">
        No products found. Try another search or category.
      </div>

      <div v-else class="products-grid">
        <article
          v-for="product in displayProducts"
          :key="product.id"
          class="product-card"
          @click="goToProduct(product.id)"
        >
          <div class="product-image">
            <img
              v-if="product.image"
              :src="imageUrl(product.image)"
              :alt="product.name"
              loading="lazy"
            />
            <div v-else class="image-placeholder">Fresh pick</div>

            <WishlistButton
              class="btn-wishlist"
              :active="isInWishlist(product.id)"
              :loading="wishlistBusyId === String(product.id)"
              :title="isInWishlist(product.id) ? 'Remove from wishlist' : 'Add to wishlist'"
              aria-label="Toggle wishlist"
              @click="toggleWishlist(product.id)"
            />
          </div>

          <div class="product-details">
            <p v-if="product.category?.name" class="product-category">{{ product.category.name }}</p>
            <h3 class="product-name">{{ product.name }}</h3>
            <p class="product-description">{{ product.description }}</p>

            <div class="product-price">
              <span class="current-price">${{ parseFloat(product.price).toFixed(2) }}</span>
              <span v-if="product.original_price" class="original-price">
                ${{ parseFloat(product.original_price).toFixed(2) }}
              </span>
            </div>

            <button @click.stop="handleAddToCart(product)" class="btn-add-cart">
              Add to Cart
            </button>
          </div>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useProducts } from '@/composables/useProducts'
import { useCategories } from '@/composables/useCategories'
import { useWishlist } from '@/composables/useWishlist'
import { useAuthStore } from '@/stores/auth'
import { useCart } from '@/composables/useCart'
import WishlistButton from '@/components/WishlistButton.vue'

const router = useRouter()
const authStore = useAuthStore()
const { products, loading, error, getProducts, searchProducts } = useProducts()
const { categories, fetchCategories } = useCategories()
const { items: wishlistItems, fetchWishlist, addToWishlist, removeFromWishlist } = useWishlist()
const { addItem } = useCart()

const searchQuery = ref('')
const selectedCategory = ref(null)
const wishlistBusyId = ref(null)

const normalizeText = (value) => (value ?? '').toString().trim().toLowerCase()

const categoryMatches = (product, selected) => {
  if (selected == null) return true

  const productCategoryId = product.category?.id ?? product.category_id ?? product.categoryId
  if (productCategoryId != null && String(productCategoryId) === String(selected)) {
    return true
  }

  const productCategoryName = normalizeText(
    product.category?.name ?? product.category_name ?? product.category
  )
  const selectedCategoryName = normalizeText(
    categories.value.find((cat) => String(cat.id) === String(selected))?.name
  )

  return (
    productCategoryName !== '' &&
    selectedCategoryName !== '' &&
    productCategoryName === selectedCategoryName
  )
}

const displayProducts = computed(() => {
  let list = [...products.value]

  if (selectedCategory.value != null) {
    list = list.filter((product) => categoryMatches(product, selectedCategory.value))
  }

  return list
})

const wishlistSet = computed(() => {
  return new Set(
    wishlistItems.value
      .map((item) => item.product_id ?? item.productId ?? item.id)
      .filter((value) => value != null)
      .map((value) => String(value))
  )
})

const imageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http')) return path
  return `${import.meta.env.VITE_STORAGE_URL || 'http://localhost:8000/storage'}/${path}`
}

const loadProducts = async () => {
  await getProducts()
}

const handleSearch = async () => {
  const query = searchQuery.value.trim()
  if (!query) {
    await loadProducts()
    return
  }

  await searchProducts(query)
}

const goToProduct = (productId) => {
  router.push({ name: 'ProductDetail', params: { id: productId } })
}

const isInWishlist = (productId) => wishlistSet.value.has(String(productId))

const wishlistItemIdForProduct = (productId) => {
  const match = wishlistItems.value.find((entry) => {
    const entryProductId = entry.product_id ?? entry.productId ?? entry.id
    return entryProductId != null && String(entryProductId) === String(productId)
  })

  return match?.id ?? null
}

const toggleWishlist = async (productId) => {
  if (wishlistBusyId.value === String(productId)) return
  wishlistBusyId.value = String(productId)
  try {
    if (!authStore.isAuthenticated) {
      router.push({ name: 'Login', query: { redirect: '/products' } })
      return
    }
    if (isInWishlist(productId)) {
      await removeFromWishlist(wishlistItemIdForProduct(productId) ?? productId)
    } else {
      await addToWishlist(productId)
    }
  } catch (err) {
    console.error('Wishlist error:', err)
  } finally {
    wishlistBusyId.value = null
  }
}

const handleAddToCart = (product) => {
  addItem(product)
}

onMounted(async () => {
  const tasks = [loadProducts(), fetchCategories()]
  if (authStore.isAuthenticated) {
    tasks.push(fetchWishlist())
  }
  await Promise.allSettled(tasks)
})
</script>

<style scoped>
.products-page {
  min-height: 100%;
  padding: 40px 24px 72px;
  background:
    radial-gradient(circle at top, rgba(249, 115, 22, 0.12), transparent 28%),
    linear-gradient(180deg, #fffdf8 0%, #f4fff3 100%);
}

.page-hero,
.filters-panel,
.products-grid {
  max-width: 1180px;
  margin: 0 auto;
}

.page-hero {
  margin-bottom: 22px;
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

.page-hero h1 {
  margin: 14px 0 10px;
  font-size: clamp(2.2rem, 5vw, 4.2rem);
  line-height: 0.98;
  letter-spacing: -0.05em;
  color: #17301c;
}

.subtitle {
  max-width: 64ch;
  color: #58705c;
  line-height: 1.75;
  font-size: 1.05rem;
}

.filters-panel {
  display: grid;
  gap: 18px;
  margin-bottom: 28px;
}

.search-section {
  display: flex;
  gap: 12px;
}

.search-input {
  flex: 1;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(23, 48, 28, 0.12);
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.btn-search,
.btn-retry,
.btn-add-cart {
  border: 0;
  border-radius: 14px;
  padding: 14px 18px;
  font-weight: 700;
}

.btn-search,
.btn-add-cart {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.categories-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.category-btn {
  border: 1px solid rgba(23, 48, 28, 0.12);
  background: rgba(255, 255, 255, 0.72);
  color: #35513a;
  padding: 10px 14px;
  border-radius: 999px;
  font-weight: 600;
}

.category-btn.active {
  background: #17301c;
  color: #fff;
}

.loading-state,
.error-state,
.empty-state {
  max-width: 1180px;
  margin: 0 auto;
  padding: 32px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(23, 48, 28, 0.08);
  color: #35513a;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 22px;
}

.product-card {
  overflow: hidden;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 16px 50px rgba(24, 48, 28, 0.08);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.product-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 24px 65px rgba(24, 48, 28, 0.12);
}

.product-image {
  position: relative;
  aspect-ratio: 1 / 1;
  background: linear-gradient(135deg, #dcfce7, #fed7aa);
}

.product-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  display: grid;
  place-items: center;
  height: 100%;
  color: #58705c;
  font-weight: 700;
}

.btn-wishlist {
  position: absolute;
  top: 14px;
  right: 14px;
  width: 42px;
  height: 42px;
  font-size: 1.1rem;
}

.product-details {
  padding: 18px;
}

.product-category {
  margin-bottom: 6px;
  color: #f97316;
  font-size: 0.82rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
}

.product-name {
  margin: 0 0 8px;
  color: #17301c;
  font-size: 1.15rem;
}

.product-description {
  color: #58705c;
  line-height: 1.6;
  font-size: 0.95rem;
  min-height: 3.1em;
}

.product-price {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 16px 0;
}

.current-price {
  color: #17301c;
  font-size: 1.3rem;
  font-weight: 800;
}

.original-price {
  color: #7c8d80;
  text-decoration: line-through;
}

.btn-add-cart {
  width: 100%;
}

@media (max-width: 720px) {
  .search-section {
    flex-direction: column;
  }
}
</style>
