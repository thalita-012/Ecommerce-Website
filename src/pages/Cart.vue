<template>
  <div class="cart-page">
    <h1>Shopping Cart</h1>

    <!-- Cart Items -->
    <div v-if="items && items.length > 0" class="cart-container">
      <!-- Cart Table -->
      <div class="cart-items">
        <div class="cart-header">
          <div class="col-product">Product</div>
          <div class="col-price">Price</div>
          <div class="col-quantity">Quantity</div>
          <div class="col-total">Total</div>
          <div class="col-action">Action</div>
        </div>

        <div v-for="item in items" :key="item.id" class="cart-item">
          <!-- Product Image & Info -->
          <div class="col-product">
            <div class="product-info">
              <img
                v-if="item.image"
                :src="`http://localhost:8000/storage/${item.image}`"
                :alt="item.name"
                class="product-image"
              />
              <div v-else class="image-placeholder">No Image</div>

              <div class="product-details">
                <router-link :to="`/products/${item.id}`" class="product-link">
                  {{ item.name }}
                </router-link>
                <p class="product-sku">SKU: {{ item.id }}</p>
              </div>
            </div>
          </div>

          <!-- Price -->
          <div class="col-price">
            ${{ parseFloat(item.price).toFixed(2) }}
          </div>

          <!-- Quantity -->
          <div class="col-quantity">
            <div class="quantity-input">
              <button 
                @click="decrementQty(item.id)"
                class="btn-qty"
              >
                −
              </button>
              <input
                type="number"
                min="1"
                :value="item.quantity"
                @input="updateQuantity(item.id, Number($event.target.value))"
                class="qty-input"
              />
              <button 
                @click="incrementQty(item.id)"
                class="btn-qty"
              >
                +
              </button>
            </div>
          </div>

          <!-- Total -->
          <div class="col-total">
            ${{ (item.price * item.quantity).toFixed(2) }}
          </div>

          <!-- Remove Button -->
          <div class="col-action">
            <button 
              @click="removeItem(item.id)"
              class="btn-remove"
              title="Remove from cart"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- Cart Summary -->
      <div class="cart-summary">
        <h2>Order Summary</h2>

        <div class="summary-row">
          <span>Items ({{ itemCount }})</span>
          <span>${{ subtotal.toFixed(2) }}</span>
        </div>

        <div class="summary-row">
          <span>Tax (10%)</span>
          <span>${{ tax.toFixed(2) }}</span>
        </div>

        <div class="summary-row shipping">
          <span>Shipping</span>
          <span>FREE</span>
        </div>

        <div class="summary-total">
          <span>Total</span>
          <span>${{ total.toFixed(2) }}</span>
        </div>

        <!-- Checkout Button -->
        <button class="btn-checkout" @click="handleCheckout">
          Proceed to Checkout
        </button>

        <!-- Continue Shopping -->
        <router-link to="/products" class="btn-continue-shopping">
          Continue Shopping
        </router-link>
      </div>
    </div>

    <!-- Empty Cart -->
    <div v-else class="empty-cart">
      <div class="empty-icon">🛒</div>
      <h2>Your Cart is Empty</h2>
      <p>Add some products to your cart to get started!</p>
      <router-link to="/products" class="btn-shop-now">
        Start Shopping
      </router-link>
    </div>

    <!-- Cart Actions (visible when cart has items) -->
    <div v-if="items && items.length > 0" class="cart-actions">
      <button 
        class="btn-clear"
        @click="confirmClear"
      >
        Clear Cart
      </button>
    </div>
  </div>
</template>

<script setup>
import { onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import Swal from 'sweetalert2'
import { useCart } from '@/composables/useCart'

const router = useRouter()
const CHECKOUT_DRAFT_KEY = 'checkout_draft'

const {
  items,
  itemCount,
  subtotal,
  tax,
  total,
  removeItem,
  updateQuantity,
  clearCart,
  prepareForCheckout,
  loadCart,
} = useCart()

onMounted(() => {
  loadCart()
})

// Methods
const decrementQty = (itemId) => {
  const item = items.value.find(i => i.id === itemId)
  if (item && item.quantity > 1) {
    updateQuantity(itemId, item.quantity - 1)
  }
}

const incrementQty = (itemId) => {
  const item = items.value.find(i => i.id === itemId)
  if (item) {
    updateQuantity(itemId, item.quantity + 1)
  }
}

const handleCheckout = () => {
  try {
    const orderDraft = prepareForCheckout()
    sessionStorage.setItem(CHECKOUT_DRAFT_KEY, JSON.stringify(orderDraft))
    clearCart()
    router.push({ name: 'Checkout' })
  } catch (err) {
    console.error('Checkout error:', err)
    Swal.fire({
      icon: 'error',
      title: 'Checkout error',
      text: 'Error preparing checkout. Please try again.',
      confirmButtonColor: '#ef4444',
    })
  }
}

const confirmClear = () => {
  Swal.fire({
    icon: 'warning',
    title: 'Clear cart?',
    text: 'Are you sure you want to clear your cart?',
    showCancelButton: true,
    confirmButtonText: 'Yes, clear it',
    cancelButtonText: 'Cancel',
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#6b7280',
  }).then((result) => {
    if (result.isConfirmed) {
      clearCart()
      Swal.fire({
        icon: 'success',
        title: 'Cart cleared',
        text: 'Your cart has been cleared.',
        confirmButtonColor: '#ef4444',
      })
    }
  })
}
</script>

<style scoped>
.cart-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-size: 32px;
  color: #333;
}

