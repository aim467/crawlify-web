import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import type { HttpConfigItem } from '../utils/httpConfigUtils';
import { textToTableData, tableDataToText, generateConfigId } from '../utils/httpConfigUtils';

export const useHttpConfig = () => {
  const httpConfigMode = ref<'text' | 'table'>('text');
  const headersTableData = ref<HttpConfigItem[]>([]);
  const cookiesTableData = ref<HttpConfigItem[]>([]);
  const importDialogVisible = ref(false);
  const importType = ref<'headers' | 'cookies'>('headers');
  const importText = ref('');

  const switchHttpConfigMode = (mode: 'text' | 'table', headersText: string, cookiesText: string) => {
    if (mode === 'table' && httpConfigMode.value === 'text') {
      // 从文本模式切换到表格模式，转换数据
      const convertedHeaders = textToTableData(headersText, ': ');
      const convertedCookies = textToTableData(cookiesText, '=');
      
      // 如果没有数据，添加一些示例行
      headersTableData.value = convertedHeaders.length > 0 ? convertedHeaders : [
        { id: generateConfigId(), key: '', value: '' }
      ];
      cookiesTableData.value = convertedCookies.length > 0 ? convertedCookies : [
        { id: generateConfigId(), key: '', value: '' }
      ];
    }
    httpConfigMode.value = mode;
  };

  const addTableRow = (type: 'headers' | 'cookies') => {
    const newRow: HttpConfigItem = {
      id: generateConfigId(),
      key: '',
      value: ''
    };
    if (type === 'headers') {
      headersTableData.value.push(newRow);
    } else {
      cookiesTableData.value.push(newRow);
    }
  };

  const removeTableRow = (type: 'headers' | 'cookies', id: string) => {
    if (type === 'headers') {
      headersTableData.value = headersTableData.value.filter(item => item.id !== id);
    } else {
      cookiesTableData.value = cookiesTableData.value.filter(item => item.id !== id);
    }
  };

  const handleImport = (type: 'headers' | 'cookies') => {
    importType.value = type;
    importText.value = '';
    importDialogVisible.value = true;
  };

  const confirmImport = () => {
    if (!importText.value.trim()) {
      ElMessage.warning('请输入要导入的内容');
      return;
    }
    
    const separator = importType.value === 'headers' ? ':' : '=';
    const importedData = textToTableData(importText.value, separator);
    
    if (importType.value === 'headers') {
      // 合并数据，避免重复的key
      const existingMap = new Map(headersTableData.value.map(item => [item.key, item]));
      importedData.forEach(item => {
        existingMap.set(item.key, item);
      });
      headersTableData.value = Array.from(existingMap.values());
    } else {
      // 合并数据，避免重复的key
      const existingMap = new Map(cookiesTableData.value.map(item => [item.key, item]));
      importedData.forEach(item => {
        existingMap.set(item.key, item);
      });
      cookiesTableData.value = Array.from(existingMap.values());
    }
    
    ElMessage.success(`成功导入 ${importedData.length} 条${importType.value === 'headers' ? '请求头' : 'Cookie'}记录`);
    importDialogVisible.value = false;
  };

  // 计算属性：将表格数据转换为文本
  const headersText = computed(() => tableDataToText(headersTableData.value, ': '));
  const cookiesText = computed(() => tableDataToText(cookiesTableData.value, '='));

  return {
    httpConfigMode,
    headersTableData,
    cookiesTableData,
    importDialogVisible,
    importType,
    importText,
    headersText,
    cookiesText,
    switchHttpConfigMode,
    addTableRow,
    removeTableRow,
    handleImport,
    confirmImport
  };
}; 