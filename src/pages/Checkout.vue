<template>
  <div class="container py-5">
    <h1 class="mb-4">Checkout</h1>

    <div class="row">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5>Shipping Address</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="submitOrder">
              <div class="mb-3">
                <label class="form-label">Full Address</label>
                <textarea v-model="shippingAddress" class="form-control" rows="4" required></textarea>
              </div>

              <button :disabled="loading" class="btn btn-primary">
                {{ loading ? 'Processing...' : 'Place Order' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-4">
        <div class="card">
          <div class="card-header">
            <h5>Order Summary</h5>
          </div>
          <div class="card-body">
            <div v-for="item in cart" :key="item.id" class="mb-3">
              <p class="d-flex justify-content-between mb-1">
                <span>{{ item.name }} x {{ item.quantity }}</span>
                <span>${{ (item.price * item.quantity).toFixed(2) }}</span>
              </p>
            </div>

            <hr>

            <p class="d-flex justify-content-between">
              <strong>Total:</strong>
              <strong class="text-primary">${{ totalPrice.toFixed(2) }}</strong>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useCart } from '../composables/useCart'
import { useApi } from '../composables/useApi'

const { cart, totalPrice, clearCart } = useCart()
const { api } = useApi()
const router = useRouter()

const shippingAddress = ref('')
const loading = ref(false)

const submitOrder = async () => {
  loading.value = true
  try {
    const items = cart.value.map(item => ({
      product_id: item.id,
      quantity: item.quantity
    }))

    const response = await api.post('/orders', {
      items,
      shipping_address: shippingAddress.value
    })

    clearCart()
    router.push({ name: 'OrderDetail', params: { id: response.data.data.id } })
  } catch (error) {
    alert(error.response?.data?.message || 'Order failed')
  } finally {
    loading.value = false
  }
}
</script>