/* Main Container */
.cart-container {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 30px;
  margin-bottom: 30px;
}

/* Cart Items Table */
.cart-items {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.cart-header {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr 80px;
  gap: 15px;
  padding: 16px 20px;
  background: #f9f9f9;
  border-bottom: 2px solid #eee;
  font-weight: 600;
  color: #666;
  font-size: 14px;
}

.cart-item {
  display: grid;
  grid-template-columns: 2fr 1fr 1.5fr 1fr 80px;
  gap: 15px;
  padding: 20px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.cart-item:last-child {
  border-bottom: none;
}

/* Product Info */
.product-info {
  display: flex;
  gap: 15px;
}

.product-image {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
  background: #f5f5f5;
}

.image-placeholder {
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  color: #999;
  font-size: 12px;
}

.product-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-link {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.3s;
}

.product-link:hover {
  color: #5568d3;
  text-decoration: underline;
}

.product-sku {
  font-size: 12px;
  color: #999;
  margin: 0;
}

/* Quantity Input */
.quantity-input {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: fit-content;
}

.btn-qty {
  width: 30px;
  height: 30px;
  border: none;
  background: #f5f5f5;
  cursor: pointer;
  font-size: 16px;
  transition: background 0.3s;
}

.btn-qty:hover {
  background: #eee;
}

.qty-input {
  width: 50px;
  border: none;
  text-align: center;
  font-weight: 600;
  padding: 0 8px;
}

.qty-input:focus {
  outline: none;
  background: #f5f5f5;
}

/* Remove Button */
.btn-remove {
  width: 36px;
  height: 36px;
  border: 1px solid #ddd;
  background: #fff;
  border-radius: 4px;
  cursor: pointer;
  color: #d32f2f;
  font-size: 18px;
  transition: all 0.3s;
}

.btn-remove:hover {
  background: #ffebee;
  border-color: #d32f2f;
}

/* Cart Summary */
.cart-summary {
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: fit-content;
  position: sticky;
  top: 20px;
}

.cart-summary h2 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #333;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #eee;
  font-size: 14px;
  color: #666;
}

.summary-row.shipping {
  color: #2e7d32;
  font-weight: 600;
}

.summary-total {
  display: flex;
  justify-content: space-between;
  padding: 16px 0;
  margin-top: 8px;
  border-top: 2px solid #eee;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.summary-total span:last-child {
  color: #667eea;
}

/* Buttons */
.btn-checkout {
  width: 100%;
  padding: 14px;
  background: #667eea;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  font-size: 16px;
  margin-top: 20px;
  transition: background 0.3s;
}

.btn-checkout:hover {
  background: #5568d3;
}

.btn-continue-shopping {
  display: block;
  width: 100%;
  padding: 12px;
  background: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  text-decoration: none;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
  transition: all 0.3s;
}

.btn-continue-shopping:hover {
  background: #eee;
  border-color: #999;
}

/* Empty Cart */
.empty-cart {
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 20px;
}

.empty-cart h2 {
  margin: 0 0 10px 0;
  font-size: 24px;
  color: #333;
}

.empty-cart p {
  color: #999;
  margin-bottom: 30px;
  font-size: 16px;
}

.btn-shop-now {
  display: inline-block;
  padding: 12px 24px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-weight: 600;
  transition: background 0.3s;
}

.btn-shop-now:hover {
  background: #5568d3;
}

/* Cart Actions */
.cart-actions {
  text-align: center;
}

.btn-clear {
  padding: 12px 24px;
  background: #f5f5f5;
  color: #d32f2f;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-clear:hover {
  background: #ffebee;
  border-color: #d32f2f;
}

/* Responsive */
@media (max-width: 1024px) {
  .cart-container {
    grid-template-columns: 1fr;
  }

  .cart-summary {
    position: static;
  }
}

@media (max-width: 768px) {
  .cart-header {
    display: none;
  }

  .cart-item {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 15px;
  }

  .product-info {
    width: 100%;
  }

  .col-product,
  .col-price,
  .col-quantity,
  .col-total,
  .col-action {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }

  .col-price::before,
  .col-quantity::before,
  .col-total::before {
    font-weight: 600;
    color: #999;
    min-width: 80px;
  }

  .col-price::before {
    content: "Price: ";
  }

  .col-quantity::before {
    content: "Qty: ";
  }

  .col-total::before {
    content: "Total: ";
  }

  h1 {
    font-size: 24px;
  }
}

@media (max-width: 480px) {
  .cart-page {
    padding: 10px;
  }

  .cart-summary {
    padding: 15px;
  }

  .product-image {
    width: 60px;
    height: 60px;
  }

  .image-placeholder {
    width: 60px;
    height: 60px;
  }

  .btn-checkout {
    padding: 12px;
    font-size: 14px;
  }
}
</style>
