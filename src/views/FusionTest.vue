<template>
  <div class="fusion-test-container">
    <div class="page-header">
      <div class="title-section">
        <el-icon class="page-icon"><Connection /></el-icon>
        <h2 class="page-title">融合身份验证接口测试</h2>
      </div>
      <div class="api-badge">
        <el-tag type="primary" effect="dark" size="large" class="api-tag">
          <el-icon><Link /></el-icon>
          <span>POST /fusion/</span>
        </el-tag>
      </div>
    </div>
    
    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon><InfoFilled /></el-icon>
          <span>接口信息</span>
        </div>
      </template>
      <div class="api-info">
        <div class="api-info-item">
          <div class="api-info-label">接口URL</div>
          <div class="api-info-value">/fusion/</div>
        </div>
        <div class="api-info-item">
          <div class="api-info-label">请求方法</div>
          <div class="api-info-value method-post">POST</div>
        </div>
        <div class="api-info-item">
          <div class="api-info-label">功能描述</div>
          <div class="api-info-value">融合多模态生物特征（人脸、声纹、指纹）进行身份验证</div>
        </div>
      </div>
    </el-card>
    
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="test-config-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Setting /></el-icon>
              <span>测试参数配置</span>
            </div>
          </template>
          
          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="预设测试用例" name="preset">
              <div class="test-case-list">
                <el-radio-group v-model="selectedTestCase">
                  <div v-for="(testCase, index) in testCases" :key="index" class="test-case-item">
                    <el-radio :label="index" class="test-case-radio">{{ testCase.name }}</el-radio>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="runTest(testCase.data)"
                      :loading="loading"
                      class="run-button"
                    >
                      <el-icon><VideoPlay /></el-icon>
                      <span>运行</span>
                    </el-button>
                  </div>
                </el-radio-group>
              </div>
              
              <div class="test-case-detail" v-if="selectedTestCase !== null">
                <div class="detail-header">
                  <el-icon><Document /></el-icon>
                  <span>测试用例详情</span>
                </div>
                <div class="json-viewer">
                  <pre>{{ JSON.stringify(testCases[selectedTestCase].data, null, 2) }}</pre>
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="自定义测试" name="custom">
              <div class="custom-test">
                <el-form :model="customTestForm" label-width="100px">
                  <div class="user-section">
                    <div class="user-header">
                      <el-icon><User /></el-icon>
                      <span>用户1</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser1FaceChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><PictureFilled /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持JPG、PNG格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <el-form-item label="声纹音频">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser1VoiceChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><Microphone /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持WAV、MP3格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <el-form-item label="指纹图像">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser1FingerChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><Stamp /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持JPG、PNG格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                  </div>
                  
                  <div class="user-section">
                    <div class="user-header">
                      <el-icon><User /></el-icon>
                      <span>用户2</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser2FaceChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><PictureFilled /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持JPG、PNG格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <el-form-item label="声纹音频">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser2VoiceChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><Microphone /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持WAV、MP3格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                    
                    <el-form-item label="指纹图像">
                      <el-upload
                        class="upload-container"
                        action="#"
                        :auto-upload="false"
                        :limit="1"
                        :on-change="handleUser2FingerChange"
                      >
                        <template #trigger>
                          <el-button type="primary" class="upload-button">
                            <el-icon><Stamp /></el-icon>
                            <span>选择文件</span>
                          </el-button>
                        </template>
                        <template #tip>
                          <div class="upload-tip">支持JPG、PNG格式</div>
                        </template>
                      </el-upload>
                    </el-form-item>
                  </div>
                  
                  <el-form-item class="form-actions">
                    <el-button type="primary" @click="runCustomTest" :loading="loading" class="action-button">
                      <el-icon><VideoPlay /></el-icon>
                      <span>运行测试</span>
                    </el-button>
                    <el-button @click="resetCustomForm" class="action-button">
                      <el-icon><Refresh /></el-icon>
                      <span>重置</span>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="批量测试" name="batch">
              <div class="batch-test">
                <el-form label-width="100px">
                  <el-form-item label="测试次数">
                    <el-input-number v-model="batchCount" :min="1" :max="100" class="custom-input-number" />
                  </el-form-item>
                  
                  <el-form-item label="并发数">
                    <el-input-number v-model="concurrentCount" :min="1" :max="10" class="custom-input-number" />
                  </el-form-item>
                  
                  <el-form-item class="form-actions">
                    <el-button type="primary" @click="runBatchTest" :loading="batchLoading" class="action-button">
                      <el-icon><VideoPlay /></el-icon>
                      <span>开始批量测试</span>
                    </el-button>
                    <el-button @click="stopBatchTest" :disabled="!batchLoading" class="action-button">
                      <el-icon><VideoPause /></el-icon>
                      <span>停止</span>
                    </el-button>
                  </el-form-item>
                </el-form>
                
                <div v-if="batchProgress > 0" class="batch-progress">
                  <el-progress 
                    :percentage="batchProgress" 
                    :stroke-width="10"
                    :status="batchProgress < 100 ? 'primary' : 'success'"
                    class="custom-progress"
                  />
                  <div class="progress-info">
                    <el-icon v-if="batchProgress < 100"><Loading /></el-icon>
                    <el-icon v-else><SuccessFilled /></el-icon>
                    <span>已完成: {{ completedTests }}/{{ batchCount }}</span>
                  </div>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="result-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><DataAnalysis /></el-icon>
              <span>测试结果</span>
              <el-button type="danger" size="small" @click="clearResults" class="clear-button">
                <el-icon><Delete /></el-icon>
                <span>清除结果</span>
              </el-button>
            </div>
          </template>
          
          <div v-if="currentResult" class="result-container">
            <div class="result-header">
              <el-tag 
                :type="currentResult.status === 'success' ? 'success' : 'danger'"
                effect="dark"
                class="result-tag"
              >
                <el-icon v-if="currentResult.status === 'success'"><SuccessFilled /></el-icon>
                <el-icon v-else><CircleCloseFilled /></el-icon>
                {{ currentResult.status === 'success' ? '成功' : '失败' }}
              </el-tag>
              <div class="result-time">
                <el-icon><Timer /></el-icon>
                <span>响应时间: <strong>{{ currentResult.responseTime }}</strong> ms</span>
              </div>
            </div>
            
            <div class="result-body">
              <div class="result-section">
                <div class="section-header">
                  <el-icon><Document /></el-icon>
                  <span>响应数据</span>
                </div>
                <div class="json-viewer">
                  <pre>{{ JSON.stringify(currentResult.response, null, 2) }}</pre>
                </div>
              </div>
              
              <template v-if="currentResult.systemMetrics">
                <div class="result-section">
                  <div class="section-header">
                    <el-icon><Monitor /></el-icon>
                    <span>系统资源占用</span>
                  </div>
                  <div class="metrics-container">
                    <div class="metric-item">
                      <div class="metric-label">CPU</div>
                      <el-progress 
                        :percentage="currentResult.systemMetrics.cpu" 
                        :stroke-width="8" 
                        :color="getProgressColor(currentResult.systemMetrics.cpu)"
                      />
                      <div class="metric-value">{{ currentResult.systemMetrics.cpu.toFixed(2) }}%</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">GPU</div>
                      <el-progress 
                        :percentage="currentResult.systemMetrics.gpu" 
                        :stroke-width="8" 
                        :color="getProgressColor(currentResult.systemMetrics.gpu)"
                      />
                      <div class="metric-value">{{ currentResult.systemMetrics.gpu.toFixed(2) }}%</div>
                    </div>
                    <div class="metric-item">
                      <div class="metric-label">内存</div>
                      <el-progress 
                        :percentage="currentResult.systemMetrics.memory" 
                        :stroke-width="8" 
                        :color="getProgressColor(currentResult.systemMetrics.memory)"
                      />
                      <div class="metric-value">{{ currentResult.systemMetrics.memory.toFixed(2) }}%</div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>
          
          <div v-else class="no-result">
            <el-empty description="暂无测试结果" />
          </div>
        </el-card>
        
        <el-card class="history-card" shadow="hover" style="margin-top: 24px;">
          <template #header>
            <div class="card-header">
              <el-icon><Calendar /></el-icon>
              <span>测试历史</span>
            </div>
          </template>
          
          <el-table 
            :data="testHistory" 
            style="width: 100%" 
            height="250"
            :stripe="true"
            :border="false"
            :highlight-current-row="true"
            class="history-table"
          >
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="name" label="测试名称" width="150" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="120">
              <template #default="scope">
                <span :class="{'response-fast': scope.row.responseTime < 100, 'response-slow': scope.row.responseTime > 500}">
                  {{ scope.row.responseTime }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.status === 'success' ? 'success' : 'danger'" 
                  size="small"
                  effect="light"
                  class="status-tag-animated"
                >
                  <el-icon v-if="scope.row.status === 'success'"><SuccessFilled /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  link
                  @click="showHistoryResult(scope.row)"
                  class="action-link"
                >
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useStore } from 'vuex'
import { fusionTest, getSystemMetrics } from '@/utils/api'
import { generateFusionTestCases, generateRandomTestData } from '@/utils/testCases'

