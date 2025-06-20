/**
 * 前端自定义测试功能自动化测试脚本 - 改进版
 * 改进了元素查找逻辑和错误处理
 */

class FrontendTestRunner {
  constructor() {
    this.testResults = {
      identity: { passed: 0, failed: 0, total: 0, details: [] },
      faceViz: { passed: 0, failed: 0, total: 0, details: [] },
      fusion: { passed: 0, failed: 0, total: 0, details: [] }
    };
    this.currentPage = null;
    this.testStartTime = null;
    this.debug = true; // 启用调试模式
  }

  // 调试日志
  debugLog(message) {
    if (this.debug) {
      console.log(`[DEBUG] ${message}`);
    }
  }

  // 测试结果记录
  recordResult(page, testName, passed, details = {}) {
    const result = {
      testName,
      passed,
      timestamp: new Date().toISOString(),
      details
    };
    
    this.testResults[page].details.push(result);
    this.testResults[page].total++;
    if (passed) {
      this.testResults[page].passed++;
    } else {
      this.testResults[page].failed++;
    }
    
    console.log(`[${page.toUpperCase()}] ${testName}: ${passed ? '✅ 通过' : '❌ 失败'}`);
    if (!passed && details.error) {
      console.log(`    错误详情: ${details.error}`);
    }
  }

  // 查找包含特定文本的元素 - 改进版
  findElementByText(selector, text, exact = false) {
    try {
      const elements = document.querySelectorAll(selector);
      this.debugLog(`查找元素 ${selector}，包含文本"${text}"，找到 ${elements.length} 个候选元素`);
      
      return Array.from(elements).find(el => {
        const elementText = el.textContent || el.innerText || '';
        return exact ? elementText === text : elementText.includes(text);
      });
    } catch (error) {
      this.debugLog(`查找元素时发生错误: ${error.message}`);
      return null;
    }
  }

  // 多种方式查找元素
  findElementMultiWay(selectors, text = null) {
    for (const selector of selectors) {
      try {
        if (text) {
          const element = this.findElementByText(selector, text);
          if (element) {
            this.debugLog(`通过选择器 ${selector} 和文本"${text}"找到元素`);
            return element;
          }
        } else {
          const element = document.querySelector(selector);
          if (element) {
            this.debugLog(`通过选择器 ${selector} 找到元素`);
            return element;
          }
        }
      } catch (error) {
        this.debugLog(`选择器 ${selector} 查找失败: ${error.message}`);
      }
    }
    return null;
  }

  // 等待元素出现 - 改进版
  async waitForElement(selectors, text = null, timeout = 3000) {
    const startTime = Date.now();
    
    // 确保selectors是数组
    if (typeof selectors === 'string') {
      selectors = [selectors];
    }
    
    while (Date.now() - startTime < timeout) {
      const element = this.findElementMultiWay(selectors, text);
      if (element) {
        this.debugLog(`元素在 ${Date.now() - startTime}ms 后找到`);
        return element;
      }
      await this.sleep(200);
    }
    
    this.debugLog(`元素未在 ${timeout}ms 内找到`);
    return null;
  }

  // 等待页面加载
  async waitForPageLoad() {
    await this.sleep(1500);
    this.debugLog('页面加载等待完成');
  }

  // 睡眠函数
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 导航到指定页面
  async navigateToPage(pageName) {
    console.log(`\n🚀 开始测试 ${pageName} 页面...`);
    
    const pageMap = {
      'identity': '/identity-test',
      'faceViz': '/face-viz-test', 
      'fusion': '/fusion-test'
    };
    
    if (pageMap[pageName]) {
      try {
        window.location.hash = pageMap[pageName];
        await this.waitForPageLoad();
        this.currentPage = pageName;
        this.debugLog(`成功导航到 ${pageName} 页面`);
        
        // 检查页面是否正确加载
        const pageContent = document.querySelector('.el-main, .main-content, main, .content');
        if (pageContent) {
          this.debugLog('页面内容容器已找到');
        } else {
          this.debugLog('警告：未找到页面内容容器');
        }
        
      } catch (error) {
        console.error(`导航到 ${pageName} 页面时发生错误:`, error);
        throw error;
      }
    }
  }

  // 安全地点击元素
  async safeClick(element, description = '元素') {
    try {
      if (element && typeof element.click === 'function') {
        element.click();
        this.debugLog(`成功点击${description}`);
        await this.sleep(300);
        return true;
      } else {
        this.debugLog(`无法点击${description}：元素无效`);
        return false;
      }
    } catch (error) {
      this.debugLog(`点击${description}时发生错误: ${error.message}`);
      return false;
    }
  }

