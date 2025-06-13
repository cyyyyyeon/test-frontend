<template>
  <div class="fusion-test-container">
    <div class="page-header">
      <div class="title-section">
        <el-icon class="page-icon">
          <Connection />
        </el-icon>
        <h2 class="page-title">融合身份验证接口测试</h2>
      </div>
      <div class="api-badge">
        <el-tag type="primary" effect="dark" size="large" class="api-tag">
          <el-icon>
            <Link />
          </el-icon>
          <span>POST /fusion/</span>
        </el-tag>
      </div>
    </div>

    <el-card class="info-card" shadow="hover">
      <template #header>
        <div class="card-header">
          <el-icon>
            <InfoFilled />
          </el-icon>
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
              <el-icon>
                <Setting />
              </el-icon>
              <span>测试参数配置</span>
            </div>
          </template>

          <el-tabs v-model="activeTab" class="custom-tabs">
            <el-tab-pane label="预设测试用例" name="preset">
              <div class="test-case-list">
                <el-radio-group v-model="selectedTestCase">
                  <div v-for="(testCase, index) in testCases" :key="index" class="test-case-item">
                    <el-radio :label="index" class="test-case-radio">
                      {{ testCase.name }}
                      <el-tag size="small" :type="getExpectedResultTagType(testCase.expectedResult)"
                        class="expected-tag">
                        预期: {{ formatExpectedResult(testCase.expectedResult) }}
                      </el-tag>
                    </el-radio>
                    <el-button type="primary" size="small" @click="runTest(testCase.data, testCase.expectedResult)"
                      :loading="loading" class="run-button">
                      <el-icon>
                        <VideoPlay />
                      </el-icon>
                      <span>运行</span>
                    </el-button>
                  </div>
                </el-radio-group>
              </div>

              <div class="test-case-detail" v-if="selectedTestCase !== null">
                <div class="detail-header">
                  <el-icon>
                    <Document />
                  </el-icon>
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
                      <el-icon>
                        <User />
                      </el-icon>
                      <span>用户1</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-input v-model="customTestForm.user1.face" placeholder="输入文件名，例如: 1_1.png"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <PictureFilled />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持PNG格式</div>
                    </el-form-item>

                    <el-form-item label="声纹音频">
                      <el-input v-model="customTestForm.user1.voice" placeholder="输入文件名，例如: 1_1.wav"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <Microphone />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持WAV格式</div>
                    </el-form-item>

                    <el-form-item label="指纹图像">
                      <el-input v-model="customTestForm.user1.finger" placeholder="输入文件名，例如: 1_1.jpg"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <Stamp />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持JPG格式</div>
                    </el-form-item>
                  </div>

                  <div class="user-section">
                    <div class="user-header">
                      <el-icon>
                        <User />
                      </el-icon>
                      <span>用户2</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-input v-model="customTestForm.user2.face" placeholder="输入文件名，例如: 2_1.png"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <PictureFilled />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持PNG格式</div>
                    </el-form-item>

                    <el-form-item label="声纹音频">
                      <el-input v-model="customTestForm.user2.voice" placeholder="输入文件名，例如: 2_1.wav"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <Microphone />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持WAV格式</div>
                    </el-form-item>

                    <el-form-item label="指纹图像">
                      <el-input v-model="customTestForm.user2.finger" placeholder="输入文件名，例如: 2_1.jpg"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <Stamp />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持JPG格式</div>
                    </el-form-item>
                  </div>

                  <div class="expected-result-section">
                    <div class="section-header">
                      <el-icon>
                        <Flag />
                      </el-icon>
                      <span>预期结果</span>
                    </div>
                    <el-form-item label="预期结果">
                      <el-radio-group v-model="customTestForm.expectedResult" class="expected-radio-group">
                        <el-radio label="same_person">同一个人</el-radio>
                        <el-radio label="different_person">不同人</el-radio>
                        <el-radio label="error">错误</el-radio>
                      </el-radio-group>
                    </el-form-item>
                  </div>

                  <el-form-item class="form-actions">
                    <el-button type="primary" @click="runCustomTest" :loading="loading" class="action-button">
                      <el-icon>
                        <VideoPlay />
                      </el-icon>
                      <span>运行测试</span>
                    </el-button>
                    <el-button @click="resetCustomForm" class="action-button">
                      <el-icon>
                        <Refresh />
                      </el-icon>
                      <span>重置</span>
                    </el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>

            <el-tab-pane label="批量测试" name="batch">
              <div class="batch-test">
                <el-form label-width="100px">
                  <el-form-item label="CSV文件">
                    <el-upload class="csv-upload" action="#" :auto-upload="false" :on-change="handleCsvUpload"
                      :limit="1" :file-list="csvFileList" accept=".csv">
                      <el-button type="primary">选择文件</el-button>
                      <template #tip>
                        <div class="el-upload__tip">请上传CSV格式文件，包含列：test_name, user1_face, user1_voice, user1_finger,
                          user2_face, user2_voice, user2_finger, expected_result</div>
                      </template>
                    </el-upload>
                  </el-form-item>

                  <el-form-item class="form-actions">
                    <el-button type="info" @click="downloadCsvTemplate" class="action-button">
                      <el-icon>
                        <Download />
                      </el-icon>
                      <span>下载CSV模板</span>
                    </el-button>
                  </el-form-item>

                  <el-form-item class="form-actions">
                    <el-button type="primary" @click="runBatchTest" :loading="batchLoading" class="action-button">
                      <el-icon>
                        <VideoPlay />
                      </el-icon>
                      <span>开始批量测试</span>
                    </el-button>
                    <el-button @click="stopBatchTest" :disabled="!batchLoading" class="action-button">
                      <el-icon>
                        <VideoPause />
                      </el-icon>
                      <span>停止</span>
                    </el-button>
                  </el-form-item>
                </el-form>

                <div v-if="batchProgress > 0" class="batch-progress">
                  <el-progress :percentage="batchProgress" :stroke-width="10"
                    :status="batchProgress < 100 ? 'primary' : 'success'" class="custom-progress" />
                  <div class="progress-info">
                    <el-icon v-if="batchProgress < 100">
                      <Loading />
                    </el-icon>
                    <el-icon v-else>
                      <SuccessFilled />
                    </el-icon>
                    <span>已完成: {{ completedTests }}/{{ getBatchTotalTests() }}</span>
                  </div>
                </div>

                <!-- CSV测试用例列表 -->
                <div class="csv-test-cases" v-if="csvTestCases.length > 0">
                  <div class="detail-header">
                    <el-icon>
                      <Document />
                    </el-icon>
                    <span>CSV测试用例列表 (共{{ csvTestCases.length }}条)</span>
                  </div>
                  <el-collapse v-model="activeCsvCase" class="csv-cases-collapse">
                    <el-collapse-item v-for="(testCase, index) in csvTestCases" :key="index"
                      :title="`测试用例 #${index + 1}: ${testCase.name || '未命名'}`" :name="index">
                      <div class="csv-case-item">
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(testCase.testData, null, 2) }}</pre>
                        </div>
                        <div class="expected-result-info">
                          <el-tag :type="getExpectedResultTagType(testCase.expectedResult)" class="expected-tag-small">
                            预期结果: {{ formatExpectedResult(testCase.expectedResult) }}
                          </el-tag>
                        </div>
                        <div v-if="completedTests > index" class="test-status">
                          <el-tag
                            :type="batchResults[index] && batchResults[index].status === 'success' ? 'success' : 'danger'"
                            size="small" effect="light">
                            {{ batchResults[index] && batchResults[index].status === 'success' ? '成功' : '失败' }}
                          </el-tag>
                          <el-tag v-if="batchResults[index] && batchResults[index].expectedResult"
                            :type="isTestPassed(batchResults[index]) ? 'success' : 'danger'" size="small" effect="light"
                            class="test-result-tag">
                            {{ isTestPassed(batchResults[index]) ? '测试通过' : '测试不通过' }}
                          </el-tag>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>

              </div>
            </el-tab-pane>

            <!-- 添加并发测试选项卡 -->
            <el-tab-pane label="并发测试" name="concurrent">
              <div class="concurrent-test">
                <el-form label-width="100px">
                  <el-form-item label="测试次数">
                    <el-input-number v-model="concurrentCount" :min="1" :max="100" class="custom-input-number" />
                  </el-form-item>

                  <el-form-item label="并发数量">
                    <el-input-number v-model="concurrentLimit" :min="1" :max="20" class="custom-input-number" />
                  </el-form-item>

                  <el-form-item class="form-actions">
                    <el-button type="primary" @click="runConcurrentTest" :loading="concurrentLoading"
                      class="action-button">
                      <el-icon>
                        <VideoPlay />
                      </el-icon>
                      <span>开始并发测试</span>
                    </el-button>
                    <el-button @click="stopConcurrentTest" :disabled="!concurrentLoading" class="action-button">
                      <el-icon>
                        <VideoPause />
                      </el-icon>
                      <span>停止</span>
                    </el-button>
                  </el-form-item>
                </el-form>

                <div v-if="concurrentProgress > 0" class="batch-progress">
                  <el-progress :percentage="concurrentProgress" :stroke-width="10"
                    :status="concurrentProgress < 100 ? 'primary' : 'success'" class="custom-progress" />
                  <div class="progress-info">
                    <el-icon v-if="concurrentProgress < 100">
                      <Loading />
                    </el-icon>
                    <el-icon v-else>
                      <SuccessFilled />
                    </el-icon>
                    <span>已完成: {{ concurrentCompleted }}/{{ concurrentCount }}</span>
                  </div>
                </div>

                <!-- 并发测试用例详情列表 -->
                <div class="concurrent-test-cases"
                  v-if="concurrentTestCases.length > 0 && concurrentCompleted < concurrentCount">
                  <div class="detail-header">
                    <el-icon>
                      <Document />
                    </el-icon>
                    <span>当前批次测试用例 ({{ Math.min(concurrentLimit, concurrentCount - concurrentCompleted) }}个并发)</span>
                  </div>
                  <el-collapse v-model="activeConcurrentCase" class="concurrent-cases-collapse">
                    <el-collapse-item v-for="(testCase, index) in concurrentTestCases" :key="index"
                      :title="`测试用例 #${concurrentCompleted + index + 1}`" :name="index">
                      <div class="concurrent-case-item">
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(testCase.testData, null, 2) }}</pre>
                        </div>
                        <div class="expected-result-info" v-if="testCase.expectedResult">
                          <el-tag :type="getExpectedResultTagType(testCase.expectedResult)" class="expected-tag-small">
                            预期结果: {{ formatExpectedResult(testCase.expectedResult) }}
                          </el-tag>
                        </div>
                      </div>
                    </el-collapse-item>
                  </el-collapse>
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
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>测试结果</span>
            </div>
          </template>

          <div v-if="currentResult" class="result-container">
            <div class="result-header">
              <div class="result-status-group">
                <el-tag :type="currentResult.status === 'success' ? 'success' : 'danger'" effect="dark"
                  class="result-tag">
                  <el-icon v-if="currentResult.status === 'success'">
                    <SuccessFilled />
                  </el-icon>
                  <el-icon v-else>
                    <CircleCloseFilled />
                  </el-icon>
                  {{ currentResult.status === 'success' ? '成功' : '失败' }}
                </el-tag>

                <el-tag v-if="currentResult.expectedResult" :type="getTestPassedStatus(currentResult)" effect="dark"
                  class="result-tag test-pass-tag">
                  <el-icon v-if="isTestPassed(currentResult)">
                    <CircleCheckFilled />
                  </el-icon>
                  <el-icon v-else>
                    <CloseBold />
                  </el-icon>
                  {{ isTestPassed(currentResult) ? '测试通过' : '测试不通过' }}
                </el-tag>
              </div>

              <div class="result-time">
                <el-icon>
                  <Timer />
                </el-icon>
                <span>响应时间: <strong>{{ currentResult.responseTime }}</strong> ms</span>
              </div>
            </div>

            <!-- 基础测试结果：在批量测试模式下不显示，但在查看历史记录时显示 -->
            <div class="result-body" v-if="!isInBatchMode || isViewingHistory">
              <div class="result-section">
                <div class="section-header">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>请求数据</span>
                </div>
                <div class="json-viewer">
                  <pre>{{ JSON.stringify(currentResult.request, null, 2) }}</pre>
                </div>
              </div>

              <div class="result-section">
                <div class="section-header">
                  <el-icon>
                    <Document />
                  </el-icon>
                  <span>响应数据</span>
                </div>
                <div class="json-viewer">
                  <pre>{{ JSON.stringify(currentResult.response, null, 2) }}</pre>
                </div>
              </div>

              <div v-if="currentResult.expectedResult" class="result-section">
                <div class="section-header">
                  <el-icon>
                    <Flag />
                  </el-icon>
                  <span>预期结果</span>
                </div>
                <div class="expected-result-display">
                  <el-tag :type="getExpectedResultTagType(currentResult.expectedResult)" effect="light"
                    class="expected-result-tag">
                    {{ formatExpectedResult(currentResult.expectedResult) }}
                  </el-tag>
                  <div class="expected-result-explanation">
                    {{ getExpectedResultExplanation(currentResult) }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 批量测试结果列表 -->
            <div v-if="activeTab === 'batch' && batchResults.length > 0" class="result-section">
              <div class="section-header">
                <el-icon>
                  <List />
                </el-icon>
                <span>批量测试结果列表</span>
              </div>
              <el-collapse v-model="activeBatchResult" class="batch-results-collapse">
                <el-collapse-item v-for="(result, index) in batchResults" :key="index"
                  :title="`测试 #${index + 1} - ${result.status === 'success' ? '成功' : '失败'} ${result.expectedResult ? (isTestPassed(result) ? '✓' : '✗') : ''} (${result.responseTime}ms)`"
                  :name="index"
                  :class="{'test-passed': result.expectedResult && isTestPassed(result), 'test-failed': result.expectedResult && !isTestPassed(result)}">
                  <div class="batch-result-item">
                    <div class="batch-result-header">
                      <div class="batch-result-tags">
                        <el-tag :type="result.status === 'success' ? 'success' : 'danger'" size="small" effect="light">
                          {{ result.status === 'success' ? '成功' : '失败' }}
                        </el-tag>

                        <el-tag v-if="result.expectedResult" :type="isTestPassed(result) ? 'success' : 'danger'"
                          size="small" effect="light" class="test-result-tag">
                          {{ isTestPassed(result) ? '测试通过' : '测试不通过' }}
                        </el-tag>

                        <el-tag v-if="result.expectedResult" :type="getExpectedResultTagType(result.expectedResult)"
                          size="small" effect="plain" class="expected-tag-small">
                          预期: {{ formatExpectedResult(result.expectedResult) }}
                        </el-tag>
                      </div>
                      <span class="batch-result-time">{{ result.timestamp }}</span>
                    </div>

                    <div class="batch-result-content">
                      <div class="batch-result-section">
                        <div class="batch-section-title">请求数据：</div>
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(result.request, null, 2) }}</pre>
                        </div>
                      </div>

                      <div class="batch-result-section">
                        <div class="batch-section-title">响应数据：</div>
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(result.response, null, 2) }}</pre>
                        </div>
                      </div>

                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
            <!-- 并发测试结果列表 -->
            <div v-if="activeTab === 'concurrent' && concurrentResults.length > 0" class="result-section">
              <div class="section-header">
                <el-icon>
                  <List />
                </el-icon>
                <span>并发测试结果列表</span>
              </div>
              <el-collapse v-model="activeConcurrentResult" class="batch-results-collapse">
                <el-collapse-item v-for="(result, index) in concurrentResults" :key="index"
                  :title="`测试 #${index + 1} - ${result.status === 'success' ? '成功' : '失败'} ${result.expectedResult ? (isTestPassed(result) ? '✓' : '✗') : ''} (${result.responseTime}ms)`"
                  :name="index"
                  :class="{ 'test-passed': result.expectedResult && isTestPassed(result), 'test-failed': result.expectedResult && !isTestPassed(result) }">
                  <div class="batch-result-item">
                    <div class="batch-result-header">
                      <div class="batch-result-tags">
                        <el-tag :type="result.status === 'success' ? 'success' : 'danger'" size="small" effect="light">
                          {{ result.status === 'success' ? '成功' : '失败' }}
                        </el-tag>

                        <el-tag v-if="result.expectedResult" :type="isTestPassed(result) ? 'success' : 'danger'"
                          size="small" effect="light" class="test-result-tag">
                          {{ isTestPassed(result) ? '测试通过' : '测试不通过' }}
                        </el-tag>

                        <el-tag v-if="result.expectedResult" :type="getExpectedResultTagType(result.expectedResult)"
                          size="small" effect="plain" class="expected-tag-small">
                          预期: {{ formatExpectedResult(result.expectedResult) }}
                        </el-tag>
                      </div>
                      <span class="batch-result-time">{{ result.timestamp }}</span>
                    </div>

                    <div class="batch-result-content">
                      <div class="batch-result-section">
                        <div class="batch-section-title">请求数据：</div>
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(result.request, null, 2) }}</pre>
                        </div>
                      </div>

                      <div class="batch-result-section">
                        <div class="batch-section-title">响应数据：</div>
                        <div class="json-viewer small">
                          <pre>{{ JSON.stringify(result.response, null, 2) }}</pre>
                        </div>
                      </div>

                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
          </div>

          <div v-else class="no-result">
            <el-empty description="暂无测试结果" />
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 将历史卡片移到单独的行 -->
    <el-row style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="history-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon>
                <Calendar />
              </el-icon>
              <span>测试历史</span>
              <el-button type="danger" size="small" @click="clearResults" class="clear-button">
                <el-icon style="color: #fff">
                  <Delete />
                </el-icon>
                <span>清除结果</span>
              </el-button>
            </div>
          </template>

          <el-table :data="testHistory" style="width: 100%" height="250" :stripe="true" :border="false"
            :highlight-current-row="true" class="history-table">
            <el-table-column prop="timestamp" label="时间" width="160" />
            <el-table-column prop="name" label="测试名称" width="140" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="100">
              <template #default="scope">
                <span
                  :class="{'response-fast': scope.row.responseTime < 100, 'response-slow': scope.row.responseTime > 500}">
                  {{ scope.row.responseTime }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="80">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small" effect="light"
                  class="status-tag-animated">
                  <el-icon v-if="scope.row.status === 'success'">
                    <SuccessFilled />
                  </el-icon>
                  <el-icon v-else>
                    <CircleCloseFilled />
                  </el-icon>
                  {{ scope.row.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="testPassed" label="测试结果" width="90">
              <template #default="scope">
                <el-tag v-if="scope.row.expectedResult" :type="isTestPassed(scope.row) ? 'success' : 'danger'"
                  size="small" effect="light">
                  <el-icon v-if="isTestPassed(scope.row)">
                    <CircleCheckFilled />
                  </el-icon>
                  <el-icon v-else>
                    <CloseBold />
                  </el-icon>
                  {{ isTestPassed(scope.row) ? '通过' : '不通过' }}
                </el-tag>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作">
              <template #default="scope">
                <el-button type="primary" size="small" link @click="showHistoryResult(scope.row)" class="action-link">
                  查看详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 添加仪表盘功能 -->
    <el-row style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>融合身份验证接口仪表盘</span>
              <el-button type="primary" size="small" @click="refreshStats" class="refresh-button">
                <el-icon style="color: #fff">
                  <Refresh />
                </el-icon>
                <span>刷新统计</span>
              </el-button>
            </div>
          </template>

          <el-row :gutter="24">
            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <div class="stats-card">
                <div class="stats-header">测试统计</div>
                <div class="stats-container">
                  <div class="stats-item">
                    <div class="stats-label">总测试数</div>
                    <div class="stats-value total">{{ fusionStats.totalTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">成功请求</div>
                    <div class="stats-value success">{{ fusionStats.successTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">失败请求</div>
                    <div class="stats-value danger">{{ fusionStats.failedTests }}</div>
                  </div>
                  <div class="stats-divider"></div>
                  <div class="stats-item">
                    <div class="stats-label">测试通过</div>
                    <div class="stats-value success">{{ fusionStats.passedTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">测试不通过</div>
                    <div class="stats-value danger">{{ fusionStats.notPassedTests }}</div>
                  </div>
                  <div class="stats-divider"></div>
                  <div class="stats-item full-width">
                    <div class="stats-label">通过率</div>
                    <div class="stats-value highlight">{{ passRate }}%</div>
                    <el-progress :percentage="passRate" :status="getPassRateStatus(passRate)" :stroke-width="8"
                      class="pass-rate-progress" />
                  </div>
                  <div class="stats-item full-width">
                    <div class="stats-label">平均响应时间</div>
                    <div class="stats-value">{{ avgResponseTime.toFixed(2) }} ms</div>
                  </div>
                </div>
              </div>
            </el-col>

            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <div class="chart-card">
                <div class="chart-header">测试结果分布</div>
                <div class="chart-container">
                  <canvas ref="resultPieChart"></canvas>
                </div>
              </div>
            </el-col>

            <el-col :xs="24" :sm="24" :md="8" :lg="8" :xl="8">
              <div class="chart-card">
                <div class="chart-header">响应时间趋势</div>
                <div class="chart-container">
                  <canvas ref="responseTimeChart"></canvas>
                </div>
              </div>
            </el-col>
          </el-row>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch, onBeforeUnmount } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { fusionTest } from '@/utils/api'
import { generateFusionTestCases, generateRandomTestData } from '@/utils/testCases'
import Chart from 'chart.js/auto'
import { Download } from '@element-plus/icons-vue'

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
    const batchProgress = ref(0)
    const completedTests = ref(0)
    // const batchTestMode = ref('random') // 批量测试模式：random-随机生成，csv-CSV文件
    const csvFileList = ref([]) // CSV文件列表
    const csvTestCases = ref([]) // 从CSV解析的测试用例
    const activeCsvCase = ref([0]) // 默认展开第一个CSV测试用例
    let batchTestRunning = false
    
    // 批量测试结果列表
    const batchResults = ref([])
    const activeBatchResult = ref([]) // 初始为空数组，不展开任何结果
    
    // 当前批量测试用例数据
    const currentBatchTestData = ref(null)
    const currentBatchExpectedResult = ref(null)
    
    // 标记是否在查看历史记录
    const isViewingHistory = ref(false)
    
    const customTestForm = ref({
      user1: {
        face: '',
        voice: '',
        finger: ''
      },
      user2: {
        face: '',
        voice: '',
        finger: ''
      },
      expectedResult: 'same_person' // 默认预期结果为同一个人
    })
    
    // 获取测试历史
    const testHistory = computed(() => {
      return store.getters.getTestResults('fusion')
    })
    
    // 计算属性：是否在批量测试模式
    const isInBatchMode = computed(() => {
      return (activeTab.value === 'batch' && batchResults.value.length > 0) || 
             (activeTab.value === 'concurrent' && concurrentResults.value.length > 0)
    })
    
    // 新增仪表盘相关计算属性和方法
    const resultPieChart = ref(null)
    const responseTimeChart = ref(null)
    let charts = {
      resultPie: null,
      responseTime: null
    }

    // 融合接口测试统计数据
    const fusionStats = computed(() => {
      const results = testHistory.value
      const totalTests = results.length
      const successTests = results.filter(r => r.status === 'success').length
      const failedTests = results.filter(r => r.status === 'failed').length
      
      // 只计算有预期结果的测试
      const testsWithExpectation = results.filter(r => r.expectedResult)
      const passedTests = testsWithExpectation.filter(r => isTestPassed(r)).length
      const notPassedTests = testsWithExpectation.length - passedTests
      
      return {
        totalTests,
        successTests,
        failedTests,
        passedTests,
        notPassedTests
      }
    })

    // 计算通过率
    const passRate = computed(() => {
      const testsWithExpectation = testHistory.value.filter(r => r.expectedResult)
      if (testsWithExpectation.length === 0) return 0
      const passedTests = testsWithExpectation.filter(r => isTestPassed(r)).length
      return Math.round((passedTests / testsWithExpectation.length) * 100)
    })

    // 计算平均响应时间
    const avgResponseTime = computed(() => {
      if (testHistory.value.length === 0) return 0
      const totalTime = testHistory.value.reduce((sum, item) => sum + item.responseTime, 0)
      return totalTime / testHistory.value.length
    })

    // 获取通过率状态
    const getPassRateStatus = (rate) => {
      if (rate >= 80) return 'success'
      if (rate >= 60) return 'warning'
      return 'exception'
    }

    // 初始化图表
    const initCharts = () => {
      // 销毁现有图表
      if (charts.resultPie) charts.resultPie.destroy()
      if (charts.responseTime) charts.responseTime.destroy()
      
      // 测试结果分布饼图
      if (resultPieChart.value) {
        charts.resultPie = new Chart(resultPieChart.value, {
          type: 'doughnut',
          data: {
            labels: ['测试通过', '测试不通过', '无预期结果'],
            datasets: [{
              data: [
                fusionStats.value.passedTests,
                fusionStats.value.notPassedTests,
                fusionStats.value.totalTests - fusionStats.value.passedTests - fusionStats.value.notPassedTests
              ],
              backgroundColor: ['#67C23A', '#F56C6C', '#909399'],
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
                    size: 12
                  },
                  padding: 15
                }
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                padding: 10,
                boxWidth: 8,
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
            cutout: '65%',
            animation: {
              animateRotate: true,
              animateScale: true
            }
          }
        })
      }
      
      // 响应时间趋势图
      if (responseTimeChart.value) {
        // 获取最近10条测试记录的响应时间
        const recentTests = [...testHistory.value].slice(0, 10).reverse()
        const labels = recentTests.map((_, index) => `测试 ${index + 1}`)
        const responseTimes = recentTests.map(test => test.responseTime)
        
        charts.responseTime = new Chart(responseTimeChart.value, {
          type: 'line',
          data: {
            labels: labels,
            datasets: [{
              label: '响应时间(ms)',
              data: responseTimes,
              borderColor: '#409EFF',
              backgroundColor: 'rgba(64, 158, 255, 0.1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: '#409EFF',
              pointRadius: 4,
              pointHoverRadius: 6
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
                    return `响应时间: ${context.raw} ms`;
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
    }

    // 刷新统计数据和图表
    const refreshStats = () => {
      initCharts()
    }

    // 监听测试历史变化，更新图表
    watch(testHistory, () => {
      initCharts()
    })

    // 在原有的onMounted函数中添加图表初始化
    const originalOnMounted = onMounted
    onMounted(() => {
      testCases.value = generateFusionTestCases()
      if (testCases.value.length > 0) {
        selectedTestCase.value = 0
      }
      
      // 延迟初始化图表，确保DOM已经渲染
      setTimeout(() => {
        initCharts()
      }, 500)
    })
    
    // 组件卸载前销毁图表
    onBeforeUnmount(() => {
      if (charts.resultPie) charts.resultPie.destroy()
      if (charts.responseTime) charts.responseTime.destroy()
    })
    
    // 格式化预期结果
    const formatExpectedResult = (expectedResult) => {
      if (expectedResult === 'same_person') return '同一个人'
      if (expectedResult === 'different_person') return '不同人'
      if (expectedResult === 'error') return '错误'
      return '未知'
    }
    
    // 获取预期结果标签类型
    const getExpectedResultTagType = (expectedResult) => {
      if (expectedResult === 'same_person') return 'success'
      if (expectedResult === 'different_person') return 'warning'
      if (expectedResult === 'error') return 'danger'
      return 'info'
    }
    
    // 判断测试是否通过
    const isTestPassed = (result) => {
      if (!result.expectedResult) return true // 没有预期结果，默认通过
      
      if (result.expectedResult === 'error') {
        return result.status === 'failed' // 预期错误，实际错误则通过
      } else if (result.status === 'failed') {
        return false // 预期成功但实际失败，不通过
      }
      
      // 对于成功的请求，检查是否符合预期
      const isSamePerson = result.response && result.response.is_same_person === true
      return (result.expectedResult === 'same_person' && isSamePerson) || 
             (result.expectedResult === 'different_person' && !isSamePerson)
    }
    
    // 获取测试通过状态
    const getTestPassedStatus = (result) => {
      return isTestPassed(result) ? 'success' : 'danger'
    }
    
    // 获取预期结果解释
    const getExpectedResultExplanation = (result) => {
      if (!result.expectedResult) return ''
      
      if (result.expectedResult === 'error') {
        if (result.status === 'failed') {
          return '测试通过：预期出现错误，实际确实出现错误'
        } else {
          return '测试不通过：预期出现错误，但实际请求成功'
        }
      } else if (result.status === 'failed') {
        return '测试不通过：预期请求成功，但实际出现错误'
      }
      
      const isSamePerson = result.response && result.response.is_same_person === true
      if (result.expectedResult === 'same_person') {
        return isSamePerson 
          ? '测试通过：预期为同一个人，实际结果也是同一个人' 
          : '测试不通过：预期为同一个人，但实际结果是不同人'
      } else {
        return !isSamePerson 
          ? '测试通过：预期为不同人，实际结果也是不同人' 
          : '测试不通过：预期为不同人，但实际结果是同一个人'
      }
    }
    
    // 确定批量测试的预期结果
    const determineBatchExpectedResult = (testData) => {
      // 从测试数据中提取用户ID
      const userIds = []
      for (const user in testData) {
        // 假设文件名格式为 userID_*.ext
        const faceFile = testData[user].face
        if (faceFile) {
          const userId = faceFile.split('_')[0]
          userIds.push(userId)
        }
      }
      
      // 判断是否是同一个用户
      const isSameUser = userIds.length === 2 && userIds[0] === userIds[1]
      
      // 根据用户ID判断预期结果
      return isSameUser ? 'same_person' : 'different_person'
    }
    
    // 运行单个测试
    const runTest = async (testData, expectedResult) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 获取测试开始时的系统资源使用情况
        // 调用API
        const response = await fusionTest(testData)
        
        // 获取测试结束时的系统资源使用情况
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 计算系统资源使用变化
        // const systemMetrics = {
        //   cpu: endMetrics.cpu,
        //   gpu: endMetrics.gpu,
        //   memory: endMetrics.memory
        // }
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: activeTab.value === 'preset' ? testCases.value[selectedTestCase.value].name : '自定义测试',
          request: testData,
          response,
          responseTime,
          status: 'success',
          expectedResult
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
          response: { error: error.error || '未知错误' },
          responseTime: endTime - startTime,
          status: 'failed',
          expectedResult
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
          face: customTestForm.value.user1.face,
          voice: customTestForm.value.user1.voice,
          finger: customTestForm.value.user1.finger
        },
        user2: {
          face: customTestForm.value.user2.face,
          voice: customTestForm.value.user2.voice,
          finger: customTestForm.value.user2.finger
        }
      }
      
      runTest(testData, customTestForm.value.expectedResult)
    }
    
    // 重置自定义表单
    const resetCustomForm = () => {
      customTestForm.value = {
        user1: {
          face: '',
          voice: '',
          finger: ''
        },
        user2: {
          face: '',
          voice: '',
          finger: ''
        },
        expectedResult: 'same_person'
      }
    }
    
    // 运行批量测试
    const runBatchTest = async () => {
      // 检查CSV模式下是否有上传文件
      if (csvTestCases.value.length === 0) {
        ElMessage.error('请先上传CSV文件并确保格式正确')
        return
      }
      
      batchLoading.value = true
      batchTestRunning = true
      batchProgress.value = 0
      completedTests.value = 0
      // 清空之前的批量测试结果
      batchResults.value = []
      // 清空当前批量测试用例数据
      currentBatchTestData.value = null
      currentBatchExpectedResult.value = null
      
      // 确保当前选中的是批量测试选项卡
      activeTab.value = 'batch'
      
      // 获取测试总数
      const totalTests = getBatchTotalTests()
      
      const processTestResult = (result) => {
        // 添加到批量测试结果列表的末尾（按顺序从上往下添加）
        batchResults.value.push(result)
        
        // 更新当前显示的结果为最新的测试结果
        currentResult.value = result
        
        // 设置最新的结果为展开状态（展开最后一个元素）
        activeBatchResult.value = [batchResults.value.length - 1]
        
        // 更新进度
        completedTests.value++
        batchProgress.value = Math.min((completedTests.value / getBatchTotalTests()) * 100, 100)
      }
      
      // 串行执行单个测试 - 随机生成数据
      const runRandomTest = async () => {
        if (!batchTestRunning || completedTests.value >= batchCount.value) {
          return false
        }
        
        const testData = generateRandomTestData('fusion')
        // 确定预期结果
        const expectedResult = determineBatchExpectedResult(testData)
        
        // 更新当前批量测试用例数据和预期结果
        currentBatchTestData.value = testData
        currentBatchExpectedResult.value = expectedResult
        
        return await executeTest(testData, expectedResult, `批量测试 #${completedTests.value + 1}`)
      }
      
      // 串行执行单个测试 - 使用CSV数据
      const runCsvTest = async () => {
        if (!batchTestRunning || completedTests.value >= csvTestCases.value.length) {
          return false
        }
        
        const testCase = csvTestCases.value[completedTests.value]
        
        // 更新当前批量测试用例数据和预期结果
        currentBatchTestData.value = testCase.testData
        currentBatchExpectedResult.value = testCase.expectedResult
        
        // 使用CSV中的测试名称，如果没有则使用默认名称
        const testName = testCase.name || `CSV测试 #${completedTests.value + 1}`
        
        return await executeTest(testCase.testData, testCase.expectedResult, testName)
      }
      
      // 执行单个测试
      const executeTest = async (testData, expectedResult, testName) => {
        const startTime = Date.now()
        
        try {
          const response = await fusionTest(testData)
          const endTime = Date.now()
          
          // 生成成功结果
          const result = {
            timestamp: new Date().toLocaleString(),
            name: testName,
            request: testData,
            response,
            responseTime: endTime - startTime,
            // systemMetrics: {
            //   cpu: endMetrics.cpu,
            //   gpu: endMetrics.gpu,
            //   memory: endMetrics.memory
            // },
            status: 'success',
            expectedResult
          }
        
          
          // 处理测试结果
          processTestResult(result)
          
          // 存储到历史
          store.dispatch('addTestResult', { type: 'fusion', result })
          
          return true
        } catch (error) {
          const endTime = Date.now()
          const errorMessage = error.error || error.message || '未知错误'
          
          // 生成失败结果
          const result = {
            timestamp: new Date().toLocaleString(),
            name: testName,
            request: testData,
            response: { error: errorMessage },
            responseTime: endTime - startTime,
            status: 'failed',
            expectedResult
          }
                    
          // 处理测试结果
          processTestResult(result)
          
          // 存储到历史
          store.dispatch('addTestResult', { type: 'fusion', result })
          
          return true
        }
      }
      
      // 运行批量测试的主函数 - 串行执行
      const runTests = async () => {
        // 根据测试模式选择不同的测试函数
        const testFunction = runCsvTest
        
        // 循环运行测试，直到所有测试完成或被停止
        const total = getBatchTotalTests()
        while (batchTestRunning && completedTests.value < total) {
          await testFunction()
          
          // 添加一个小延迟，避免请求过于频繁
          await new Promise(resolve => setTimeout(resolve, 100))
        }
        
        // 测试完成后的处理
        batchLoading.value = false
        batchTestRunning = false
        
        // 确保进度条显示100%
        if (completedTests.value >= total) {
          batchProgress.value = 100
          // 测试全部完成后，清空当前批量测试用例数据
          currentBatchTestData.value = null
          currentBatchExpectedResult.value = null
        }
      }
      
      // 开始运行测试
      runTests()
    }
    
    // 停止批量测试
    const stopBatchTest = () => {
      batchTestRunning = false
    }
    
    // 获取批量测试总数
    const getBatchTotalTests = () => {
      return csvTestCases.value.length
    }
    
    // 显示历史测试结果
    const showHistoryResult = (result) => {
      currentResult.value = result
      isViewingHistory.value = true
    }
    
    // 清除结果
    const clearResults = () => {
      currentResult.value = null
      batchResults.value = [] // 清空批量测试结果列表
      activeBatchResult.value = [] // 重置展开状态
      concurrentResults.value = [] // 清空并发测试结果列表
      activeConcurrentResult.value = [] // 重置并发测试展开状态
      concurrentTestCases.value = [] // 清空并发测试用例
      activeConcurrentCase.value = [0] // 重置并发测试用例展开状态
      isViewingHistory.value = false // 重置查看历史状态
      currentBatchTestData.value = null // 清空当前批量测试用例数据
      currentBatchExpectedResult.value = null // 清空当前批量测试预期结果
      csvFileList.value = [] // 清空CSV文件列表
      csvTestCases.value = [] // 清空CSV测试用例
      batchProgress.value = 0 // 重置进度条
      completedTests.value = 0 // 重置完成测试计数
      concurrentProgress.value = 0 // 重置并发测试进度条
      concurrentCompleted.value = 0 // 重置并发测试完成计数
      store.dispatch('resetTestResults', 'fusion')
    }
    
    // 获取进度条颜色
    const getProgressColor = (value) => {
      if (value < 50) return '#67C23A'
      if (value < 80) return '#E6A23C'
      return '#F56C6C'
    }
    
    // 添加切换标签页的监听
    watch(activeTab, (newValue) => {
      if (newValue !== 'batch') {
        isViewingHistory.value = false
      }
    })

    // 并发测试相关变量
    const concurrentCount = ref(10)
    const concurrentLimit = ref(5)
    const concurrentLoading = ref(false)
    const concurrentProgress = ref(0)
    const concurrentCompleted = ref(0)
    const concurrentResults = ref([])
    const activeConcurrentResult = ref([])
    const concurrentTestCases = ref([]) // 当前批次的并发测试用例
    const activeConcurrentCase = ref([0]) // 默认展开第一个测试用例
    const concurrentAvgTime = ref(0)
    const concurrentMinTime = ref(0)
    const concurrentMaxTime = ref(0)
    const concurrentSuccessRate = ref(0)
    let concurrentTestRunning = false

    // 运行并发测试
    const runConcurrentTest = async () => {
      concurrentLoading.value = true
      concurrentTestRunning = true
      concurrentProgress.value = 0
      concurrentCompleted.value = 0
      concurrentResults.value = []
      concurrentTestCases.value = [] // 清空当前批次测试用例
      
      // 确保当前选中的是并发测试选项卡
      activeTab.value = 'concurrent'
      
      // 生成所有测试数据
      const allTestData = []
      for (let i = 0; i < concurrentCount.value; i++) {
        const testData = generateRandomTestData('fusion')
        const expectedResult = determineBatchExpectedResult(testData)
        allTestData.push({
          testData,
          expectedResult,
          index: i
        })
      }
      
      // 使用Promise.all和并发限制执行测试
      const runConcurrentTests = async () => {
        // 分批执行测试，每批最多concurrentLimit个
        for (let i = 0; i < allTestData.length && concurrentTestRunning; i += concurrentLimit.value) {
          const batch = allTestData.slice(i, i + concurrentLimit.value)
          
          // 更新当前批次的测试用例
          concurrentTestCases.value = batch
          activeConcurrentCase.value = [0] // 默认展开第一个
          
          const promises = batch.map(item => runConcurrentSingleTest(item.testData, item.expectedResult, item.index))
          
          await Promise.all(promises)
          
          // 更新进度
          concurrentProgress.value = Math.min((concurrentCompleted.value / concurrentCount.value) * 100, 100)
        }
        
        // 测试完成后的处理
        concurrentLoading.value = false
        concurrentTestRunning = false
        
        // 确保进度条显示100%
        if (concurrentCompleted.value >= concurrentCount.value) {
          concurrentProgress.value = 100
        }
        
        // 计算性能指标
        calculateConcurrentMetrics()
      }
      
      // 运行单个并发测试
      const runConcurrentSingleTest = async (testData, expectedResult, index) => {
        if (!concurrentTestRunning) return
        
        const startTime = Date.now()
        
        try {
          const response = await fusionTest(testData)
          const endTime = Date.now()
          
          // 生成成功结果
          const result = {
            timestamp: new Date().toLocaleString(),
            name: `并发测试 #${index + 1}`,
            request: testData,
            response,
            responseTime: endTime - startTime,
            // systemMetrics: {
            //   cpu: endMetrics.cpu,
            //   gpu: endMetrics.gpu,
            //   memory: endMetrics.memory
            // },
            status: 'success',
            expectedResult
          }
          
          // 添加到结果列表
          concurrentResults.value.push(result)
          
          // 更新当前显示的结果为最新的测试结果
          currentResult.value = result
          
          // 更新完成数量
          concurrentCompleted.value++
          
          // 存储到历史
          store.dispatch('addTestResult', { type: 'fusion', result })
          
          return result
        } catch (error) {
          const endTime = Date.now()
          const errorMessage = error.error || error.message || '未知错误'
          
          // 生成失败结果
          const result = {
            timestamp: new Date().toLocaleString(),
            name: `并发测试 #${index + 1}`,
            request: testData,
            response: { error: errorMessage },
            responseTime: endTime - startTime,
            status: 'failed',
            expectedResult
          }
          
          // 添加到结果列表
          concurrentResults.value.push(result)
          
          // 更新当前显示的结果为最新的测试结果
          currentResult.value = result
          
          // 更新完成数量
          concurrentCompleted.value++
          
          // 存储到历史
          store.dispatch('addTestResult', { type: 'fusion', result })
          
          return result
        }
      }
      
      // 计算并发测试性能指标
      const calculateConcurrentMetrics = () => {
        if (concurrentResults.value.length === 0) return
        
        // 计算平均响应时间
        const totalTime = concurrentResults.value.reduce((sum, result) => sum + result.responseTime, 0)
        concurrentAvgTime.value = totalTime / concurrentResults.value.length
        
        // 计算最短和最长响应时间
        const responseTimes = concurrentResults.value.map(result => result.responseTime)
        concurrentMinTime.value = Math.min(...responseTimes)
        concurrentMaxTime.value = Math.max(...responseTimes)
        
        // 计算请求成功率
        const successCount = concurrentResults.value.filter(result => result.status === 'success').length
        concurrentSuccessRate.value = Math.round((successCount / concurrentResults.value.length) * 100)
        
        // 刷新图表
        refreshStats()
      }
      
      // 开始执行测试
      runConcurrentTests()
    }
    
    // 停止并发测试
    const stopConcurrentTest = () => {
      concurrentTestRunning = false
    }
    
    // 处理CSV文件上传
    const handleCsvUpload = (file) => {
      if (!file) return
      
      // 检查文件类型
      if (file.raw.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        ElMessage.error('请上传CSV格式的文件')
        return
      }
      
      // 清空之前的测试用例
      csvTestCases.value = []
      
      // 读取CSV文件
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const content = e.target.result
          // 检查文件内容是否为空
          if (!content || content.trim() === '') {
            ElMessage.error('CSV文件内容为空')
            return
          }
          
          // 解析CSV内容
          parseCsvContent(content)
          
          // 检查是否成功解析到测试用例
          if (csvTestCases.value.length === 0) {
            ElMessage.warning('未从CSV文件中解析到有效的测试用例')
            return
          }
          
          ElMessage.success(`成功解析 ${csvTestCases.value.length} 条测试用例`)
        } catch (error) {
          ElMessage.error(`CSV文件解析失败: ${error.message}`)
          console.error('CSV解析错误:', error)
        }
      }
      reader.onerror = () => {
        ElMessage.error('读取CSV文件时发生错误')
      }
      reader.readAsText(file.raw)
    }
    
    // 解析CSV内容
    const parseCsvContent = (content) => {
      try {
        // 按行分割
        const lines = content.split('\n')
        if (lines.length < 2) {
          throw new Error('CSV文件格式不正确，至少需要标题行和一行数据')
        }
        
        console.log("CSV文件内容第一行:", lines[0])
        
        // 获取标题行并转为小写以便不区分大小写比较
        const headerLine = lines[0].trim()
        const headerColumns = headerLine.split(',').map(col => col.trim().toLowerCase())
        
        console.log("解析后的标题列:", headerColumns)
        
        // 查找列索引，支持多种可能的列名格式
        const findColumnIndex = (possibleNames) => {
          for (const name of possibleNames) {
            const index = headerColumns.findIndex(col => 
              col === name.toLowerCase() || 
              col.replace(/[_\s-]/g, '') === name.replace(/[_\s-]/g, '').toLowerCase()
            )
            if (index !== -1) return index
          }
          return -1
        }
        
        const nameIndex = findColumnIndex(['test_name', 'testname', 'name', 'casename'])
        const user1FaceIndex = findColumnIndex(['user1_face', 'user1face', 'face1'])
        const user1VoiceIndex = findColumnIndex(['user1_voice', 'user1voice', 'voice1'])
        const user1FingerIndex = findColumnIndex(['user1_finger', 'user1finger', 'finger1'])
        const user2FaceIndex = findColumnIndex(['user2_face', 'user2face', 'face2'])
        const user2VoiceIndex = findColumnIndex(['user2_voice', 'user2voice', 'voice2'])
        const user2FingerIndex = findColumnIndex(['user2_finger', 'user2finger', 'finger2'])
        const expectedResultIndex = findColumnIndex(['expected_result', 'expectedresult', 'result', 'expectation'])
        
        console.log("列索引:", {
          nameIndex,
          user1FaceIndex,
          user1VoiceIndex,
          user1FingerIndex,
          user2FaceIndex,
          user2VoiceIndex,
          user2FingerIndex,
          expectedResultIndex
        })
        
        // 检查必要的列是否存在
        const requiredColumns = [
          { index: user1FaceIndex, name: 'user1_face' },
          { index: user1VoiceIndex, name: 'user1_voice' },
          { index: user1FingerIndex, name: 'user1_finger' },
          { index: user2FaceIndex, name: 'user2_face' },
          { index: user2VoiceIndex, name: 'user2_voice' },
          { index: user2FingerIndex, name: 'user2_finger' },
          { index: expectedResultIndex, name: 'expected_result' }
        ]
        
        const missingColumns = requiredColumns.filter(col => col.index === -1).map(col => col.name)
        if (missingColumns.length > 0) {
          throw new Error(`CSV文件缺少必要的列: ${missingColumns.join(', ')}`)
        }
        
        // 处理每一行数据
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim()
          if (!line) continue // 跳过空行
          
          const columns = line.split(',')
          if (columns.length < headerColumns.length) continue // 跳过数据不完整的行
          
          // 提取数据
          const testCase = {
            name: nameIndex !== -1 ? columns[nameIndex].trim() : `测试用例 #${i}`,
            testData: {
              user1: {
                face: columns[user1FaceIndex].trim(),
                voice: columns[user1VoiceIndex].trim(),
                finger: columns[user1FingerIndex].trim()
              },
              user2: {
                face: columns[user2FaceIndex].trim(),
                voice: columns[user2VoiceIndex].trim(),
                finger: columns[user2FingerIndex].trim()
              }
            },
            expectedResult: columns[expectedResultIndex].trim()
          }
          
          // 验证预期结果是否合法
          if (!['same_person', 'different_person', 'error'].includes(testCase.expectedResult.toLowerCase())) {
            testCase.expectedResult = determineBatchExpectedResult(testCase.testData)
          }
          
          csvTestCases.value.push(testCase)
        }
      } catch (error) {
        console.error('CSV解析错误:', error)
        throw error
      }
    }
    
    // 下载CSV模板
    const downloadCsvTemplate = () => {
      // 创建CSV内容
      const header = 'test_name,user1_face,user1_voice,user1_finger,user2_face,user2_voice,user2_finger,expected_result'
      const sampleData = [
        '同一用户测试,1_1.png,1_1.wav,1_1.jpg,1_2.png,1_2.wav,1_2.jpg,same_person',
        '不同用户测试,1_1.png,1_1.wav,1_1.jpg,2_1.png,2_1.wav,2_1.jpg,different_person',
        '错误测试,1_1.png,1_1.wav,1_1.jpg,invalid.png,2_1.wav,2_1.jpg,error'
      ]
      const csvContent = [header, ...sampleData].join('\n')
      
      // 创建Blob对象
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      
      // 创建下载链接
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', 'fusion_test_template.csv')
      link.style.visibility = 'hidden'
      
      // 添加到DOM并触发点击
      document.body.appendChild(link)
      link.click()
      
      // 清理
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }
    
    return {
      activeTab,
      selectedTestCase,
      testCases,
      loading,
      currentResult,
      customTestForm,
      batchCount,
      batchLoading,
      batchProgress,
      completedTests,
      testHistory,
      batchResults,
      activeBatchResult,
      currentBatchTestData,
      currentBatchExpectedResult,
      isInBatchMode,
      isViewingHistory,
      // CSV相关
      // batchTestMode,
      csvFileList,
      csvTestCases,
      activeCsvCase,
      handleCsvUpload,
      downloadCsvTemplate,
      getBatchTotalTests,
      // 并发测试相关
      concurrentCount,
      concurrentLimit,
      concurrentLoading,
      concurrentProgress,
      concurrentCompleted,
      concurrentResults,
      activeConcurrentResult,
      concurrentTestCases,
      activeConcurrentCase,
      concurrentAvgTime,
      concurrentMinTime,
      concurrentMaxTime,
      concurrentSuccessRate,
      runConcurrentTest,
      stopConcurrentTest,
      // 其他方法
      runTest,
      runCustomTest,
      resetCustomForm,
      runBatchTest,
      stopBatchTest,
      showHistoryResult,
      clearResults,
      getProgressColor,
      formatExpectedResult,
      getExpectedResultTagType,
      isTestPassed,
      getTestPassedStatus,
      getExpectedResultExplanation,
      // 仪表盘相关
      resultPieChart,
      responseTimeChart,
      fusionStats,
      passRate,
      avgResponseTime,
      refreshStats,
      getPassRateStatus
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

.custom-input {
  width: 100%;
}

.input-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 4px;
  padding-left: 4px;
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

.batch-results-collapse {
  margin-top: 16px;
}

.batch-result-item {
  padding: 8px 0;
}

.batch-result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.batch-result-time {
  font-size: 13px;
  color: #909399;
}

.batch-result-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.batch-result-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.batch-section-title {
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
}

.json-viewer.small {
  max-height: 200px;
  font-size: 12px;
}

.batch-result-metrics {
  margin-top: 8px;
}

.batch-metrics-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-top: 8px;
}

.batch-metric-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
}

.expected-tag {
  margin-left: 8px;
  font-size: 12px;
}

.expected-tag-small {
  margin-left: 4px;
}

.expected-result-section {
  margin-top: 24px;
  padding: 16px;
  border-radius: var(--border-radius);
  background-color: rgba(0, 0, 0, 0.02);
}

.section-header {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
  color: var(--text-color);
}

.section-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.expected-radio-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
}

.result-status-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-pass-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.expected-result-display {
  background-color: #f8f9fa;
  border-radius: var(--border-radius);
  padding: 16px;
}

.expected-result-tag {
  font-size: 14px;
  padding: 6px 12px;
  margin-bottom: 12px;
}

.expected-result-explanation {
  margin-top: 8px;
  color: #606266;
  font-size: 14px;
}

.batch-result-tags {
  display: flex;
  align-items: center;
  gap: 8px;
}

.test-result-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.test-passed {
  border-left: 3px solid #67C23A;
  padding-left: 8px;
}

.test-failed {
  border-left: 3px solid #F56C6C;
  padding-left: 8px;
}

.history-card {
  margin-top: 0;
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
  
  .batch-metrics-grid {
    grid-template-columns: 1fr;
  }
}

.expected-tag-batch {
  margin-top: 12px;
  padding: 6px 10px;
  font-size: 14px;
}

/* 仪表盘样式 */
.dashboard-card {
  margin-top: 0;
}

.refresh-button {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s;
}

.refresh-button:hover {
  transform: scale(1.05);
}

.stats-card, .chart-card {
  height: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stats-header, .chart-header {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-color);
  margin-bottom: 16px;
  display: flex;
  align-items: center;
}

.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.stats-item {
  display: flex;
  flex-direction: column;
}

.stats-item.full-width {
  grid-column: span 2;
}

.stats-label {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.stats-value {
  font-size: 22px;
  font-weight: 600;
  color: var(--text-color);
}

.stats-value.total {
  color: var(--primary-color);
}

.stats-value.success {
  color: #67C23A;
}

.stats-value.danger {
  color: #F56C6C;
}

.stats-value.highlight {
  color: var(--primary-color);
  font-size: 26px;
}

.stats-divider {
  grid-column: span 2;
  height: 1px;
  background-color: rgba(0, 0, 0, 0.05);
  margin: 4px 0;
}

.pass-rate-progress {
  width: 100%;
  margin-top: 8px;
}

.chart-container {
  height: 220px;
  position: relative;
}

@media (max-width: 768px) {
  .stats-container {
    grid-template-columns: 1fr;
  }
  
  .stats-item.full-width, .stats-divider {
    grid-column: span 1;
  }
  
  .chart-container {
    height: 180px;
  }
}

/* 添加并发测试相关样式 */
.concurrent-metrics {
  margin-top: 20px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
}

.metrics-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  margin-bottom: 16px;
}

.metrics-header .el-icon {
  margin-right: 8px;
  color: var(--primary-color);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.metric-box {
  background-color: white;
  border-radius: 6px;
  padding: 12px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.metric-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}

.metric-value {
  font-size: 20px;
  font-weight: 600;
  color: var(--primary-color);
}

@media (max-width: 768px) {
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

/* 并发测试样式 */
.concurrent-test {
  padding: 0;
}

.concurrent-test-cases {
  margin-top: 20px;
}

.concurrent-cases-collapse {
  margin-top: 12px;
}

.concurrent-case-item {
  padding: 8px 0;
}

.concurrent-case-item .expected-tag-small {
  margin-top: 8px;
  display: inline-block;
}

/* CSV上传样式 */
.csv-upload {
  width: 100%;
}

.csv-upload .el-upload {
  width: 100%;
}

.csv-upload .el-upload-dragger {
  width: 100%;
  height: auto;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

/* CSV测试用例列表样式 */
.csv-test-cases {
  margin-top: 20px;
}

.csv-cases-collapse {
  margin-top: 12px;
}

.csv-case-item {
  padding: 8px 0;
}

.csv-case-item .expected-tag-small {
  margin-top: 8px;
  display: inline-block;
}

.csv-case-item .test-status {
  margin-top: 12px;
  display: flex;
  gap: 8px;
}

.csv-case-item .json-viewer.small {
  max-height: 200px;
}
</style> 