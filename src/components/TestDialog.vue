<template>
  <el-dialog v-model="dialogVisible" :title="dialogTitle" width="95%" :style="{height: '80%'}">
    <div class="dialog-container">
      <!-- 操作按钮放在上方 -->
      <div class="action-buttons">
        <el-button type="primary" @click="executeTest" class="execute-btn">执行</el-button>
        <el-button type="success" @click="formatData" class="format-btn">格式化</el-button>
      </div>
      
      <!-- 表达式输入放在操作按钮下方 -->
      <div class="expression-group">
        <div class="expression-label">{{ expressionLabel }}:</div>
        <el-input v-model="expressionData" :placeholder="expressionPlaceholder" class="expression-input" />
      </div>
      
      <!-- 左右布局容器 -->
      <div class="content-container">
        <div class="left-section">
          <div class="input-group">
            <div class="input-label">{{ inputLabel }}:</div>
            <el-input v-model="inputData" type="textarea" :rows="18" :placeholder="inputPlaceholder"
              class="input-textarea" />
          </div>
        </div>
        <div class="right-section">
          <div class="result-group">
            <div class="result-label">执行结果:</div>
            <el-input v-model="resultData" type="textarea" :rows="18" readonly placeholder="执行结果将显示在这里"
              class="result-output" />
          </div>
        </div>
      </div>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { JSONPath } from 'jsonpath-plus';
import { XMLParser } from 'fast-xml-parser';
import * as xpath from 'xpath';
import { DOMParser } from 'xmldom';
import { TestType } from './types';

// 定义组件属性
const props = defineProps({
  visible: {
    type: Boolean,
    required: true
  },
  type: {
    type: String as () => TestType,
    required: true
  },
  initialInputData: {
    type: String,
    default: ''
  },
  initialExpressionData: {
    type: String,
    default: ''
  }
});

// 定义组件事件
const emit = defineEmits(['update:visible', 'update:inputData', 'update:expressionData']);

// 内部状态
const inputData = ref(props.initialInputData);
const expressionData = ref(props.initialExpressionData);
const resultData = ref('');

// 监听属性变化
watch(() => props.initialInputData, (newVal) => {
  inputData.value = newVal;
});

watch(() => props.initialExpressionData, (newVal) => {
  expressionData.value = newVal;
});

// 监听内部状态变化，向父组件发送更新
watch(inputData, (newVal) => {
  emit('update:inputData', newVal);
});

watch(expressionData, (newVal) => {
  emit('update:expressionData', newVal);
});

// 计算属性：对话框标题
const dialogTitle = computed(() => {
  switch (props.type) {
    case TestType.JSON:
      return 'JSONPath测试工具';
    case TestType.XML:
      return 'XML测试工具';
    case TestType.REGEX:
      return '正则表达式测试工具';
    default:
      return '测试工具';
  }
});

// 计算属性：输入标签
const inputLabel = computed(() => {
  switch (props.type) {
    case TestType.JSON:
      return 'JSON数据';
    case TestType.XML:
      return 'XML数据';
    case TestType.REGEX:
      return '测试文本';
    default:
      return '输入数据';
  }
});

// 计算属性：输入占位符
const inputPlaceholder = computed(() => {
  switch (props.type) {
    case TestType.JSON:
      return '请输入JSON数据';
    case TestType.XML:
      return '请输入XML数据';
    case TestType.REGEX:
      return '请输入要测试的文本';
    default:
      return '请输入数据';
  }
});

// 计算属性：表达式标签
const expressionLabel = computed(() => {
  switch (props.type) {
    case TestType.JSON:
      return 'JSONPath表达式';
    case TestType.XML:
      return 'XPath表达式';
    case TestType.REGEX:
      return '正则表达式';
    default:
      return '表达式';
  }
});

// 计算属性：表达式占位符
const expressionPlaceholder = computed(() => {
  switch (props.type) {
    case TestType.JSON:
      return '例如: $.store.book[0].title';
    case TestType.XML:
      return '例如: //book[1]/title';
    case TestType.REGEX:
      return '例如: \\b\\w+@\\w+\\.\\w+\\b';
    default:
      return '请输入表达式';
  }
});

// 计算属性：对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
});

// 执行测试方法
const executeTest = () => {
  switch (props.type) {
    case TestType.JSON:
      executeJsonPathTest();
      break;
    case TestType.XML:
      executeXmlTest();
      break;
    case TestType.REGEX:
      executeRegexTest();
      break;
  }
};

// 格式化数据方法
const formatData = () => {
  switch (props.type) {
    case TestType.JSON:
      formatJsonData();
      break;
    case TestType.XML:
      formatXmlData();
      break;
    case TestType.REGEX:
      formatRegexPattern();
      break;
  }
};

// JSON测试相关方法
const executeJsonPathTest = () => {
  try {
    // 验证JSON格式
    const jsonObj = JSON.parse(inputData.value);

    // 使用jsonpath-plus执行JSONPath查询
    const result = JSONPath({ path: expressionData.value, json: jsonObj });

    // 显示结果
    resultData.value = JSON.stringify(result, null, 2);
  } catch (error) {
    if (error instanceof SyntaxError) {
      ElMessage.error('JSON格式错误，请检查输入');
    } else {
      ElMessage.error('JSONPath执行错误: ' + (error as Error).message);
    }
  }
};

