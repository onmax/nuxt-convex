import { createApp } from 'vue'
import { convexVue } from 'vue-convex'
import { convexVueStorage } from 'vue-convex/storage'
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
