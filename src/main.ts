import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import './style.css'
import './assets/design-system.css'

createApp(App).use(createPinia()).mount('#app')