// JSON格式化方法
const formatJsonData = () => {
  try {
    // 验证JSON格式
    const jsonObj = JSON.parse(inputData.value);
    // 格式化JSON
    inputData.value = JSON.stringify(jsonObj, null, 2);
    ElMessage.success('JSON格式化成功');
  } catch (error) {
    ElMessage.error('JSON格式错误，无法格式化');
  }
};

// XML测试相关方法
const executeXmlTest = () => {
  try {
    // 验证XML格式
    if (!inputData.value.trim()) {
      ElMessage.warning('请输入XML数据');
      return;
    }

    // 使用DOMParser解析XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(inputData.value, "text/xml");

    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("XML格式错误");
    }

    // 使用xpath执行XPath查询
    const nodes = xpath.select(expressionData.value, xmlDoc);

    // 处理结果
    if (Array.isArray(nodes)) {
      // 如果结果是节点数组
      if (nodes.length === 0) {
        resultData.value = "未找到匹配结果";
        return;
      }

      const result = nodes.map(node => {
        if (node.nodeType === 1) { // 元素节点
          return node.toString();
        } else if (node.nodeType === 2) { // 属性节点
          return node.nodeValue;
        } else if (node.nodeType === 3) { // 文本节点
          return node.nodeValue;
        }
        return node.toString();
      });

      // 格式化输出结果
      if (result.length === 1) {
        resultData.value = result[0] || '';
      } else {
        resultData.value = JSON.stringify(result, null, 2);
      }
    } else {
      // 如果结果是单个值
      resultData.value = String(nodes);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes("XML格式错误")) {
      ElMessage.error('XML格式错误，请检查输入');
    } else {
      ElMessage.error('XPath执行错误: ' + (error as Error).message);
    }
    resultData.value = "执行出错，请检查XML数据和XPath表达式";
  }
};

// XML格式化方法
const formatXmlData = () => {
  try {
    if (!inputData.value.trim()) {
      ElMessage.warning('请输入XML数据');
      return;
    }

    // 使用DOMParser解析XML
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(inputData.value, "text/xml");

    // 检查解析错误
    const parseError = xmlDoc.getElementsByTagName("parsererror");
    if (parseError.length > 0) {
      throw new Error("XML格式错误");
    }

    // 格式化XML
    const formattedXml = formatXml(inputData.value);
    inputData.value = formattedXml;

    ElMessage.success('XML格式化成功');
  } catch (error) {
    ElMessage.error('XML格式错误，无法格式化');
  }
};

// 简单的XML格式化函数
const formatXml = (xml: string): string => {
  let formatted = '';
  let indent = '';

  xml.split(/>[\s\r\n]*</).forEach(node => {
    if (node.match(/^\/\w/)) {
      // 如果是结束标签，减少缩进
      indent = indent.substring(2);
    }

    formatted += indent + '<' + node + '>\n';

    if (node.match(/^<\w[^>]*[^/]$/) && !node.startsWith('<?xml')) {
      // 如果是开始标签且不是自闭合标签，增加缩进
      indent += '  ';
    }
  });

  // 处理格式化后可能出现的问题
  return formatted
    .replace(/><\//g, '>\n</')
    .replace(/<\?xml/g, '<?xml')
    .replace(/\n<\?xml/g, '<?xml');
};

// 正则表达式测试相关方法
const executeRegexTest = () => {
  try {
    if (!inputData.value.trim()) {
      ElMessage.warning('请输入测试文本');
      return;
    }
    if (!expressionData.value.trim()) {
      ElMessage.warning('请输入正则表达式');
      return;
    }

    // 创建正则表达式对象
    const regex = new RegExp(expressionData.value, 'g');
    const matches = inputData.value.match(regex);

    if (matches) {
      resultData.value = `找到 ${matches.length} 个匹配：\n\n${matches.join('\n')}`;
    } else {
      resultData.value = '未找到匹配';
    }
  } catch (error) {
    ElMessage.error('正则表达式执行错误：' + (error as Error).message);
    resultData.value = '执行出错，请检查正则表达式格式';
  }
};

// 正则表达式格式化方法
const formatRegexPattern = () => {
  try {
    if (!expressionData.value.trim()) {
      ElMessage.warning('请输入正则表达式');
      return;
    }
    // 尝试创建正则表达式对象来验证格式
    new RegExp(expressionData.value);
    ElMessage.success('正则表达式格式正确');
  } catch (error) {
    ElMessage.error('正则表达式格式错误：' + (error as Error).message);
  }
};


</script>

<style scoped>

.dialog-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 80%;
}

.content-container {
  display: flex;
  flex-direction: row;
  gap: 24px;
  flex: 1;
}

.left-section, 
.right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.action-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}

.expression-group {
  margin-bottom: 16px;
}

.input-group,
.expression-group,
.result-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.input-label,
.expression-label,
.result-label {
  font-weight: 600;
  font-size: 14px;
  color: #606266;
  margin-bottom: 6px;
}

.input-textarea :deep(.el-textarea__inner),
.result-output :deep(.el-textarea__inner) {
  height: 100%;
  font-family: Monaco, Consolas, monospace;
  font-size: 13px;
}

.expression-input :deep(.el-input__inner) {
  font-family: Monaco, Consolas, monospace;
  font-size: 13px;
}
</style>
