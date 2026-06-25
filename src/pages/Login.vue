<template>
  <main class="auth-shell">
    <section class="auth-card">
      <div class="auth-copy">
        <p class="eyebrow">SpiceLeaf Market</p>
        <h1>Welcome back</h1>
        <p>
          Sign in to keep shopping fresh vegetables, save your wishlist, and checkout faster.
        </p>
      </div>

      <form @submit.prevent="handleLogin" class="auth-form">
        <div v-if="error" class="alert-box">
          {{ error }}
        </div>

        <label>
          Email
          <input v-model.trim="formData.email" type="email" placeholder="you@example.com" required @input="clearError" />
        </label>

        <label>
          Password
          <input v-model="formData.password" type="password" placeholder="••••••••" required @input="clearError" />
        </label>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Signing in...' : 'Login' }}
        </button>

        <p class="auth-link">
          Don't have an account?
          <router-link to="/register">Register here</router-link>
        </p>
      </form>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

const router = useRouter()
const { login } = useAuth()

const formData = ref({
  email: '',
  password: '',
})

const error = ref(null)
const loading = ref(false)

const clearError = () => {
  error.value = null
}

const handleLogin = async () => {
  error.value = null
  loading.value = true

  try {
    await login({
      email: formData.value.email.trim().toLowerCase(),
      password: formData.value.password,
    })

    router.push({ name: 'Home' })
  } catch (err) {
    const validationMessage =
      err?.data?.message ||
      (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null)

    error.value = validationMessage || err.message || 'Login failed. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-shell {
  min-height: calc(100vh - 72px);
  display: grid;
  place-items: center;
  padding: 32px 20px;
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.14), transparent 30%),
    linear-gradient(180deg, #fffaf4 0%, #f4fff3 100%);
}

.auth-card {
  width: min(960px, 100%);
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;
  border-radius: 30px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 30px 80px rgba(24, 48, 28, 0.12);
}

.auth-copy {
  padding: 42px;
  background: linear-gradient(160deg, #123524, #25593a);
  color: rgba(255, 255, 255, 0.92);
}

.auth-copy h1 {
  margin: 14px 0 12px;
  font-size: clamp(2.2rem, 5vw, 3.4rem);
  line-height: 0.95;
}

.auth-copy p {
  max-width: 34ch;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.78);
}

.eyebrow {
  display: inline-flex;
  padding: 7px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.auth-form {
  padding: 42px;
  display: grid;
  gap: 18px;
}

.auth-form label {
  display: grid;
  gap: 8px;
  font-weight: 600;
  color: #17301c;
}

.auth-form input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(23, 48, 28, 0.12);
  background: rgba(255, 255, 255, 0.94);
}

.auth-form input:focus {
  outline: none;
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
}

.btn-submit {
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.btn-submit:disabled {
  opacity: 0.7;
}

.alert-box {
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(254, 226, 226, 0.9);
  color: #b91c1c;
}

.auth-link {
  margin: 0;
  color: #58705c;
  text-align: center;
}

.auth-link a {
  color: #25603a;
  font-weight: 700;
  text-decoration: none;
}

@media (max-width: 820px) {
  .auth-card {
    grid-template-columns: 1fr;
  }
}
</style>
