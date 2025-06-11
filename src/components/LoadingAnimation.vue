<template>
  <div class="loading-container" :class="{ 'full-screen': fullScreen }">
    <div class="loading-content">
      <div class="spinner">
        <div class="spinner-inner">
          <div class="spinner-circle"></div>
          <div class="spinner-circle-outer"></div>
        </div>
      </div>
      <div class="loading-text" v-if="text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LoadingAnimation',
  props: {
    text: {
      type: String,
      default: '加载中...'
    },
    fullScreen: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.loading-container.full-screen {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.spinner {
  position: relative;
  width: 60px;
  height: 60px;
}

.spinner-inner {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  animation: spin 1.2s linear infinite;
}

.spinner-circle {
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 3px solid transparent;
  border-top-color: var(--primary-color);
  animation: spin 2s linear infinite;
}

.spinner-circle-outer {
  position: absolute;
  top: 5px;
  left: 5px;
  right: 5px;
  bottom: 5px;
  border-radius: 50%;
  border: 3px solid transparent;
  border-right-color: var(--primary-light);
  animation: spin 1.5s linear infinite reverse;
}

.loading-text {
  color: var(--primary-color);
  font-size: 16px;
  font-weight: 500;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style> 