<template>
  <div class="app-container">
    <el-container>
      <el-header height="60px" class="header-with-shadow">
        <div class="header-content">
          <div class="logo-container">
            <div class="logo-icon">
              <el-icon><Monitor /></el-icon>
            </div>
            <h1 class="app-title">API测试平台</h1>
          </div>
          <div class="header-right">
            <span class="system-info">系统状态: 
              <el-tag :type="systemStatus === 'online' ? 'success' : 'danger'" size="small" effect="dark">
                {{ systemStatus === 'online' ? '在线' : '离线' }}
              </el-tag>
            </span>
          </div>
        </div>
      </el-header>
      <el-container>
        <el-aside width="220px" class="sidebar-container">
          <div class="sidebar-header">
            <el-icon><Connection /></el-icon>
            <span>功能导航</span>
          </div>
          <el-menu
            router
            :default-active="activeMenu"
            class="el-menu-vertical"
            background-color="#1e88e5"
            text-color="#ffffff"
            active-text-color="#ffffff">
            <el-menu-item index="/" class="menu-item-with-hover">
              <el-icon><Monitor /></el-icon>
              <span>仪表盘</span>
            </el-menu-item>
            <el-menu-item index="/fusion-test" class="menu-item-with-hover">
              <el-icon><Connection /></el-icon>
              <span>融合身份测试</span>
            </el-menu-item>
            <el-menu-item index="/face-viz-test" class="menu-item-with-hover">
              <el-icon><PictureFilled /></el-icon>
              <span>人脸相似度测试</span>
            </el-menu-item>
            <el-menu-item index="/identity-test" class="menu-item-with-hover">
              <el-icon><UserFilled /></el-icon>
              <span>身份风险评估测试</span>
            </el-menu-item>
          </el-menu>
        </el-aside>
        <el-main class="main-container">
          <div class="content-wrapper">
            <router-view v-slot="{ Component }">
              <transition name="fade" mode="out-in">
                <component :is="Component" />
              </transition>
            </router-view>
          </div>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const route = useRoute()
    const systemStatus = ref('online')
    
    const activeMenu = computed(() => {
      return route.path
    })
    
    onMounted(() => {
      // 可以在这里检查后端系统状态
      checkSystemStatus()
    })
    
    const checkSystemStatus = () => {
      // 模拟检查系统状态
      setTimeout(() => {
        systemStatus.value = 'online'
      }, 1000)
    }
    
    return {
      systemStatus,
      activeMenu
    }
  }
}
</script>

<style>
:root {
  --primary-color: #1e88e5;
  --primary-light: #42a5f5;
  --primary-dark: #0d47a1;
  --text-color: #333;
  --background-color: #f5f7fa;
  --card-background: #ffffff;
  --hover-color: #bbdefb;
  --active-color: #2196f3;
  --border-radius: 8px;
  --box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  --transition-speed: 0.3s;
}

body {
  margin: 0;
  padding: 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Arial, sans-serif;
  background-color: var(--background-color);
  color: var(--text-color);
}

.app-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.header-with-shadow {
  background-color: var(--card-background);
  color: var(--text-color);
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  padding: 0 20px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
  font-size: 18px;
}

.app-title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

.header-right {
  display: flex;
  align-items: center;
}

.system-info {
  margin-right: 20px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.sidebar-container {
  background-color: var(--primary-color);
  color: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  position: relative;
  z-index: 5;
  transition: all var(--transition-speed);
}

.sidebar-header {
  height: 50px;
  display: flex;
  align-items: center;
  padding: 0 20px;
  font-size: 16px;
  font-weight: 600;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  gap: 10px;
}

.el-menu-vertical {
  border-right: none !important;
}

.menu-item-with-hover {
  position: relative;
  overflow: hidden;
  transition: all var(--transition-speed);
}

.menu-item-with-hover::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.1);
  transform: translateX(-100%);
  transition: transform var(--transition-speed);
  z-index: -1;
}

.menu-item-with-hover:hover::after {
  transform: translateX(0);
}

.menu-item-with-hover.is-active {
  background-color: var(--primary-dark) !important;
}

.main-container {
  background-color: var(--background-color);
  padding: 20px;
  overflow-y: auto;
}

.content-wrapper {
  max-width: 1600px;
  margin: 0 auto;
}

/* 添加过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 自定义Element Plus组件样式 */
.el-card {
  border-radius: var(--border-radius);
  box-shadow: var(--box-shadow);
  transition: transform var(--transition-speed), box-shadow var(--transition-speed);
  overflow: hidden;
}

.el-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.el-button {
  transition: all var(--transition-speed);
}

.el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.el-button:active {
  transform: translateY(1px);
}

.el-button--primary {
  background-color: var(--primary-color);
}

.el-button--primary:hover {
  background-color: var(--primary-light);
}

.el-button--primary:active {
  background-color: var(--primary-dark);
}
</style> 