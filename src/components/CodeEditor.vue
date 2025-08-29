<template>
  <div class="code-editor-container">
    <!-- 工具栏 -->
    <div class="editor-toolbar">
      <div class="toolbar-left">
        <el-select 
          v-model="selectedLanguage" 
          @change="changeLanguage" 
          class="language-select"
          size="small"
        >
          <el-option 
            v-for="lang in supportedLanguages" 
            :key="lang.value" 
            :label="lang.label" 
            :value="lang.value"
          />
        </el-select>
        
        <el-upload
          :auto-upload="false"
          :show-file-list="false"
          :on-change="handleFileUpload"
          accept=".js,.ts,.json,.xml,.html,.css,.py,.txt,.md,.sql,.groovy,.java,.c,.cpp,.php,.rb,.go,.rs,.swift,.kt,.dart,.vue,.jsx,.tsx"
          class="file-upload"
        >
          <el-button size="small" icon="Upload">
            上传文件
          </el-button>
        </el-upload>
      </div>
      
      <div class="toolbar-right">
        <el-button 
          size="small" 
          icon="MagicStick" 
          @click="formatCode"
          :disabled="!canFormat"
        >
          格式化
        </el-button>
        
        <el-button 
          size="small" 
          icon="CopyDocument" 
          @click="copyCode"
        >
          复制
        </el-button>
        
        <el-button 
          size="small" 
          icon="Download" 
          @click="downloadCode"
        >
          下载
        </el-button>
        
        <el-select 
          v-model="selectedTheme" 
          @change="changeTheme" 
          class="theme-select"
          size="small"
        >
          <el-option label="浅色主题" value="light" />
          <el-option label="深色主题" value="dark" />
        </el-select>
      </div>
    </div>

    <!-- 编辑器区域 -->
    <div class="editor-wrapper">
      <div ref="editorElement" class="editor-element"></div>
    </div>

    <!-- 状态栏 -->
    <div class="editor-statusbar">
      <div class="statusbar-left">
        <span class="status-item">{{ selectedLanguage.toUpperCase() }}</span>
        <span class="status-separator">|</span>
        <span class="status-item">行: {{ cursorLine }}</span>
        <span class="status-separator">|</span>
        <span class="status-item">列: {{ cursorColumn }}</span>
      </div>
      <div class="statusbar-right">
        <span class="status-item">{{ lineCount }} 行</span>
        <span class="status-separator">|</span>
        <span class="status-item">{{ characterCount }} 字符</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, MagicStick, CopyDocument, Download } from '@element-plus/icons-vue';

// CodeMirror imports
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Extension } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { javascript } from '@codemirror/lang-javascript';
import { json } from '@codemirror/lang-json';
import { xml } from '@codemirror/lang-xml';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { python } from '@codemirror/lang-python';

// Props
interface Props {
  modelValue?: string;
  language?: string;
  theme?: string;
  placeholder?: string;
  readonly?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  language: 'javascript',
  theme: 'light',
  placeholder: '开始编写代码...',
  readonly: false
});

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string];
  'change': [value: string];
  'save': [value: string];
}>();

// 响应式数据
const editorElement = ref<HTMLElement>();
const editorView = ref<EditorView>();
const selectedLanguage = ref(props.language);
const selectedTheme = ref(props.theme);
const cursorLine = ref(1);
const cursorColumn = ref(1);
const lineCount = ref(1);
const characterCount = ref(0);

