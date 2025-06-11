import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/styles/global.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import LoadingAnimation from './components/LoadingAnimation.vue'

const app = createApp(App)

// 注册所有图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

// 注册全局组件
app.component('LoadingAnimation', LoadingAnimation)

app.use(store).use(router).use(ElementPlus, { size: 'small' }).mount('#app') 