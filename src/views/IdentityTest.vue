<template>
  <div class="identity-test-container">
    <h2 class="page-title">身份风险评估接口测试</h2>
    
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>接口信息</span>
        </div>
      </template>
      <div class="api-info">
        <p><strong>接口URL：</strong> /identity/predict</p>
        <p><strong>请求方法：</strong> POST</p>
        <p><strong>功能描述：</strong> 根据用户交易序列和个人信息评估身份风险</p>
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
                <el-form :model="customTestForm" label-width="120px">
                  <h4>交易序列：</h4>
                  <el-form-item label="CSV文件上传">
                    <el-upload
                      class="upload"
                      action="#"
                      :auto-upload="false"
                      :limit="1"
                      :on-change="handleCsvUpload"
                      accept=".csv"
                    >
                      <el-button type="primary">选择CSV文件</el-button>
                      <template #tip>
                        <div class="el-upload__tip">
                          请上传包含交易序列的CSV文件，每行一个交易序列
                        </div>
                      </template>
                    </el-upload>
                  </el-form-item>
                  
                  <el-form-item label="手动输入">
                    <el-input
                      type="textarea"
                      v-model="customTestForm.transSeriesInput"
                      :rows="5"
                      placeholder="请输入交易序列数据，格式如: [[100,200,300],[150,250,350]]"
                    />
                  </el-form-item>
                  
                  <h4>用户信息：</h4>
                  <el-form-item label="年龄">
                    <el-input-number v-model="customTestForm.userInfo[0]" :min="0" :max="120" />
                  </el-form-item>
                  
                  <el-form-item label="性别">
                    <el-select v-model="customTestForm.userInfo[1]" placeholder="请选择">
                      <el-option :value="0" label="女" />
                      <el-option :value="1" label="男" />
                    </el-select>
                  </el-form-item>
                  
                  <el-form-item label="收入">
                    <el-input-number v-model="customTestForm.userInfo[2]" :min="0" :step="1000" />
                  </el-form-item>
                  
                  <el-form-item label="教育水平">
                    <el-input-number v-model="customTestForm.userInfo[3]" :min="0" :max="10" />
                  </el-form-item>
                  
                  <el-form-item label="婚姻状态">
                    <el-input-number v-model="customTestForm.userInfo[4]" :min="0" :max="5" />
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
              
              <template v-if="currentResult.status === 'success' && currentResult.response && currentResult.response.prediction !== undefined">
                <h4>风险评估结果:</h4>
                <el-alert
                  :title="currentResult.response.prediction === 1 ? '高风险' : '低风险'"
                  :type="currentResult.response.prediction === 1 ? 'error' : 'success'"
                  :description="currentResult.response.prediction === 1 ? '该用户交易行为存在风险' : '该用户交易行为正常'"
                  show-icon
                />
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
import { identityTest, getSystemMetrics } from '@/utils/api'
import { generateIdentityTestCases, generateRandomTestData } from '@/utils/testCases'

export default {
  name: 'IdentityTest',
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
      transSeriesInput: '',
      csvData: null,
      userInfo: [30, 1, 100000, 5, 2]
    })
    
    // 获取测试历史
    const testHistory = computed(() => {
      return store.getters.getTestResults('identity')
    })
    
    // 初始化测试用例
    onMounted(() => {
      testCases.value = generateIdentityTestCases()
      if (testCases.value.length > 0) {
        selectedTestCase.value = 0
      }
    })
    
    // CSV文件解析
    const parseCsv = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target.result
            const lines = text.split('\n').filter(line => line.trim())
            const transSeries = lines.map(line => {
              return line.split(',').map(val => Number(val.trim()))
            })
            resolve(transSeries)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    }
    
    // 运行单个测试
    const runTest = async (testData) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 获取测试开始时的系统资源使用情况
        const startMetrics = await getSystemMetrics()
        
        // 调用API
        const response = await identityTest(testData)
        
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
        store.dispatch('addTestResult', { type: 'identity', result })
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
        store.dispatch('addTestResult', { type: 'identity', result })
      } finally {
        loading.value = false
      }
    }
    
    // 运行自定义测试
    const runCustomTest = async () => {
      try {
        let transSeries = []
        
        // 优先使用CSV数据
        if (customTestForm.value.csvData) {
          transSeries = await parseCsv(customTestForm.value.csvData)
        } 
        // 其次使用手动输入的数据
        else if (customTestForm.value.transSeriesInput) {
          try {
            // 尝试解析JSON格式输入
            transSeries = JSON.parse(customTestForm.value.transSeriesInput)
          } catch (e) {
            // 如果不是有效的JSON，尝试解析为简单格式
            const lines = customTestForm.value.transSeriesInput.split('\n')
            transSeries = lines.map(line => {
              return line.split(',').map(val => Number(val.trim()))
            })
          }
        }
        
        const testData = {
          trans_series: transSeries,
          user_info: customTestForm.value.userInfo
        }
        
        runTest(testData)
      } catch (error) {
        console.error('解析输入数据失败:', error)
        
        const result = {
          timestamp: new Date().toLocaleString(),
          name: '自定义测试',
          request: {},
          response: { error: '解析输入数据失败: ' + error.message },
          responseTime: 0,
          status: 'failed'
        }
        
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'identity', result })
      }
    }
    
    // 重置自定义表单
    const resetCustomForm = () => {
      customTestForm.value = {
        transSeriesInput: '',
        csvData: null,
        userInfo: [30, 1, 100000, 5, 2]
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
          
          const testData = generateRandomTestData('identity')
          promises.push(
            (async () => {
              const startTime = Date.now()
              
              try {
                const startMetrics = await getSystemMetrics()
                const response = await identityTest(testData)
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
                
                store.dispatch('addTestResult', { type: 'identity', result })
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
                
                store.dispatch('addTestResult', { type: 'identity', result })
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
      store.dispatch('resetTestResults', 'identity')
    }
    
    // 处理CSV文件上传
    const handleCsvUpload = (file) => {
      customTestForm.value.csvData = file.raw
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
      handleCsvUpload
    }
  }
}
</script>

<style scoped>
.identity-test-container {
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
</style> 