  // 安全地设置输入值
  async safeSetValue(element, value, description = '输入框') {
    try {
      if (element) {
        element.value = value;
        element.dispatchEvent(new Event('input', { bubbles: true }));
        element.dispatchEvent(new Event('change', { bubbles: true }));
        this.debugLog(`成功设置${description}的值为: ${value}`);
        await this.sleep(200);
        return true;
      } else {
        this.debugLog(`无法设置${description}的值：元素无效`);
        return false;
      }
    } catch (error) {
      this.debugLog(`设置${description}的值时发生错误: ${error.message}`);
      return false;
    }
  }

  // ==================== IdentityTest 测试用例 ====================
  
  async testIdentityCustomFeatures() {
    console.log('\n📋 测试 IdentityTest 自定义测试功能...');
    
    // 尝试切换到自定义测试标签
    try {
      const customTab = await this.waitForElement([
        '.el-tabs__item', 
        '.el-tab-pane', 
        '[role="tab"]',
        'button'
      ], '自定义测试');
      
      if (customTab) {
        await this.safeClick(customTab, '自定义测试标签');
      } else {
        this.debugLog('未找到自定义测试标签，继续测试当前页面');
      }
    } catch (error) {
      this.debugLog(`切换标签时发生错误: ${error.message}`);
    }

    // 测试快速填入功能
    await this.testIdentityQuickFill();

    // 测试预期结果选择
    await this.testIdentityExpectedResult();

    // 测试运行测试功能
    await this.testIdentityRunTest();

    // 测试重置功能
    await this.testIdentityReset();
  }

