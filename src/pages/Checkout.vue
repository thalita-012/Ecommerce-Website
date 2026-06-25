<template>
  <div class="checkout-page">
    <h1>Checkout</h1>

    <div class="checkout-container">
      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Order Summary</h2>

        <div v-if="cartItems.length === 0" class="empty-cart">
          <p>Your cart is empty</p>
          <router-link to="/products" class="btn-continue-shopping">
            Continue Shopping
          </router-link>
        </div>

        <div v-else>
          <div class="order-items">
            <div v-for="item in cartItems" :key="item.id" class="order-item">
              <div class="item-info">
                <h4>{{ item.name }}</h4>
                <p class="quantity">Qty: {{ item.quantity }}</p>
              </div>
              <div class="item-price">
                ${{ (item.price * item.quantity).toFixed(2) }}
              </div>
            </div>
          </div>

          <div class="order-totals">
            <div class="total-row">
              <span>Subtotal:</span>
              <span>${{ subtotal.toFixed(2) }}</span>
            </div>
            <div class="total-row">
              <span>Tax (10%):</span>
              <span>${{ tax.toFixed(2) }}</span>
            </div>
            <div class="total-row total-amount">
              <span>Total:</span>
              <span>${{ total.toFixed(2) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Checkout Form -->
      <div v-if="cartItems.length > 0" class="checkout-form">
        <h2>Billing & Shipping</h2>

        <form @submit.prevent="handleCheckout">
          <!-- Billing Address -->
          <fieldset>
            <legend>Billing Address</legend>

            <div class="form-group">
              <label for="full_name">Full Name</label>
              <input
                id="full_name"
                v-model="formData.full_name"
                type="text"
                required
              />
            </div>

            <div class="form-group">
              <label for="email">Email</label>
              <input
                id="email"
                v-model="formData.email"
                type="email"
                required
              />
            </div>

            <div class="form-group">
              <label for="phone">Phone</label>
              <input
                id="phone"
                v-model="formData.phone"
                type="tel"
                required
              />
            </div>

            <div class="form-group">
              <label for="street">Street Address</label>
              <input
                id="street"
                v-model="formData.street"
                type="text"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="city">City</label>
                <input
                  id="city"
                  v-model="formData.city"
                  type="text"
                  required
                />
              </div>
              <div class="form-group">
                <label for="state">State/Province</label>
                <input
                  id="state"
                  v-model="formData.state"
                  type="text"
                  required
                />
              </div>
              <div class="form-group">
                <label for="zip">ZIP/Postal Code</label>
                <input
                  id="zip"
                  v-model="formData.zip"
                  type="text"
                  required
                />
              </div>
            </div>

            <div class="form-group">
              <label for="country">Country</label>
              <input
                id="country"
                v-model="formData.country"
                type="text"
                required
              />
            </div>
          </fieldset>

          <!-- Payment Method -->
          <fieldset>
            <legend>Payment Method</legend>

            <div class="form-group">
              <label for="card_number">Card Number</label>
              <input
                id="card_number"
                v-model="formData.card_number"
                type="text"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>

            <div class="form-row">
              <div class="form-group">
                <label for="expiry">Expiry Date</label>
                <input
                  id="expiry"
                  v-model="formData.expiry"
                  type="text"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div class="form-group">
                <label for="cvv">CVV</label>
                <input
                  id="cvv"
                  v-model="formData.cvv"
                  type="text"
                  placeholder="123"
                  required
                />
              </div>
            </div>
          </fieldset>

          <!-- Error Message -->
          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <!-- Submit Button -->
          <button
            type="submit"
            class="btn-place-order"
            :disabled="loading"
          >
            {{ loading ? 'Processing...' : 'Place Order' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Order Confirmation Modal -->
    <div v-if="orderPlaced" class="confirmation-modal">
      <div class="modal-content">
        <div class="success-icon">✓</div>
        <h2>Order Placed Successfully!</h2>
        <p>Your order #{{ orderId }} has been confirmed.</p>
        <p>You will receive a confirmation email shortly.</p>

        <div class="modal-buttons">
          <router-link to="/products" class="btn-continue">
            Continue Shopping
          </router-link>
          <router-link :to="`/orders/${orderId}`" class="btn-view-order">
            View Order
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '@/composables/useCart'
import { useOrders } from '@/composables/useOrders'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { items: cartItems, subtotal, tax, total, prepareForCheckout, clearCart, loadCart } = useCart()
const { createOrder, loading: orderLoading } = useOrders()
const { isAuthenticated } = useAuth()

const loading = ref(false)
const error = ref(null)
const orderPlaced = ref(false)
const orderId = ref(null)

const formData = ref({
  full_name: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  zip: '',
  country: '',
  card_number: '',
  expiry: '',
  cvv: '',
})

onMounted(() => {
  // Check if user is authenticated
  if (!isAuthenticated.value) {
    router.push({ name: 'Login', query: { redirect: '/checkout' } })
    return
  }

  // Load cart from localStorage
  loadCart()
})

const handleCheckout = async () => {
  // Validate form
  if (
    !formData.value.full_name ||
    !formData.value.email ||
    !formData.value.street ||
    !formData.value.city ||
    !formData.value.card_number
  ) {
    error.value = 'Please fill in all required fields'
    return
  }

  error.value = null
  loading.value = true

  try {
    const orderData = prepareForCheckout()

    const response = await createOrder({
      ...orderData,
      billing_address: {
        full_name: formData.value.full_name,
        email: formData.value.email,
        phone: formData.value.phone,
        street: formData.value.street,
        city: formData.value.city,
        state: formData.value.state,
        zip: formData.value.zip,
        country: formData.value.country,
      },
      payment_method: {
        card_number: formData.value.card_number.replace(/\s/g, ''),
        expiry: formData.value.expiry,
        cvv: formData.value.cvv,
      },
    })

    // Order placed successfully
    orderId.value = response?.id || response?.data?.id || response?.order?.id || null
    orderPlaced.value = true
    clearCart()
    window.alert(`Order placed successfully${orderId.value ? `! Order #${orderId.value}` : '!'}`)

    // Auto-redirect after 5 seconds
    setTimeout(() => {
      router.push({ name: 'Home' })
    }, 5000)
  } catch (err) {
    error.value =
      err?.data?.message ||
      (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null) ||
      err.message ||
      'Failed to place order. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.checkout-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  margin-bottom: 30px;
  font-size: 32px;
}

.checkout-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
}

.order-summary,
.checkout-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  font-size: 24px;
}

.empty-cart {
  text-align: center;
  padding: 40px 20px;
}

.empty-cart p {
  color: #666;
  margin-bottom: 20px;
}

.btn-continue-shopping {
  display: inline-block;
  padding: 10px 24px;
  background: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.btn-continue-shopping:hover {
  background: #5568d3;
}

.order-items {
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 20px;
}

.order-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
}

.quantity {
  color: #666;
  font-size: 14px;
  margin: 0;
}

.item-price {
  font-weight: bold;
  font-size: 16px;
}

.order-totals {
  padding: 20px 0;
  border-top: 2px solid #eee;
}

.total-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.total-row.total-amount {
  font-size: 18px;
  font-weight: bold;
  padding: 12px 0;
  border-top: 1px solid #eee;
  margin-top: 12px;
}

.checkout-form form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

fieldset {
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 20px;
  margin: 0;
}

legend {
  font-weight: 600;
  font-size: 16px;
  padding: 0 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.form-group:last-child {
  margin-bottom: 0;
}

label {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

input {
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
}

input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
}

.error-message {
  padding: 12px;
  background: #ffebee;
  color: #d32f2f;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 10px;
}

.btn-place-order {
  padding: 14px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 600;
  font-size: 16px;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;
}

.btn-place-order:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-place-order:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.confirmation-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  padding: 40px;
  border-radius: 8px;
  text-align: center;
  max-width: 400px;
}

.success-icon {
  width: 60px;
  height: 60px;
  background: #4caf50;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  margin: 0 auto 20px;
}

.modal-content h2 {
  margin: 0 0 12px 0;
  color: #333;
}

.modal-content p {
  color: #666;
  margin: 8px 0;
}

.modal-buttons {
  display: flex;
  gap: 12px;
  margin-top: 30px;
}

.btn-continue,
.btn-view-order {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-continue {
  background: #f0f0f0;
  color: #333;
}

.btn-continue:hover {
  background: #e0e0e0;
}

.btn-view-order {
  background: #667eea;
  color: white;
}

.btn-view-order:hover {
  background: #5568d3;
}

@media (max-width: 768px) {
  .checkout-container {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>
