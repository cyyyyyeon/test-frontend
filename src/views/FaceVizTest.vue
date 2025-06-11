<template>
  <div class="face-viz-test-container">
    <h2 class="page-title">人脸相似度可视化接口测试</h2>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>接口信息</span>
        </div>
      </template>
      <div class="api-info">
        <p><strong>接口URL：</strong> /faceviz/</p>
        <p><strong>请求方法：</strong> POST</p>
        <p><strong>功能描述：</strong> 分析两张人脸图像的相似度并生成可视化热力图</p>
      </div>
    </el-card>
    
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>测试参数配置</span>
            </div>
          </template>
          
          <el-tabs v-model="activeTab">
            <el-tab-pane label="预设测试用例" name="preset">
              <div class="test-case-list">
                <el-radio-group v-model="selectedTestCase">
                  <div v-for="(testCase, index) in testCases" :key="index" class="test-case-item">
                    <el-radio :label="index">{{ testCase.name }}</el-radio>
                    <el-button 
                      type="primary" 
                      size="small" 
                      @click="runTest(testCase.data)"
                      :loading="loading"
                    >
                      运行
                    </el-button>
                  </div>
                </el-radio-group>
              </div>
              
              <div class="test-case-detail" v-if="selectedTestCase !== null">
                <h4>测试用例详情：</h4>
                <pre>{{ JSON.stringify(testCases[selectedTestCase].data, null, 2) }}</pre>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="自定义测试" name="custom">
              <div class="custom-test">
                <el-form :model="customTestForm" label-width="100px">
                  <el-form-item label="图像1">
                    <el-upload
                      class="upload"
                      action="#"
                      :auto-upload="false"
                      :limit="1"
                      :on-change="handleImage1Change"
                    >
                      <el-button type="primary">选择文件</el-button>
                    </el-upload>
                  </el-form-item>
                  
                  <el-form-item label="图像2">
                    <el-upload
                      class="upload"
                      action="#"
                      :auto-upload="false"
                      :limit="1"
                      :on-change="handleImage2Change"
                    >
                      <el-button type="primary">选择文件</el-button>
                    </el-upload>
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="runCustomTest" :loading="loading">运行测试</el-button>
                    <el-button @click="resetCustomForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="批量测试" name="batch">
              <div class="batch-test">
                <el-form label-width="100px">
                  <el-form-item label="测试次数">
                    <el-input-number v-model="batchCount" :min="1" :max="100" />
                  </el-form-item>
                  
                  <el-form-item label="并发数">
                    <el-input-number v-model="concurrentCount" :min="1" :max="10" />
                  </el-form-item>
                  
                  <el-form-item>
                    <el-button type="primary" @click="runBatchTest" :loading="batchLoading">
                      开始批量测试
                    </el-button>
                    <el-button @click="stopBatchTest" :disabled="!batchLoading">
                      停止
                    </el-button>
                  </el-form-item>
                </el-form>
                
                <div v-if="batchProgress > 0" class="batch-progress">
                  <el-progress :percentage="batchProgress" />
                  <p>已完成: {{ completedTests }}/{{ batchCount }}</p>
                </div>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>测试结果</span>
              <el-button type="danger" size="small" @click="clearResults">清除结果</el-button>
            </div>
          </template>
          
          <div v-if="currentResult" class="result-container">
            <div class="result-header">
              <el-tag :type="currentResult.status === 'success' ? 'success' : 'danger'">
                {{ currentResult.status === 'success' ? '成功' : '失败' }}
              </el-tag>
              <span class="result-time">响应时间: {{ currentResult.responseTime }} ms</span>
            </div>
            
            <div class="result-body">
              <h4>响应数据:</h4>
              <pre>{{ JSON.stringify(currentResult.response, null, 2) }}</pre>
              
              <template v-if="currentResult.status === 'success' && currentResult.response">
                <h4>相似度得分: {{ currentResult.response.similarity.toFixed(4) }}</h4>
                
                <div class="visualization-container">
                  <div class="visualization-item">
                    <h5>图像1可视化:</h5>
                    <div class="image-placeholder">
                      <p>图像1热力图</p>
                      <p>(实际使用时显示后端返回的热力图)</p>
                    </div>
                  </div>
                  
                  <div class="visualization-item">
                    <h5>图像2可视化:</h5>
                    <div class="image-placeholder">
                      <p>图像2热力图</p>
                      <p>(实际使用时显示后端返回的热力图)</p>
                    </div>
                  </div>
                </div>
              </template>
              
              <template v-if="currentResult.systemMetrics">
                <h4>系统资源占用:</h4>
                <p>CPU: {{ currentResult.systemMetrics.cpu.toFixed(2) }}%</p>
                <p>GPU: {{ currentResult.systemMetrics.gpu.toFixed(2) }}%</p>
                <p>内存: {{ currentResult.systemMetrics.memory.toFixed(2) }}%</p>
              </template>
            </div>
          </div>
          
          <div v-else class="no-result">
            <el-empty description="暂无测试结果" />
          </div>
        </el-card>
        
        <el-card class="box-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>测试历史</span>
            </div>
          </template>
          
          <el-table :data="testHistory" style="width: 100%" height="250">
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="name" label="测试名称" width="150" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="100" />
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button 
                  type="text" 
                  size="small" 
                  @click="showHistoryResult(scope.row)"
                >
                  查看
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
import { faceVizTest, getSystemMetrics } from '@/utils/api'
import { generateFaceVizTestCases, generateRandomTestData } from '@/utils/testCases'