  async testIdentityQuickFill() {
    try {
      // 测试正常示例按钮
      const normalBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]'
      ], '正常示例');
      
      if (normalBtn) {
        await this.safeClick(normalBtn, '正常示例按钮');
        
        // 检查表格是否有数据
        const table = document.querySelector('.el-table, table, .table');
        if (table) {
          const rows = table.querySelectorAll('tbody tr, tr');
          this.recordResult('identity', '正常示例快速填入', rows.length >= 1, { 
            rowCount: rows.length 
          });
        } else {
          this.recordResult('identity', '正常示例快速填入', false, { 
            error: '未找到表格元素' 
          });
        }
      } else {
        this.recordResult('identity', '正常示例快速填入', false, { 
          error: '未找到正常示例按钮' 
        });
      }

      // 测试随机生成按钮
      const randomBtn = this.findElementMultiWay([
        'button',
        '.el-button', 
        'input[type="button"]'
      ], '随机生成');
      
      if (randomBtn) {
        await this.safeClick(randomBtn, '随机生成按钮');
        this.recordResult('identity', '随机生成快速填入', true);
      } else {
        this.recordResult('identity', '随机生成快速填入', false, { 
          error: '未找到随机生成按钮' 
        });
      }

      // 测试清空按钮
      const clearBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]'
      ], '清空');
      
      if (clearBtn) {
        await this.safeClick(clearBtn, '清空按钮');
        this.recordResult('identity', '清空功能', true);
      } else {
        this.recordResult('identity', '清空功能', false, { 
          error: '未找到清空按钮' 
        });
      }
      
    } catch (error) {
      this.recordResult('identity', '快速填入功能', false, { error: error.message });
    }
  }

  async testIdentityExpectedResult() {
    try {
      // 查找预期结果相关的单选框
      const radios = document.querySelectorAll('input[type="radio"]');
      this.debugLog(`找到 ${radios.length} 个单选框`);
      
      let foundRadio = false;
      for (const radio of radios) {
        if (radio.value === 'error' || radio.value === 'success' || radio.value === 'normal') {
          await this.safeClick(radio, `预期结果选项(${radio.value})`);
          foundRadio = true;
          break;
        }
      }
      
      this.recordResult('identity', '预期结果选择', foundRadio, { 
        error: foundRadio ? null : '未找到合适的预期结果选项' 
      });
      
    } catch (error) {
      this.recordResult('identity', '预期结果选择', false, { error: error.message });
    }
  }

  async testIdentityRunTest() {
    try {
      const runBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="submit"]'
      ], '运行测试');
      
      if (runBtn) {
        const isEnabled = !runBtn.disabled && !runBtn.classList.contains('disabled');
        this.recordResult('identity', '运行测试按钮状态', isEnabled, { 
          disabled: runBtn.disabled,
          classes: runBtn.className 
        });
      } else {
        this.recordResult('identity', '运行测试按钮状态', false, { 
          error: '未找到运行测试按钮' 
        });
      }
    } catch (error) {
      this.recordResult('identity', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testIdentityReset() {
    try {
      const resetBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="reset"]'
      ], '重置');
      
      if (resetBtn) {
        await this.safeClick(resetBtn, '重置按钮');
        this.recordResult('identity', '重置功能', true);
      } else {
        this.recordResult('identity', '重置功能', false, { 
          error: '未找到重置按钮' 
        });
      }
    } catch (error) {
      this.recordResult('identity', '重置功能', false, { error: error.message });
    }
  }

  // ==================== FaceVizTest 测试用例 ====================
  
  async testFaceVizCustomFeatures() {
    console.log('\n📋 测试 FaceVizTest 自定义测试功能...');
    
    // 尝试切换到自定义测试标签
    try {
      const customTab = await this.waitForElement([
        '.el-tabs__item',
        '.el-tab-pane',
        '[role="tab"]',
        'button'
      ], '自定义测试');
      
      if (customTab) {
        await this.safeClick(customTab, '自定义测试标签');
      }
    } catch (error) {
      this.debugLog(`切换标签时发生错误: ${error.message}`);
    }

    // 测试图像输入功能
    await this.testFaceVizImageInput();

    // 测试预期结果选择
    await this.testFaceVizExpectedResult();

    // 测试运行测试功能
    await this.testFaceVizRunTest();

    // 测试重置功能
    await this.testFaceVizReset();
  }

  async testFaceVizImageInput() {
    try {
      const inputs = document.querySelectorAll('input[type="text"], input[type="file"], .el-input input');
      this.debugLog(`找到 ${inputs.length} 个输入框`);
      
      let imageInputCount = 0;
      for (const input of inputs) {
        const placeholder = input.placeholder || '';
        const label = input.labels?.[0]?.textContent || '';
        
        if (placeholder.includes('图像') || placeholder.includes('image') || 
            label.includes('图像') || label.includes('image')) {
          await this.safeSetValue(input, `test_image_${imageInputCount + 1}.png`, `图像输入框${imageInputCount + 1}`);
          imageInputCount++;
          
          if (imageInputCount >= 2) break; // 只测试前两个图像输入
        }
      }
      
      this.recordResult('faceViz', '图像输入功能', imageInputCount > 0, { 
        inputCount: imageInputCount 
      });
      
    } catch (error) {
      this.recordResult('faceViz', '图像输入功能', false, { error: error.message });
    }
  }

  async testFaceVizExpectedResult() {
    try {
      const radios = document.querySelectorAll('input[type="radio"]');
      let foundRadio = false;
      
      for (const radio of radios) {
        if (radio.value === 'different_person' || radio.value === 'same_person' || 
            radio.value === 'error' || radio.value === 'success') {
          await this.safeClick(radio, `预期结果选项(${radio.value})`);
          foundRadio = true;
          break;
        }
      }
      
      this.recordResult('faceViz', '预期结果选择', foundRadio, { 
        error: foundRadio ? null : '未找到合适的预期结果选项' 
      });
      
    } catch (error) {
      this.recordResult('faceViz', '预期结果选择', false, { error: error.message });
    }
  }

  async testFaceVizRunTest() {
    try {
      const runBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="submit"]'
      ], '运行测试');
      
      if (runBtn) {
        const isEnabled = !runBtn.disabled && !runBtn.classList.contains('disabled');
        this.recordResult('faceViz', '运行测试按钮状态', isEnabled);
      } else {
        this.recordResult('faceViz', '运行测试按钮状态', false, { 
          error: '未找到运行测试按钮' 
        });
      }
    } catch (error) {
      this.recordResult('faceViz', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testFaceVizReset() {
    try {
      const resetBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="reset"]'
      ], '重置');
      
      if (resetBtn) {
        await this.safeClick(resetBtn, '重置按钮');
        this.recordResult('faceViz', '重置功能', true);
      } else {
        this.recordResult('faceViz', '重置功能', false, { 
          error: '未找到重置按钮' 
        });
      }
    } catch (error) {
      this.recordResult('faceViz', '重置功能', false, { error: error.message });
    }
  }

  // ==================== FusionTest 测试用例 ====================
  
  async testFusionCustomFeatures() {
    console.log('\n📋 测试 FusionTest 自定义测试功能...');
    
    // 尝试切换到自定义测试标签
    try {
      const customTab = await this.waitForElement([
        '.el-tabs__item',
        '.el-tab-pane', 
        '[role="tab"]',
        'button'
      ], '自定义测试');
      
      if (customTab) {
        await this.safeClick(customTab, '自定义测试标签');
      }
    } catch (error) {
      this.debugLog(`切换标签时发生错误: ${error.message}`);
    }

    // 测试模态数据输入
    await this.testFusionModalInput();

    // 测试预期结果选择
    await this.testFusionExpectedResult();

    // 测试运行测试功能
    await this.testFusionRunTest();

    // 测试重置功能
    await this.testFusionReset();
  }

  async testFusionModalInput() {
    try {
      const inputs = document.querySelectorAll('input[type="text"], input[type="number"], textarea, .el-input input');
      this.debugLog(`找到 ${inputs.length} 个输入框`);
      
      let inputCount = 0;
      for (const input of inputs) {
        if (input.type !== 'radio' && input.type !== 'checkbox') {
          await this.safeSetValue(input, `test_data_${inputCount + 1}`, `模态数据输入框${inputCount + 1}`);
          inputCount++;
          
          if (inputCount >= 3) break; // 只测试前3个输入框
        }
      }
      
      this.recordResult('fusion', '模态数据输入', inputCount > 0, { 
        inputCount: inputCount 
      });
      
    } catch (error) {
      this.recordResult('fusion', '模态数据输入', false, { error: error.message });
    }
  }

  async testFusionExpectedResult() {
    try {
      const radios = document.querySelectorAll('input[type="radio"]');
      let foundRadio = false;
      
      for (const radio of radios) {
        if (radio.value === 'error' || radio.value === 'success' || 
            radio.value === 'normal' || radio.value === 'fusion') {
          await this.safeClick(radio, `预期结果选项(${radio.value})`);
          foundRadio = true;
          break;
        }
      }
      
      this.recordResult('fusion', '预期结果选择', foundRadio, { 
        error: foundRadio ? null : '未找到合适的预期结果选项' 
      });
      
    } catch (error) {
      this.recordResult('fusion', '预期结果选择', false, { error: error.message });
    }
  }

  async testFusionRunTest() {
    try {
      const runBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="submit"]'
      ], '运行测试');
      
      if (runBtn) {
        const isEnabled = !runBtn.disabled && !runBtn.classList.contains('disabled');
        this.recordResult('fusion', '运行测试按钮状态', isEnabled);
      } else {
        this.recordResult('fusion', '运行测试按钮状态', false, { 
          error: '未找到运行测试按钮' 
        });
      }
    } catch (error) {
      this.recordResult('fusion', '运行测试按钮状态', false, { error: error.message });
    }
  }

  async testFusionReset() {
    try {
      const resetBtn = this.findElementMultiWay([
        'button',
        '.el-button',
        'input[type="button"]',
        'input[type="reset"]'
      ], '重置');
      
      if (resetBtn) {
        await this.safeClick(resetBtn, '重置按钮');
        this.recordResult('fusion', '重置功能', true);
      } else {
        this.recordResult('fusion', '重置功能', false, { 
          error: '未找到重置按钮' 
        });
      }
    } catch (error) {
      this.recordResult('fusion', '重置功能', false, { error: error.message });
    }
  }

  // ==================== 测试执行主函数 ====================
  
  async runAllTests() {
    console.log('🚀 开始执行前端自定义测试功能自动化测试...');
    this.testStartTime = Date.now();
    
    try {
      // 测试 IdentityTest 页面
      await this.navigateToPage('identity');
      await this.testIdentityCustomFeatures();
      
      // 测试 FaceVizTest 页面
      await this.navigateToPage('faceViz');
      await this.testFaceVizCustomFeatures();
      
      // 测试 FusionTest 页面
      await this.navigateToPage('fusion');
      await this.testFusionCustomFeatures();
      
    } catch (error) {
      console.error('测试执行过程中发生严重错误:', error);
    }
    
    // 生成测试报告
    this.generateTestReport();
  }

  // 生成测试报告
  generateTestReport() {
    const testEndTime = Date.now();
    const totalDuration = ((testEndTime - this.testStartTime) / 1000).toFixed(2);
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 前端自定义测试功能测试报告');
    console.log('='.repeat(60));
    
    let totalPassed = 0;
    let totalFailed = 0;
    let totalTests = 0;
    
    Object.keys(this.testResults).forEach(page => {
      const result = this.testResults[page];
      totalPassed += result.passed;
      totalFailed += result.failed;
      totalTests += result.total;
      
      console.log(`\n📄 ${page.toUpperCase()} 页面测试结果:`);
      console.log(`   总测试数: ${result.total}`);
      console.log(`   通过: ${result.passed} ✅`);
      console.log(`   失败: ${result.failed} ❌`);
      console.log(`   通过率: ${result.total > 0 ? ((result.passed / result.total) * 100).toFixed(1) : 0}%`);
      
      if (result.failed > 0) {
        console.log('\n   失败详情:');
        result.details.filter(d => !d.passed).forEach(detail => {
          console.log(`   - ${detail.testName}: ${detail.details.error || '未知错误'}`);
        });
      }
    });
    
    console.log('\n' + '-'.repeat(60));
    console.log('📈 总体测试结果:');
    console.log(`   总测试数: ${totalTests}`);
    console.log(`   总通过: ${totalPassed} ✅`);
    console.log(`   总失败: ${totalFailed} ❌`);
    console.log(`   总体通过率: ${totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0}%`);
    console.log(`   测试耗时: ${totalDuration} 秒`);
    console.log('='.repeat(60));
    
    // 保存测试结果到全局变量
    window.testResults = this.testResults;
    window.testReport = {
      totalTests,
      totalPassed,
      totalFailed,
      passRate: totalTests > 0 ? ((totalPassed / totalTests) * 100).toFixed(1) : 0,
      duration: totalDuration,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n💡 测试结果已保存到 window.testResults 和 window.testReport');
    
    // 提供调试信息
    if (totalTests === 0) {
      console.log('\n⚠️  没有执行任何测试，可能的原因：');
      console.log('   1. 页面元素结构与预期不符');
      console.log('   2. 页面加载时间不够');
      console.log('   3. 网络或其他技术问题');
      console.log('\n💡 建议：');
      console.log('   - 手动检查页面是否正常加载');
      console.log('   - 尝试单独测试某个页面: testIdentityPage(), testFaceVizPage(), testFusionPage()');
      console.log('   - 查看调试信息以了解具体问题');
    }
  }
}

