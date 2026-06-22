<template>
  <div>
    <!-- Hero Section -->
    <section class="bg-light py-5">
      <div class="container text-center">
        <h1 class="display-4 mb-3">Welcome to E-Commerce</h1>
        <p class="lead mb-4">Discover amazing products at great prices</p>
        <router-link to="/products" class="btn btn-primary btn-lg">
          Shop Now
        </router-link>
      </div>
    </section>

    <!-- Categories Section -->
    <section class="py-5">
      <div class="container">
        <h2 class="mb-4">Categories</h2>
        <div class="row">
          <div v-for="category in categories" :key="category.id" class="col-md-4 mb-4">
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{{ category.name }}</h5>
                <p class="card-text text-muted">{{ category.products.length }} products</p>
                <router-link 
                  :to="{ name: 'Products', query: { category: category.slug } }" 
                  class="btn btn-primary"
                >
                  View Category
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Featured Products Section -->
    <section class="py-5 bg-light">
      <div class="container">
        <h2 class="mb-4">Featured Products</h2>
        <div class="row">
          <div v-for="product in featuredProducts" :key="product.id" class="col-md-3 mb-4">
            <ProductCard :product="product" />
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useApi } from '../composables/useApi'
import ProductCard from '../components/ProductCard.vue'

const { api } = useApi()
const categories = ref([])
const featuredProducts = ref([])

onMounted(async () => {
  try {
    const categoriesRes = await api.get('/categories')
    categories.value = categoriesRes.data.data

    const productsRes = await api.get('/products?per_page=8')
    featuredProducts.value = productsRes.data.data.data
  } catch (error) {
    console.error('Error loading home data:', error)
  }
})
</script>