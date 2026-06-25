// src/composables/useOrders.js
import { ref } from 'vue';
import { useApi } from './useApi';

export function useOrders() {
  const { get, post } = useApi();
  const orders = ref([]);
  const order = ref(null);
  const loading = ref(false);
  const error = ref(null);

  const getOrders = async () => {
    loading.value = true;
    error.value = null;
    try {
      const response = await get('/orders');
      orders.value = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : response?.data?.data || response?.data || [];
      return orders.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const getOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await get(`/orders/${orderId}`);
      order.value = response?.data || response;
      return order.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const createOrder = async (data) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await post('/orders', data);
      order.value = response?.data || response;
      return order.value;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const cancelOrder = async (orderId) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await post(`/orders/${orderId}/cancel`, {});
      return response;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    order,
    loading,
    error,
    getOrders,
    getOrder,
    createOrder,
    cancelOrder,
  };
}
