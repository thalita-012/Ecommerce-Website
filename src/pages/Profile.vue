<template>
  <main class="profile-page">
    <section class="profile-shell">
      <div class="profile-hero">
        <div class="hero-copy">
          <p class="eyebrow">Account center</p>
          <h1>Profile settings</h1>
          <p class="lead">
            Keep your account details fresh, update your password securely, and stay ready for a faster checkout.
          </p>

          <div class="profile-actions">
            <span class="action-pill">Secure checkout</span>
            <span class="action-pill alt">Fresh market profile</span>
          </div>
        </div>

        <div class="profile-summary">
          <div class="summary-card accent">
            <span>Signed in as</span>
            <strong>{{ authStore.user?.name || 'Guest' }}</strong>
          </div>
          <div class="summary-card">
            <span>Email</span>
            <strong>{{ authStore.user?.email || 'Not set' }}</strong>
          </div>
          <div class="summary-card">
            <span>Status</span>
            <strong>Active customer</strong>
          </div>
        </div>
      </div>

      <div class="profile-grid">
        <section class="panel">
          <div class="panel-head">
            <div class="panel-kicker">01</div>
            <div>
              <h2>Edit Profile</h2>
              <p>Update your display name and email address.</p>
            </div>
          </div>

          <form class="form-stack" @submit.prevent="handleUpdateProfile">
            <label>
              <span>Name</span>
              <input v-model.trim="name" type="text" placeholder="Your name" required />
            </label>

            <label>
              <span>Email</span>
              <input v-model.trim="email" type="email" placeholder="you@example.com" required />
            </label>

            <button class="btn-primary" :disabled="loading">
              {{ loading ? 'Updating...' : 'Update Profile' }}
            </button>
          </form>
        </section>

        <section class="panel">
          <div class="panel-head">
            <div class="panel-kicker">02</div>
            <div>
              <h2>Change Password</h2>
              <p>Use a strong password and keep it private.</p>
            </div>
          </div>

          <form class="form-stack" @submit.prevent="handleChangePassword">
            <label>
              <span>Current Password</span>
              <input v-model="currentPassword" type="password" placeholder="Current password" required />
            </label>

            <label>
              <span>New Password</span>
              <input v-model="newPassword" type="password" placeholder="New password" required />
            </label>

            <label>
              <span>Confirm Password</span>
              <input v-model="confirmPassword" type="password" placeholder="Confirm password" required />
            </label>

            <button class="btn-primary" :disabled="loading">
              {{ loading ? 'Changing...' : 'Change Password' }}
            </button>
          </form>
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const handleUpdateProfile = async () => {
  loading.value = true
  try {
    await authStore.updateProfile({
      name: name.value,
      email: email.value,
    })

    await Swal.fire({
      icon: 'success',
      title: 'Profile updated',
      text: 'Your profile was updated successfully.',
      confirmButtonColor: '#ef4444',
    })
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Update failed',
      text: error?.message || 'Error updating profile',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    loading.value = false
  }
}

const handleChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    await Swal.fire({
      icon: 'warning',
      title: 'Password mismatch',
      text: 'Passwords do not match.',
      confirmButtonColor: '#ef4444',
    })
    return
  }

  loading.value = true
  try {
    await authStore.changePassword({
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value,
    })

    await Swal.fire({
      icon: 'success',
      title: 'Password changed',
      text: 'Your password was changed successfully.',
      confirmButtonColor: '#ef4444',
    })

    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    await Swal.fire({
      icon: 'error',
      title: 'Password change failed',
      text: error?.message || 'Error changing password',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  name.value = authStore.user?.name || ''
  email.value = authStore.user?.email || ''
})
</script>

<style scoped>
.profile-page {
  min-height: 100%;
  padding: 32px 24px 72px;
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.18), transparent 24%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.16), transparent 28%),
    linear-gradient(180deg, #fffdf7 0%, #f3fff1 100%);
}

