import { convexVue } from '@onmax/convex-vue'
import { convexVueStorage } from '@onmax/convex-vue/storage'
import { createApp } from 'vue'
import App from './App.vue'
import { convexUrl, storageApi } from './lib/convex'
import './style.css'

const app = createApp(App)

app.use(convexVue, {
  server: false,
  url: convexUrl || undefined,
})

app.use(convexVueStorage, {
  generateUploadUrl: storageApi.generateUploadUrl,
  getUrl: storageApi.getUrl,
  remove: storageApi.removeByStorageId,
})

app.mount('#app')
