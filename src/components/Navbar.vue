<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <strong>🛍️ E-Commerce</strong>
      </router-link>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav ms-auto">
          <li class="nav-item">
            <router-link to="/products" class="nav-link">Products</router-link>
          </li>

          <li class="nav-item">
            <router-link to="/cart" class="nav-link position-relative">
              Cart
              <span v-if="cartTotal > 0" class="badge bg-danger position-absolute top-0 start-100 translate-middle">
                {{ cartTotal }}
              </span>
            </router-link>
          </li>

          <template v-if="!authStore.isAuthenticated">
            <li class="nav-item">
              <router-link to="/login" class="nav-link">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link">Register</router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link to="/wishlist" class="nav-link">
                ❤️ Wishlist
              </router-link>
            </li>
            <li class="nav-item">
              <router-link to="/orders" class="nav-link">Orders</router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                {{ authStore.user.name }}
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">Profile</router-link>
                </li>
                <li>
                  <button @click="logout" class="dropdown-item">Logout</button>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '../stores/auth'
import { useCart } from '../composables/useCart'
import { useApi } from '../composables/useApi'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const { totalItems: cartTotal } = useCart()
const { api } = useApi()
const router = useRouter()

const logout = async () => {
  await api.post('/auth/logout')
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<style scoped>
.navbar {
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>