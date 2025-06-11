<template>
  <div class="dashboard-container">
    <div class="dashboard-header">
      <div class="title-section">
        <el-icon class="dashboard-icon"><DataAnalysis /></el-icon>
        <h2 class="page-title">系统测试仪表盘</h2>
      </div>
      <div class="refresh-section">
        <el-button type="primary" size="small" @click="refreshData" class="refresh-button">
          <el-icon><Refresh /></el-icon>
          <span>刷新数据</span>
        </el-button>
      </div>
    </div>
    
    <el-row :gutter="24">
      <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
        <el-card class="stats-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><PieChart /></el-icon>
              <span>测试统计</span>
            </div>
          </template>
          <div class="statistic-container">
            <div class="statistic-item">
              <div class="statistic-title">总测试数</div>
              <div class="statistic-value total">{{ testStats.totalTests }}</div>
            </div>
            <div class="statistic-item">
              <div class="statistic-title">通过测试</div>
              <div class="statistic-value success">{{ testStats.passedTests }}</div>
            </div>
            <div class="statistic-item">
              <div class="statistic-title">失败测试</div>
              <div class="statistic-value danger">{{ testStats.failedTests }}</div>
            </div>
            <div class="statistic-divider"></div>
            <div class="statistic-item">
              <div class="statistic-title">通过率</div>
              <div class="statistic-value highlight">{{ passRate }}%</div>
              <el-progress 
                :percentage="passRate" 
                :status="passRate > 80 ? 'success' : passRate > 60 ? 'warning' : 'exception'"
                :stroke-width="8"
                class="pass-rate-progress"
              />
            </div>
            <div class="statistic-item">
              <div class="statistic-title">平均响应时间</div>
              <div class="statistic-value">{{ testStats.avgResponseTime.toFixed(2) }} ms</div>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="16" :lg="16" :xl="16">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><DataLine /></el-icon>
              <span>测试通过率</span>
            </div>
          </template>
          <div class="chart-container">
            <canvas ref="passRateChart"></canvas>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Monitor /></el-icon>
              <span>系统资源监控</span>
              <el-tag size="small" type="success" class="status-tag">实时</el-tag>
            </div>
          </template>
          <div class="chart-container">
            <canvas ref="resourceChart"></canvas>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :sm="24" :md="12" :lg="12" :xl="12">
        <el-card class="chart-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Timer /></el-icon>
              <span>接口响应时间</span>
            </div>
          </template>
          <div class="chart-container">
            <canvas ref="responseTimeChart"></canvas>
          </div>
        </el-card>
      </el-col>
    </el-row>
    
    <el-row :gutter="24" style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="table-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>最近测试记录</span>
              <div class="card-actions">
                <el-button type="primary" size="small" @click="exportTestData" class="action-button">
                  <el-icon><Download /></el-icon>
                  <span>导出数据</span>
                </el-button>
              </div>
            </div>
          </template>
          <el-table 
            :data="recentTests" 
            style="width: 100%" 
            :stripe="true"
            :border="false"
            :highlight-current-row="true"
            class="dashboard-table"
          >
            <el-table-column prop="timestamp" label="时间" width="180" />
            <el-table-column prop="type" label="接口类型" width="150" />
            <el-table-column prop="name" label="测试名称" width="200" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="150">
              <template #default="scope">
                <span :class="{'response-fast': scope.row.responseTime < 100, 'response-slow': scope.row.responseTime > 500}">
                  {{ scope.row.responseTime }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag 
                  :type="scope.row.status === 'success' ? 'success' : 'danger'"
                  effect="light"
                  class="status-tag-animated"
                >
                  <el-icon v-if="scope.row.status === 'success'"><SuccessFilled /></el-icon>
                  <el-icon v-else><CircleCloseFilled /></el-icon>
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="120">
              <template #default="scope">
                <el-button 
                  type="primary" 
                  size="small" 
                  link
                  @click="viewTestDetail(scope.row)"
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
import { ref, onMounted, computed } from 'vue'
import { useStore } from 'vuex'
import Chart from 'chart.js/auto'
import { getSystemMetrics } from '@/utils/api'

export default {
  name: 'Dashboard',
  setup() {
    const store = useStore()
    const passRateChart = ref(null)
    const resourceChart = ref(null)
    const responseTimeChart = ref(null)
    
    const testStats = computed(() => store.getters.getTestStats)
    const passRate = computed(() => store.getters.getPassRate)
    
    // 获取所有测试结果并合并
    const allTestResults = computed(() => {
      const fusion = store.getters.getTestResults('fusion')
      const faceViz = store.getters.getTestResults('faceViz')
      const identity = store.getters.getTestResults('identity')
      
      return [
        ...fusion.map(item => ({ ...item, type: '融合身份' })),
        ...faceViz.map(item => ({ ...item, type: '人脸相似度' })),
        ...identity.map(item => ({ ...item, type: '身份风险评估' }))
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    })
    
    // 最近10条测试记录
    const recentTests = computed(() => {
      return allTestResults.value.slice(0, 10)
    })
    
    // 初始化图表
    const initCharts = () => {
      // 通过率图表
      if (passRateChart.value) {
        new Chart(passRateChart.value, {
          type: 'doughnut',
          data: {
            labels: ['通过', '失败'],
            datasets: [{
              data: [testStats.value.passedTests, testStats.value.failedTests],
              backgroundColor: ['#67C23A', '#F56C6C'],
              hoverOffset: 6,
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  font: {
                    size: 14
                  },
                  padding: 20
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 12,
                boxWidth: 10,
                usePointStyle: true,
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100);
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            },
            cutout: '70%',
            animation: {
              animateRotate: true,
              animateScale: true
            }
          }
        })
      }
      
      // 系统资源图表
      if (resourceChart.value) {
        const metrics = store.getters.getSystemMetrics
        new Chart(resourceChart.value, {
          type: 'line',
          data: {
            labels: Array(metrics.cpu.length).fill().map((_, i) => i + 1),
            datasets: [
              {
                label: 'CPU使用率(%)',
                data: metrics.cpu,
                borderColor: '#1e88e5',
                backgroundColor: 'rgba(30, 136, 229, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              },
              {
                label: 'GPU使用率(%)',
                data: metrics.gpu,
                borderColor: '#67C23A',
                backgroundColor: 'rgba(103, 194, 58, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              },
              {
                label: '内存使用率(%)',
                data: metrics.memory,
                borderColor: '#E6A23C',
                backgroundColor: 'rgba(230, 162, 60, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
              }
            ]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'top',
                align: 'end'
              },
              tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                max: 100,
                ticks: {
                  stepSize: 20
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            interaction: {
              mode: 'nearest',
              axis: 'x',
              intersect: false
            },
            animation: {
              duration: 1000
            }
          }
        })
      }
      
      // 响应时间图表
      if (responseTimeChart.value) {
        const apiTypes = ['融合身份', '人脸相似度', '身份风险评估']
        const avgResponseTimes = apiTypes.map(type => {
          const results = allTestResults.value.filter(item => item.type === type)
          if (results.length === 0) return 0
          return results.reduce((sum, item) => sum + item.responseTime, 0) / results.length
        })
        
        new Chart(responseTimeChart.value, {
          type: 'bar',
          data: {
            labels: apiTypes,
            datasets: [{
              label: '平均响应时间(ms)',
              data: avgResponseTimes,
              backgroundColor: [
                'rgba(30, 136, 229, 0.7)',
                'rgba(103, 194, 58, 0.7)',
                'rgba(230, 162, 60, 0.7)'
              ],
              borderColor: [
                '#1e88e5',
                '#67C23A',
                '#E6A23C'
              ],
              borderWidth: 2,
              borderRadius: 6,
              hoverBackgroundColor: [
                'rgba(30, 136, 229, 0.9)',
                'rgba(103, 194, 58, 0.9)',
                'rgba(230, 162, 60, 0.9)'
              ]
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: {
                  label: function(context) {
                    return `响应时间: ${context.raw.toFixed(2)} ms`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                grid: {
                  color: 'rgba(0, 0, 0, 0.05)'
                },
                title: {
                  display: true,
                  text: '响应时间 (ms)'
                }
              },
              x: {
                grid: {
                  display: false
                }
              }
            },
            animation: {
              duration: 1000
            }
          }
        })
      }
    }
    
    // 定时获取系统资源使用情况
    const startMonitoring = () => {
      const timer = setInterval(async () => {
        try {
          const metrics = await getSystemMetrics()
          store.dispatch('updateSystemMetrics', metrics)
        } catch (error) {
          console.error('获取系统资源数据失败:', error)
        }
      }, 5000)
      
      // 组件销毁时清除定时器
      return () => clearInterval(timer)
    }
    
    // 刷新数据
    const refreshData = async () => {
      try {
        const metrics = await getSystemMetrics()
        store.dispatch('updateSystemMetrics', metrics)
        initCharts()
      } catch (error) {
        console.error('刷新数据失败:', error)
      }
    }
    
    // 导出测试数据
    const exportTestData = () => {
      // 实现导出功能
      console.log('导出测试数据')
    }
    
    // 查看测试详情
    const viewTestDetail = (test) => {
      // 查看测试详情
      console.log('查看测试详情', test)
    }
    
    onMounted(() => {
      initCharts()
      startMonitoring()
    })
    
    return {
      testStats,
      passRate,
      recentTests,
      passRateChart,
      resourceChart,
      responseTimeChart,
      refreshData,
      exportTestData,
      viewTestDetail
    }
  }
}
</script>

<style scoped>
.dashboard-container {
  padding: 16px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.title-section {
  display: flex;
  align-items: center;
}

.dashboard-icon {
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

.refresh-button {
  display: flex;
  align-items: center;
  gap: 6px;
  transition: all 0.3s;
}

.refresh-button:hover {
  transform: scale(1.05);
}

.stats-card, .chart-card, .table-card {
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

.card-actions {
  margin-left: auto;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 4px;
}

.statistic-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-top: 8px;
}

.statistic-item {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.statistic-divider {
  grid-column: span 2;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 8px 0;
}

.statistic-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.statistic-value {
  font-size: 24px;
  font-weight: 600;
  color: var(--text-color);
}

.statistic-value.total {
  color: var(--primary-color);
}

.statistic-value.success {
  color: #67C23A;
}

.statistic-value.danger {
  color: #F56C6C;
}

.statistic-value.highlight {
  color: var(--primary-color);
  font-size: 28px;
}

.pass-rate-progress {
  width: 100%;
  margin-top: 8px;
}

.chart-container {
  height: 300px;
  position: relative;
}

.status-tag {
  margin-left: 8px;
  font-size: 12px;
  height: 20px;
  line-height: 18px;
}

.dashboard-table {
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
  .statistic-container {
    grid-template-columns: 1fr;
  }
  
  .statistic-divider {
    grid-column: span 1;
  }
  
  .chart-container {
    height: 250px;
  }
}
</style> 