<template>
  <main class="orders-page">
    <section class="orders-shell">
      <div class="header-row">
        <div>
          <p class="eyebrow">Your orders</p>
          <h1>Order history</h1>
        </div>
        <router-link to="/products" class="btn-shop">Continue shopping</router-link>
      </div>

      <div v-if="loading" class="state-box">Loading orders...</div>
      <div v-else-if="error" class="state-box error">{{ error }}</div>
      <div v-else-if="orders.length === 0" class="state-box">
        You haven't placed any orders yet.
      </div>

      <div v-else class="orders-grid">
        <article v-for="order in orders" :key="order.id" class="order-card">
          <div>
            <p class="order-id">Order #{{ order.id }}</p>
            <h3>${{ parseFloat(order.total_amount || order.total_price || 0).toFixed(2) }}</h3>
            <p class="meta">{{ formatDate(order.created_at) }}</p>
          </div>

          <div class="status" :class="(order.status || 'pending').toLowerCase()">
            {{ order.status || 'Pending' }}
          </div>

          <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="btn-view">
            View order
          </router-link>
        </article>
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue'
import Swal from 'sweetalert2'
import { useOrders } from '@/composables/useOrders'

const { orders, loading, error, getOrders } = useOrders()

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString()
}

onMounted(async () => {
  try {
    await getOrders()
  } catch (err) {
    console.error('Error fetching orders:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Orders unavailable',
      text: err?.message || 'Failed to load orders. Please try again.',
      confirmButtonColor: '#ef4444',
    })
  }
})
</script>

<style scoped>
.orders-page {
  min-height: 100%;
  padding: 40px 24px 72px;
}

.orders-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.header-row {
  display: flex;
  align-items: end;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 22px;
}

.eyebrow {
  margin: 0 0 10px;
  color: #25603a;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.75rem;
}

.header-row h1 {
  margin: 0;
}

.btn-shop,
.btn-view {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
}

.btn-shop {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
}

.state-box {
  padding: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(23, 48, 28, 0.08);
}

.state-box.error {
  color: #b91c1c;
}

.orders-grid {
  display: grid;
  gap: 16px;
}

.order-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px 20px;
  border-radius: 24px;
  background: rgba(255, 255, 255, 0.84);
  border: 1px solid rgba(23, 48, 28, 0.08);
}

.order-id {
  margin: 0 0 8px;
  color: #58705c;
  font-weight: 700;
}

.meta {
  margin: 0;
  color: #58705c;
}

.status {
  padding: 8px 14px;
  border-radius: 999px;
  font-weight: 700;
  text-transform: capitalize;
}

.status.pending {
  background: rgba(251, 191, 36, 0.16);
  color: #92400e;
}

.status.completed,
.status.delivered {
  background: rgba(34, 197, 94, 0.16);
  color: #166534;
}

.status.cancelled {
  background: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
}

.btn-view {
  color: #17301c;
  background: rgba(23, 48, 28, 0.08);
}

@media (max-width: 720px) {
  .header-row,
  .order-card {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
