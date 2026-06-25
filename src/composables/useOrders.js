// src/composables/useOrders.js
import { ref } from 'vue';
import { useApi } from './useApi';

export function useOrders() {
  const { get, post } = useApi();
  const orders = ref([]);
  const order = ref(null);
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    perPage: 0,
    total: 0,
  });
  const loading = ref(false);
  const error = ref(null);

  const extractList = (response) => {
    return (
      response?.data?.data ||
      response?.data?.orders ||
      response?.data ||
      response?.orders ||
      (Array.isArray(response) ? response : [])
    );
  };

  const extractPagination = (response) => {
    const meta = response?.data || response || {};
    return {
      currentPage: meta.current_page || meta.currentPage || 1,
      lastPage: meta.last_page || meta.lastPage || 1,
      perPage: meta.per_page || meta.perPage || 0,
      total: meta.total || 0,
    };
  };

  const extractItem = (response) => {
    return response?.data?.order || response?.data?.data || response?.data || response?.order || response;
  };

  const getOrders = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await get(`/orders?page=${page}`);
      orders.value = extractList(response);
      pagination.value = extractPagination(response);
      return orders.value;
    } catch (err) {
      error.value = err?.data?.message || err.message || 'Failed to load orders';
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
      order.value = extractItem(response);
      return order.value;
    } catch (err) {
      error.value = err?.data?.message || err.message || 'Failed to load order';
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
      order.value = extractItem(response);
      return order.value;
    } catch (err) {
      error.value = err?.data?.message || err.message || 'Failed to create order';
      throw err;
    } finally {
      loading.value = false;
    }
  };

  return {
    orders,
    order,
    pagination,
    loading,
    error,
    getOrders,
    getOrder,
    createOrder,
  };
}
