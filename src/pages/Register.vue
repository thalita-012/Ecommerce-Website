<template>
  <main class="auth-shell">
    <section class="auth-card">
      <div class="auth-copy">
        <p class="eyebrow">SpiceLeaf Market</p>
        <h1>Create your account</h1>
        <p>
          Join to save favorites, track orders, and shop fresh produce with a faster checkout.
        </p>
      </div>

      <form @submit.prevent="handleRegister" class="auth-form">
        <div v-if="errorMessage" class="alert-box">{{ errorMessage }}</div>
        <div v-if="successMessage" class="success-box">{{ successMessage }}</div>

        <label>
          Full Name
          <input v-model="form.name" type="text" required />
        </label>

        <label>
          Email
          <input v-model.trim="form.email" type="email" required />
        </label>

        <label>
          Password
          <input v-model="form.password" type="password" required />
        </label>

        <label>
          Confirm Password
          <input v-model="form.password_confirmation" type="password" required />
        </label>

        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? 'Creating account...' : 'Register' }}
        </button>

        <p class="auth-link">
          Already have an account?
          <router-link to="/login">Login</router-link>
        </p>
      </form>
    </section>
  </main>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loading = ref(false)
const errorMessage = ref('')
const successMessage = ref('')

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
})

const handleRegister = async () => {
  loading.value = true
  errorMessage.value = ''
  successMessage.value = ''

  try {
    await authStore.register(form)
    successMessage.value = 'Registration successful. Redirecting...'
    setTimeout(() => {
      router.push(route.query.redirect || '/')
    }, 1200)
  } catch (err) {
    errorMessage.value =
      err?.data?.message ||
      (err?.data?.errors ? Object.values(err.data.errors).flat().join(' ') : null) ||
      err.message ||
      'Registration failed. Please try again.'
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

.btn-submit {
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.alert-box,
.success-box {
  padding: 14px 16px;
  border-radius: 16px;
}

.alert-box {
  background: rgba(254, 226, 226, 0.9);
  color: #b91c1c;
}

.success-box {
  background: rgba(220, 252, 231, 0.9);
  color: #166534;
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
