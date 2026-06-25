<template>
  <div class="product-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading">
      <div class="spinner-border" role="status"></div>
      <p>Loading product...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error">
      <p><strong>Error:</strong> {{ error }}</p>
      <button @click="loadProduct" class="btn-retry">
        Try Again
      </button>
    </div>

    <!-- Product Detail -->
    <div v-else-if="product" class="product-container">
      <div class="breadcrumb">
        <router-link to="/">Home</router-link>
        <span>/</span>
        <router-link to="/products">Products</router-link>
        <span>/</span>
        <span>{{ product.name }}</span>
      </div>

      <div class="product-main">
        <!-- Product Image -->
        <div class="product-image-section">
          <div class="product-image">
            <img 
              v-if="product.image" 
              :src="`http://localhost:8000/storage/${product.image}`" 
              :alt="product.name"
              class="main-image"
            />
            <div v-else class="image-placeholder">
              No Image Available
            </div>

            <!-- Wishlist Button -->
            <button 
              @click="toggleWishlist" 
              class="btn-wishlist-large"
              :class="{ wishlisted: isInWishlist }"
              :title="isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'"
            >
              ♡
            </button>
          </div>

          <!-- Stock Status -->
          <div class="stock-status" :class="{ 'in-stock': product.stock > 0, 'out-of-stock': product.stock === 0 }">
            <span v-if="product.stock > 0" class="badge badge-success">
              In Stock ({{ product.stock }} available)
            </span>
            <span v-else class="badge badge-danger">
              Out of Stock
            </span>
          </div>
        </div>

        <!-- Product Info -->
        <div class="product-info">
          <!-- Category -->
          <div v-if="product.category" class="product-category">
            <small>{{ product.category.name }}</small>
          </div>

          <!-- Title -->
          <h1 class="product-title">{{ product.name }}</h1>

          <!-- Rating -->
          <div v-if="product.rating" class="product-rating">
            <div class="stars">
              <span class="rating-stars">★</span>
              {{ product.rating }}
              <span class="review-count">({{ product.reviews_count }} reviews)</span>
            </div>
          </div>

          <!-- Price -->
          <div class="product-price">
            <span class="current-price">${{ parseFloat(product.price).toFixed(2) }}</span>
            <span v-if="product.original_price" class="original-price">
              ${{ parseFloat(product.original_price).toFixed(2) }}
            </span>
          </div>

          <!-- Description -->
          <div class="product-description">
            <h3>Description</h3>
            <p>{{ product.description }}</p>
          </div>

          <!-- Add to Cart Section -->
          <div class="add-to-cart-section">
            <div class="quantity-selector">
              <label>Quantity:</label>
              <div class="quantity-input">
                <button @click="decrementQuantity" class="btn-qty">−</button>
                <input v-model.number="quantity" type="number" min="1" :max="product.stock" />
                <button @click="incrementQuantity" class="btn-qty">+</button>
              </div>
            </div>

            <button 
              @click="handleAddToCart" 
              class="btn-add-to-cart"
              :disabled="product.stock === 0 || isAddingToCart"
            >
              <span v-if="isAddingToCart" class="spinner-small"></span>
              {{ isAddingToCart ? 'Adding...' : 'Add to Cart' }}
            </button>
          </div>

          <!-- Product Meta -->
          <div class="product-meta">
            <div class="meta-item">
              <strong>SKU:</strong> {{ product.id }}
            </div>
            <div class="meta-item">
              <strong>Category:</strong> 
              <span v-if="product.category">{{ product.category.name }}</span>
              <span v-else>N/A</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Reviews Section -->
      <div class="reviews-section">
        <h2>Customer Reviews</h2>

        <!-- Add Review Form (if authenticated) -->
        <div v-if="isAuthenticated" class="add-review-form">
          <h3>Write a Review</h3>
          <form @submit.prevent="submitReview">
            <div class="form-group">
              <label>Rating</label>
              <div class="rating-input">
                <button 
                  v-for="star in 5" 
                  :key="star"
                  type="button"
                  @click="newReview.rating = star"
                  class="star-btn"
                  :class="{ active: newReview.rating >= star }"
                >
                  ★
                </button>
              </div>
            </div>

            <div class="form-group">
              <label>Review Title</label>
              <input 
                v-model="newReview.title" 
                type="text" 
                placeholder="Review title..."
                class="form-input"
                required
              />
            </div>

            <div class="form-group">
              <label>Review Text</label>
              <textarea 
                v-model="newReview.text" 
                placeholder="Share your experience..."
                class="form-textarea"
                rows="4"
                required
              ></textarea>
            </div>

            <button 
              type="submit" 
              class="btn-submit-review"
              :disabled="isSubmittingReview"
            >
              {{ isSubmittingReview ? 'Submitting...' : 'Submit Review' }}
            </button>
          </form>
        </div>

        <!-- Reviews List -->
        <div v-if="reviews.length > 0" class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-card">
            <div class="review-header">
              <div class="reviewer-info">
                <strong>{{ review.user?.name || 'Anonymous' }}</strong>
                <span class="review-date">{{ formatDate(review.created_at) }}</span>
              </div>
              <div class="review-rating">
                <span class="stars">★</span> {{ review.rating }}/5
              </div>
            </div>

            <h4 class="review-title">{{ review.title }}</h4>
            <p class="review-text">{{ review.text }}</p>

            <!-- Edit/Delete Options (for own reviews) -->
            <div v-if="canEditReview(review)" class="review-actions">
              <button @click="editReview(review)" class="btn-edit">Edit</button>
              <button @click="deleteReview(review.id)" class="btn-delete">Delete</button>
            </div>
          </div>
        </div>

        <!-- No Reviews -->
        <div v-else class="no-reviews">
          <p>No reviews yet. Be the first to review this product!</p>
        </div>
      </div>
    </div>

    <!-- Product Not Found -->
    <div v-else class="not-found">
      <h2>Product Not Found</h2>
      <p>The product you're looking for doesn't exist.</p>
      <router-link to="/products" class="btn-back">
        Back to Products
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import Swal from 'sweetalert2'
import { useProducts } from '@/composables/useProducts'
import { useCart } from '@/composables/useCart'
import { useWishlist } from '@/composables/useWishlist'
import { useReviews } from '@/composables/useReviews'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// Composables
const { product, loading, error, getProduct } = useProducts()
const { addItem } = useCart()
const { addToWishlist, removeFromWishlist, isInWishlist: checkWishlist } = useWishlist()
const { reviews, fetchProductReviews, createReview, updateReview, deleteReview: deleteReviewApi } = useReviews()