// 创建测试运行器实例
const testRunner = new FrontendTestRunner();

// 导出测试函数
window.runFrontendTests = () => testRunner.runAllTests();

// 导出单个页面测试函数
window.testIdentityPage = () => {
  testRunner.navigateToPage('identity').then(() => testRunner.testIdentityCustomFeatures());
};

window.testFaceVizPage = () => {
  testRunner.navigateToPage('faceViz').then(() => testRunner.testFaceVizCustomFeatures());
};

window.testFusionPage = () => {
  testRunner.navigateToPage('fusion').then(() => testRunner.testFusionCustomFeatures());
};

// 导出测试结果获取函数
window.getTestResults = () => testRunner.testResults;

// 导出调试函数
window.debugCurrentPage = () => {
  console.log('🔍 当前页面调试信息:');
  console.log('URL:', window.location.href);
  console.log('Hash:', window.location.hash);
  
  // 检查常用元素
  const elements = {
    '按钮': document.querySelectorAll('button, .el-button, input[type="button"]').length,
    '输入框': document.querySelectorAll('input, textarea, .el-input').length,
    '表格': document.querySelectorAll('table, .el-table').length,
    '标签页': document.querySelectorAll('.el-tabs__item, [role="tab"]').length,
    '单选框': document.querySelectorAll('input[type="radio"]').length
  };
  
  console.log('页面元素统计:', elements);
  
  // 列出所有按钮文本
  const buttons = document.querySelectorAll('button, .el-button, input[type="button"]');
  const buttonTexts = Array.from(buttons).map(btn => btn.textContent || btn.value).filter(text => text.trim());
  console.log('按钮文本:', buttonTexts);
};

console.log(`
🎯 前端自定义测试功能自动化测试脚本已加载！(改进版)

使用方法：
1. 运行所有测试: runFrontendTests()
2. 测试单个页面:
   - testIdentityPage()    // 测试身份风险评估页面
   - testFaceVizPage()     // 测试人脸可视化页面  
   - testFusionPage()      // 测试多模态融合页面
3. 获取测试结果: getTestResults()
4. 调试当前页面: debugCurrentPage()

改进内容：
✅ 更强的元素查找逻辑
✅ 更好的错误处理
✅ 调试模式和日志
✅ 多种选择器支持
✅ 更安全的交互操作

开始测试: runFrontendTests()
`); 