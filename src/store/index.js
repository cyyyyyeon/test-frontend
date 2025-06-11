import { createStore } from 'vuex'

export default createStore({
  state: {
    testResults: {
      fusion: [],
      faceViz: [],
      identity: []
    },
    systemMetrics: {
      cpu: [],
      gpu: [],
      memory: []
    },
    testStats: {
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      avgResponseTime: 0
    }
  },
  getters: {
    getTestResults: (state) => (type) => {
      return state.testResults[type]
    },
    getSystemMetrics: (state) => {
      return state.systemMetrics
    },
    getTestStats: (state) => {
      return state.testStats
    },
    getPassRate: (state) => {
      if (state.testStats.totalTests === 0) return 0
      return (state.testStats.passedTests / state.testStats.totalTests * 100).toFixed(2)
    }
  },
  mutations: {
    ADD_TEST_RESULT(state, { type, result }) {
      state.testResults[type].push(result)
      state.testStats.totalTests++
      if (result.status === 'success') {
        state.testStats.passedTests++
      } else {
        state.testStats.failedTests++
      }
      
      // 更新平均响应时间
      const totalTime = state.testResults[type].reduce((sum, item) => sum + item.responseTime, 0)
      state.testStats.avgResponseTime = totalTime / state.testResults[type].length
    },
    UPDATE_SYSTEM_METRICS(state, { cpu, gpu, memory }) {
      state.systemMetrics.cpu.push(cpu)
      state.systemMetrics.gpu.push(gpu)
      state.systemMetrics.memory.push(memory)
      
      // 保持最多100个数据点
      if (state.systemMetrics.cpu.length > 100) {
        state.systemMetrics.cpu.shift()
        state.systemMetrics.gpu.shift()
        state.systemMetrics.memory.shift()
      }
    },
    RESET_TEST_RESULTS(state, type) {
      if (type) {
        state.testResults[type] = []
      } else {
        state.testResults = {
          fusion: [],
          faceViz: [],
          identity: []
        }
      }
      
      // 重置统计数据
      state.testStats = {
        totalTests: 0,
        passedTests: 0,
        failedTests: 0,
        avgResponseTime: 0
      }
    }
  },
  actions: {
    addTestResult({ commit }, payload) {
      commit('ADD_TEST_RESULT', payload)
    },
    updateSystemMetrics({ commit }, metrics) {
      commit('UPDATE_SYSTEM_METRICS', metrics)
    },
    resetTestResults({ commit }, type) {
      commit('RESET_TEST_RESULTS', type)
    }
  }
}) 