import { createApp } from 'vue'
import { convexVue } from 'vue-convex'
import { convexVueStorage } from 'vue-convex/storage'
import App from './App.vue'
import { api, convexUrl } from './lib/convex'
import './style.css'

const app = createApp(App)

// Without a URL the runtime starts disconnected, and App.vue shows the setup steps
app.use(convexVue, { url: convexUrl || undefined })

app.use(convexVueStorage, {
  generateUploadUrl: api.files.generateUploadUrl,
  getUrl: api.files.getUrl,
  remove: api.files.remove,
})

app.mount('#app')
