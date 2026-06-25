<template>
  <div class="container py-5">
    <h1 class="mb-4">My Profile</h1>

    <div class="row">
      <div class="col-md-6">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Edit Profile</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="updateProfile">
              <div class="mb-3">
                <label class="form-label">Name</label>
                <input v-model="name" type="text" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Email</label>
                <input v-model="email" type="email" class="form-control" required>
              </div>

              <button :disabled="loading" class="btn btn-primary">
                {{ loading ? 'Updating...' : 'Update Profile' }}
              </button>
            </form>
          </div>
        </div>
      </div>

      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5>Change Password</h5>
          </div>
          <div class="card-body">
            <form @submit.prevent="changePassword">
              <div class="mb-3">
                <label class="form-label">Current Password</label>
                <input v-model="currentPassword" type="password" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">New Password</label>
                <input v-model="newPassword" type="password" class="form-control" required>
              </div>

              <div class="mb-3">
                <label class="form-label">Confirm Password</label>
                <input v-model="confirmPassword" type="password" class="form-control" required>
              </div>

              <button :disabled="loading" class="btn btn-primary">
                {{ loading ? 'Changing...' : 'Change Password' }}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useApi } from '../composables/useApi'
import { useAuthStore } from '../stores/auth'

const { api } = useApi()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const loading = ref(false)

const updateProfile = async () => {
  loading.value = true
  try {
    const response = await api.put('/auth/profile', {
      name: name.value,
      email: email.value
    })
    authStore.setAuth(response.data.user, authStore.token)
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
      text: 'Error updating profile',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    loading.value = false
  }
}

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    alert('Passwords do not match')
    return
  }

  loading.value = true
  try {
    await api.post('/auth/change-password', {
      current_password: currentPassword.value,
      password: newPassword.value,
      password_confirmation: confirmPassword.value
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
      text: error.response?.data?.message || 'Error changing password',
      confirmButtonColor: '#ef4444',
    })
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  name.value = authStore.user.name
  email.value = authStore.user.email
})
</script>
