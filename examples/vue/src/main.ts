import { convexVue } from '@onmax/convex-vue'
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

app.use(convexVue, {
  url: import.meta.env.VITE_CONVEX_URL || 'https://example.convex.cloud',
})

app.mount('#app')
