<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-5">
        <div class="card">
          <div class="card-header bg-primary text-white">
            <h4 class="mb-0">Login</h4>
          </div>
          <div class="card-body">
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Email Address</label>
                <input v-model="email" type="email" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Password</label>
                <input v-model="password" type="password" class="form-control" required>
              </div>

              <button :disabled="loading" class="btn btn-primary w-100">
                {{ loading ? 'Logging in...' : 'Login' }}
              </button>
            </form>

            <hr>

            <p class="text-center">
              Don't have an account?
              <router-link to="/register">Register here</router-link>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useApi } from '../composables/useApi'
import { useAuthStore } from '../stores/auth'

const { api } = useApi()
const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const email = ref('')
const password = ref('')
const loading = ref(false)

const login = async () => {
  loading.value = true
  try {
    const response = await api.post('/auth/login', {
      email: email.value,
      password: password.value,
    })

    authStore.setAuth(response.data.user, response.data.token)

    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (error) {
    alert(error.response?.data?.message || 'Login failed')
  } finally {
    loading.value = false
  }
}
</script>   