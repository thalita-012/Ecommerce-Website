<template>
  <div class="order-detail-page">
    <!-- Loading State -->
    <div v-if="loading" class="loading-container">
      <div class="spinner"></div>
      <p>Loading order details...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-container">
      <p class="error-message">{{ error }}</p>
      <button @click="fetchOrder" class="retry-btn">Retry</button>
    </div>

    <!-- Order Details -->
    <div v-else-if="order" class="order-container">
      <!-- Back Button -->
      <button @click="goBack" class="back-btn">
        ← Back to Orders
      </button>

      <!-- Order Header -->
      <div class="order-header">
        <h1>Order #{{ order.id }}</h1>
        <span :class="['order-status', order.status?.toLowerCase() || 'pending']">
          {{ order.status || 'Pending' }}
        </span>
      </div>

      <!-- Order Info Grid -->
      <div class="order-info-grid">
        <div class="info-card">
          <h3>Order Date</h3>
          <p>{{ formatDate(order.created_at) }}</p>
        </div>
        <div class="info-card">
          <h3>Total Amount</h3>
          <p class="total-amount">${{ parseFloat(order.total_amount).toFixed(2) }}</p>
        </div>
        <div class="info-card">
          <h3>Payment Method</h3>
          <p>{{ order.payment_method || 'Not specified' }}</p>
        </div>
        <div class="info-card">
          <h3>Payment Status</h3>
          <span :class="['payment-status', order.payment_status?.toLowerCase() || 'pending']">
            {{ order.payment_status || 'Pending' }}
          </span>
        </div>
      </div>

      <!-- Shipping Address -->
      <div v-if="order.shipping_address" class="shipping-section">
        <h2>Shipping Address</h2>
        <div class="address-card">
          <p><strong>{{ order.shipping_address.name || order.user?.name }}</strong></p>
          <p>{{ order.shipping_address.address_line1 }}</p>
          <p v-if="order.shipping_address.address_line2">{{ order.shipping_address.address_line2 }}</p>
          <p>{{ order.shipping_address.city }}, {{ order.shipping_address.state }} {{ order.shipping_address.postal_code }}</p>
          <p>{{ order.shipping_address.country }}</p>
          <p v-if="order.shipping_address.phone">Phone: {{ order.shipping_address.phone }}</p>
        </div>
      </div>

      <!-- Order Items -->
      <div class="order-items-section">
        <h2>Order Items</h2>
        
        <div v-if="order.items && order.items.length > 0" class="items-list">
          <div 
            v-for="item in order.items" 
            :key="item.id" 
            class="order-item"
          >
            <div class="item-image">
              <img 
                :src="item.product?.image_url || item.image || '/placeholder-image.jpg'" 
                :alt="item.product?.name || item.name"
                @error="handleImageError"
              />
            </div>
            
            <div class="item-details">
              <h3>{{ item.product?.name || item.name || 'Product' }}</h3>
              <p class="item-sku" v-if="item.sku">SKU: {{ item.sku }}</p>
              <p class="item-quantity">Quantity: {{ item.quantity }}</p>
              <p class="item-price">Price: ${{ parseFloat(item.price).toFixed(2) }}</p>
              <p class="item-total">Subtotal: ${{ (parseFloat(item.price) * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div v-else class="empty-items">
          <p>No items found in this order.</p>
        </div>
      </div>

      <!-- Order Summary -->
      <div class="order-summary">
        <h2>Order Summary</h2>
        <div class="summary-row">
          <span>Subtotal</span>
          <span>${{ parseFloat(order.subtotal || order.total_amount).toFixed(2) }}</span>
        </div>
        <div class="summary-row" v-if="order.discount">
          <span>Discount</span>
          <span>-${{ parseFloat(order.discount).toFixed(2) }}</span>
        </div>
        <div class="summary-row" v-if="order.shipping_cost">
          <span>Shipping</span>
          <span>${{ parseFloat(order.shipping_cost).toFixed(2) }}</span>
        </div>
        <div class="summary-row" v-if="order.tax">
          <span>Tax</span>
          <span>${{ parseFloat(order.tax).toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span><strong>Total</strong></span>
          <span><strong>${{ parseFloat(order.total_amount).toFixed(2) }}</strong></span>
        </div>
      </div>

      <!-- Cancel Button -->
      <div v-if="order.status?.toLowerCase() === 'pending'" class="order-actions">
        <button @click="cancelOrder" class="cancel-btn">
          Cancel Order
        </button>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="not-found">
      <h2>Order Not Found</h2>
      <p>The order you're looking for doesn't exist.</p>
      <router-link to="/orders" class="back-link">View All Orders</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useOrders } from '@/composables/useOrders';

// Router
const router = useRouter();
const route = useRoute();

// Composables
const { getOrder, cancelOrder: cancelOrderApi } = useOrders();

// State
const order = ref(null);
const loading = ref(true);
const error = ref('');

// Fetch order details
const fetchOrder = async () => {
  const orderId = route.params.id;
  
  if (!orderId) {
    error.value = 'Invalid order ID';
    loading.value = false;
    return;
  }

  loading.value = true;
  error.value = '';

  try {
    const response = await getOrder(orderId);
    order.value = response;
  } catch (err) {
    console.error('Error fetching order:', err);
    if (err.response?.status === 404) {
      error.value = 'Order not found';
    } else {
      error.value = err.message || 'Failed to load order details. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

// Go back to orders
const goBack = () => {
  router.push('/orders');
};

// Format date
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Handle image error
const handleImageError = (event) => {
  event.target.src = '/placeholder-image.jpg';
};

// Cancel order
const cancelOrder = async () => {
  if (!confirm('Are you sure you want to cancel this order?')) return;
  
  try {
    await cancelOrderApi(order.value.id);
    await fetchOrder();
    alert('Order cancelled successfully');
  } catch (err) {
    console.error('Error cancelling order:', err);
    alert(err.message || 'Failed to cancel order. Please try again.');
  }
};

// Fetch order on component mount
onMounted(() => {
  fetchOrder();
});
</script>

<style scoped>
.order-detail-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* Loading State */
.loading-container {
  text-align: center;
  padding: 60px 20px;
}

.spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #4CAF50;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
  margin: 0 auto 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-container {
  text-align: center;
  padding: 60px 20px;
}

.error-message {
  color: #ff4444;
  font-size: 18px;
  margin-bottom: 20px;
}

.retry-btn {
  padding: 10px 30px;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.retry-btn:hover {
  background: #45a049;
}

/* Back Button */
.back-btn {
  background: none;
  border: none;
  color: #4CAF50;
  font-size: 16px;
  cursor: pointer;
  padding: 10px 0;
  margin-bottom: 20px;
  transition: color 0.3s;
}

.back-btn:hover {
  color: #388E3C;
  text-decoration: underline;
}

/* Order Header */
.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  flex-wrap: wrap;
  gap: 15px;
}

.order-header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.order-status {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  text-transform: capitalize;
}

.order-status.pending {
  background: #fff3cd;
  color: #856404;
}

.order-status.processing {
  background: #cce5ff;
  color: #004085;
}

.order-status.shipped {
  background: #d1ecf1;
  color: #0c5460;
}

.order-status.delivered {
  background: #d4edda;
  color: #155724;
}

.order-status.cancelled {
  background: #f8d7da;
  color: #721c24;
}

/* Order Info Grid */
.order-info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.info-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.info-card h3 {
  font-size: 14px;
  color: #666;
  margin: 0 0 10px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-card p {
  font-size: 18px;
  color: #333;
  margin: 0;
  font-weight: 500;
}

.total-amount {
  font-weight: bold;
  color: #4CAF50;
  font-size: 20px;
}

.payment-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 14px;
  display: inline-block;
  font-weight: 500;
}

.payment-status.paid {
  background: #d4edda;
  color: #155724;
}

.payment-status.pending {
  background: #fff3cd;
  color: #856404;
}

.payment-status.failed {
  background: #f8d7da;
  color: #721c24;
}

/* Shipping Section */
.shipping-section {
  margin-bottom: 30px;
}

.shipping-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

.address-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
}

.address-card p {
  margin: 5px 0;
  color: #555;
  line-height: 1.6;
}

/* Order Items */
.order-items-section {
  margin-bottom: 30px;
}

.order-items-section h2 {
  font-size: 20px;
  color: #333;
  margin-bottom: 15px;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.order-item {
  display: flex;
  gap: 20px;
  padding: 15px;
  background: white;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: box-shadow 0.2s;
}

.order-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.item-image {
  flex-shrink: 0;
  width: 100px;
  height: 100px;
  overflow: hidden;
  border-radius: 4px;
  background: #f5f5f5;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.item-details {
  flex: 1;
}

.item-details h3 {
  margin: 0 0 8px 0;
  color: #333;
  font-size: 18px;
}

.item-details p {
  margin: 4px 0;
  color: #666;
  font-size: 14px;
}

.item-price {
  font-weight: 500;
  color: #333;
}

.item-total {
  font-weight: 600;
  color: #4CAF50;
}

.empty-items {
  text-align: center;
  padding: 40px;
  background: #f9f9f9;
  border-radius: 8px;
  color: #666;
}

/* Order Summary */
.order-summary {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  max-width: 400px;
  margin-left: auto;
  border: 1px solid #eee;
}

.order-summary h2 {
  font-size: 18px;
  color: #333;
  margin: 0 0 15px 0;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  color: #666;
}

.summary-row.total {
  border-top: 2px solid #ddd;
  margin-top: 8px;
  padding-top: 12px;
  color: #333;
  font-size: 18px;
}

/* Order Actions */
.order-actions {
  text-align: center;
  padding: 20px 0;
}

.cancel-btn {
  padding: 12px 30px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.cancel-btn:hover {
  background: #c82333;
}

/* Not Found */
.not-found {
  text-align: center;
  padding: 60px 20px;
}

.not-found h2 {
  color: #333;
  margin-bottom: 10px;
}

.not-found p {
  color: #666;
  margin-bottom: 20px;
}

.back-link {
  display: inline-block;
  padding: 10px 30px;
  background: #4CAF50;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s;
}

.back-link:hover {
  background: #45a049;
}

/* Responsive */
@media (max-width: 768px) {
  .order-item {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .item-image {
    width: 150px;
    height: 150px;
  }

  .order-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .order-summary {
    max-width: 100%;
  }

  .order-info-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 480px) {
  .order-info-grid {
    grid-template-columns: 1fr;
  }
  
  .order-detail-page {
    padding: 10px;
  }
}
</style>