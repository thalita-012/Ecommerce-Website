<template>
  <div class="container py-5">
    <h1 class="mb-4">Shopping Cart</h1>

    <template v-if="cart.length > 0">
      <div class="row">
        <div class="col-md-8">
          <div class="card">
            <table class="table mb-0">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in cart" :key="item.id">
                  <td>{{ item.name }}</td>
                  <td>${{ item.price }}</td>
                  <td>
                    <input 
                      :value="item.quantity"
                      @change="e => updateQuantity(item.id, parseInt(e.target.value))"
                      type="number" 
                      min="1" 
                      class="form-control" 
                      style="width: 80px;"
                    >
                  </td>
                  <td>${{ (item.price * item.quantity).toFixed(2) }}</td>
                  <td>
                    <button @click="removeFromCart(item.id)" class="btn btn-danger btn-sm">
                      Remove
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div class="col-md-4">
          <div class="card">
            <div class="card-body">
              <h5>Cart Summary</h5>
              <hr>
              <p class="d-flex justify-content-between">
                <span>Subtotal:</span>
                <strong>${{ totalPrice.toFixed(2) }}</strong>
              </p>
              <p class="d-flex justify-content-between">
                <span>Shipping:</span>
                <strong>Free</strong>
              </p>
              <hr>
              <p class="d-flex justify-content-between">
                <span><strong>Total:</strong></span>
                <strong class="text-primary">${{ totalPrice.toFixed(2) }}</strong>
              </p>

              <router-link 
                v-if="authStore.isAuthenticated"
                to="/checkout" 
                class="btn btn-primary w-100"
              >
                Proceed to Checkout
              </router-link>
              <router-link 
                v-else
                to="/login" 
                class="btn btn-primary w-100"
              >
                Login to Checkout
              </router-link>

              <router-link to="/products" class="btn btn-secondary w-100 mt-2">
                Continue Shopping
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </template>

    <div v-else class="alert alert-info">
      Your cart is empty.
      <router-link to="/products">Continue shopping</router-link>
    </div>
  </div>
</template>

<script setup>
import { useCart } from '../composables/useCart'
import { useAuthStore } from '../stores/auth'

const { cart, removeFromCart, updateQuantity, totalPrice } = useCart()
const authStore = useAuthStore()
</script>