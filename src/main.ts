import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import router from './router'
import { createPinia } from 'pinia'
import { MotionPlugin } from '@vueuse/motion'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import './utils/request'

import './style.css'
import App from './App.vue'

// Configure NProgress
NProgress.configure({ 
  easing: 'ease', 
  speed: 500, 
  showSpinner: false 
})

const app = createApp(App)

// Register Element Plus icons
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// Use plugins
app.use(ElementPlus, {
    locale: zhCn,
  })
app.use(createPinia())
app.use(router)
app.use(MotionPlugin)

app.mount('#app')
