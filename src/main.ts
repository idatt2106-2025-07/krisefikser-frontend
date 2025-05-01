import { createApp } from 'vue'
import './assets/main.css'
import App from './App.vue'
import router from './router'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Lara from '@primevue/themes/lara'
import Material from '@primevue/themes/material'
import '@/assets/fonts.css'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Checkbox from 'primevue/checkbox'
import Button from 'primevue/button'
import ToastService from 'primevue/toastservice'
import { createPinia } from 'pinia'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(ToastService)
app.use(PrimeVue, {
  theme: {
    preset: Material,
    options: {
      darkModeSelector: '.my-app-dark',
    },
  },
})
app.use(pinia)

// Register PrimeVue components
app.component('InputText', InputText)
app.component('Password', Password)
app.component('Checkbox', Checkbox)
app.component('Button', Button)

app.mount('#app')