// 支持的语言列表
const supportedLanguages = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'JSON', value: 'json' },
  { label: 'XML', value: 'xml' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Python', value: 'python' },
  { label: 'Groovy', value: 'groovy' },
  { label: 'Java', value: 'java' },
  { label: 'SQL', value: 'sql' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Plain Text', value: 'text' }
];

// 计算属性
const canFormat = computed(() => {
  const formatableLanguages = ['javascript', 'typescript', 'json', 'html', 'css', 'xml'];
  return formatableLanguages.includes(selectedLanguage.value);
});

// 获取语言扩展
const getLanguageExtension = (language: string): Extension[] => {
  switch (language) {
    case 'javascript':
    case 'typescript':
      return [javascript()];
    case 'json':
      return [json()];
    case 'xml':
      return [xml()];
    case 'html':
      return [html()];
    case 'css':
      return [css()];
    case 'python':
      return [python()];
    default:
      return [];
  }
};

// 获取主题扩展
const getThemeExtension = (theme: string): Extension[] => {
  return theme === 'dark' ? [oneDark] : [];
};

// 创建编辑器扩展
const createExtensions = (): Extension[] => {
  const extensions = [
    basicSetup,
    ...getLanguageExtension(selectedLanguage.value),
    ...getThemeExtension(selectedTheme.value),
    EditorView.updateListener.of((update) => {
      if (update.docChanged) {
        const content = update.state.doc.toString();
        emit('update:modelValue', content);
        emit('change', content);
        updateStatistics(content);
      }
      
      if (update.selectionSet) {
        updateCursorPosition(update.state);
      }
    })
  ];

  return extensions;
};

// 初始化编辑器
const initEditor = () => {
  if (!editorElement.value) return;

  const startState = EditorState.create({
    doc: props.modelValue,
    extensions: createExtensions()
  });

  editorView.value = new EditorView({
    state: startState,
    parent: editorElement.value
  });

  // 初始化统计信息
  updateStatistics(props.modelValue);
  updateCursorPosition(startState);
};

// 更新统计信息
const updateStatistics = (content: string) => {
  lineCount.value = content.split('\n').length;
  characterCount.value = content.length;
};

// 更新光标位置
const updateCursorPosition = (state: EditorState) => {
  const pos = state.selection.main.head;
  const line = state.doc.lineAt(pos);
  cursorLine.value = line.number;
  cursorColumn.value = pos - line.from + 1;
};

// 切换语言
const changeLanguage = () => {
  if (!editorView.value) return;
  
  const currentContent = editorView.value.state.doc.toString();
  
  // 重新创建编辑器状态
  const newState = EditorState.create({
    doc: currentContent,
    extensions: createExtensions()
  });
  
  editorView.value.setState(newState);
};

// 切换主题
const changeTheme = () => {
  if (!editorView.value) return;
  
  const currentContent = editorView.value.state.doc.toString();
  
  // 重新创建编辑器状态
  const newState = EditorState.create({
    doc: currentContent,
    extensions: createExtensions()
  });
  
  editorView.value.setState(newState);
};

// 格式化代码
const formatCode = () => {
  if (!editorView.value || !canFormat.value) return;
  
  try {
    const content = editorView.value.state.doc.toString();
    let formattedContent = content;
    
    // 简单的格式化逻辑，可以根据需要扩展
    if (selectedLanguage.value === 'json') {
      try {
        const parsed = JSON.parse(content);
        formattedContent = JSON.stringify(parsed, null, 2);
      } catch (e) {
        ElMessage.warning('JSON 格式无效，无法格式化');
        return;
      }
    }
    
    // 更新编辑器内容
    editorView.value.dispatch({
      changes: {
        from: 0,
        to: editorView.value.state.doc.length,
        insert: formattedContent
      }
    });
    
    ElMessage.success('代码格式化完成');
  } catch (error) {
    ElMessage.error('格式化失败');
  }
};

// 复制代码
const copyCode = async () => {
  if (!editorView.value) return;
  
  try {
    const content = editorView.value.state.doc.toString();
    await navigator.clipboard.writeText(content);
    ElMessage.success('代码已复制到剪贴板');
  } catch (error) {
    ElMessage.error('复制失败');
  }
};

// 下载代码
const downloadCode = () => {
  if (!editorView.value) return;
  
  const content = editorView.value.state.doc.toString();
  const fileName = `code.${getFileExtension(selectedLanguage.value)}`;
  
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
  ElMessage.success('文件下载完成');
};

// 获取文件扩展名
const getFileExtension = (language: string): string => {
  const extensions: Record<string, string> = {
    javascript: 'js',
    typescript: 'ts',
    json: 'json',
    xml: 'xml',
    html: 'html',
    css: 'css',
    python: 'py',
    groovy: 'groovy',
    java: 'java',
    sql: 'sql',
    markdown: 'md',
    text: 'txt'
  };
  
  return extensions[language] || 'txt';
};

// 处理文件上传
const handleFileUpload = async (file: any) => {
  if (!file.raw) return;
  
  try {
    const content = await readFileAsText(file.raw);
    
    // 根据文件扩展名推断语言
    const fileName = file.raw.name;
    const extension = fileName.split('.').pop()?.toLowerCase();
    const detectedLanguage = detectLanguageFromExtension(extension || '');
    
    if (detectedLanguage) {
      selectedLanguage.value = detectedLanguage;
    }
    
    // 更新编辑器内容
    if (editorView.value) {
      const newState = EditorState.create({
        doc: content,
        extensions: createExtensions()
      });
      
      editorView.value.setState(newState);
      emit('update:modelValue', content);
      emit('change', content);
    }
    
    ElMessage.success(`文件 "${fileName}" 加载完成`);
  } catch (error) {
    ElMessage.error('文件读取失败');
  }
};

// 读取文件内容
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };
    reader.readAsText(file, 'UTF-8');
  });
};

