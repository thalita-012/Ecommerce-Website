import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Pages
import Home from '../pages/Home.vue'
import Products from '../pages/Products.vue'
import ProductDetail from '../pages/ProductDetail.vue'
import Login from '../pages/Login.vue'
import Register from '../pages/Register.vue'
import Cart from '../pages/Cart.vue'
import Checkout from '../pages/Checkout.vue'
import Orders from '../pages/Orders.vue'
import OrderDetail from '../pages/OrderDetail.vue'
import Profile from '../pages/Profile.vue'
import Wishlist from '../pages/Wishlist.vue'

const routes = [
  { path: '/', component: Home, name: 'Home' },
  { path: '/products', component: Products, name: 'Products' },
  { path: '/products/:id', component: ProductDetail, name: 'ProductDetail' },
  { path: '/login', component: Login, name: 'Login' },
  { path: '/register', component: Register, name: 'Register' },
  { path: '/cart', component: Cart, name: 'Cart' },
  { path: '/checkout', component: Checkout, name: 'Checkout', meta: { requiresAuth: true } },
  { path: '/orders', component: Orders, name: 'Orders', meta: { requiresAuth: true } },
  { path: '/orders/:id', component: OrderDetail, name: 'OrderDetail', meta: { requiresAuth: true } },
  { path: '/profile', component: Profile, name: 'Profile', meta: { requiresAuth: true } },
  { path: '/wishlist', component: Wishlist, name: 'Wishlist', meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Route Guard
router.beforeEach((to, from) => {
  const authStore = useAuthStore()

  // Route requires auth and user not logged in
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'Login', query: { redirect: to.fullPath } }  // ✅ Return redirect
  }

  // User already logged in trying to access login page
  if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    return { name: 'Home' }  // ✅ Return home
  }

  return true  // ✅ Return true to allow navigation
})

export default router