.profile-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.profile-hero {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(300px, 0.8fr);
  gap: 18px;
  align-items: start;
  margin-bottom: 24px;
}

.hero-copy {
  padding: 12px 2px;
}

.eyebrow {
  display: inline-flex;
  width: fit-content;
  padding: 8px 14px;
  border-radius: 999px;
  background: rgba(34, 197, 94, 0.14);
  color: #166534;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  font-size: 0.75rem;
}

.profile-hero h1 {
  margin: 0;
  color: #17301c;
  font-size: clamp(2.3rem, 5vw, 4.2rem);
  line-height: 1;
  letter-spacing: -0.04em;
}

.lead {
  margin: 0;
  color: #58705c;
  max-width: 62ch;
  line-height: 1.7;
  font-size: 1.05rem;
}

.profile-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 18px;
}

.action-pill {
  display: inline-flex;
  align-items: center;
  padding: 10px 14px;
  border-radius: 999px;
  background: rgba(23, 48, 28, 0.08);
  color: #17301c;
  font-weight: 700;
  font-size: 0.92rem;
}

.action-pill.alt {
  background: rgba(249, 115, 22, 0.12);
  color: #9a3412;
}

.profile-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  margin-top: 8px;
}

.summary-card {
  padding: 18px 20px;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.86);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 16px 40px rgba(24, 48, 28, 0.08);
  backdrop-filter: blur(10px);
}

.summary-card.accent {
  background: linear-gradient(135deg, rgba(22, 101, 52, 0.95), rgba(249, 115, 22, 0.9));
  border-color: transparent;
}

.summary-card span {
  display: block;
  color: #58705c;
  font-size: 0.85rem;
  margin-bottom: 6px;
}

.summary-card.accent span {
  color: rgba(255, 255, 255, 0.72);
}

.summary-card strong {
  color: #17301c;
  font-size: 1.05rem;
}

.summary-card.accent strong {
  color: #fff;
}

.profile-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 18px;
}

.panel {
  padding: 24px;
  border-radius: 26px;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 20px 50px rgba(24, 48, 28, 0.1);
  backdrop-filter: blur(12px);
}

.panel-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.panel-kicker {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  height: 42px;
  border-radius: 14px;
  background: linear-gradient(135deg, #17301c, #2f6f3b);
  color: #fff;
  font-weight: 800;
}

.panel-head h2 {
  margin: 0 0 6px;
  color: #17301c;
}

.panel-head p {
  margin: 0;
  color: #58705c;
}

.form-stack {
  display: grid;
  gap: 14px;
}

.form-stack label {
  display: grid;
  gap: 8px;
}

.form-stack span {
  font-weight: 700;
  color: #17301c;
}

.form-stack input {
  width: 100%;
  padding: 14px 16px;
  border-radius: 16px;
  border: 1px solid rgba(23, 48, 28, 0.12);
  background: rgba(255, 255, 255, 0.95);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.form-stack input:focus {
  outline: none;
  border-color: rgba(249, 115, 22, 0.6);
  box-shadow: 0 0 0 4px rgba(249, 115, 22, 0.12);
}

.btn-primary {
  border: 0;
  border-radius: 16px;
  padding: 14px 18px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316 55%, #ea580c);
  box-shadow: 0 14px 28px rgba(249, 115, 22, 0.28);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  box-shadow: none;
}

.btn-primary:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.03);
  box-shadow: 0 18px 30px rgba(249, 115, 22, 0.34);
}

@media (max-width: 900px) {
  .profile-hero {
    grid-template-columns: 1fr;
  }

  .profile-grid,
  .profile-summary {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .profile-page {
    padding: 20px 14px 56px;
  }

  .panel {
    padding: 18px;
    border-radius: 22px;
  }

  .profile-hero h1 {
    font-size: clamp(2rem, 12vw, 3rem);
  }
}
</style>
