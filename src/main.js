import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'
import { useUserStore } from '@/stores/userStore';

const app = createApp(App)

// Ícones simulados
app.component('font-awesome-icon', {
  props: ['icon'],
  template: `<span class="icon-placeholder">{{ icon[1] }}</span>`,
})

const iconClasses = {
  'fa-users': 'users',
  'fa-microchip': 'microchip',
  'fa-city': 'city',
  'fa-tachometer-alt': 'tachometer-alt',
  'fa-sync': 'sync',
  'fa-sign-out-alt': 'sign-out-alt',
  'fa-cog': 'cog',
  'fa-edit': 'edit',
  'fa-trash': 'trash',
  'fa-chart-line': 'chart-line',
  'fa-map-marker-alt': 'map-marker-alt',
  'fa-search': 'search',
  'fa-plus': 'plus',
  'fa-chevron-left': 'chevron-left',
  'fa-chevron-right': 'chevron-right',
  'fa-signal': 'signal',
  'fa-info-circle': 'info-circle',
  'fa-user': 'user'
};

app.mixin({
  computed: {
    fas() {
      return iconClasses;
    }
  }
})

const pinia = createPinia()
app.use(pinia)

const userStore = useUserStore();
userStore.loadFromStorage();

app.use(router)
app.mount('#app')
