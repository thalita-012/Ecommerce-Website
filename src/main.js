import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import router from './router'

const app = createApp(App)

app.use(createPinia())   // Register Pinia FIRST
app.use(router)

app.mount('#app')
