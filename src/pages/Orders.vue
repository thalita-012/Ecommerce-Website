<template>
  <div class="container py-5">
    <h1 class="mb-4">My Orders</h1>

    <div v-if="orders.length > 0" class="card">
      <table class="table mb-0">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>{{ new Date(order.created_at).toLocaleDateString() }}</td>
            <td>${{ order.total_price }}</td>
            <td>
              <span :class="['badge', order.status === 'completed' ? 'bg-success' : 'bg-warning']">
                {{ order.status }}
              </span>
            </td>
            <td>
              <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="btn btn-sm btn-primary">
                View
              </router-link>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-else class="alert alert-info">
      You haven't placed any orders yet.
      <router-link to="/products">Start shopping</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi'

const { api } = useApi()
const orders = ref([])

onMounted(async () => {
  try {
    const response = await api.get('/orders')
    orders.value = response.data.data.data
  } catch (error) {
    console.error('Error fetching orders:', error)
  }
})
</script>