export default {
  name: 'FusionTest',
  setup() {
    const store = useStore()
    const activeTab = ref('preset')
    const selectedTestCase = ref(null)
    const testCases = ref([])
    const loading = ref(false)
    const currentResult = ref(null)
    const batchLoading = ref(false)
    const batchCount = ref(10)
    const concurrentCount = ref(3)
    const batchProgress = ref(0)
    const completedTests = ref(0)
    let batchTestRunning = false
    
    const customTestForm = ref({
      user1: {
        face: null,
        voice: null,
        finger: null
      },
      user2: {
        face: null,
        voice: null,
        finger: null
      }
    })
    
    // 获取测试历史
    const testHistory = computed(() => {
      return store.getters.getTestResults('fusion')
    })
    
    // 初始化测试用例
    onMounted(() => {
      testCases.value = generateFusionTestCases()
      if (testCases.value.length > 0) {
        selectedTestCase.value = 0
      }
    })
    
    // 运行单个测试
    const runTest = async (testData) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 获取测试开始时的系统资源使用情况
        const startMetrics = await getSystemMetrics()
        
        // 调用API
        const response = await fusionTest(testData)
        
        // 获取测试结束时的系统资源使用情况
        const endMetrics = await getSystemMetrics()
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 计算系统资源使用变化
        const systemMetrics = {
          cpu: endMetrics.cpu,
          gpu: endMetrics.gpu,
          memory: endMetrics.memory
        }
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: activeTab.value === 'preset' ? testCases.value[selectedTestCase.value].name : '自定义测试',
          request: testData,
          response,
          responseTime,
          systemMetrics,
          status: 'success'
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'fusion', result })
      } catch (error) {
        console.error('测试失败:', error)
        
        // 生成错误结果
        const endTime = Date.now()
        const result = {
          timestamp: new Date().toLocaleString(),
          name: activeTab.value === 'preset' ? testCases.value[selectedTestCase.value].name : '自定义测试',
          request: testData,
          response: { error: error.message || '未知错误' },
          responseTime: endTime - startTime,
          status: 'failed'
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'fusion', result })
      } finally {
        loading.value = false
      }
    }
    
    // 运行自定义测试
    const runCustomTest = () => {
      const testData = {
        user1: {
          face: customTestForm.value.user1.face ? customTestForm.value.user1.face.name : '',
          voice: customTestForm.value.user1.voice ? customTestForm.value.user1.voice.name : '',
          finger: customTestForm.value.user1.finger ? customTestForm.value.user1.finger.name : ''
        },
        user2: {
          face: customTestForm.value.user2.face ? customTestForm.value.user2.face.name : '',
          voice: customTestForm.value.user2.voice ? customTestForm.value.user2.voice.name : '',
          finger: customTestForm.value.user2.finger ? customTestForm.value.user2.finger.name : ''
        }
      }
      
      runTest(testData)
    }
    
    // 重置自定义表单
    const resetCustomForm = () => {
      customTestForm.value = {
        user1: {
          face: null,
          voice: null,
          finger: null
        },
        user2: {
          face: null,
          voice: null,
          finger: null
        }
      }
    }
    
    // 运行批量测试
    const runBatchTest = async () => {
      batchLoading.value = true
      batchTestRunning = true
      batchProgress.value = 0
      completedTests.value = 0
      
      const runConcurrentBatch = async (count) => {
        const promises = []
        
        for (let i = 0; i < count && completedTests.value < batchCount.value; i++) {
          if (!batchTestRunning) break
          
          const testData = generateRandomTestData('fusion')
          promises.push(
            (async () => {
              const startTime = Date.now()
              
              try {
                const startMetrics = await getSystemMetrics()
                const response = await fusionTest(testData)
                const endMetrics = await getSystemMetrics()
                const endTime = Date.now()
                
                const result = {
                  timestamp: new Date().toLocaleString(),
                  name: `批量测试 #${completedTests.value + 1}`,
                  request: testData,
                  response,
                  responseTime: endTime - startTime,
                  systemMetrics: {
                    cpu: endMetrics.cpu,
                    gpu: endMetrics.gpu,
                    memory: endMetrics.memory
                  },
                  status: 'success'
                }
                
                store.dispatch('addTestResult', { type: 'fusion', result })
              } catch (error) {
                const endTime = Date.now()
                const result = {
                  timestamp: new Date().toLocaleString(),
                  name: `批量测试 #${completedTests.value + 1}`,
                  request: testData,
                  response: { error: error.message || '未知错误' },
                  responseTime: endTime - startTime,
                  status: 'failed'
                }
                
                store.dispatch('addTestResult', { type: 'fusion', result })
              }
              
              completedTests.value++
              batchProgress.value = (completedTests.value / batchCount.value) * 100
            })()
          )
        }
        
        await Promise.all(promises)
        
        if (batchTestRunning && completedTests.value < batchCount.value) {
          await runConcurrentBatch(concurrentCount.value)
        }
      }
      
      try {
        await runConcurrentBatch(concurrentCount.value)
      } finally {
        batchLoading.value = false
        batchTestRunning = false
      }
    }
    
    // 停止批量测试
    const stopBatchTest = () => {
      batchTestRunning = false
    }
    
    // 显示历史测试结果
    const showHistoryResult = (result) => {
      currentResult.value = result
    }
    
    // 清除结果
    const clearResults = () => {
      currentResult.value = null
      store.dispatch('resetTestResults', 'fusion')
    }
    
    // 文件上传处理函数
    const handleUser1FaceChange = (file) => {
      customTestForm.value.user1.face = file.raw
    }
    
    const handleUser1VoiceChange = (file) => {
      customTestForm.value.user1.voice = file.raw
    }
    
    const handleUser1FingerChange = (file) => {
      customTestForm.value.user1.finger = file.raw
    }
    
    const handleUser2FaceChange = (file) => {
      customTestForm.value.user2.face = file.raw
    }
    
    const handleUser2VoiceChange = (file) => {
      customTestForm.value.user2.voice = file.raw
    }
    
    const handleUser2FingerChange = (file) => {
      customTestForm.value.user2.finger = file.raw
    }
    
    // 获取进度条颜色
    const getProgressColor = (value) => {
      if (value < 50) return '#67C23A'
      if (value < 80) return '#E6A23C'
      return '#F56C6C'
    }
    
    return {
      activeTab,
      selectedTestCase,
      testCases,
      loading,
      currentResult,
      customTestForm,
      batchCount,
      concurrentCount,
      batchLoading,
      batchProgress,
      completedTests,
      testHistory,
      runTest,
      runCustomTest,
      resetCustomForm,
      runBatchTest,
      stopBatchTest,
      showHistoryResult,
      clearResults,
      handleUser1FaceChange,
      handleUser1VoiceChange,
      handleUser1FingerChange,
      handleUser2FaceChange,
      handleUser2VoiceChange,
      handleUser2FingerChange,
      getProgressColor
    }
  }
}
</script>

