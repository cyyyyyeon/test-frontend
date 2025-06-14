<template>
    <div class="home-container">
        <div class="home-header">
            <div class="title-section">
                <el-icon class="home-icon">
                    <HomeFilled />
                </el-icon>
                <h2 class="page-title">API测试平台欢迎您</h2>
            </div>
        </div>

        <el-row :gutter="24">
            <el-col :span="24">
                <el-card class="welcome-card" shadow="hover">
                    <div class="welcome-content">
                        <h3 class="welcome-title">欢迎使用API测试平台</h3>
                        <p class="welcome-description">
                            本平台提供多种API测试功能，帮助您快速验证和评估API性能。
                            请从下方选择您需要的测试功能，或使用左侧导航栏进行切换。
                        </p>
                    </div>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="24" class="feature-cards">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-card class="feature-card" shadow="hover" @click="navigateTo('/fusion-test')">
                    <div class="feature-icon">
                        <el-icon>
                            <Connection />
                        </el-icon>
                    </div>
                    <h3 class="feature-title">融合身份测试</h3>
                    <p class="feature-description">
                        测试融合身份API的性能和准确性，验证身份融合功能。
                    </p>
                    <el-button type="primary" class="feature-button">开始测试</el-button>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-card class="feature-card" shadow="hover" @click="navigateTo('/face-viz-test')">
                    <div class="feature-icon">
                        <el-icon>
                            <PictureFilled />
                        </el-icon>
                    </div>
                    <h3 class="feature-title">可解释性接口测试</h3>
                    <p class="feature-description">
                        测试可解释性接口，验证可解释性算法的准确性。
                    </p>
                    <el-button type="primary" class="feature-button">开始测试</el-button>
                </el-card>
            </el-col>

            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
                <el-card class="feature-card" shadow="hover" @click="navigateTo('/identity-test')">
                    <div class="feature-icon">
                        <el-icon>
                            <UserFilled />
                        </el-icon>
                    </div>
                    <h3 class="feature-title">身份风险评估测试</h3>
                    <p class="feature-description">
                        测试身份风险评估API，验证风险评估算法的有效性。
                    </p>
                    <el-button type="primary" class="feature-button">开始测试</el-button>
                </el-card>
            </el-col>
        </el-row>

        <el-row :gutter="24" style="margin-top: 24px;">
            <el-col :span="24">
                <el-card class="info-card" shadow="hover">
                    <template #header>
                        <div class="card-header">
                            <el-icon>
                                <InfoFilled />
                            </el-icon>
                            <span>系统信息</span>
                        </div>
                    </template>
                    <div class="system-info-content">
                        <div class="info-item">
                            <span class="info-label">系统状态:</span>
                            <el-tag :type="systemStatus === 'online' ? 'success' : 'danger'" size="small" effect="dark">
                                {{ systemStatus === 'online' ? '在线' : '离线' }}
                            </el-tag>
                        </div>
                        <div class="info-item">
                            <span class="info-label">API版本:</span>
                            <span class="info-value">v1.0.0</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">最近更新:</span>
                            <span class="info-value">{{ formatDate(new Date()) }}</span>
                        </div>
                    </div>
                </el-card>
            </el-col>
        </el-row>
    </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export default {
  name: 'Home',
  setup() {
    const router = useRouter()
    const systemStatus = ref('online')
    
    const navigateTo = (path) => {
      router.push(path)
    }
    
    const formatDate = (date) => {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date)
    }
    
    return {
      systemStatus,
      navigateTo,
      formatDate
    }
  }
}
</script>

<style scoped>
.home-container {
  padding: 20px;
}

.home-header {
  margin-bottom: 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section {
  display: flex;
  align-items: center;
}

.home-icon {
  font-size: 24px;
  margin-right: 12px;
  color: var(--primary-color);
}

.page-title {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
  color: var(--text-color);
}

.welcome-card {
  margin-bottom: 24px;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary-color) 100%);
  color: white;
}

.welcome-content {
  padding: 20px;
  text-align: center;
}

.welcome-title {
  font-size: 24px;
  margin-bottom: 16px;
}

.welcome-description {
  font-size: 16px;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

.feature-cards {
  margin-bottom: 24px;
}

.feature-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all var(--transition-speed);
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
}

.feature-icon {
  font-size: 40px;
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: var(--primary-color);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.feature-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 12px;
  color: var(--primary-color);
}

.feature-description {
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
  margin-bottom: 20px;
  flex-grow: 1;
}

.feature-button {
  margin-top: auto;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 16px;
}

.card-header .el-icon {
  margin-right: 8px;
}

.system-info-content {
  padding: 16px;
}

.info-item {
  margin-bottom: 12px;
  display: flex;
  align-items: center;
}

.info-label {
  font-weight: 600;
  margin-right: 8px;
  min-width: 100px;
}

.info-value {
  color: var(--text-color);
}
</style> 