export default {
  name: 'FaceVizTest',
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
      image1: null,
      image2: null
    })
    
    // 获取测试历史
    const testHistory = computed(() => {
      return store.getters.getTestResults('faceViz')
    })
    
    // 初始化测试用例
    onMounted(() => {
      testCases.value = generateFaceVizTestCases()
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
        const response = await faceVizTest(testData)
        
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
        store.dispatch('addTestResult', { type: 'faceViz', result })
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
        store.dispatch('addTestResult', { type: 'faceViz', result })
      } finally {
        loading.value = false
      }
    }
    
    // 运行自定义测试
    const runCustomTest = () => {
      const testData = {
        image1_name: customTestForm.value.image1 ? customTestForm.value.image1.name : '',
        image2_name: customTestForm.value.image2 ? customTestForm.value.image2.name : ''
      }
      
      runTest(testData)
    }
    
    // 重置自定义表单
    const resetCustomForm = () => {
      customTestForm.value = {
        image1: null,
        image2: null
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
          
          const testData = generateRandomTestData('faceViz')
          promises.push(
            (async () => {
              const startTime = Date.now()
              
              try {
                const startMetrics = await getSystemMetrics()
                const response = await faceVizTest(testData)
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
                
                store.dispatch('addTestResult', { type: 'faceViz', result })
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
                
                store.dispatch('addTestResult', { type: 'faceViz', result })
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
      store.dispatch('resetTestResults', 'faceViz')
    }
    
    // 文件上传处理函数
    const handleImage1Change = (file) => {
      customTestForm.value.image1 = file.raw
    }
    
    const handleImage2Change = (file) => {
      customTestForm.value.image2 = file.raw
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
      handleImage1Change,
      handleImage2Change
    }
  }
}
</script>

<style scoped>
.face-viz-test-container {
  padding: 20px;
}

.page-title {
  margin-top: 0;
  margin-bottom: 20px;
  font-weight: 600;
  color: #303133;
}

.box-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.api-info {
  line-height: 1.8;
}

.test-case-list {
  margin-bottom: 20px;
}

.test-case-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid #ebeef5;
}

.test-case-item:last-child {
  border-bottom: none;
}

.test-case-detail {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.test-case-detail pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
}

.result-container {
  padding: 15px;
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.result-time {
  font-size: 14px;
  color: #909399;
}

.result-body pre {
  background-color: #f5f7fa;
  padding: 15px;
  border-radius: 4px;
  white-space: pre-wrap;
  word-break: break-all;
}

.no-result {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.batch-progress {
  margin-top: 20px;
}

.upload {
  width: 100%;
}

.visualization-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-top: 20px;
}

.visualization-item {
  flex: 1;
  min-width: 200px;
}

.image-placeholder {
  height: 200px;
  background-color: #f5f7fa;
  border: 1px dashed #dcdfe6;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #909399;
}
</style> 