<style scoped>
.fusion-test-container {
  padding: 16px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-section {
  display: flex;
  align-items: center;
}

.page-icon {
  font-size: 24px;
  color: var(--primary-color);
  margin-right: 12px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.api-badge {
  display: flex;
  align-items: center;
}

.api-tag {
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: monospace;
  font-size: 14px;
  padding: 8px 12px;
}

.info-card, .test-config-card, .result-card, .history-card {
  height: 100%;
  transition: all 0.3s;
  border: none;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  padding: 0;
}

.card-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.clear-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.clear-button:hover {
  transform: scale(1.05);
}

.api-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.api-info-item {
  display: flex;
  align-items: flex-start;
}

.api-info-label {
  min-width: 100px;
  font-weight: 600;
  color: var(--text-color);
}

.api-info-value {
  flex: 1;
  color: #606266;
}

.method-post {
  color: #67C23A;
  font-weight: 600;
  font-family: monospace;
}

.custom-tabs {
  margin-top: 8px;
}

.test-case-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.test-case-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-radius: var(--border-radius);
  background-color: rgba(0, 0, 0, 0.02);
  transition: all 0.3s;
}

.test-case-item:hover {
  background-color: rgba(0, 0, 0, 0.04);
}

.test-case-radio {
  flex: 1;
}

.run-button {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.run-button:hover {
  transform: scale(1.05);
}

.test-case-detail {
  margin-top: 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.05);
  padding-top: 16px;
}

.detail-header {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  font-weight: 600;
  color: var(--text-color);
}

.detail-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.json-viewer {
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  padding: 12px;
  max-height: 300px;
  overflow: auto;
}

.json-viewer pre {
  margin: 0;
  font-family: monospace;
  font-size: 14px;
  color: #333;
  white-space: pre-wrap;
}

.user-section {
  margin-bottom: 24px;
  padding: 16px;
  border-radius: var(--border-radius);
  background-color: rgba(0, 0, 0, 0.02);
}

.user-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.user-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.upload-container {
  width: 100%;
}

.upload-button {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.upload-button:hover {
  transform: scale(1.02);
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  justify-content: flex-start;
  gap: 12px;
  margin-top: 24px;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.action-button:hover {
  transform: scale(1.05);
}

.custom-input-number {
  width: 100%;
}

.batch-progress {
  margin-top: 24px;
}

.custom-progress {
  margin-bottom: 12px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 8px;
  color: var(--text-color);
  font-size: 14px;
}

.result-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.result-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.result-time {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #606266;
  font-size: 14px;
}

.result-body {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.result-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: var(--text-color);
}

.section-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.metrics-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.metric-item {
  display: flex;
  align-items: center;
  gap: 12px;
}

.metric-label {
  min-width: 50px;
  font-weight: 600;
  color: var(--text-color);
}

.metric-value {
  min-width: 60px;
  text-align: right;
  font-family: monospace;
}

.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.history-table {
  margin-top: 8px;
}

.response-fast {
  color: #67C23A;
  font-weight: 600;
}

.response-slow {
  color: #E6A23C;
  font-weight: 600;
}

.status-tag-animated {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.status-tag-animated:hover {
  transform: scale(1.05);
}

.action-link {
  position: relative;
  overflow: hidden;
  transition: all 0.3s;
}

.action-link::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
  background-color: var(--primary-color);
  transform: scaleX(0);
  transform-origin: right;
  transition: transform 0.3s ease;
}

.action-link:hover::after {
  transform: scaleX(1);
  transform-origin: left;
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .api-badge {
    margin-top: 8px;
  }
  
  .result-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .metric-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .metric-value {
    text-align: left;
  }
}
</style> 