<template>
  <nav class="navbar navbar-expand-lg navbar-dark">
    <div class="container">
      <router-link to="/" class="navbar-brand">
        <strong>SpiceLeaf Market</strong>
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
            <router-link to="/cart" class="nav-link nav-icon-link" aria-label="Cart">
              <span class="nav-icon">🛒</span>
              <span class="nav-icon-text">Cart</span>
              <span v-if="showCartBadge" class="nav-badge">{{ cartCount }}</span>
            </router-link>
          </li>
          <li class="nav-item">
            <router-link to="/wishlist" class="nav-link nav-icon-link" aria-label="Wishlist">
              <span class="nav-icon">♡</span>
              <span class="nav-icon-text">Wishlist</span>
              <span v-if="showWishlistBadge" class="nav-badge">{{ unseenCount }}</span>
            </router-link>
          </li>

          <template v-if="!authStore.isAuthenticated">
            <li class="nav-item">
              <router-link to="/login" class="nav-link pill">Login</router-link>
            </li>
            <li class="nav-item">
              <router-link to="/register" class="nav-link pill pill-accent">Register</router-link>
            </li>
          </template>

          <template v-else>
            <li class="nav-item">
              <router-link to="/orders" class="nav-link">Orders</router-link>
            </li>
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle user-chip" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown">
                {{ authStore.user?.name || 'Account' }}
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
import { computed, onMounted, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useCart } from '../composables/useCart'
import { useWishlist } from '../composables/useWishlist'
import { useRouter, useRoute } from 'vue-router'

const authStore = useAuthStore()
const { itemCount: cartCount, loadCart } = useCart()
const { items: wishlistItems, fetchWishlist, unseenCount, clearUnseen } = useWishlist()
const router = useRouter()
const route = useRoute()

const showWishlistBadge = computed(() => {
  return authStore.isAuthenticated && unseenCount.value > 0 && route.path !== '/wishlist'
})

const showCartBadge = computed(() => {
  return cartCount.value > 0 && route.path !== '/cart'
})

watch(
  () => route.path,
  (newPath) => {
    if (newPath === '/wishlist') {
      clearUnseen()
    }
  },
  { immediate: true }
)

onMounted(async () => {
  loadCart()
  if (authStore.isAuthenticated) {
    try {
      await fetchWishlist()
    } catch {
      // Keep the badge usable even if the backend is temporarily down.
    }
  }
})

const logout = async () => {
  try {
    await authStore.logout()
  } finally {
    router.push({ name: 'Login' })
  }
}
</script>

<style scoped>
.navbar {
  background:
    linear-gradient(135deg, rgba(13, 42, 29, 0.94), rgba(19, 88, 53, 0.9)),
    rgba(10, 33, 22, 0.82) !important;
  backdrop-filter: blur(18px);
  padding: 0.95rem 0;
  box-shadow: 0 12px 30px rgba(18, 53, 36, 0.12);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.navbar-brand {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: #fff !important;
  letter-spacing: -0.04em;
}

.brand-mark {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 12px;
  background: linear-gradient(135deg, #ef4444, #f97316);
  font-weight: 800;
}

.navbar-nav {
  align-items: center;
  gap: 8px;
}

.nav-link {
  color: rgba(255, 255, 255, 0.84) !important;
  font-weight: 600;
  padding: 8px 14px !important;
  border-radius: 999px;
  transition: all 0.2s ease;
}

.nav-icon-link {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding-right: 18px !important;
}

.nav-icon {
  font-size: 1rem;
  line-height: 1;
}

.nav-icon-text {
  display: inline-block;
}

.nav-badge {
  position: absolute;
  top: -6px;
  right: 0;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  background: #f59e0b;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.35);
}

.nav-link:hover,
.router-link-active:not(.navbar-brand) {
  color: #fff !important;
  background: rgba(255, 255, 255, 0.12);
}

.pill {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.pill-accent {
  background: linear-gradient(135deg, #ef4444, #f97316);
  border: 0;
}

.badge {
  font-size: 0.72rem;
  font-weight: 700;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 20px;
  border: 2px solid #2f6f46;
}

.nav-link .badge {
  top: 4px !important;
  left: 82% !important;
}

.user-chip {
  background: rgba(255, 255, 255, 0.08);
}

.dropdown-menu {
  border: 1px solid rgba(241, 245, 249, 0.9);
  border-radius: 14px;
  overflow: hidden;
  margin-top: 12px !important;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
  padding: 6px;
}

.dropdown-item {
  padding: 10px 16px;
  font-weight: 500;
  font-size: 0.92rem;
  color: #334155;
  border-radius: 8px;
  transition: all 0.2s ease;
}

.dropdown-item:hover {
  background: #f1f5f9;
  color: #25603a;
}

button.dropdown-item {
  color: #c2410c;
}

button.dropdown-item:hover {
  background: #fef2f2;
  color: #dc2626;
}

.navbar-toggler {
  border: none;
  padding: 6px;
  border-radius: 8px;
}

.navbar-toggler:focus {
  box-shadow: none;
}

.navbar-toggler-icon {
  filter: brightness(0) invert(1);
}

@media (max-width: 992px) {
  .navbar-collapse {
    margin-top: 12px;
    background: rgba(255, 255, 255, 0.08);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    border-radius: 14px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .navbar-nav {
    align-items: stretch;
    gap: 4px;
  }

  .nav-link {
    margin: 0;
    padding: 10px 16px !important;
  }

  .nav-link .badge {
    position: static !important;
    transform: none !important;
    margin-left: 8px;
    display: inline-flex;
  }

  .dropdown-menu {
    background: rgba(255, 255, 255, 0.95);
    margin-top: 6px !important;
    border: none;
  }
}
</style>
