// src/composables/useOrders.js
import { ref } from 'vue';
import { useApi } from './useApi';

const ORDERS_CACHE_PREFIX = 'orders_cache';

const normalizeId = (value) => (value == null ? null : String(value));

const safeParse = (value, fallback = null) => {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

const getCurrentUserCacheKey = () => {
  try {
    const storedUser = safeParse(sessionStorage.getItem('user'));
    const userKey = storedUser?.id ?? storedUser?.email ?? 'guest';
    return `${ORDERS_CACHE_PREFIX}:${userKey}`;
  } catch {
    return `${ORDERS_CACHE_PREFIX}:guest`;
  }
};

const summarizeOrder = (order) => {
  if (!order || typeof order !== 'object') return null;

  const items = Array.isArray(order.items)
    ? order.items.map((item) => ({
        id: item?.id ?? item?.product_id ?? item?.product?.id ?? null,
        product_id: item?.product_id ?? item?.product?.id ?? item?.id ?? null,
        name: item?.product?.name ?? item?.name ?? 'Product',
        image: item?.product?.image_url ?? item?.image ?? item?.product?.image ?? '',
        price: item?.price ?? item?.product?.price ?? 0,
        quantity: item?.quantity ?? 1,
        sku: item?.sku ?? null,
      }))
    : [];

  let shippingAddress = order.shipping_address ?? null;
  if (typeof shippingAddress === 'string') {
    try {
      shippingAddress = JSON.parse(shippingAddress);
    } catch {
      // Keep string if parsing fails
    }
  }

  return {
    id: order.id ?? null,
    created_at: order.created_at ?? order.updated_at ?? new Date().toISOString(),
    status: order.status ?? 'Pending',
    total_amount: order.total_amount ?? order.total_price ?? order.total ?? 0,
    total_price: order.total_price ?? order.total_amount ?? order.total ?? 0,
    total: order.total ?? order.total_amount ?? order.total_price ?? 0,
    payment_status: order.payment_status ?? 'Pending',
    payment_method: order.payment_method ?? null,
    subtotal: order.subtotal ?? order.total_amount ?? order.total_price ?? order.total ?? 0,
    shipping_cost: order.shipping_cost ?? 0,
    tax: order.tax ?? 0,
    discount: order.discount ?? 0,
    shipping_address: shippingAddress,
    items,
  };
};

const readCachedOrders = () => {
  try {
    const cached = safeParse(localStorage.getItem(getCurrentUserCacheKey()), null);
    if (!cached || typeof cached !== 'object') {
      return { orders: [], pagination: null, updated_at: null };
    }

    return {
      orders: Array.isArray(cached.orders) ? cached.orders : [],
      pagination: cached.pagination || null,
      updated_at: cached.updated_at || null,
    };
  } catch {
    return { orders: [], pagination: null, updated_at: null };
  }
};

const writeCachedOrders = (ordersList, pagination = null) => {
  try {
    const payload = {
      orders: Array.isArray(ordersList) ? ordersList.map((order) => summarizeOrder(order)).filter(Boolean) : [],
      pagination: pagination || null,
      updated_at: new Date().toISOString(),
    };
    localStorage.setItem(getCurrentUserCacheKey(), JSON.stringify(payload));
  } catch (err) {
    console.error('Failed to save order cache:', err);
  }
};

const upsertCachedOrder = (order) => {
  const normalized = summarizeOrder(order);
  if (!normalized) return;

  try {
    const cached = readCachedOrders();
    const existingIndex = cached.orders.findIndex((item) => normalizeId(item.id) === normalizeId(normalized.id));

    if (existingIndex >= 0) {
      cached.orders[existingIndex] = normalized;
    } else {
      cached.orders = [normalized, ...cached.orders];
    }

    const nextPagination = cached.pagination || {
      currentPage: 1,
      lastPage: 1,
      perPage: cached.orders.length,
      total: cached.orders.length,
    };

    writeCachedOrders(cached.orders, nextPagination);
  } catch (err) {
    console.error('Failed to update order cache:', err);
  }
};

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
  const isUsingCache = ref(false);
  const cachedAt = ref(null);

  const extractList = (response) => {
    if (response?.data?.data && Array.isArray(response.data.data.data)) {
      return response.data.data.data;
    }
    if (Array.isArray(response?.data?.data)) {
      return response.data.data;
    }
    return (
      response?.data?.orders ||
      response?.data ||
      response?.orders ||
      (Array.isArray(response) ? response : [])
    );
  };

  const extractPagination = (response) => {
    const meta = (response?.data?.data && response.data.data.current_page) 
      ? response.data.data 
      : (response?.data || response || {});
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

  const getFriendlyErrorMessage = (err, fallback) => {
    const status = err?.status ?? err?.response?.status ?? err?.data?.status ?? 0;
    const rawMessage = err?.data?.message || err?.message || '';
    const looksLikeServerFailure =
      status >= 500 ||
      /Allowed memory size|maximum execution time|stack trace|SQLSTATE|fatal error/i.test(rawMessage);

    if (looksLikeServerFailure) {
      return fallback;
    }

    return rawMessage || fallback;
  };

  const getOrders = async (page = 1) => {
    loading.value = true;
    error.value = null;
    try {
      const response = await get(`/orders?page=${page}`);
      orders.value = extractList(response);
      pagination.value = extractPagination(response);
      isUsingCache.value = false;
      cachedAt.value = new Date().toISOString();
      writeCachedOrders(orders.value, pagination.value);
      return orders.value;
    } catch (err) {
      const cached = readCachedOrders();
      if (cached.orders.length > 0) {
        orders.value = cached.orders;
        pagination.value = cached.pagination || {
          currentPage: 1,
          lastPage: 1,
          perPage: cached.orders.length,
          total: cached.orders.length,
        };
        isUsingCache.value = true;
        cachedAt.value = cached.updated_at;
        error.value = 'Showing saved order history from this device. Live orders are temporarily unavailable.';
        return orders.value;
      }

      error.value = getFriendlyErrorMessage(err, 'Orders are temporarily unavailable. Please try again.');
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
      error.value = getFriendlyErrorMessage(err, 'Order details are temporarily unavailable. Please try again.');
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
      upsertCachedOrder(order.value);
      return order.value;
    } catch (err) {
      error.value = getFriendlyErrorMessage(err, 'Could not create the order right now.');
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
    isUsingCache,
    cachedAt,
    getOrders,
    getOrder,
    createOrder,
  };
}
