<template>
  <div class="container py-5">
    <h1 class="mb-4">Products</h1>

    <div class="row">
      <!-- Filters Sidebar -->
      <div class="col-md-3">
        <div class="card mb-4">
          <div class="card-header">
            <h5>Filters</h5>
          </div>
          <div class="card-body">
            <!-- Category Filter -->
            <div class="mb-3">
              <label class="form-label"><strong>Category</strong></label>
              <select v-model="selectedCategory" class="form-select" @change="fetchProducts">
                <option value="">All Categories</option>
                <option v-for="cat in categories" :key="cat.id" :value="cat.slug">
                  {{ cat.name }}
                </option>
              </select>
            </div>

            <!-- Price Range -->
            <div class="mb-3">
              <label class="form-label"><strong>Price Range</strong></label>
              <div class="row">
                <div class="col-6">
                  <input 
                    v-model.number="minPrice" 
                    type="number" 
                    class="form-control" 
                    placeholder="Min"
                    @change="fetchProducts"
                  >
                </div>
                <div class="col-6">
                  <input 
                    v-model.number="maxPrice" 
                    type="number" 
                    class="form-control" 
                    placeholder="Max"
                    @change="fetchProducts"
                  >
                </div>
              </div>
            </div>

            <!-- Sort -->
            <div class="mb-3">
              <label class="form-label"><strong>Sort By</strong></label>
              <select v-model="sort" class="form-select" @change="fetchProducts">
                <option value="latest">Latest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- Products -->
      <div class="col-md-9">
        <!-- Search -->
        <div class="mb-4">
          <div class="input-group">
            <input 
              v-model="searchQuery" 
              type="text" 
              class="form-control" 
              placeholder="Search products..."
            >
            <button @click="search" class="btn btn-primary">Search</button>
          </div>
        </div>

        <!-- Products Grid -->
        <div class="row">
          <div v-for="product in products" :key="product.id" class="col-md-4 mb-4">
            <ProductCard :product="product" />
          </div>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li :class="['page-item', { disabled: currentPage === 1 }]">
              <button @click="previousPage" class="page-link">Previous</button>
            </li>
            <li v-for="page in totalPages" :key="page" :class="['page-item', { active: page === currentPage }]">
              <button @click="goToPage(page)" class="page-link">{{ page }}</button>
            </li>
            <li :class="['page-item', { disabled: currentPage === totalPages }]">
              <button @click="nextPage" class="page-link">Next</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useApi } from '../composables/useApi'
import ProductCard from '../components/ProductCard.vue'

const { api } = useApi()
const route = useRoute()

const categories = ref([])
const products = ref([])
const selectedCategory = ref(route.query.category || '')
const searchQuery = ref('')
const minPrice = ref('')
const maxPrice = ref('')
const sort = ref('latest')
const currentPage = ref(1)
const totalPages = ref(1)

const fetchProducts = async () => {
  try {
    const params = {
      page: currentPage.value,
      sort: sort.value,
    }

    if (selectedCategory.value) params.category = selectedCategory.value
    if (minPrice.value) params.min_price = minPrice.value
    if (maxPrice.value) params.max_price = maxPrice.value

    const response = await api.get('/products', { params })
    products.value = response.data.data.data
    totalPages.value = response.data.data.last_page
  } catch (error) {
    console.error('Error fetching products:', error)
  }
}

const search = async () => {
  try {
    const response = await api.get('/products/search', {
      params: { q: searchQuery.value }
    })
    products.value = response.data.data.data
    totalPages.value = response.data.data.last_page
  } catch (error) {
    console.error('Error searching products:', error)
  }
}

const goToPage = (page) => {
  currentPage.value = page
  fetchProducts()
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
    fetchProducts()
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
    fetchProducts()
  }
}

onMounted(async () => {
  try {
    const response = await api.get('/categories')
    categories.value = response.data.data
    await fetchProducts()
  } catch (error) {
    console.error('Error loading categories:', error)
  }
})
</script>