// 根据文件扩展名检测语言
const detectLanguageFromExtension = (extension: string): string | null => {
  const languageMap: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    json: 'json',
    xml: 'xml',
    html: 'html',
    htm: 'html',
    css: 'css',
    py: 'python',
    groovy: 'groovy',
    java: 'java',
    sql: 'sql',
    md: 'markdown',
    txt: 'text',
    vue: 'html',
    jsx: 'javascript',
    tsx: 'typescript'
  };
  
  return languageMap[extension] || null;
};

// 设置编辑器内容
const setValue = (value: string) => {
  if (!editorView.value) return;
  
  editorView.value.dispatch({
    changes: {
      from: 0,
      to: editorView.value.state.doc.length,
      insert: value
    }
  });
};

// 获取编辑器内容
const getValue = (): string => {
  return editorView.value?.state.doc.toString() || '';
};

// 监听 props 变化
watch(() => props.modelValue, (newValue) => {
  if (editorView.value && newValue !== getValue()) {
    setValue(newValue);
  }
});

watch(() => props.language, (newLanguage) => {
  selectedLanguage.value = newLanguage;
  changeLanguage();
});

watch(() => props.theme, (newTheme) => {
  selectedTheme.value = newTheme;
  changeTheme();
});

// 暴露方法
defineExpose({
  setValue,
  getValue,
  formatCode,
  copyCode,
  downloadCode
});

// 生命周期
onMounted(() => {
  initEditor();
});

onBeforeUnmount(() => {
  if (editorView.value) {
    editorView.value.destroy();
  }
});
</script>

<style scoped>
.code-editor-container {
  height: 100%;
  display: flex;
  flex-direction: column;
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  overflow: hidden;
  background: white;
}

.editor-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  flex-shrink: 0;
}

.toolbar-left,
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.language-select,
.theme-select {
  width: 120px;
}

.file-upload :deep(.el-upload) {
  display: inline-block;
}

.editor-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
}

.editor-element {
  height: 100%;
}

.editor-element :deep(.cm-editor) {
  height: 100%;
  outline: none;
}

.editor-element :deep(.cm-focused) {
  outline: none;
  border: none;
  box-shadow: none;
}

.editor-element :deep(.cm-content) {
  min-height: 200px;
  font-size: 14px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
}

.editor-element :deep(.cm-line) {
  line-height: 1.6;
}

.editor-statusbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 12px;
  background: #f0f2f5;
  border-top: 1px solid #e4e7ed;
  font-size: 12px;
  color: #606266;
  flex-shrink: 0;
}

.statusbar-left,
.statusbar-right {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-item {
  font-weight: 500;
}

.status-separator {
  color: #c0c4cc;
  margin: 0 4px;
}

/* 深色主题适配 */
.code-editor-container.dark {
  background: #1e1e1e;
  border-color: #3a3a3a;
}

.code-editor-container.dark .editor-toolbar {
  background: #2d2d30;
  border-bottom-color: #3a3a3a;
}

.code-editor-container.dark .editor-statusbar {
  background: #2d2d30;
  border-top-color: #3a3a3a;
  color: #cccccc;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .editor-toolbar {
    flex-direction: column;
    gap: 8px;
    padding: 12px;
  }
  
  .toolbar-left,
  .toolbar-right {
    width: 100%;
    justify-content: center;
  }
  
  .language-select,
  .theme-select {
    width: 100px;
  }
  
  .editor-statusbar {
    flex-direction: column;
    gap: 4px;
    text-align: center;
  }
  
  .statusbar-left,
  .statusbar-right {
    justify-content: center;
  }
}
</style>
