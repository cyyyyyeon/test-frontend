<template>
  <div class="fusion-test-container">
    <div class="page-header">
      <div class="title-section">
        <el-icon class="page-icon">
          <PictureFilled />
        </el-icon>
        <h2 class="page-title">可解释性接口测试</h2>
      </div>
      <div class="api-badge">
        <el-tag type="primary" effect="dark" size="large" class="api-tag">
          <el-icon>
            <Link />
          </el-icon>
          <span>POST /face-viz</span>
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
          <div class="api-info-value">/face-viz</div>
        </div>
        <div class="api-info-item">
          <div class="api-info-label">请求方法</div>
          <div class="api-info-value method-post">POST</div>
        </div>
        <div class="api-info-item">
          <div class="api-info-label">功能描述</div>
          <div class="api-info-value">人脸热力图可解释性与相似度得分</div>
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
                      <span>图像 1</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-input v-model="customTestForm.user1_face" placeholder="输入文件名，例如: 1_1.png"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <PictureFilled />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持PNG格式</div>
                    </el-form-item>
                  </div>

                  <div class="user-section">
                    <div class="user-header">
                      <el-icon>
                        <User />
                      </el-icon>
                      <span>图像 2</span>
                    </div>
                    <el-form-item label="人脸图像">
                      <el-input v-model="customTestForm.user2_face" placeholder="输入文件名，例如: 2_1.png"
                        class="custom-input">
                        <template #prefix>
                          <el-icon>
                            <PictureFilled />
                          </el-icon>
                        </template>
                      </el-input>
                      <div class="input-tip">支持PNG格式</div>
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
                        <div class="el-upload__tip">请上传CSV格式文件，包含列：test_name, user1_face, user2_face,
                          expected_result</div>
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

            <el-tab-pane label="并发测试" name="concurrent">
              <div class="concurrent-test">
                <el-form label-width="100px">
                  <el-form-item label="测试次数">
                    <el-input-number v-model="concurrentCount" :min="1" :max="100" class="custom-input-number" />
                  </el-form-item>

                  <el-form-item label="并发数量">
                    <el-input-number v-model="concurrentLimit" :min="1" :max="5" class="custom-input-number" />
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

              <template v-if="currentResult.status === 'success' && currentResult.response">
                <h4>相似度得分: {{ currentResult.response.similarity.toFixed(4) }}</h4>

                <div class="visualization-container">
                  <div class="visualization-item">
                    <h5>图像1可视化:</h5>
                    <div class="image-placeholder">
                      <img v-if="currentResult.response.user1_face_output"
                        :src="'http://10.60.38.173:59090/output/' + currentResult.response.user1_face_output"
                        alt="图像1热力图"
                        style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                      <p v-else>暂无图像1热力图</p>
                    </div>
                  </div>

                  <div class="visualization-item">
                    <h5>图像2可视化:</h5>
                    <div class="image-placeholder">
                      <img v-if="currentResult.response.user2_face_output"
                        :src="'http://10.60.38.173:59090/output/' + currentResult.response.user2_face_output"
                        alt="图像2热力图"
                        style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                      <p v-else>暂无图像2热力图</p>
                    </div>
                  </div>
                </div>
              </template>

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

                      <template v-if="result.status === 'success' && result.response">
                        <h4>相似度得分: {{ result.response.similarity.toFixed(4) }}</h4>

                        <div class="visualization-container">
                          <div class="visualization-item">
                            <h5>图像1可视化:</h5>
                            <div class="image-placeholder">
                              <img v-if="result.response.user1_face_output"
                                :src="'http://10.60.38.173:59090/output/' + result.response.user1_face_output"
                                alt="图像1热力图"
                                style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                              <p v-else>暂无图像1热力图</p>
                            </div>
                          </div>

                          <div class="visualization-item">
                            <h5>图像2可视化:</h5>
                            <div class="image-placeholder">
                              <img v-if="result.response.user2_face_output"
                                :src="'http://10.60.38.173:59090/output/' + result.response.user2_face_output"
                                alt="图像2热力图"
                                style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                              <p v-else>暂无图像2热力图</p>
                            </div>
                          </div>
                        </div>
                      </template>

                      <div v-if="result.expectedResult" class="result-section">
                        <div class="section-header">
                          <el-icon>
                            <Flag />
                          </el-icon>
                          <span>预期结果</span>
                        </div>
                        <div class="expected-result-display">
                          <el-tag :type="getExpectedResultTagType(result.expectedResult)" effect="light"
                            class="expected-result-tag">
                            {{ formatExpectedResult(result.expectedResult) }}
                          </el-tag>
                          <div class="expected-result-explanation">
                            {{ getExpectedResultExplanation(result) }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </el-collapse-item>
              </el-collapse>
            </div>
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

                      <template v-if="result.status === 'success' && result.response">
                        <h4>相似度得分: {{ result.response.similarity.toFixed(4) }}</h4>

                        <div class="visualization-container">
                          <div class="visualization-item">
                            <h5>图像1可视化:</h5>
                            <div class="image-placeholder">
                              <img v-if="result.response.user1_face_output"
                                :src="'http://10.60.38.173:59090/output/' + result.response.user1_face_output"
                                alt="图像1热力图"
                                style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                              <p v-else>暂无图像1热力图</p>
                            </div>
                          </div>

                          <div class="visualization-item">
                            <h5>图像2可视化:</h5>
                            <div class="image-placeholder">
                              <img v-if="result.response.user2_face_output"
                                :src="'http://10.60.38.173:59090/output/' + result.response.user2_face_output"
                                alt="图像2热力图"
                                style="max-width: 100%; max-height: 200px; border-radius: 8px; border: 1px solid #eee;" />
                              <p v-else>暂无图像2热力图</p>
                            </div>
                          </div>
                        </div>
                      </template>

                      <div v-if="result.expectedResult" class="result-section">
                        <div class="section-header">
                          <el-icon>
                            <Flag />
                          </el-icon>
                          <span>预期结果</span>
                        </div>
                        <div class="expected-result-display">
                          <el-tag :type="getExpectedResultTagType(result.expectedResult)" effect="light"
                            class="expected-result-tag">
                            {{ formatExpectedResult(result.expectedResult) }}
                          </el-tag>
                          <div class="expected-result-explanation">
                            {{ getExpectedResultExplanation(result) }}
                          </div>
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
                  :class="{ 'response-fast': scope.row.responseTime < 100, 'response-slow': scope.row.responseTime > 500 }">
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

    <el-row style="margin-top: 24px;">
      <el-col :span="24">
        <el-card class="dashboard-card" shadow="hover">
          <template #header>
            <div class="card-header">
              <el-icon>
                <DataAnalysis />
              </el-icon>
              <span>人脸可视化接口仪表盘</span>
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
                    <div class="stats-value total">{{ faceVizStats.totalTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">成功请求</div>
                    <div class="stats-value success">{{ faceVizStats.successTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">失败请求</div>
                    <div class="stats-value danger">{{ faceVizStats.failedTests }}</div>
                  </div>
                  <div class="stats-divider"></div>
                  <div class="stats-item">
                    <div class="stats-label">测试通过</div>
                    <div class="stats-value success">{{ faceVizStats.passedTests }}</div>
                  </div>
                  <div class="stats-item">
                    <div class="stats-label">测试不通过</div>
                    <div class="stats-value danger">{{ faceVizStats.notPassedTests }}</div>
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
import { faceVizTest } from '@/utils/api'
import { generateFaceVizTestCases, generateRandomTestData } from '@/utils/testCases'
import Chart from 'chart.js/auto'
import { Download } from '@element-plus/icons-vue'

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
    const batchProgress = ref(0)
    const completedTests = ref(0)
    const csvFileList = ref([])
    const csvTestCases = ref([])
    const activeCsvCase = ref([0])
    let batchTestRunning = false

    const batchResults = ref([])
    const activeBatchResult = ref([])

    const isViewingHistory = ref(false)

    const customTestForm = ref({
      user1_face: '',
      user2_face: '',
      expectedResult: 'same_person'
    })

    const testHistory = computed(() => {
      return store.getters.getTestResults('faceViz')
    })

    const isInBatchMode = computed(() => {
      return (activeTab.value === 'batch' && batchResults.value.length > 0) ||
        (activeTab.value === 'concurrent' && concurrentResults.value.length > 0)
    })

    // --- Dashboard & Charting ---
    const resultPieChart = ref(null)
    const responseTimeChart = ref(null)
    let charts = { resultPie: null, responseTime: null }

    const faceVizStats = computed(() => {
      const results = testHistory.value
      const totalTests = results.length
      const successTests = results.filter(r => r.status === 'success').length
      const failedTests = totalTests - successTests
      const testsWithExpectation = results.filter(r => r.expectedResult)
      const passedTests = testsWithExpectation.filter(r => isTestPassed(r)).length
      const notPassedTests = testsWithExpectation.length - passedTests
      return { totalTests, successTests, failedTests, passedTests, notPassedTests }
    })

    const passRate = computed(() => {
      const { passedTests, notPassedTests } = faceVizStats.value
      const total = passedTests + notPassedTests
      if (total === 0) return 0
      return Math.round((passedTests / total) * 100)
    })

    const avgResponseTime = computed(() => {
      if (testHistory.value.length === 0) return 0
      const totalTime = testHistory.value.reduce((sum, item) => sum + item.responseTime, 0)
      return totalTime / testHistory.value.length
    })

    const getPassRateStatus = (rate) => {
      if (rate >= 80) return 'success'
      if (rate >= 60) return 'warning'
      return 'exception'
    }

    const initCharts = () => {
      if (charts.resultPie) charts.resultPie.destroy()
      if (charts.responseTime) charts.responseTime.destroy()

      if (resultPieChart.value) {
        charts.resultPie = new Chart(resultPieChart.value, {
          type: 'doughnut',
          data: {
            labels: ['测试通过', '测试不通过', '无预期结果'],
            datasets: [{
              data: [
                faceVizStats.value.passedTests,
                faceVizStats.value.notPassedTests,
                faceVizStats.value.totalTests - (faceVizStats.value.passedTests + faceVizStats.value.notPassedTests)
              ],
              backgroundColor: ['#67C23A', '#F56C6C', '#909399'],
            }]
          },
          options: { responsive: true, maintainAspectRatio: false }
        })
      }

      if (responseTimeChart.value) {
        const recentTests = [...testHistory.value].slice(-10)
        charts.responseTime = new Chart(responseTimeChart.value, {
          type: 'line',
          data: {
            labels: recentTests.map((_, index) => `测试 ${index + 1}`),
            datasets: [{
              label: '响应时间(ms)',
              data: recentTests.map(test => test.responseTime),
              borderColor: '#409EFF',
              fill: true,
              tension: 0.4
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        })
      }
    }

    const refreshStats = () => initCharts()

    watch(testHistory, () => initCharts(), { deep: true })

    onMounted(() => {
      testCases.value = generateFaceVizTestCases()

      if (testCases.value.length > 0) {
        selectedTestCase.value = 0
      }
      setTimeout(() => initCharts(), 500)
    })

    onBeforeUnmount(() => {
      if (charts.resultPie) charts.resultPie.destroy()
      if (charts.responseTime) charts.responseTime.destroy()
    })

    // --- Test Logic & Helpers ---
    const SIMILARITY_THRESHOLD = 0.8;

    const formatExpectedResult = (expected) => {
      if (expected === 'same_person') return '同一个人'
      if (expected === 'different_person') return '不同人'
      if (expected === 'error') return '错误'
      return '未知'
    }

    const getExpectedResultTagType = (expected) => {
      if (expected === 'same_person') return 'success'
      if (expected === 'different_person') return 'warning'
      if (expected === 'error') return 'danger'
      return 'info'
    }

    const isTestPassed = (result) => {
      if (!result.expectedResult) return true
      if (result.expectedResult === 'error') return result.status === 'failed'
      if (result.status === 'failed') return false

      const isSamePerson = result.response && result.response.is_same_person === true
      return (result.expectedResult === 'same_person' && isSamePerson) ||
        (result.expectedResult === 'different_person' && !isSamePerson)
    }

    const getTestPassedStatus = (result) => isTestPassed(result) ? 'success' : 'danger'

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
      }    }

    const runTest = async (testData, expectedResult) => {
      loading.value = true
      const startTime = Date.now()
      const testName = activeTab.value === 'preset' ? testCases.value[selectedTestCase.value].name : '自定义测试';

      try {
        const response = await faceVizTest(testData)
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testName,
          request: testData,
          response,
          responseTime: Date.now() - startTime,
          status: 'success',
          expectedResult
        }
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'faceViz', result })
      } catch (error) {
        console.log(error)
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testName,
          request: testData,
          response: { error: error.error || '未知错误' },
          responseTime: Date.now() - startTime,
          status: 'failed',
          expectedResult
        }
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'faceViz', result })
      } finally {
        loading.value = false
      }
    }

    const runCustomTest = () => {
      const testData = { user1_face: customTestForm.value.user1_face, user2_face: customTestForm.value.user2_face };
      runTest(testData, customTestForm.value.expectedResult)
    }

    const resetCustomForm = () => {
      customTestForm.value = {
        user1_face: '',
        user2_face: '',
        expectedResult: 'same_person'
      }
    }

    // --- CSV & Batch Testing ---
    const handleCsvUpload = (file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          parseCsvContent(e.target.result);
          if (csvTestCases.value.length > 0) {
            ElMessage.success(`成功解析 ${csvTestCases.value.length} 条测试用例`);
          } else {
            ElMessage.warning('未从CSV文件中解析到有效的测试用例');
          }
        } catch (error) {
          ElMessage.error(`CSV文件解析失败: ${error.message}`);
        }
      };
      reader.readAsText(file.raw);
    };

    const parseCsvContent = (content) => {
      csvTestCases.value = [];
      const lines = content.split('\n').slice(1); // Skip header
      for (const line of lines) {
        if (!line.trim()) continue;
        const [test_name, user1_face, user2_face, expected_result] = line.split(',').map(s => s.trim());
        if (user1_face && user2_face && expected_result) {
          csvTestCases.value.push({
            name: test_name,
            testData: { user1_face: user1_face , user2_face: user2_face  },
            expectedResult: expected_result
          });
        }
      }
    };

    const downloadCsvTemplate = () => {
      const header = 'test_name,user1_face,user2_face,expected_result';
      const sample1 = 'Same Person Test,1_1.png,1_2.png,same_person';
      const sample2 = 'Different Person Test,1_1.png,2_1.png,different_person';
      const csvContent = [header, sample1, sample2].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.setAttribute('download', 'faceviz_test_template.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const getBatchTotalTests = () => csvTestCases.value.length;

    const runBatchTest = async () => {
      if (csvTestCases.value.length === 0) {
        ElMessage.error('请先上传CSV文件');
        return;
      }
      batchLoading.value = true;
      batchTestRunning = true;
      batchProgress.value = 0;
      completedTests.value = 0;
      batchResults.value = [];
      activeTab.value = 'batch';

      for (const testCase of csvTestCases.value) {
        if (!batchTestRunning) break;
        const startTime = Date.now();
        try {
          const response = await faceVizTest(testCase.testData);
          const result = {
            timestamp: new Date().toLocaleString(),
            name: testCase.name,
            request: testCase.testData,
            response,
            responseTime: Date.now() - startTime,
            status: 'success',
            expectedResult: testCase.expectedResult
          };
          batchResults.value.push(result);
          store.dispatch('addTestResult', { type: 'faceViz', result });
        } catch (error) {
          const result = {
            timestamp: new Date().toLocaleString(),
            name: testCase.name,
            request: testCase.testData,
            response: { error: error.error || '未知错误' },
            responseTime: Date.now() - startTime,
            status: 'failed',
            expectedResult: testCase.expectedResult
          };
          batchResults.value.push(result);
          store.dispatch('addTestResult', { type: 'faceViz', result });
        }
        completedTests.value++;
        batchProgress.value = (completedTests.value / getBatchTotalTests()) * 100;
        currentResult.value = batchResults.value[batchResults.value.length - 1];
        activeBatchResult.value = [batchResults.value.length - 1];
      }
      batchLoading.value = false;
      batchTestRunning = false;
    };

    const stopBatchTest = () => { batchTestRunning = false; };

    // --- Concurrent Testing ---
    const concurrentCount = ref(10);
    const concurrentLimit = ref(3);
    const concurrentLoading = ref(false);
    const concurrentProgress = ref(0);
    const concurrentCompleted = ref(0);
    const concurrentResults = ref([]);
    const activeConcurrentResult = ref([]);
    const concurrentTestCases = ref([]);
    const activeConcurrentCase = ref([0]);
    let concurrentTestRunning = false;

    const runConcurrentTest = async () => {
      concurrentLoading.value = true;
      concurrentTestRunning = true;
      concurrentProgress.value = 0;
      concurrentCompleted.value = 0;
      concurrentResults.value = [];
      concurrentTestCases.value = [];
      activeTab.value = 'concurrent';

      const allTestData = Array.from({ length: concurrentCount.value }, (_, i) => {
        const testData = generateRandomTestData('faceViz');
        const id1 = testData.user1_face.split('_')[0];
        const id2 = testData.user2_face.split('_')[0];
        return {
          testData,
          expectedResult: id1 === id2 ? 'same_person' : 'different_person',
          name: `并发测试 #${i + 1}`
        };
      });

      for (let i = 0; i < allTestData.length && concurrentTestRunning; i += concurrentLimit.value) {
        const batch = allTestData.slice(i, i + concurrentLimit.value);
        concurrentTestCases.value = batch;

        const promises = batch.map(item => runSingleConcurrentTest(item));
        await Promise.all(promises);

        concurrentProgress.value = Math.min((concurrentCompleted.value / concurrentCount.value) * 100, 100);
      }
      concurrentLoading.value = false;
      concurrentTestRunning = false;
      if (concurrentCompleted.value >= concurrentCount.value) {
        concurrentProgress.value = 100
      }

    };

    const runSingleConcurrentTest = async (item) => {
      if (!concurrentTestRunning) return;
      const startTime = Date.now();
      try {
        const response = await faceVizTest(item.testData);
        const result = {
          timestamp: new Date().toLocaleString(), name: item.name, request: item.testData,
          response, responseTime: Date.now() - startTime, status: 'success', expectedResult: item.expectedResult
        };
        concurrentResults.value.push(result);
        store.dispatch('addTestResult', { type: 'faceViz', result });
      } catch (error) {
        const result = {
          timestamp: new Date().toLocaleString(), name: item.name, request: item.testData,
          response: { error: error.error || '未知错误' }, responseTime: Date.now() - startTime, status: 'failed', expectedResult: item.expectedResult
        };
        concurrentResults.value.push(result);
        store.dispatch('addTestResult', { type: 'faceViz', result });
      }
      concurrentCompleted.value++;
      currentResult.value = concurrentResults.value[concurrentResults.value.length - 1];
      console.log(currentResult.value)
      activeConcurrentResult.value = [concurrentResults.value.length - 1];
    };

    const stopConcurrentTest = () => { concurrentTestRunning = false; };

    // --- General Actions ---
    const showHistoryResult = (result) => {
      currentResult.value = result
      isViewingHistory.value = true
    }

    const clearResults = () => {
      currentResult.value = null
      batchResults.value = [];
      concurrentResults.value = [];
      csvTestCases.value = [];
      csvFileList.value = [];
      batchProgress.value = 0;
      completedTests.value = 0;
      concurrentProgress.value = 0;
      concurrentCompleted.value = 0;
      isViewingHistory.value = false;
      store.dispatch('resetTestResults', 'faceViz');
    }

    watch(activeTab, () => { isViewingHistory.value = false; });

    return {
      activeTab, selectedTestCase, testCases, loading, currentResult, testHistory,
      customTestForm, runCustomTest, resetCustomForm,
      batchLoading, batchProgress, completedTests, batchResults, activeBatchResult,
      getBatchTotalTests, runBatchTest, stopBatchTest,
      csvFileList, csvTestCases, activeCsvCase, handleCsvUpload, downloadCsvTemplate,
      concurrentCount, concurrentLimit, concurrentLoading, concurrentProgress, concurrentCompleted,
      concurrentResults, activeConcurrentResult, concurrentTestCases, activeConcurrentCase,
      runConcurrentTest, stopConcurrentTest,
      runTest, showHistoryResult, clearResults,
      formatExpectedResult, getExpectedResultTagType, isTestPassed, getTestPassedStatus, getExpectedResultExplanation,
      isInBatchMode, isViewingHistory,
      // Dashboard
      resultPieChart, responseTimeChart, faceVizStats, passRate, avgResponseTime, refreshStats, getPassRateStatus
    }
  }
}
</script>

<style scoped>
/* Using the exact same styles from FusionTest.vue for consistency */
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

.info-card,
.test-config-card,
.result-card,
.history-card {
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

.stats-card,
.chart-card {
  height: 100%;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stats-header,
.chart-header {
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

.csv-upload {
  width: 100%;
}

.el-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: #909399;
}

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

  .stats-container {
    grid-template-columns: 1fr;
  }

  .stats-item.full-width,
  .stats-divider {
    grid-column: span 1;
  }

  .chart-container {
    height: 180px;
  }
}
</style>
```