// State
const quantity = ref(1)
const isAddingToCart = ref(false)
const isSubmittingReview = ref(false)
const isInWishlist = ref(false)

const newReview = ref({
  rating: 5,
  title: '',
  text: '',
})

const isAuthenticated = computed(() => authStore.isAuthenticated)

// Lifecycle
onMounted(async () => {
  const productId = route.params.id
  await loadProduct()
  await loadReviews()
})

// Methods
const loadProduct = async () => {
  try {
    const productId = route.params.id
    await getProduct(productId)
    
    // Check if in wishlist
    if (product.value && isAuthenticated.value) {
      isInWishlist.value = await checkWishlist(product.value.id)
    }
  } catch (err) {
    console.error('Failed to load product:', err)
  }
}

const loadReviews = async () => {
  try {
    const productId = route.params.id
    await fetchProductReviews(productId)
  } catch (err) {
    console.error('Failed to load reviews:', err)
  }
}

const incrementQuantity = () => {
  if (quantity.value < product.value.stock) {
    quantity.value++
  }
}

const decrementQuantity = () => {
  if (quantity.value > 1) {
    quantity.value--
  }
}

const handleAddToCart = async () => {
  try {
    isAddingToCart.value = true
    
    addItem({
      id: product.value.id,
      product_id: product.value.id,
      name: product.value.name,
      price: product.value.price,
      image: product.value.image,
      quantity: quantity.value,
    })

    await Swal.fire({
      icon: 'success',
      title: 'Added to cart',
      text: `Added ${quantity.value} item(s) to cart!`,
      confirmButtonColor: '#ef4444',
    })
    quantity.value = 1
  } catch (err) {
    console.error('Add to cart error:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Add to cart failed',
      text: 'Failed to add to cart',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    isAddingToCart.value = false
  }
}

const toggleWishlist = async () => {
  try {
    if (!isAuthenticated.value) {
      router.push({ name: 'Login', query: { redirect: route.fullPath } })
      return
    }
    if (isInWishlist.value) {
      await removeFromWishlist(product.value.id)
      isInWishlist.value = false
    } else {
      await addToWishlist(product.value.id)
      isInWishlist.value = true
    }
  } catch (err) {
    console.error('Wishlist error:', err)
  }
}

const submitReview = async () => {
  try {
    isSubmittingReview.value = true

    await createReview(product.value.id, {
      rating: newReview.value.rating,
      title: newReview.value.title,
      text: newReview.value.text,
    })

    // Reset form
    newReview.value = {
      rating: 5,
      title: '',
      text: '',
    }

    // Reload reviews
    await loadReviews()
    await Swal.fire({
      icon: 'success',
      title: 'Review submitted',
      text: 'Review submitted successfully!',
      confirmButtonColor: '#ef4444',
    })
  } catch (err) {
    console.error('Submit review error:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Review failed',
      text: 'Failed to submit review',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    isSubmittingReview.value = false
  }
}

const canEditReview = (review) => {
  return isAuthenticated.value && authStore.user?.id === review.user_id
}

const editReview = (review) => {
  newReview.value = {
    rating: review.rating,
    title: review.title,
    text: review.text,
  }
  // Scroll to form
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const deleteReview = async (reviewId) => {
  const confirmResult = await Swal.fire({
    icon: 'warning',
    title: 'Delete this review?',
    text: 'This action cannot be undone.',
    showCancelButton: true,
    confirmButtonText: 'Delete',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#dc2626',
    cancelButtonColor: '#6b7280',
  })

  if (!confirmResult.isConfirmed) return

  try {
    await deleteReviewApi(reviewId)
    await loadReviews()
    await Swal.fire({
      icon: 'success',
      title: 'Review deleted',
      text: 'Review deleted successfully!',
      confirmButtonColor: '#ef4444',
    })
  } catch (err) {
    console.error('Delete review error:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Delete failed',
      text: 'Failed to delete review',
      confirmButtonColor: '#ef4444',
    })
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}
</script>

<style scoped>
.product-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* Loading & Error States */
.loading,
.error {
  text-align: center;
  padding: 60px 20px;
}

.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.spinner-border {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

.spinner-small {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #ffffff;
  border-top: 2px solid transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error {
  color: #d32f2f;
}

/* Breadcrumb */
.breadcrumb {
  display: flex;
  gap: 8px;
  margin-bottom: 30px;
  font-size: 14px;
  color: #666;
}

.breadcrumb a {
  color: #667eea;
  text-decoration: none;
}

.breadcrumb a:hover {
  text-decoration: underline;
}

/* Product Main */
.product-container {
  background: white;
  border-radius: 8px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.product-main {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;
}

/* Product Image Section */
.product-image-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  background: #f5f5f5;
  border-radius: 8px;
  overflow: hidden;
}

.main-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #999;
  background: #f5f5f5;
}

.btn-wishlist-large {
  position: absolute;
  top: 15px;
  right: 15px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: white;
  border: 2px solid #ddd;
  cursor: pointer;
  font-size: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.btn-wishlist-large:hover {
  border-color: #ff6b6b;
  color: #ff6b6b;
}

.btn-wishlist-large.wishlisted {
  background: #ff6b6b;
  color: white;
  border-color: #ff6b6b;
}

.stock-status {
  text-align: center;
}

.badge {
  display: inline-block;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
}

.badge-success {
  background: #e8f5e9;
  color: #2e7d32;
}

.badge-danger {
  background: #ffebee;
  color: #c62828;
}

/* Product Info */
.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-category {
  color: #667eea;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.product-title {
  font-size: 32px;
  color: #333;
  margin: 0;
  line-height: 1.2;
}

.product-rating {
  display: flex;
  align-items: center;
  gap: 10px;
}

.stars {
  color: #f57c00;
  font-size: 18px;
}

.rating-stars {
  margin-right: 4px;
}

.review-count {
  color: #999;
  font-size: 14px;
}

.product-price {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 28px;
  font-weight: bold;
}

.current-price {
  color: #667eea;
}

.original-price {
  text-decoration: line-through;
  color: #999;
  font-size: 18px;
}

.product-description {
  border-top: 1px solid #eee;
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.product-description h3 {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #333;
}

.product-description p {
  margin: 0;
  color: #666;
  line-height: 1.6;
}

/* Add to Cart Section */
.add-to-cart-section {
  display: flex;
  gap: 15px;
  align-items: flex-end;
}

.quantity-selector {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.quantity-selector label {
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.quantity-input {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.quantity-input input {
  flex: 1;
  border: none;
  padding: 10px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  width: 60px;
}

.quantity-input input:focus {
  outline: none;
  background: #f5f5f5;
}

.btn-qty {
  width: 40px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 18px;
  transition: background 0.3s;
}

.btn-qty:hover {
  background: #eee;
}

.btn-add-to-cart {
  flex: 1;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: background 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 44px;
}

.btn-add-to-cart:hover:not(:disabled) {
  background: #5568d3;
}

.btn-add-to-cart:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Product Meta */
.product-meta {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.meta-item {
  display: flex;
  gap: 8px;
  color: #666;
  font-size: 14px;
}

.meta-item strong {
  color: #333;
  min-width: 100px;
}

/* Reviews Section */
.reviews-section {
  margin-top: 40px;
  padding-top: 40px;
  border-top: 2px solid #eee;
}

.reviews-section h2 {
  margin: 0 0 30px 0;
  font-size: 24px;
  color: #333;
}

.add-review-form {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.add-review-form h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.form-group {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
  font-size: 14px;
}

.rating-input {
  display: flex;
  gap: 8px;
}

.star-btn {
  width: 40px;
  height: 40px;
  border: 2px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 20px;
  color: #999;
  transition: all 0.3s;
}

.star-btn:hover,
.star-btn.active {
  border-color: #f57c00;
  color: #f57c00;
  background: #fff8e1;
}

.form-input,
.form-textarea {
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.btn-submit-review {
  padding: 12px 24px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-submit-review:hover:not(:disabled) {
  background: #5568d3;
}

.btn-submit-review:disabled {
  background: #ccc;
  cursor: not-allowed;
}

/* Reviews List */
.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.review-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border-left: 4px solid #667eea;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 12px;
}

.reviewer-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.reviewer-info strong {
  color: #333;
}

.review-date {
  color: #999;
  font-size: 12px;
}

.review-rating {
  color: #f57c00;
  font-weight: 600;
}

.review-title {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: #333;
}

.review-text {
  margin: 0 0 12px 0;
  color: #666;
  line-height: 1.6;
}

.review-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-edit {
  background: #e3f2fd;
  color: #1976d2;
}

.btn-edit:hover {
  background: #bbdefb;
}

.btn-delete {
  background: #ffebee;
  color: #d32f2f;
}

.btn-delete:hover {
  background: #ffcdd2;
}

.no-reviews {
  text-align: center;
  padding: 40px 20px;
  color: #999;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.not-found p {
  color: #999;
  margin-bottom: 20px;
}

.btn-back {
  display: inline-block;
  padding: 10px 20px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-back:hover {
  background: #5568d3;
}

.btn-retry {
  display: inline-block;
  margin-top: 20px;
  padding: 10px 20px;
  background: #d32f2f;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-retry:hover {
  background: #b71c1c;
}

/* Responsive */
@media (max-width: 768px) {
  .product-main {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .product-title {
    font-size: 24px;
  }

  .product-price {
    font-size: 24px;
  }

  .add-to-cart-section {
    flex-direction: column;
  }

  .btn-add-to-cart {
    width: 100%;
  }

  .review-header {
    flex-direction: column;
    gap: 8px;
  }

  .product-container {
    padding: 20px;
  }
}

@media (max-width: 480px) {
  .product-detail-page {
    padding: 10px;
  }

  .product-container {
    padding: 15px;
  }

  .product-title {
    font-size: 20px;
  }

  .product-price {
    font-size: 20px;
  }

  .add-to-cart-section {
    gap: 10px;
  }

  .quantity-input {
    width: 100%;
  }
}
</style>
