<template>
  <main class="orders-page">
    <section class="orders-shell">
      <div class="orders-hero">
        <div>
          <p class="eyebrow">Your orders</p>
          <h1>Order history</h1>
          <p class="lead">
            Browse your recent orders with a lightweight summary. Open any order only when you need the full details.
          </p>
        </div>

        <router-link to="/products" class="btn-shop">Continue shopping</router-link>
      </div>

      <div class="stats-row">
        <div class="stat-card">
          <span>Current page</span>
          <strong>{{ pagination.currentPage }}</strong>
        </div>
        <div class="stat-card">
          <span>Total orders</span>
          <strong>{{ pagination.total || orders.length }}</strong>
        </div>
        <div class="stat-card">
          <span>Loaded now</span>
          <strong>{{ orders.length }}</strong>
        </div>
      </div>

      <div v-if="loading && !orders.length" class="state-box">Loading orders...</div>
      <div v-else-if="error" class="state-box error">{{ error }}</div>
      <div v-else-if="orders.length === 0" class="state-box">
        You haven't placed any orders yet.
      </div>

      <div v-else class="orders-table-wrap">
        <div class="orders-table">
          <div class="orders-head">
            <span>Order ID</span>
            <span>Date</span>
            <span>Status</span>
            <span>Total Price</span>
            <span></span>
          </div>

          <article v-for="order in orders" :key="order.id" class="orders-row">
            <div class="cell order-id">#{{ order.id }}</div>
            <div class="cell">{{ formatDate(order.created_at) }}</div>
            <div class="cell">
              <span class="status" :class="statusClass(order.status)">{{ order.status || 'Pending' }}</span>
            </div>
            <div class="cell price">
              ${{ formatMoney(order.total_amount ?? order.total_price ?? order.total ?? 0) }}
            </div>
            <div class="cell action-cell">
              <router-link :to="{ name: 'OrderDetail', params: { id: order.id } }" class="btn-view">
                View details
              </router-link>
            </div>
          </article>
        </div>
      </div>

      <div v-if="orders.length" class="pagination-bar">
        <button class="page-btn" :disabled="pagination.currentPage <= 1 || loading" @click="changePage(pagination.currentPage - 1)">
          Previous
        </button>

        <div class="page-info">
          Page {{ pagination.currentPage }} of {{ pagination.lastPage }}
        </div>

        <button class="page-btn" :disabled="pagination.currentPage >= pagination.lastPage || loading" @click="changePage(pagination.currentPage + 1)">
          Next
        </button>
      </div>

      <div v-if="loading && orders.length" class="loading-more">
        Loading more orders...
      </div>
    </section>
  </main>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import Swal from 'sweetalert2'
import { useOrders } from '@/composables/useOrders'

const { orders, loading, error, getOrders, pagination } = useOrders()
const currentPage = ref(1)

const formatDate = (value) => {
  if (!value) return 'N/A'
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatMoney = (value) => {
  const amount = Number.parseFloat(value || 0)
  return amount.toFixed(2)
}

const statusClass = (status) => {
  return (status || 'pending').toLowerCase()
}

const loadOrders = async (page = 1) => {
  try {
    currentPage.value = page
    await getOrders(page)
  } catch (err) {
    console.error('Error fetching orders:', err)
    await Swal.fire({
      icon: 'error',
      title: 'Orders unavailable',
      text: err?.message || 'Failed to load orders. Please try again.',
      confirmButtonColor: '#ef4444',
    })
  }
}

const changePage = async (page) => {
  if (page < 1 || page === currentPage.value) return
  await loadOrders(page)
}

onMounted(() => {
  loadOrders(1)
})
</script>

<style scoped>
.orders-page {
  min-height: 100%;
  padding: 32px 24px 72px;
  background:
    radial-gradient(circle at top left, rgba(249, 115, 22, 0.12), transparent 28%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.12), transparent 26%),
    linear-gradient(180deg, #fffdf7 0%, #f5fff2 100%);
}

.orders-shell {
  max-width: 1180px;
  margin: 0 auto;
}

.orders-hero {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
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

.orders-hero h1 {
  margin: 0;
  color: #17301c;
  font-size: clamp(2rem, 4vw, 3.5rem);
  letter-spacing: -0.04em;
}

.lead {
  margin: 10px 0 0;
  max-width: 68ch;
  color: #58705c;
  line-height: 1.7;
}

.btn-shop,
.btn-view,
.page-btn {
  text-decoration: none;
  border-radius: 999px;
  padding: 12px 18px;
  font-weight: 700;
  border: 0;
  cursor: pointer;
}

.btn-shop {
  color: #fff;
  background: linear-gradient(135deg, #ef4444, #f97316);
  box-shadow: 0 14px 28px rgba(249, 115, 22, 0.2);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  margin-bottom: 18px;
}

.stat-card,
.state-box,
.orders-table,
.pagination-bar {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(23, 48, 28, 0.08);
  box-shadow: 0 18px 50px rgba(24, 48, 28, 0.08);
  backdrop-filter: blur(12px);
}

.stat-card {
  padding: 18px 20px;
  border-radius: 22px;
}

.stat-card span {
  display: block;
  color: #7c8d80;
  font-size: 0.86rem;
  margin-bottom: 6px;
}

.stat-card strong {
  color: #17301c;
  font-size: 1.2rem;
}

.state-box {
  padding: 24px;
  border-radius: 20px;
}

.state-box.error {
  color: #b91c1c;
}

.orders-table-wrap {
  overflow-x: auto;
}

.orders-table {
  min-width: 780px;
  border-radius: 26px;
  overflow: hidden;
}

.orders-head,
.orders-row {
  display: grid;
  grid-template-columns: 1fr 1.1fr 1fr 1fr auto;
  gap: 14px;
  align-items: center;
}

.orders-head {
  padding: 16px 20px;
  background: rgba(23, 48, 28, 0.04);
  color: #58705c;
  font-weight: 700;
}

.orders-row {
  padding: 18px 20px;
  border-top: 1px solid rgba(23, 48, 28, 0.08);
}

.cell {
  min-width: 0;
}

.order-id {
  font-weight: 800;
  color: #17301c;
}

.price {
  font-weight: 800;
  color: #17301c;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.status.processing {
  background: rgba(59, 130, 246, 0.14);
  color: #1d4ed8;
}

.status.cancelled {
  background: rgba(239, 68, 68, 0.14);
  color: #b91c1c;
}

.btn-view {
  color: #17301c;
  background: rgba(23, 48, 28, 0.08);
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 18px;
  padding: 16px 20px;
  border-radius: 22px;
}

.page-btn {
  color: #17301c;
  background: rgba(23, 48, 28, 0.08);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  color: #58705c;
  font-weight: 700;
}

.loading-more {
  margin-top: 12px;
  color: #58705c;
  text-align: center;
}

@media (max-width: 900px) {
  .orders-hero {
    flex-direction: column;
    align-items: flex-start;
  }

  .stats-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .orders-page {
    padding: 20px 14px 56px;
  }

  .pagination-bar {
    flex-direction: column;
  }
}
</style>
