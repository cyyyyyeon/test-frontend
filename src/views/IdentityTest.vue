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
        <p><strong>Content-Type：</strong> application/json</p>
        <p><strong>功能描述：</strong> 基于深度学习模型对用户进行身份风险等级评估</p>
        <div class="param-info">
          <h4>请求参数：</h4>
          <ul>
            <li><strong>trans_series</strong> (Array[Array[Number]]): 交易序列数据，二维数组，每个时间步包含7个特征</li>
            <li><strong>user_info</strong> (Array[Number]): 用户基本信息，一维数组，长度灵活</li>
          </ul>
          <h4>响应参数：</h4>
          <ul>
            <li><strong>prediction</strong> (Integer): 预测结果，表示风险等级 (0: 低风险, 1: 高风险)</li>
          </ul>
        </div>
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
            <el-tab-pane label="真实数据测试" name="real">
              <div class="real-data-test">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-card>
                      <template #header>数据集信息</template>
                      <div v-if="datasetInfo">
                        <p><strong>总样本数:</strong> {{ datasetInfo.total_samples }}</p>
                        <p><strong>标签分布:</strong></p>
                        <ul>
                          <li>低风险 (0): {{ datasetInfo.label_distribution[0] || 0 }}个 ({{ ((datasetInfo.label_distribution[0] || 0) / datasetInfo.total_samples * 100).toFixed(1) }}%)</li>
                          <li>高风险 (1): {{ datasetInfo.label_distribution[1] || 0 }}个 ({{ ((datasetInfo.label_distribution[1] || 0) / datasetInfo.total_samples * 100).toFixed(1) }}%)</li>
                        </ul>
                        <p><strong>交易序列长度:</strong> {{ datasetInfo.trans_length_stats.min }}-{{ datasetInfo.trans_length_stats.max }} (平均: {{ datasetInfo.trans_length_stats.mean.toFixed(0) }})</p>
                      </div>
                      <el-button v-else type="primary" @click="loadDatasetInfo" :loading="loadingDatasetInfo">加载数据集信息</el-button>
                    </el-card>
                  </el-col>
                  <el-col :span="12">
                    <el-card>
                      <template #header>测试选项</template>
                      <el-form label-width="100px">
                        <el-form-item label="测试方式">
                          <el-radio-group v-model="testMode">
                            <el-radio label="index">指定索引</el-radio>
                            <el-radio label="random">随机抽样</el-radio>
                          </el-radio-group>
                        </el-form-item>
                        
                        <el-form-item label="样本索引" v-if="testMode === 'index'">
                          <el-input-number 
                            v-model="sampleIndex" 
                            :min="0" 
                            :max="datasetInfo ? datasetInfo.total_samples - 1 : 240"
                            placeholder="输入样本索引"
                          />
                        </el-form-item>
                        
                        <el-form-item label="样本数量" v-if="testMode === 'random'">
                          <el-input-number v-model="randomCount" :min="1" :max="50" />
                        </el-form-item>
                        
                        <el-form-item>
                          <el-button type="primary" @click="runRealDataTest" :loading="loading">
                            {{ testMode === 'index' ? '测试指定样本' : '随机测试' }}
                          </el-button>
                        </el-form-item>
                      </el-form>
                    </el-card>
                  </el-col>
                </el-row>
                
                <!-- 指定索引模式 - 单个样本 -->
                <el-card style="margin-top: 20px;" v-if="currentSample && testMode === 'index'">
                  <template #header>当前测试样本</template>
                  <div class="sample-info">
                    <p><strong>样本索引:</strong> {{ currentSample.index }}</p>
                    <p><strong>真实标签:</strong> 
                      <el-tag :type="currentSample.true_label === 1 ? 'danger' : 'success'">
                        {{ currentSample.true_label === 1 ? '高风险' : '低风险' }} ({{ currentSample.true_label }})
                      </el-tag>
                    </p>
                    <p><strong>交易序列长度:</strong> {{ currentSample.trans_series.length }}</p>
                    <p><strong>用户信息:</strong> {{ currentSample.user_info.join(', ') }}</p>
                    
                    <el-button type="primary" @click="runSingleTest" :loading="loading">
                      执行预测
                    </el-button>
                  </div>
                </el-card>
                
                <!-- 随机模式 - 多个样本 -->
                <el-card style="margin-top: 20px;" v-if="randomSamples.length > 0 && testMode === 'random'">
                  <template #header>
                    <div class="card-header">
                      <span>随机抽取的样本 ({{ randomSamples.length }}个)</span>
                      <el-button 
                        type="primary" 
                        size="small"
                        @click="runBatchSamplesTest" 
                        :loading="batchTestingSamples"
                      >
                        测试所有样本
                      </el-button>
                    </div>
                  </template>
                  
                                     <div class="samples-list">
                     <div class="samples-info">
                       <p><strong>总计：</strong>{{ randomSamples.length }}个样本</p>
                       <p v-if="batchTestingSamples"><strong>测试进度：</strong>{{ sampleTestResults.length }}/{{ randomSamples.length }}</p>
                     </div>
                     <el-table 
                       :data="randomSamples" 
                       style="width: 100%" 
                       height="300"
                       :virtual-scrolling="randomSamples.length > 50"
                       stripe
                     >
                       <el-table-column prop="index" label="样本索引" width="80" />
                       <el-table-column label="真实标签" width="100">
                         <template #default="scope">
                           <el-tag :type="scope.row.true_label === 1 ? 'danger' : 'success'" size="small">
                             {{ scope.row.true_label === 1 ? '高风险' : '低风险' }}
                           </el-tag>
                         </template>
                       </el-table-column>
                       <el-table-column prop="trans_series.length" label="序列长度" width="80" />
                       <el-table-column label="用户信息" min-width="200">
                         <template #default="scope">
                           <span class="user-info-preview">{{ scope.row.user_info.slice(0, 3).join(', ') }}...</span>
                         </template>
                       </el-table-column>
                       <el-table-column label="测试状态" width="100">
                         <template #default="scope">
                           <template v-if="getSampleTestResult(scope.row.index)">
                             <el-tag 
                               :type="getSampleTestResult(scope.row.index).status === 'success' ? 'success' : 'danger'" 
                               size="small"
                             >
                               {{ getSampleTestResult(scope.row.index).status === 'success' ? '成功' : '失败' }}
                             </el-tag>
                           </template>
                           <template v-else-if="batchTestingSamples">
                             <el-tag type="info" size="small">测试中...</el-tag>
                           </template>
                           <template v-else>
                             <el-tag type="info" size="small">未测试</el-tag>
                           </template>
                         </template>
                       </el-table-column>
                     </el-table>
                   </div>
                </el-card>

              </div>
            </el-tab-pane>
            
            <el-tab-pane label="预设测试用例" name="preset">
              <div class="preset-test">
                <div class="test-case-grid">
                  <div 
                    v-for="(testCase, index) in testCases" 
                    :key="index" 
                    class="test-case-card"
                    :class="{ 'selected': selectedTestCase === index }"
                    @click="selectedTestCase = index"
                  >
                    <div class="card-header">
                      <h4 class="case-title">{{ testCase.name }}</h4>
                    </div>
                    
                    <div class="card-body">
                      <p class="case-description">{{ testCase.description }}</p>
                    </div>
                    
                    <div class="expected-result">
                      <span>预期：</span>
                      <el-tag 
                        :type="testCase.expectedResult === 'success' ? 'success' : 'danger'"
                        size="small"
                      >
                        {{ testCase.expectedResult === 'success' ? '成功' : '错误' }}
                      </el-tag>
                    </div>
                    
                    <div class="card-footer">
                      <el-button 
                        type="primary" 
                        size="small"
                        round
                        @click.stop="runSpecificTest(index)"
                        :loading="loading && runningTestIndex === index"
                        class="run-button"
                      >
                        <span class="play-icon">▶</span>
                        运行
                      </el-button>
                    </div>
                  </div>
                </div>
                
                <el-divider content-position="left">测试用例详情</el-divider>
                
                <div class="test-case-detail" v-if="selectedTestCase !== null">
                  <el-card shadow="never" style="background-color: #f5f7fa;">
                    <template #header>
                      <div class="case-header">
                        <span class="case-name">{{ testCases[selectedTestCase].name }}</span>
                        <el-tag 
                          :type="testCases[selectedTestCase].expectedResult === 'success' ? 'success' : 'danger'"
                          size="small"
                        >
                          预期{{ testCases[selectedTestCase].expectedResult === 'success' ? '成功' : '错误' }}
                        </el-tag>
                      </div>
                    </template>
                    <div class="case-content">
                      <h5>测试描述：</h5>
                      <p>{{ testCases[selectedTestCase].description }}</p>
                      <h5>请求数据：</h5>
                      <pre class="code-block">{{ JSON.stringify(testCases[selectedTestCase].data, null, 2) }}</pre>
                    </div>
                  </el-card>
                </div>
                
                <div v-else class="no-selection">
                  <el-empty description="请点击选择一个测试用例" />
                </div>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="自定义测试" name="custom">
                            <div class="custom-test">
                <el-form :model="customTestForm" label-width="120px">
                  
                  <!-- 交易序列部分 -->
                  <el-divider content-position="left">
                    <h4>交易序列数据</h4>
                  </el-divider>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <!-- 快速填入 -->
                      <el-form-item label="快速填入">
                        <el-button-group size="small">
                          <el-button @click="fillExampleData('normal')">正常示例</el-button>
                          <el-button @click="fillExampleData('random')">随机生成</el-button>
                          <el-button @click="clearTransSeries">清空</el-button>
                        </el-button-group>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <!-- CSV上传 -->
                      <el-form-item label="CSV上传">
                        <el-upload
                          action="#"
                          :auto-upload="false"
                          :show-file-list="false"
                          :on-change="handleTransCsvUpload"
                          accept=".csv"
                        >
                          <el-button size="small" type="primary">上传交易CSV</el-button>
                        </el-upload>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <!-- 交易数据编辑器 -->
                  <el-form-item label="数据编辑">
                    <div class="simple-editor">
                      <div class="editor-toolbar">
                        <span class="data-count">{{ parsedTransSeries.length }}条记录</span>
                        <el-button-group size="small">
                          <el-button @click="addTransRow">添加行</el-button>
                          <el-button @click="removeLastRow" :disabled="parsedTransSeries.length === 0">删除行</el-button>
                        </el-button-group>
                      </div>
                      
                      <div v-if="parsedTransSeries.length > 0" class="table-container">
                        <el-table 
                          :data="parsedTransSeries" 
                          style="width: 100%" 
                          max-height="160"
                          size="small"
                        >
                          <el-table-column label="#" width="40" type="index" />
                          <el-table-column 
                            v-for="i in 7" 
                            :key="i"
                            :label="`F${i}`" 
                            width="75"
                          >
                            <template #default="{ row, $index }">
                              <el-input
                                v-model="row[i-1]"
                                size="small"
                                style="width: 65px"
                                @input="updateTransSeries"
                              />
                            </template>
                          </el-table-column>
                          <el-table-column label="操作" width="50" fixed="right">
                            <template #default="{ $index }">
                              <el-button 
                                type="danger" 
                                size="small"
                                text
                                @click="removeTransRow($index)"
                              >
                                ×
                              </el-button>
                            </template>
                          </el-table-column>
                        </el-table>
                      </div>
                      
                      <div v-else class="simple-empty">
                        <p>暂无数据，点击"添加行"或使用"快速填入"</p>
                      </div>
                    </div>
                  </el-form-item>
                  
                  <!-- 用户信息部分 -->
                  <el-divider content-position="left">
                    <h4>用户信息数据</h4>
                  </el-divider>
                  
                  <el-row :gutter="20">
                    <el-col :span="12">
                      <!-- 特征数量控制 -->
                      <el-form-item label="特征数量">
                        <el-input-number 
                          v-model="userInfoCount" 
                          :min="1" 
                          :max="20" 
                          @change="updateUserInfoCount"
                        />
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <!-- 用户信息CSV上传 -->
                      <el-form-item label="CSV上传">
                        <el-upload
                          action="#"
                          :auto-upload="false"
                          :show-file-list="false"
                          :on-change="handleUserCsvUpload"
                          accept=".csv"
                        >
                          <el-button size="small" type="primary">上传用户CSV</el-button>
                        </el-upload>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  
                  <!-- 用户信息编辑 -->
                  <el-form-item label="用户特征">
                    <div class="user-features">
                      <el-row :gutter="10">
                        <el-col 
                          v-for="(feature, index) in customTestForm.userInfo" 
                          :key="index" 
                          :span="6"
                        >
                          <div class="feature-item">
                            <label class="feature-label">特征{{ index + 1 }}</label>
                            <el-input
                              v-model="customTestForm.userInfo[index]"
                              size="small"
                              placeholder="任意值"
                            />
                          </div>
                        </el-col>
                      </el-row>
                    </div>
                  </el-form-item>
                  
                  <!-- JSON预览部分 -->
                  <el-divider content-position="left">
                    <h4>数据预览</h4>
                  </el-divider>
                  
                  <el-form-item label="JSON数据">
                    <div class="json-preview">
                      <el-card shadow="never" style="background-color: #f8f9fa;">
                        <pre class="json-display">{{ getPreviewJson() }}</pre>
                      </el-card>
                    </div>
                  </el-form-item>
                  
                  <!-- 预期结果选择 -->
                  <el-divider content-position="left">
                    <h4>测试预期</h4>
                  </el-divider>
                  
                  <el-form-item label="预期结果">
                    <el-radio-group v-model="customTestForm.expectedResult">
                      <el-radio label="success">
                        <el-tag color="#67c23a" size="small" style="color: white;">成功</el-tag>
                        <span style="margin-left: 8px;">API调用成功，返回预测结果</span>
                      </el-radio>
                      <el-radio label="error">
                        <el-tag color="#f56c6c" size="small" style="color: white;">错误</el-tag>
                        <span style="margin-left: 8px;">API调用失败，返回错误信息</span>
                      </el-radio>
                    </el-radio-group>
                  </el-form-item>
                  
                  <!-- 运行测试 -->
                  <el-form-item>
                    <el-button type="primary" @click="runCustomTest" :loading="loading">运行测试</el-button>
                    <el-button @click="resetCustomForm">重置</el-button>
                  </el-form-item>
                </el-form>
              </div>
            </el-tab-pane>
            
            <el-tab-pane label="批量测试" name="batch">
              <div class="batch-test">
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-card class="batch-config-card">
                      <template #header>
                        <span>批量测试配置</span>
                      </template>
                      
                      <div class="config-content">
                        <!-- 数据配置区域 -->
                        <div class="config-section">
                          <h4 class="section-title">测试数据配置</h4>
                          
                          <div class="config-item">
                            <div class="config-row">
                              <label class="config-label">正常数据测试</label>
                              <el-input-number 
                                v-model="normalDataCount" 
                                :min="0" 
                                :max="50"
                                class="config-input"
                              />
                            </div>
                            <p class="config-description">使用真实数据集进行测试，预期API调用成功</p>
                          </div>
                          
                          <div class="config-item">
                            <div class="config-row">
                              <label class="config-label">异常数据测试</label>
                              <el-input-number 
                                v-model="errorDataCount" 
                                :min="0" 
                                :max="50"
                                class="config-input"
                              />
                            </div>
                            <p class="config-description">使用错误格式数据进行测试，预期API调用失败</p>
                          </div>
                        </div>
                        
                        <!-- 执行配置区域 -->
                        <div class="config-section">
                          <h4 class="section-title">执行参数</h4>
                          
                          <div class="config-item">
                            <div class="config-row">
                              <label class="config-label">并发数</label>
                              <el-input-number 
                                v-model="concurrentCount" 
                                :min="1" 
                                :max="10"
                                class="config-input"
                              />
                            </div>
                            <p class="config-description">同时执行的测试任务数量</p>
                          </div>
                        </div>
                        
                        <!-- 汇总信息 -->
                        <div class="summary-section">
                          <div class="summary-info">
                            <span class="summary-label">总测试数:</span>
                            <span class="summary-value">{{ normalDataCount + errorDataCount }} 个</span>
                          </div>
                        </div>
                        
                        <!-- 操作按钮 -->
                        <div class="action-section">
                          <el-button 
                            type="primary" 
                            size="large"
                            @click="runMixedBatchTest" 
                            :loading="batchLoading"
                            :disabled="normalDataCount + errorDataCount === 0"
                            class="primary-button"
                          >
                            {{ batchLoading ? '测试进行中...' : '开始批量测试' }}
                          </el-button>
                          
                          <div class="secondary-actions">
                            <el-button 
                              @click="stopBatchTest" 
                              :disabled="!batchLoading"
                              type="warning"
                              size="small"
                            >
                              停止测试
                            </el-button>
                            <el-button 
                              @click="clearBatchResults" 
                              :disabled="batchLoading || batchResults.length === 0"
                              size="small"
                            >
                              清空结果
                            </el-button>
                          </div>
                        </div>
                      </div>
                    </el-card>
                  </el-col>
                  
                  <el-col :span="12">
                    <el-card>
                      <template #header>实时统计</template>
                                              <div v-if="batchProgress > 0 || batchResults.length > 0">
                          <el-row :gutter="20">
                            <el-col :span="12">
                              <el-statistic title="进度" :value="completedTests" :suffix="`/ ${normalDataCount + errorDataCount}`" />
                            </el-col>
                            <el-col :span="12">
                              <el-statistic title="成功率" :value="batchSuccessRate" suffix="%" />
                            </el-col>
                          </el-row>
                        
                        <div style="margin-top: 15px;">
                          <el-progress :percentage="batchProgress" />
                        </div>
                        
                                                  <div v-if="batchResults.length > 0" style="margin-top: 15px;">
                            <el-row :gutter="20">
                              <el-col :span="6">
                                <el-statistic title="符合预期" :value="batchExpectedMatchCount" />
                              </el-col>
                              <el-col :span="6">
                                <el-statistic title="正常数据" :value="batchNormalDataCount" />
                              </el-col>
                              <el-col :span="6">
                                <el-statistic title="平均响应" :value="batchAvgResponseTime" suffix="ms" />
                              </el-col>
                              <el-col :span="6">
                                <el-statistic title="总耗时" :value="batchTotalTime" suffix="s" />
                              </el-col>
                            </el-row>
                          </div>
                      </div>
                      
                      <div v-else class="no-data">
                        <el-empty description="暂无测试数据" :image-size="80" />
                      </div>
                    </el-card>
                  </el-col>
                </el-row>
                
                <!-- 批量测试结果详情 -->
                <el-card v-if="batchResults.length > 0" style="margin-top: 20px;">
                  <template #header>
                    <div class="card-header">
                      <span>测试结果详情 ({{ batchResults.length }}条)</span>
                      <el-button type="primary" size="small" @click="showBatchSummary">
                        查看汇总
                      </el-button>
                    </div>
                  </template>
                  
                  <el-table 
                    :data="batchResults" 
                    style="width: 100%" 
                    max-height="400"
                    stripe
                  >
                    <el-table-column prop="name" label="测试名称" width="120" />
                    <el-table-column label="数据类型" width="80">
                      <template #default="scope">
                        <el-tag 
                          :type="scope.row.dataType === 'normal' ? 'success' : 'warning'"
                          size="small"
                        >
                          {{ scope.row.dataType === 'normal' ? '正常' : '异常' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="预期结果" width="80">
                      <template #default="scope">
                        <el-tag 
                          :type="scope.row.expectedResult === 'success' ? 'success' : 'danger'"
                          size="small"
                        >
                          {{ scope.row.expectedResult === 'success' ? '成功' : '错误' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="实际结果" width="80">
                      <template #default="scope">
                        <el-tag 
                          :type="scope.row.actualResult === 'success' ? 'success' : 'danger'"
                          size="small"
                        >
                          {{ scope.row.actualResult === 'success' ? '成功' : '错误' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column label="符合预期" width="80">
                      <template #default="scope">
                        <el-tag 
                          :type="scope.row.testSuccess ? 'success' : 'warning'"
                          size="small"
                        >
                          {{ scope.row.testSuccess ? '✓' : '✗' }}
                        </el-tag>
                      </template>
                    </el-table-column>
                    <el-table-column prop="responseTime" label="响应时间(ms)" width="100" />
                    <el-table-column prop="timestamp" label="测试时间" width="160" />
                    <el-table-column label="操作" width="80">
                      <template #default="scope">
                        <el-button 
                          type="text" 
                          size="small" 
                          @click="showBatchItemResult(scope.row)"
                        >
                          查看
                        </el-button>
                      </template>
                    </el-table-column>
                  </el-table>
                </el-card>
              </div>
            </el-tab-pane>
          </el-tabs>
        </el-card>
      </el-col>
      
      <el-col :span="12">
        <el-card class="box-card">
          <template #header>
            <div class="card-header">
              <span>{{ getResultTitle() }}</span>
              <div class="header-buttons">
                <!-- 返回样本列表按钮 -->
                <el-button 
                  v-if="activeTab === 'real' && testMode === 'random' && sampleTestResults.length > 0 && currentResult && !currentResult.response?.summary"
                  type="primary" 
                  size="small" 
                  @click="returnToSamplesList"
                >
                  返回样本列表
                </el-button>
                <!-- 清除结果按钮 -->
                <el-button 
                  type="danger" 
                  size="small" 
                  @click="getClearAction()"
                >
                  清除结果
                </el-button>
              </div>
            </div>
          </template>
          
          <!-- 随机抽样测试结果详情 -->
          <div v-if="activeTab === 'real' && testMode === 'random' && sampleTestResults.length > 0 && (!currentResult || (currentResult.response && currentResult.response.summary))" class="sample-results-container">
            <!-- 汇总统计信息 -->
            <div v-if="currentResult && currentResult.response && currentResult.response.summary" class="summary-stats">
              <h4>批量测试汇总:</h4>
              <el-row :gutter="20">
                <el-col :span="6">
                  <el-statistic title="总样本数" :value="currentResult.response.summary.total" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="成功测试" :value="currentResult.response.summary.success" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="预测准确率" :value="(currentResult.response.summary.accuracy * 100).toFixed(1)" suffix="%" />
                </el-col>
                <el-col :span="6">
                  <el-statistic title="平均响应时间" :value="currentResult.response.summary.avg_response_time" suffix="ms" />
                </el-col>
              </el-row>
            </div>
            
                         <!-- 详细测试结果表格 -->
             <div class="sample-results" style="margin-top: 20px;">
               <h4>详细测试结果:</h4>
               <el-table 
                 :data="sampleTestResults" 
                 style="width: 100%" 
                 height="400"
                 :virtual-scrolling="sampleTestResults.length > 100"
                 stripe
                 border
               >
                 <el-table-column prop="index" label="样本" width="60" />
                 <el-table-column label="真实标签" width="80">
                   <template #default="scope">
                     <el-tag :type="scope.row.true_label === 1 ? 'danger' : 'success'" size="small">
                       {{ scope.row.true_label }}
                     </el-tag>
                   </template>
                 </el-table-column>
                 <el-table-column label="预测结果" width="80">
                   <template #default="scope">
                     <el-tag 
                       v-if="scope.row.response && scope.row.response.prediction !== undefined"
                       :type="scope.row.response.prediction === 1 ? 'danger' : 'success'" 
                       size="small"
                     >
                       {{ scope.row.response.prediction }}
                     </el-tag>
                     <el-tag v-else type="info" size="small">-</el-tag>
                   </template>
                 </el-table-column>
                 <el-table-column label="准确性" width="80">
                   <template #default="scope">
                     <el-tag 
                       :type="scope.row.accuracy === 1 ? 'success' : 'warning'" 
                       size="small"
                     >
                       {{ scope.row.accuracy === 1 ? '✓' : '✗' }}
                     </el-tag>
                   </template>
                 </el-table-column>
                 <el-table-column prop="responseTime" label="响应时间(ms)" width="100" />
                 <el-table-column label="状态" width="80">
                   <template #default="scope">
                     <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                       {{ scope.row.status === 'success' ? '成功' : '失败' }}
                     </el-tag>
                   </template>
                 </el-table-column>
                 <el-table-column label="操作" width="80">
                   <template #default="scope">
                     <el-button 
                       type="text" 
                       size="small" 
                       @click="showSampleResult(scope.row)"
                     >
                       查看
                     </el-button>
                   </template>
                 </el-table-column>
               </el-table>
             </div>
          </div>
          
          <!-- 普通测试结果 -->
          <div v-else-if="currentResult" class="result-container">
            <div class="result-header">
              <template v-if="currentResult.testType === 'preset' || currentResult.testType === 'custom'">
                <el-tag :type="currentResult.testSuccess ? 'success' : 'danger'">
                  {{ currentResult.testSuccess ? '符合预期' : '不符合预期' }}
                </el-tag>
              </template>
              <template v-else>
                <el-tag :type="currentResult.status === 'success' ? 'success' : 'danger'">
                  {{ currentResult.status === 'success' ? '成功' : '失败' }}
                </el-tag>
              </template>
              <span class="result-time">响应时间: {{ currentResult.responseTime }} ms</span>
            </div>
            
            <div class="result-body">
              <h4>响应数据:</h4>
              <pre>{{ JSON.stringify(currentResult.response, null, 2) }}</pre>
              
              <!-- 预设测试和自定义测试结果 -->
              <template v-if="currentResult.testType === 'preset' || currentResult.testType === 'custom'">
                <h4>测试验证结果:</h4>
                <el-row :gutter="20">
                  <el-col :span="8">
                    <el-alert
                      title="期望结果"
                      :type="currentResult.expectedResult === 'success' ? 'success' : 'error'"
                      :description="currentResult.expectedResult === 'success' ? '成功' : '错误'"
                      show-icon
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-alert
                      title="实际结果"
                      :type="currentResult.actualResult === 'success' ? 'success' : 'error'"
                      :description="currentResult.actualResult === 'success' ? '成功' : '错误'"
                      show-icon
                    />
                  </el-col>
                  <el-col :span="8">
                    <el-alert
                      :title="currentResult.testSuccess ? '测试通过' : '测试失败'"
                      :type="currentResult.testSuccess ? 'success' : 'warning'"
                      :description="currentResult.testSuccess ? '✓ 符合预期' : '✗ 不符合预期'"
                      show-icon
                    />
                  </el-col>
                </el-row>
              </template>
              
              <template v-if="currentResult.status === 'success' && currentResult.response && currentResult.response.prediction !== undefined">
                <h4>风险评估结果:</h4>
                <el-row :gutter="20">
                  <el-col :span="12">
                    <el-alert
                      title="预测结果"
                      :type="currentResult.response.prediction === 1 ? 'error' : 'success'"
                      :description="`${currentResult.response.prediction === 1 ? '高风险' : '低风险'} (${currentResult.response.prediction})`"
                      show-icon
                    />
                  </el-col>
                  <el-col :span="12" v-if="currentResult.true_label !== undefined">
                    <el-alert
                      title="真实标签"
                      :type="currentResult.true_label === 1 ? 'error' : 'success'"
                      :description="`${currentResult.true_label === 1 ? '高风险' : '低风险'} (${currentResult.true_label})`"
                      show-icon
                    />
                  </el-col>
                </el-row>
                
                <div v-if="currentResult.true_label !== undefined" class="prediction-comparison" style="margin-top: 15px;">
                  <el-alert
                    :title="currentResult.response.prediction === currentResult.true_label ? '预测正确' : '预测错误'"
                    :type="currentResult.response.prediction === currentResult.true_label ? 'success' : 'warning'"
                    :description="`准确性: ${currentResult.response.prediction === currentResult.true_label ? '✓ 正确' : '✗ 错误'}`"
                    show-icon
                  />
                </div>
              </template>
              

            </div>
          </div>
          
          <div v-else class="no-result">
            <el-empty :description="activeTab === 'real' && testMode === 'random' ? '暂无样本测试结果' : '暂无测试结果'" />
          </div>
        </el-card>
        
        <el-card class="box-card" style="margin-top: 20px;">
          <template #header>
            <div class="card-header">
              <span>测试历史</span>
            </div>
          </template>
          
          <el-table :data="testHistory" style="width: 100%" height="250">
            <el-table-column prop="timestamp" label="时间" width="160" />
            <el-table-column prop="name" label="测试名称" width="130" />
            <el-table-column prop="responseTime" label="响应时间(ms)" width="90" />
            <el-table-column label="准确性" width="70">
              <template #default="scope">
                <template v-if="scope.row.testType === 'preset'">
                  <span class="text-muted">-</span>
                </template>
                <template v-else-if="scope.row.accuracy !== undefined">
                  <el-tag :type="scope.row.accuracy === 1 ? 'success' : 'warning'" size="small">
                    {{ scope.row.accuracy === 1 ? '✓' : '✗' }}
                  </el-tag>
                </template>
                <template v-else-if="scope.row.response && scope.row.response.summary">
                  <el-tag type="info" size="small">
                    {{ (scope.row.response.summary.accuracy * 100).toFixed(1) }}%
                  </el-tag>
                </template>
                <template v-else>
                  <span class="text-muted">-</span>
                </template>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90">
              <template #default="scope">
                <template v-if="scope.row.testType === 'preset' || scope.row.testType === 'custom' || scope.row.testType === 'batch'">
                  <el-tag :type="scope.row.testSuccess ? 'success' : 'danger'" size="small">
                    {{ scope.row.testSuccess ? '符合预期' : '不符预期' }}
                  </el-tag>
                </template>
                <template v-else>
                  <el-tag :type="scope.row.status === 'success' ? 'success' : 'danger'" size="small">
                    {{ scope.row.status === 'success' ? '成功' : '失败' }}
                  </el-tag>
                </template>
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
    
    <!-- 身份风险评估专属仪表盘 -->
    <div class="identity-dashboard" v-if="testHistory.length > 0">
      <div class="dashboard-header">
        <div class="dashboard-title">
          <el-icon class="dashboard-icon"><DataAnalysis /></el-icon>
          <h3>身份风险评估测试仪表盘</h3>
        </div>
        <el-button type="primary" size="small" @click="refreshDashboard" class="refresh-btn">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </div>
      
      <el-row :gutter="20">
        <!-- 测试成功率环状图 -->
        <el-col :span="8">
          <el-card class="dashboard-card donut-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><DataAnalysis /></el-icon>
                <span>测试成功率</span>
              </div>
            </template>
            <div class="donut-content">
              <div class="donut-chart">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f0f0f0"
                    stroke-width="20"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    :stroke="getTestSuccessRateColor(identityStats.testSuccessRate)"
                    stroke-width="20"
                    stroke-linecap="round"
                    :stroke-dasharray="getTestSuccessRateStrokeDasharray(identityStats.testSuccessRate)"
                    :stroke-dashoffset="getTestSuccessRateStrokeDashoffset(identityStats.testSuccessRate)"
                    transform="rotate(-90 80 80)"
                    class="progress-circle"
                  />
                  <text x="80" y="75" text-anchor="middle" class="donut-percentage">
                    {{ identityStats.testSuccessRate }}%
                  </text>
                  <text x="80" y="95" text-anchor="middle" class="donut-label">
                    符合预期
                  </text>
                </svg>
              </div>
              <div class="donut-legend">
                <div class="legend-item">
                  <div class="legend-color expected"></div>
                  <span>符合预期: {{ identityStats.expectedTests }}</span>
                </div>
                <div class="legend-item">
                  <div class="legend-color unexpected"></div>
                  <span>不符预期: {{ identityStats.unexpectedTests }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 测试类型分布环状图 -->
        <el-col :span="8">
          <el-card class="dashboard-card type-donut-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><DataBoard /></el-icon>
                <span>类型分布</span>
              </div>
            </template>
            <div class="type-donut-content">
              <div class="type-donut-chart">
                <svg width="160" height="160" viewBox="0 0 160 160">
                  <!-- 背景圆环 -->
                  <circle
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    stroke="#f0f0f0"
                    stroke-width="20"
                  />
                  <!-- 动态生成的分段圆环 -->
                  <circle
                    v-for="(segment, index) in typeDistributionSegments"
                    :key="index"
                    cx="80"
                    cy="80"
                    r="60"
                    fill="none"
                    :stroke="segment.color"
                    stroke-width="20"
                    stroke-linecap="round"
                    :stroke-dasharray="segment.dasharray"
                    :stroke-dashoffset="segment.dashoffset"
                    transform="rotate(-90 80 80)"
                    class="type-segment"
                  />
                  <text x="80" y="75" text-anchor="middle" class="donut-total">
                    {{ identityStats.totalTests }}
                  </text>
                  <text x="80" y="95" text-anchor="middle" class="donut-label">
                    总测试
                  </text>
                </svg>
              </div>
              <div class="type-legend">
                <div 
                  v-for="item in identityStats.testTypeDistribution" 
                  :key="item.type"
                  class="type-legend-item"
                >
                  <div class="type-legend-color" :class="item.type"></div>
                  <span class="type-legend-text">{{ item.label }}: {{ item.count }}</span>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
        
        <!-- 性能指标卡片 -->
        <el-col :span="8">
          <el-card class="dashboard-card performance-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Timer /></el-icon>
                <span>性能指标</span>
              </div>
            </template>
            <div class="performance-content">
              <div class="perf-item">
                <div class="perf-label">平均响应时间</div>
                <div class="perf-value">{{ identityStats.avgResponseTime }} ms</div>
                <div class="perf-indicator" :class="getResponseTimeClass(identityStats.avgResponseTime)"></div>
              </div>
              <div class="perf-item">
                <div class="perf-label">最快响应</div>
                <div class="perf-value fast">{{ identityStats.minResponseTime }} ms</div>
              </div>
              <div class="perf-item">
                <div class="perf-label">最慢响应</div>
                <div class="perf-value slow">{{ identityStats.maxResponseTime }} ms</div>
              </div>
              <div class="perf-item">
                <div class="perf-label">预测准确率</div>
                <div class="perf-value accuracy">{{ identityStats.predictionAccuracy }}%</div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      

    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import { Play } from '@element-plus/icons-vue'
import { identityTest, getTestData, getTestDataInfo } from '@/utils/api'
import { generateIdentityTestCases, generateRandomTestData } from '@/utils/testCases'
import { DataAnalysis, Refresh, Timer, DataBoard } from '@element-plus/icons-vue'

export default {
  name: 'IdentityTest',
  components: {
    Play,
    DataAnalysis,
    Refresh,
    Timer,
    DataBoard
  },
  setup() {
    const store = useStore()
    const activeTab = ref('real')
    const selectedTestCase = ref(null)
    const testCases = ref([])
    const loading = ref(false)
    const currentResult = ref(null)
    const batchLoading = ref(false)
    const normalDataCount = ref(5)
    const errorDataCount = ref(5)
    const concurrentCount = ref(3)
    const batchProgress = ref(0)
    const completedTests = ref(0)
    let batchTestRunning = false
    
    // 真实数据测试相关状态
    const datasetInfo = ref(null)
    const loadingDatasetInfo = ref(false)
    const testMode = ref('index')
    const sampleIndex = ref(0)
    const randomCount = ref(3)
    const currentSample = ref(null)
    const randomSamples = ref([])
    const sampleTestResults = ref([])
    const batchTestingSamples = ref(false)
    const runningTestIndex = ref(null)
    
    const customTestForm = ref({
      transSeriesInput: '',
      csvData: null,
      userInfo: ['30', '1', '60000'],
      expectedResult: 'success'
    })
    
    // 解析后的交易序列数据
    const parsedTransSeries = ref([])
    
    // 用户信息特征数量
    const userInfoCount = ref(3)
    
    // 批量测试相关状态
    const batchResults = ref([])
    const batchStartTime = ref(null)
    
    // 获取测试历史
    const testHistory = computed(() => {
      return store.getters.getTestResults('identity')
    })
    
    // 批量测试统计计算属性
    const batchSuccessRate = computed(() => {
      if (batchResults.value.length === 0) return 0
      const successCount = batchResults.value.filter(r => r.actualResult === 'success').length
      return ((successCount / batchResults.value.length) * 100).toFixed(1)
    })
    
    const batchExpectedMatchCount = computed(() => {
      return batchResults.value.filter(r => r.testSuccess).length
    })
    
    const batchAvgResponseTime = computed(() => {
      if (batchResults.value.length === 0) return 0
      const total = batchResults.value.reduce((sum, r) => sum + r.responseTime, 0)
      return Math.round(total / batchResults.value.length)
    })
    
    const batchTotalTime = computed(() => {
      if (!batchStartTime.value || batchResults.value.length === 0) return 0
      const lastResult = batchResults.value[batchResults.value.length - 1]
      if (!lastResult.endTime) return 0
      return ((lastResult.endTime - batchStartTime.value) / 1000).toFixed(1)
    })
    
    const batchNormalDataCount = computed(() => {
      return batchResults.value.filter(r => r.dataType === 'normal').length
    })
    
    // 身份风险评估统计数据
    const identityStats = computed(() => {
      const tests = testHistory.value
      if (tests.length === 0) {
        return {
          totalTests: 0,
          successTests: 0,
          failedTests: 0,
          successRate: 0,
          avgResponseTime: 0,
          minResponseTime: 0,
          maxResponseTime: 0,
          predictionAccuracy: 0,
          testTypeDistribution: []
        }
      }
      
      const successTests = tests.filter(t => t.status === 'success').length
      const failedTests = tests.length - successTests
      const successRate = Math.round((successTests / tests.length) * 100)
      
      // 测试成功率统计（符合预期的测试）
      const expectedTests = tests.filter(t => {
        // 对于有testSuccess字段的测试（预设、自定义、批量测试）
        if (t.testSuccess !== undefined) {
          return t.testSuccess
        }
        // 对于真实数据测试，API调用成功即为符合预期
        return t.status === 'success'
      }).length
      const unexpectedTests = tests.length - expectedTests
      const testSuccessRate = Math.round((expectedTests / tests.length) * 100)
      
      // 响应时间统计
      const responseTimes = tests.map(t => t.responseTime)
      const avgResponseTime = Math.round(responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length)
      const minResponseTime = Math.min(...responseTimes)
      const maxResponseTime = Math.max(...responseTimes)
      
      // 预测准确率（只计算有真实标签的测试）
      const testsWithLabels = tests.filter(t => t.true_label !== undefined && t.response?.prediction !== undefined)
      const correctPredictions = testsWithLabels.filter(t => t.response.prediction === t.true_label).length
      const predictionAccuracy = testsWithLabels.length > 0 ? Math.round((correctPredictions / testsWithLabels.length) * 100) : 0
      
      // 测试类型分布
      const typeStats = {
        real: tests.filter(t => t.name.includes('样本') || t.name.includes('真实')).length,
        preset: tests.filter(t => t.testType === 'preset').length,
        custom: tests.filter(t => t.testType === 'custom').length,
        batch: tests.filter(t => t.testType === 'batch' || t.name.includes('批量')).length
      }
      
      const testTypeDistribution = [
        { type: 'real', label: '真实数据', count: typeStats.real, percentage: Math.round((typeStats.real / tests.length) * 100) },
        { type: 'preset', label: '预设用例', count: typeStats.preset, percentage: Math.round((typeStats.preset / tests.length) * 100) },
        { type: 'custom', label: '自定义测试', count: typeStats.custom, percentage: Math.round((typeStats.custom / tests.length) * 100) },
        { type: 'batch', label: '批量测试', count: typeStats.batch, percentage: Math.round((typeStats.batch / tests.length) * 100) }
      ].filter(item => item.count > 0)
      
      return {
        totalTests: tests.length,
        successTests,
        failedTests,
        successRate,
        expectedTests,
        unexpectedTests,
        testSuccessRate,
        avgResponseTime,
        minResponseTime,
        maxResponseTime,
        predictionAccuracy,
        testTypeDistribution
      }
    })
    

    
    // 初始化测试用例
    onMounted(() => {
      testCases.value = generateIdentityTestCases()
      if (testCases.value.length > 0) {
        selectedTestCase.value = 0
      }
      // 自动加载数据集信息
      loadDatasetInfo()
      
      // 处理ResizeObserver错误
      const resizeObserverErrorHandler = (e) => {
        if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
          e.stopImmediatePropagation()
          return false
        }
      }
      window.addEventListener('error', resizeObserverErrorHandler)
      
      // 清理事件监听器
      return () => {
        window.removeEventListener('error', resizeObserverErrorHandler)
      }
    })
    
    // 监听测试模式变化，清空相关数据
    watch(testMode, (newMode, oldMode) => {
      if (newMode !== oldMode) {
        // 清空样本数据和测试结果
        if (newMode === 'index') {
          randomSamples.value = []
          sampleTestResults.value = []
        } else if (newMode === 'random') {
          currentSample.value = null
        }
      }
    })
    
    // 监听activeTab变化，切换到其他标签时清空样本测试结果
    watch(activeTab, (newTab, oldTab) => {
      if (newTab !== 'real' && oldTab === 'real') {
        // 离开真实数据测试tab时清空相关数据
        sampleTestResults.value = []
      }
    })
    
    // 加载数据集信息
    const loadDatasetInfo = async () => {
      loadingDatasetInfo.value = true
      try {
        const info = await getTestDataInfo()
        datasetInfo.value = info
      } catch (error) {
        console.error('加载数据集信息失败:', error)
      } finally {
        loadingDatasetInfo.value = false
      }
    }
    
    // 运行真实数据测试
    const runRealDataTest = async () => {
      try {
        let params = {}
        
        if (testMode.value === 'index') {
          params.index = sampleIndex.value
        } else if (testMode.value === 'random') {
          params.random = true
          params.count = randomCount.value
        }
        
        const response = await getTestData(params)
        
        if (testMode.value === 'index') {
          currentSample.value = response
          // 切换到指定索引模式时清空随机样本相关数据
          randomSamples.value = []
          sampleTestResults.value = []
        } else {
          // 随机模式，保存所有抽中的样本
          if (response.samples && response.samples.length > 0) {
            randomSamples.value = response.samples
            currentSample.value = null
            sampleTestResults.value = [] // 清空之前的测试结果
          }
        }
      } catch (error) {
        console.error('获取测试数据失败:', error)
        currentSample.value = null
        randomSamples.value = []
        sampleTestResults.value = []
      }
    }
    
    // 运行单个样本测试
    const runSingleTest = async () => {
      if (!currentSample.value) return
      
      const testData = {
        trans_series: currentSample.value.trans_series,
        user_info: currentSample.value.user_info
      }
      
      // 运行测试并添加真实标签信息
      await runTestWithTrueLabel(testData, currentSample.value.true_label, `样本 #${currentSample.value.index}`)
    }
    
    // 批量测试随机样本
    const runBatchSamplesTest = async () => {
      if (!randomSamples.value || randomSamples.value.length === 0) return
      
      batchTestingSamples.value = true
      sampleTestResults.value = []
      
      try {
        // 并行测试所有样本
        const testPromises = randomSamples.value.map(async (sample, index) => {
          const testData = {
            trans_series: sample.trans_series,
            user_info: sample.user_info
          }
          
          const startTime = Date.now()
          
          try {
            const response = await identityTest(testData)
            const endTime = Date.now()
            
            const result = {
              index: sample.index,
              timestamp: new Date().toLocaleString(),
              name: `样本 #${sample.index}`,
              request: testData,
              response,
              responseTime: endTime - startTime,
              status: 'success',
              true_label: sample.true_label,
              accuracy: response.prediction === sample.true_label ? 1 : 0
            }
            
            // 同时添加到历史记录
            store.dispatch('addTestResult', { type: 'identity', result })
            
            return result
          } catch (error) {
            const endTime = Date.now()
            const result = {
              index: sample.index,
              timestamp: new Date().toLocaleString(),
              name: `样本 #${sample.index}`,
              request: testData,
              response: { 
                error: error.error || error.message || '未知错误',
                errorCode: error.errorCode,
                originalError: error.originalError
              },
              responseTime: endTime - startTime,
              status: 'failed',
              true_label: sample.true_label,
              accuracy: 0
            }
            
            store.dispatch('addTestResult', { type: 'identity', result })
            return result
          }
        })
        
        // 等待所有测试完成
        const results = await Promise.all(testPromises)
        sampleTestResults.value = results
        
        // 设置当前结果为汇总结果
        const successCount = results.filter(r => r.status === 'success').length
        const totalCount = results.length
        const correctCount = results.filter(r => r.accuracy === 1).length
        const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / totalCount
        
        currentResult.value = {
          timestamp: new Date().toLocaleString(),
          name: `批量测试汇总 (${totalCount}个样本)`,
          response: {
            summary: {
              total: totalCount,
              success: successCount,
              failed: totalCount - successCount,
              accuracy: correctCount / totalCount,
              avg_response_time: avgResponseTime.toFixed(2)
            }
          },
          responseTime: avgResponseTime,
          status: 'success'
        }
        
      } catch (error) {
        console.error('批量测试失败:', error)
      } finally {
        batchTestingSamples.value = false
      }
    }
    

    
    // 运行带有真实标签的测试（用于真实数据）
    const runTestWithTrueLabel = async (testData, trueLabel, testName) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 调用API
        const response = await identityTest(testData)
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testName || '真实数据测试',
          request: testData,
          response,
          responseTime,
          status: 'success',
          true_label: trueLabel, // 添加真实标签
          accuracy: response.prediction === trueLabel ? 1 : 0 // 添加准确性
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
          name: testName || '真实数据测试',
          request: testData,
          response: { 
            error: error.error || error.message || '未知错误',
            errorCode: error.errorCode,
            originalError: error.originalError
          },
          responseTime: endTime - startTime,
          status: 'failed',
          true_label: trueLabel
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'identity', result })
      } finally {
        loading.value = false
      }
    }
    
    // 运行单个测试
    const runTest = async (testData) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 调用API
        const response = await identityTest(testData)
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: activeTab.value === 'preset' ? testCases.value[selectedTestCase.value].name : '自定义测试',
          request: testData,
          response,
          responseTime,
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
          response: { 
            error: error.error || error.message || '未知错误',
            errorCode: error.errorCode,
            originalError: error.originalError
          },
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
    
    // 运行带预期结果验证的测试
    const runTestWithExpectation = async (testData, expectedResult, testName) => {
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 调用API
        const response = await identityTest(testData)
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 判断测试是否符合期望
        const actualResult = 'success' // API调用成功
        const testSuccess = actualResult === expectedResult
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testName,
          request: testData,
          response,
          responseTime,
          status: 'success',
          expectedResult: expectedResult,
          actualResult: actualResult,
          testSuccess: testSuccess,
          testType: 'custom'
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'identity', result })
      } catch (error) {
        console.error('测试失败:', error)
        
        // API调用失败
        const endTime = Date.now()
        const actualResult = 'error'
        const testSuccess = actualResult === expectedResult
        
        // 生成错误结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testName,
          request: testData,
          response: { 
            error: error.error || error.message || '未知错误',
            errorCode: error.errorCode,
            originalError: error.originalError
          },
          responseTime: endTime - startTime,
          status: 'failed',
          expectedResult: expectedResult,
          actualResult: actualResult,
          testSuccess: testSuccess,
          testType: 'custom'
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
        
        // 优先使用解析后的数据
        if (parsedTransSeries.value && parsedTransSeries.value.length > 0) {
          transSeries = parsedTransSeries.value.map(row => {
            return row.map(val => {
              if (val === '' || val === null || val === undefined) {
                return null
              }
              const num = Number(val)
              return isNaN(num) ? val : num
            })
          })
        }
        
        if (!transSeries || transSeries.length === 0) {
          throw new Error('交易序列数据为空，请添加数据或使用快速填入功能')
        }
        
        // 处理用户信息
        const processedUserInfo = customTestForm.value.userInfo.map(val => {
          if (val === '' || val === null || val === undefined) {
            return null
          }
          const num = Number(val)
          return isNaN(num) ? val : num
        })
        
        const testData = {
          trans_series: transSeries,
          user_info: processedUserInfo
        }
        
        // 运行自定义测试，包含预期结果验证
        runTestWithExpectation(testData, customTestForm.value.expectedResult, '自定义测试')
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
    
    // 快速填入示例数据
    const fillExampleData = (type) => {
      let data = []
      switch (type) {
        case 'normal':
          data = [
            [1.0, 2.0, 3.0, 4.0, 5.0, 6.0, 7.0],
            [1.1, 2.1, 3.1, 4.1, 5.1, 6.1, 7.1],
            [1.2, 2.2, 3.2, 4.2, 5.2, 6.2, 7.2]
          ]
          break
        case 'large':
          data = [
            [100.5, 200.8, 300.2, 400.1, 500.9, 600.3, 700.7],
            [150.2, 250.6, 350.4, 450.8, 550.1, 650.5, 750.9]
          ]
          break
        case 'random':
          const rowCount = Math.floor(Math.random() * 5) + 2 // 2-6行
          for (let i = 0; i < rowCount; i++) {
            const row = []
            for (let j = 0; j < 7; j++) {
              row.push(Number((Math.random() * 1000).toFixed(2)))
            }
            data.push(row)
          }
          break
      }
      parsedTransSeries.value = data
      updateTransSeriesInput()
    }
    
    // 清空交易序列
    const clearTransSeries = () => {
      parsedTransSeries.value = []
      customTestForm.value.transSeriesInput = ''
    }
    
    // 添加交易行
    const addTransRow = () => {
      parsedTransSeries.value.push([0, 0, 0, 0, 0, 0, 0])
      updateTransSeriesInput()
    }
    
    // 删除最后一行
    const removeLastRow = () => {
      if (parsedTransSeries.value.length > 0) {
        parsedTransSeries.value.pop()
        updateTransSeriesInput()
      }
    }
    
    // 删除指定行
    const removeTransRow = (index) => {
      parsedTransSeries.value.splice(index, 1)
      updateTransSeriesInput()
    }
    
    // 更新交易序列输入框
    const updateTransSeries = () => {
      updateTransSeriesInput()
    }
    
    // 同步到输入框
    const updateTransSeriesInput = () => {
      customTestForm.value.transSeriesInput = JSON.stringify(parsedTransSeries.value, null, 2)
    }
    
    // 从输入框解析
    const parseTransSeriesFromInput = () => {
      try {
        if (customTestForm.value.transSeriesInput.trim()) {
          const parsed = JSON.parse(customTestForm.value.transSeriesInput)
          if (Array.isArray(parsed)) {
            parsedTransSeries.value = parsed
          }
        }
      } catch (error) {
        // 静默处理解析错误
      }
    }
    
    // 更新用户信息特征数量
    const updateUserInfoCount = () => {
      const current = customTestForm.value.userInfo.length
      const target = userInfoCount.value
      
      if (target > current) {
        // 增加特征，用空字符串填充
        for (let i = current; i < target; i++) {
          customTestForm.value.userInfo.push('')
        }
      } else if (target < current) {
        // 减少特征，截取数组
        customTestForm.value.userInfo = customTestForm.value.userInfo.slice(0, target)
      }
    }
    
    // 处理交易CSV上传
    const handleTransCsvUpload = async (file) => {
      try {
        const csvData = await parseCsvFile(file.raw)
        parsedTransSeries.value = csvData
        updateTransSeriesInput()
      } catch (error) {
        console.error('解析交易CSV失败:', error)
      }
    }
    
    // 处理用户信息CSV上传
    const handleUserCsvUpload = async (file) => {
      try {
        const csvData = await parseCsvFile(file.raw)
        if (csvData.length > 0) {
          // 取第一行作为用户信息
          const userInfoRow = csvData[0]
          customTestForm.value.userInfo = userInfoRow.map(String) // 转换为字符串
          userInfoCount.value = userInfoRow.length
        }
      } catch (error) {
        console.error('解析用户信息CSV失败:', error)
      }
    }
    
    // CSV文件解析通用方法
    const parseCsvFile = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          try {
            const text = e.target.result
            const lines = text.split('\n').filter(line => line.trim())
            const data = lines.map(line => {
              return line.split(',').map(val => {
                const trimmed = val.trim()
                // 尝试转换为数字，如果失败则保持字符串
                const num = Number(trimmed)
                return isNaN(num) ? trimmed : num
              })
            })
            resolve(data)
          } catch (error) {
            reject(error)
          }
        }
        reader.onerror = reject
        reader.readAsText(file)
      })
    }
    
    // 获取预览JSON
    const getPreviewJson = () => {
      const processUserInfo = () => {
        return customTestForm.value.userInfo.map(val => {
          if (val === '' || val === null || val === undefined) {
            return null
          }
          const num = Number(val)
          return isNaN(num) ? val : num
        })
      }
      
      const processTransSeries = () => {
        return parsedTransSeries.value.map(row => {
          return row.map(val => {
            if (val === '' || val === null || val === undefined) {
              return null
            }
            const num = Number(val)
            return isNaN(num) ? val : num
          })
        })
      }
      
      return JSON.stringify({
        trans_series: processTransSeries(),
        user_info: processUserInfo()
      }, null, 2)
    }
    


    // 重置自定义表单
    const resetCustomForm = () => {
      customTestForm.value = {
        transSeriesInput: '',
        csvData: null,
        userInfo: ['30', '1', '60000'],
        expectedResult: 'success'
      }
      parsedTransSeries.value = []
      userInfoCount.value = 3
    }
    
    // 生成异常数据（会导致API失败的数据）
    const generateErrorTestData = () => {
      const errorTypes = [
        // 缺少必要字段
        { trans_series: [[1, 2, 3]] }, // 缺少user_info
        { user_info: [25, 1, 50000] }, // 缺少trans_series
        
        // 错误的数据类型
        { trans_series: "invalid", user_info: [25, 1, 50000] },
        { trans_series: [[1, 2, 3]], user_info: "invalid" },
        
        // 空数据
        { trans_series: [], user_info: [] },
        { trans_series: null, user_info: null },
        
        // 错误的数组结构
        { trans_series: [1, 2, 3], user_info: [25, 1, 50000] }, // trans_series应该是二维数组
        { trans_series: [[1, 2]], user_info: [25, 1, 50000] }, // 特征数量不对
        
        // 超出范围的数据
        { trans_series: [[Number.MAX_VALUE, -Number.MAX_VALUE, 0, 0, 0, 0, 0]], user_info: [25, 1, 50000] },
        
        // 包含非法值
        { trans_series: [[NaN, Infinity, -Infinity, 0, 0, 0, 0]], user_info: [25, 1, 50000] }
      ]
      
      return errorTypes[Math.floor(Math.random() * errorTypes.length)]
    }

    // 运行混合批量测试
    const runMixedBatchTest = async () => {
      batchLoading.value = true
      batchTestRunning = true
      batchProgress.value = 0
      completedTests.value = 0
      batchResults.value = []
      batchStartTime.value = Date.now()
      
      const totalTests = normalDataCount.value + errorDataCount.value
      
      // 生成所有测试任务
      const allTasks = []
      let taskIndex = 1
      
      // 添加正常数据测试任务
      for (let i = 0; i < normalDataCount.value; i++) {
        try {
          // 获取随机真实数据样本
          const realDataResponse = await getTestData({ random: true, count: 1 })
          if (realDataResponse.samples && realDataResponse.samples.length > 0) {
            const sample = realDataResponse.samples[0]
            allTasks.push({
              index: taskIndex++,
              dataType: 'normal',
              expectedResult: 'success',
              data: {
                trans_series: sample.trans_series,
                user_info: sample.user_info
              },
              sampleInfo: sample
            })
          }
        } catch (error) {
          console.error('获取真实数据失败:', error)
          // 如果获取真实数据失败，用随机数据替代
          allTasks.push({
            index: taskIndex++,
            dataType: 'normal-fallback',
            expectedResult: 'success',
            data: generateRandomTestData('identity')
          })
        }
      }
      
      // 添加异常数据测试任务
      for (let i = 0; i < errorDataCount.value; i++) {
        allTasks.push({
          index: taskIndex++,
          dataType: 'error',
          expectedResult: 'error',
          data: generateErrorTestData()
        })
      }
      
      // 打乱任务顺序
      allTasks.sort(() => Math.random() - 0.5)
      
      // 按并发数分批执行
      let currentIndex = 0
      
      while (currentIndex < allTasks.length && batchTestRunning) {
        const currentBatch = allTasks.slice(currentIndex, currentIndex + concurrentCount.value)
        
        const promises = currentBatch.map(async (task) => {
          const startTime = Date.now()
          
          try {
            const response = await identityTest(task.data)
            const endTime = Date.now()
            
            // 判断测试是否符合期望
            const actualResult = 'success'
            const testSuccess = actualResult === task.expectedResult
            
            const result = {
              timestamp: new Date().toLocaleString(),
              name: `${task.dataType === 'normal' || task.dataType === 'normal-fallback' ? '正常数据' : '异常数据'} #${task.index}`,
              request: task.data,
              response,
              responseTime: endTime - startTime,
              status: 'success',
              expectedResult: task.expectedResult,
              actualResult: actualResult,
              testSuccess: testSuccess,
              testType: 'batch',
              dataType: task.dataType === 'normal-fallback' ? 'normal' : task.dataType,
              endTime: endTime,
              sampleInfo: task.sampleInfo
            }
            
            return result
          } catch (error) {
            const endTime = Date.now()
            
            // API调用失败
            const actualResult = 'error'
            const testSuccess = actualResult === task.expectedResult
            
            const result = {
              timestamp: new Date().toLocaleString(),
              name: `${task.dataType === 'normal' || task.dataType === 'normal-fallback' ? '正常数据' : '异常数据'} #${task.index}`,
              request: task.data,
              response: { 
                error: error.error || error.message || '未知错误',
                errorCode: error.errorCode,
                originalError: error.originalError
              },
              responseTime: endTime - startTime,
              status: 'failed',
              expectedResult: task.expectedResult,
              actualResult: actualResult,
              testSuccess: testSuccess,
              testType: 'batch',
              dataType: task.dataType === 'normal-fallback' ? 'normal' : task.dataType,
              endTime: endTime,
              sampleInfo: task.sampleInfo
            }
            
            return result
          }
        })
        
        try {
          const batchTaskResults = await Promise.all(promises)
          
          // 更新结果（按顺序添加）
          batchTaskResults.forEach(result => {
            batchResults.value.push(result)
            store.dispatch('addTestResult', { type: 'identity', result })
            
            // 更新进度
            completedTests.value = batchResults.value.length
            batchProgress.value = (completedTests.value / totalTests) * 100
          })
          
        } catch (error) {
          console.error('批量测试批次执行失败:', error)
        }
        
        currentIndex += concurrentCount.value
      }
      
      try {
        // 测试完成后，显示汇总结果
        if (batchResults.value.length > 0) {
          showBatchSummary()
        }
      } finally {
        batchLoading.value = false
        batchTestRunning = false
      }
    }
    
    // 停止批量测试
    const stopBatchTest = () => {
      batchTestRunning = false
    }
    
    // 清空批量测试结果
    const clearBatchResults = () => {
      batchResults.value = []
      batchProgress.value = 0
      completedTests.value = 0
      batchStartTime.value = null
    }
    
    // 显示批量测试汇总
    const showBatchSummary = () => {
      if (batchResults.value.length === 0) return
      
      const successCount = batchResults.value.filter(r => r.actualResult === 'success').length
      const expectedMatchCount = batchResults.value.filter(r => r.testSuccess).length
      const normalDataTestCount = batchResults.value.filter(r => r.dataType === 'normal').length
      const errorDataTestCount = batchResults.value.filter(r => r.dataType === 'error').length
      const totalTime = batchTotalTime.value
      const avgResponseTime = batchAvgResponseTime.value
      
      const summaryResult = {
        timestamp: new Date().toLocaleString(),
        name: `混合批量测试汇总 (${batchResults.value.length}个测试)`,
        response: {
          summary: {
            total: batchResults.value.length,
            success: successCount,
            failed: batchResults.value.length - successCount,
            expectedMatch: expectedMatchCount,
            expectedMatchRate: (expectedMatchCount / batchResults.value.length * 100).toFixed(1),
            normalDataCount: normalDataTestCount,
            errorDataCount: errorDataTestCount,
            avgResponseTime: avgResponseTime,
            totalTime: totalTime
          }
        },
        responseTime: avgResponseTime,
        status: 'success',
        testType: 'batch-summary'
      }
      
      currentResult.value = summaryResult
    }
    
    // 显示批量测试单项结果
    const showBatchItemResult = (result) => {
      currentResult.value = result
    }
    
    // 显示历史测试结果
    const showHistoryResult = (result) => {
      currentResult.value = result
    }
    
    // 运行预设测试
    const runPresetTest = () => {
      if (selectedTestCase.value !== null && testCases.value[selectedTestCase.value]) {
        runTest(testCases.value[selectedTestCase.value].data)
      }
    }
    
    // 运行特定测试用例
    const runSpecificTest = async (index) => {
      if (!testCases.value[index]) return
      
      runningTestIndex.value = index
      const testCase = testCases.value[index]
      
      loading.value = true
      const startTime = Date.now()
      
      try {
        // 调用API
        const response = await identityTest(testCase.data)
        
        // 计算响应时间
        const endTime = Date.now()
        const responseTime = endTime - startTime
        
        // 判断测试是否符合期望
        const actualResult = 'success' // API调用成功
        const testSuccess = actualResult === testCase.expectedResult
        
        // 生成测试结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testCase.name,
          request: testCase.data,
          response,
          responseTime,
          status: 'success',
          expectedResult: testCase.expectedResult,
          actualResult: actualResult,
          testSuccess: testSuccess,
          testType: 'preset'
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'identity', result })
      } catch (error) {
        console.error('测试失败:', error)
        
        // API调用失败
        const endTime = Date.now()
        const actualResult = 'error'
        const testSuccess = actualResult === testCase.expectedResult
        
        // 生成错误结果
        const result = {
          timestamp: new Date().toLocaleString(),
          name: testCase.name,
          request: testCase.data,
          response: { 
            error: error.error || error.message || '未知错误',
            errorCode: error.errorCode,
            originalError: error.originalError
          },
          responseTime: endTime - startTime,
          status: 'failed',
          expectedResult: testCase.expectedResult,
          actualResult: actualResult,
          testSuccess: testSuccess,
          testType: 'preset'
        }
        
        // 更新当前结果和存储到历史
        currentResult.value = result
        store.dispatch('addTestResult', { type: 'identity', result })
      } finally {
        loading.value = false
        runningTestIndex.value = null
      }
    }
    
    // 清除结果
    const clearResults = () => {
      currentResult.value = null
      store.dispatch('resetTestResults', 'identity')
    }
    
    
    
    // 获取样本测试结果
    const getSampleTestResult = (sampleIndex) => {
      return sampleTestResults.value.find(result => result.index === sampleIndex)
    }
    
    // 显示样本测试结果
    const showSampleResult = (result) => {
      currentResult.value = result
    }
    
    // 清空样本测试结果
    const clearSampleResults = () => {
      sampleTestResults.value = []
      // 如果当前显示的是汇总结果，也清空
      if (currentResult.value && currentResult.value.response && currentResult.value.response.summary) {
        currentResult.value = null
      }
    }
    
    // 获取结果标题
    const getResultTitle = () => {
      if (activeTab.value === 'real' && testMode.value === 'random' && sampleTestResults.value.length > 0) {
        if (currentResult.value && !currentResult.value.response?.summary) {
          return '样本详细结果'
        }
        return '样本测试结果详情'
      }
      return '测试结果'
    }
    
    // 获取清除操作
    const getClearAction = () => {
      if (activeTab.value === 'real' && testMode.value === 'random' && sampleTestResults.value.length > 0) {
        return clearSampleResults()
      }
      return clearResults()
    }
    
    // 返回样本列表
    const returnToSamplesList = () => {
      // 恢复显示汇总结果
      const successCount = sampleTestResults.value.filter(r => r.status === 'success').length
      const totalCount = sampleTestResults.value.length
      const correctCount = sampleTestResults.value.filter(r => r.accuracy === 1).length
      const avgResponseTime = sampleTestResults.value.reduce((sum, r) => sum + r.responseTime, 0) / totalCount
      
      currentResult.value = {
        timestamp: new Date().toLocaleString(),
        name: `批量测试汇总 (${totalCount}个样本)`,
        response: {
          summary: {
            total: totalCount,
            success: successCount,
            failed: totalCount - successCount,
            accuracy: correctCount / totalCount,
            avg_response_time: avgResponseTime.toFixed(2)
          }
        },
        responseTime: avgResponseTime,
        status: 'success'
      }
    }
    
    // 仪表盘相关方法
    const refreshDashboard = () => {
      // 刷新仪表盘数据（这里可以添加重新计算逻辑）
      console.log('刷新仪表盘数据')
    }
    
    const getResponseTimeClass = (responseTime) => {
      if (responseTime < 100) return 'excellent'
      if (responseTime < 300) return 'good'
      if (responseTime < 500) return 'average'
      return 'poor'
    }
    

    
    // 环状图相关方法
    const getTestSuccessRateColor = (rate) => {
      if (rate >= 80) return '#67c23a'
      if (rate >= 60) return '#e6a23c'
      return '#f56c6c'
    }
    
    const getTestSuccessRateStrokeDasharray = (rate) => {
      const circumference = 2 * Math.PI * 60 // r=60
      // 当 rate 为 0 时，返回完整的圆环
      if (rate === 0) return `${circumference} 0`
      return `${(rate / 100) * circumference} ${circumference}`
    }
    
    const getTestSuccessRateStrokeDashoffset = (rate) => {
      // 当 rate 为 0 时，不需要偏移
      if (rate === 0) return 0
      return 0
    }
    
    // 测试类型分布环状图数据
    const typeDistributionSegments = computed(() => {
      const distribution = identityStats.value.testTypeDistribution
      if (distribution.length === 0) return []
      
      const circumference = 2 * Math.PI * 60
      let currentOffset = 0
      const colors = {
        real: '#67c23a',
        preset: '#409eff', 
        custom: '#e6a23c',
        batch: '#f56c6c'
      }
      
      return distribution.map(item => {
        const segmentLength = (item.percentage / 100) * circumference
        const segment = {
          color: colors[item.type] || '#909399',
          dasharray: `${segmentLength} ${circumference}`,
          dashoffset: -currentOffset
        }
        currentOffset += segmentLength
        return segment
      })
    })
    
    return {
      activeTab,
      selectedTestCase,
      testCases,
      loading,
      currentResult,
      customTestForm,
      normalDataCount,
      errorDataCount,
      concurrentCount,
      batchLoading,
      batchProgress,
      completedTests,
      testHistory,
      // 真实数据测试相关
      datasetInfo,
      loadingDatasetInfo,
      testMode,
      sampleIndex,
      randomCount,
      currentSample,
      randomSamples,
      sampleTestResults,
      batchTestingSamples,
      loadDatasetInfo,
      runRealDataTest,
      runSingleTest,
      runBatchSamplesTest,
      runTestWithTrueLabel,
      getSampleTestResult,
      showSampleResult,
      clearSampleResults,
      getResultTitle,
      getClearAction,
      returnToSamplesList,
      // 原有函数
      runTest,
      runTestWithExpectation,
      runCustomTest,
      resetCustomForm,
      generateErrorTestData,
      runMixedBatchTest,
      stopBatchTest,
      clearBatchResults,
      showBatchSummary,
      showBatchItemResult,
      showHistoryResult,
      clearResults,
      runPresetTest,
      runSpecificTest,
      runningTestIndex,
      // 新增的自定义测试相关
      parsedTransSeries,
      fillExampleData,
      clearTransSeries,
      addTransRow,
      removeLastRow,
      removeTransRow,
      updateTransSeries,
      parseTransSeriesFromInput,
      // 用户信息相关
      userInfoCount,
      updateUserInfoCount,
      handleTransCsvUpload,
      handleUserCsvUpload,
      getPreviewJson,
      // 批量测试相关
      batchResults,
      batchSuccessRate,
      batchExpectedMatchCount,
      batchAvgResponseTime,
      batchTotalTime,
      batchNormalDataCount,
      // 仪表盘相关
      identityStats,
      refreshDashboard,
      getResponseTimeClass,
      getTestSuccessRateColor,
      getTestSuccessRateStrokeDasharray,
      getTestSuccessRateStrokeDashoffset,
      typeDistributionSegments
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

.param-info {
  margin-top: 15px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.param-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.param-info ul {
  margin: 0 0 15px 0;
  padding-left: 20px;
}

.param-info li {
  margin-bottom: 5px;
  line-height: 1.6;
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

.real-data-test {
  min-height: 400px;
}

.sample-info {
  line-height: 1.8;
}

.sample-info p {
  margin: 10px 0;
}

.prediction-comparison {
  border-radius: 4px;
  background-color: #f5f7fa;
  padding: 10px;
}

.samples-list {
  margin-top: 10px;
}

.user-info-preview {
  font-size: 12px;
  color: #909399;
}

.sample-results {
  margin-top: 10px;
}

.sample-results-container {
  padding: 15px;
}

.summary-stats {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.summary-stats h4 {
  margin: 0 0 15px 0;
  color: #303133;
}

.header-buttons {
  display: flex;
  gap: 10px;
}

.samples-info {
  margin-bottom: 15px;
  padding: 10px;
  background-color: #f0f9ff;
  border-radius: 4px;
  border-left: 4px solid #409eff;
}

.samples-info p {
  margin: 5px 0;
  font-size: 14px;
  color: #606266;
}

.text-muted {
  color: #c0c4cc;
  font-size: 12px;
}

.preset-test {
  padding: 20px 0;
}

.case-header {
  display: flex;
  align-items: center;
}

.case-name {
  font-weight: 600;
  color: #303133;
  font-size: 16px;
}

.case-content h5 {
  margin: 0 0 10px 0;
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.code-block {
  background-color: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  padding: 15px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.5;
  color: #2c3e50;
}

.no-selection {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.test-case-grid {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 30px;
}

.test-case-card {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 8px 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: #ffffff;
  display: flex;
  align-items: center;
  min-height: 28px;
}

.test-case-card:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.12);
  transform: translateY(-1px);
}

.test-case-card.selected {
  border-color: #409eff;
  background: #f0f9ff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.15);
}

.test-case-card .card-header {
  flex: 0 0 200px;
  margin-right: 16px;
}

.test-case-card .case-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin: 0;
  line-height: 1.3;
}

.test-case-card .card-body {
  flex: 1;
  margin-right: 16px;
}

.test-case-card .case-description {
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.test-case-card .expected-result {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #606266;
  white-space: nowrap;
  flex: 0 0 auto;
  margin-right: 16px;
}

.test-case-card .card-footer {
  flex: 0 0 auto;
}

.run-button {
  min-width: 70px !important;
  height: 28px !important;
  font-size: 12px !important;
  padding: 0 12px !important;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  color: #fff;
}

.run-button .el-icon {
  margin-right: 4px;
  font-size: 12px !important;
  display: inline-flex;
  align-items: center;
  width: 12px;
  height: 12px;
  color: inherit;
}

.run-button .el-icon svg {
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.run-button .play-icon {
  margin-right: 4px;
  font-size: 10px;
  display: inline-block;
  line-height: 1;
}

/* 自定义测试相关样式 */
.simple-editor {
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  overflow: hidden;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
}

.data-count {
  font-size: 13px;
  color: #606266;
  font-weight: 500;
}

.table-container {
  overflow-x: auto;
}

.simple-empty {
  padding: 30px;
  text-align: center;
  color: #909399;
  font-size: 14px;
  background-color: #fafafa;
}

/* 用户特征相关样式 */
.user-features {
  width: 100%;
}

.feature-item {
  margin-bottom: 10px;
}

.feature-label {
  display: block;
  font-size: 12px;
  color: #606266;
  margin-bottom: 4px;
  text-align: center;
}

/* JSON预览样式 */
.json-preview {
  width: 100%;
}

.json-display {
  background-color: #ffffff;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 16px;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-all;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #2c3e50;
  max-height: 300px;
  overflow-y: auto;
}

/* 上传组件样式 */
.el-upload {
  width: 100%;
}

/* 分割线样式调整 */
.el-divider h4 {
  margin: 0;
  color: #303133;
  font-weight: 600;
}

/* 批量测试配置样式 */
.batch-config-card {
  height: auto;
  min-height: 500px;
}

.config-content {
  padding: 8px 0;
}

.config-section {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f0f0f0;
}

.config-section:last-of-type {
  border-bottom: none;
  margin-bottom: 24px;
}

.section-title {
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.config-item {
  margin-bottom: 24px;
}

.config-item:last-child {
  margin-bottom: 0;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.config-label {
  font-size: 14px;
  font-weight: 500;
  color: #606266;
  line-height: 1.5;
}

.config-input {
  width: 120px;
}

.config-description {
  margin: 0;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  padding-left: 0;
  text-align: left;
}

.summary-section {
  background: #f8f9fa;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 32px;
  border-left: 4px solid #409eff;
}

.summary-info {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.summary-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.summary-value {
  font-size: 16px;
  font-weight: 600;
  color: #409eff;
}

.action-section {
  text-align: center;
}

.primary-button {
  width: 100%;
  height: 44px;
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 16px;
}

.secondary-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* 身份风险评估仪表盘样式 */
.identity-dashboard {
  margin-top: 40px;
  padding-top: 30px;
  border-top: 2px solid #f0f0f0;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}

.dashboard-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.dashboard-title h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #303133;
}

.dashboard-icon {
  font-size: 24px;
  color: #409eff;
}

.refresh-btn {
  display: flex;
  align-items: center;
  gap: 6px;
}

.dashboard-card {
  height: 100%;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.dashboard-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

.card-header .el-icon {
  color: #409eff;
}



/* 性能卡片样式 */
.performance-content {
  padding: 8px 0;
}

.perf-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  position: relative;
}

.perf-item:last-child {
  margin-bottom: 0;
}

.perf-label {
  font-size: 14px;
  color: #606266;
  font-weight: 500;
}

.perf-value {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
}

.perf-value.fast {
  color: #67c23a;
}

.perf-value.slow {
  color: #f56c6c;
}

.perf-value.accuracy {
  color: #409eff;
}

.perf-indicator {
  position: absolute;
  right: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.perf-indicator.excellent {
  background: #67c23a;
}

.perf-indicator.good {
  background: #e6a23c;
}

.perf-indicator.average {
  background: #f56c6c;
}

.perf-indicator.poor {
  background: #909399;
}

/* 分布卡片样式 */
.distribution-content {
  padding: 8px 0;
}

.dist-item {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.dist-item:last-child {
  margin-bottom: 0;
}

.dist-info {
  display: flex;
  justify-content: space-between;
  width: 120px;
  margin-right: 12px;
}

.dist-label {
  font-size: 13px;
  color: #606266;
}

.dist-count {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
}

.dist-bar {
  flex: 1;
  height: 8px;
  background: #f5f7fa;
  border-radius: 4px;
  overflow: hidden;
  margin-right: 12px;
}

.dist-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

.dist-fill.real {
  background: #67c23a;
}

.dist-fill.preset {
  background: #409eff;
}

.dist-fill.custom {
  background: #e6a23c;
}

.dist-fill.batch {
  background: #f56c6c;
}

.dist-percentage {
  font-size: 12px;
  color: #909399;
  width: 40px;
  text-align: right;
}



/* 环状图样式 */
.donut-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.donut-chart {
  margin-bottom: 16px;
}

.progress-circle {
  transition: stroke-dasharray 0.6s ease-in-out;
}

.donut-percentage {
  font-size: 20px;
  font-weight: 600;
  fill: #303133;
}

.donut-label {
  font-size: 12px;
  fill: #909399;
}

.donut-total {
  font-size: 18px;
  font-weight: 600;
  fill: #303133;
}

.donut-legend {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #606266;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-color.expected {
  background: #67c23a;
}

.legend-color.unexpected {
  background: #f56c6c;
}

/* 类型分布环状图样式 */
.type-donut-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 8px 0;
}

.type-donut-chart {
  margin-bottom: 16px;
}

.type-segment {
  transition: stroke-dasharray 0.6s ease-in-out;
}

.type-legend {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.type-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  color: #606266;
}

.type-legend-color {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.type-legend-color.real {
  background: #67c23a;
}

.type-legend-color.preset {
  background: #409eff;
}

.type-legend-color.custom {
  background: #e6a23c;
}

.type-legend-color.batch {
  background: #f56c6c;
}

.type-legend-text {
  flex: 1;
}
</style> 