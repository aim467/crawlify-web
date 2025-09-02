import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { templateConfigApi } from '../api/templateConfig';
import type { TemplateConfig } from '../types/templateConfig';
import { usePagination } from './usePagination';
import { useFormDialog } from './useFormDialog';

const initialTemplateForm: TemplateConfig = {
  configName: '',
  columnUrl: '',
  requestType: 'GET',
  requestBody: '',
  pageStart: 1,
  pageLen: 1,
  nextPage: '',
  requestHead: {},
  resultType: 'json',
  resultClean: '',
  resultListRule: '',
  parentLink: '',
  fieldRules: [],
  useScript: 0,
};

export function useTemplateConfig() {
  const loading = ref(false);
  const tableData = ref<TemplateConfig[]>([]);
  const searchFormRef = ref<FormInstance>();
  const searchForm = reactive({
    configName: '',
  });

  // 分页逻辑
  const { pagination, handleSizeChange, handleCurrentChange, updateFromResponse, reset: resetPagination } = usePagination();

  // 表单弹窗逻辑
  const templateFormDialog = useFormDialog(initialTemplateForm, () => {
    requestHeadersText.value = '';
  });

  // 查看弹窗
  const viewDialogVisible = ref(false);
  const viewTemplate = ref<TemplateConfig>({
    configName: '',
    columnUrl: '',
    requestType: '',
    pageStart: 0,
    pageLen: 0,
    resultType: '',
    useScript: 0
  });

  // 请求头处理
  const requestHeadersText = ref('');

  // 获取数据
  const fetchData = async () => {
    try {
      loading.value = true;
      const { data } = await templateConfigApi.list({
        page: pagination.currentPage,
        size: pagination.pageSize,
        configName: searchForm.configName || undefined,
      });
      
      if (data?.records) {
        tableData.value = data.records;
        updateFromResponse(data);
      }
    } catch (error) {
      ElMessage.error('获取模板配置列表失败');
    } finally {
      loading.value = false;
    }
  };

  // 搜索
  const handleSearch = () => {
    pagination.currentPage = 1;
    fetchData();
  };

  // 重置搜索
  const handleReset = () => {
    searchFormRef.value?.resetFields();
    pagination.currentPage = 1;
    fetchData();
  };

  // 刷新
  const handleRefresh = () => {
    fetchData();
  };

  // 新增
  const handleAdd = () => {
    templateFormDialog.open();
  };

  // 编辑
  const handleEdit = async (row: TemplateConfig) => {
    try {
      const { data } = await templateConfigApi.getById(row.configId!);
      
      // 设置请求头文本
      if (data.requestHead && Object.keys(data.requestHead).length > 0) {
        requestHeadersText.value = JSON.stringify(data.requestHead, null, 2);
      } else {
        requestHeadersText.value = '';
      }
      
      templateFormDialog.open(data);
    } catch (error) {
      ElMessage.error('获取模板配置详情失败');
    }
  };

  // 复制
  const handleCopy = async (row: TemplateConfig) => {
    try {
      const { data } = await templateConfigApi.getById(row.configId!);
      const copyData = { 
        ...data, 
        configId: undefined,
        configName: `${data.configName}_副本`
      };
      
      // 设置请求头文本
      if (data.requestHead && Object.keys(data.requestHead).length > 0) {
        requestHeadersText.value = JSON.stringify(data.requestHead, null, 2);
      } else {
        requestHeadersText.value = '';
      }
      
      templateFormDialog.open(copyData);
      
      ElMessage({
        message: '正在复制模板配置，请修改必要信息后保存',
        type: 'warning',
        duration: 5000,
        showClose: true
      });
    } catch (error) {
      ElMessage.error('复制模板配置失败');
    }
  };

  // 查看
  const handleView = async (row: TemplateConfig) => {
    try {
      const { data } = await templateConfigApi.getById(row.configId!);
      viewTemplate.value = data;
      viewDialogVisible.value = true;
    } catch (error) {
      ElMessage.error('获取模板配置详情失败');
    }
  };

  // 删除
  const handleDelete = (row: TemplateConfig) => {
    ElMessageBox.confirm('确认删除该模板配置吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await templateConfigApi.delete(row.configId!);
        ElMessage.success('删除成功');
        fetchData();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    }).catch(() => {});
  };

  // 解析请求头JSON文本
  const parseRequestHeaders = () => {
    if (!requestHeadersText.value.trim()) {
      templateFormDialog.form.requestHead = {};
      return;
    }
    
    try {
      const parsed = JSON.parse(requestHeadersText.value);
      templateFormDialog.form.requestHead = parsed;
    } catch (error) {
      ElMessage.warning('请求头JSON格式不正确，请检查语法');
    }
  };

  // 移除请求头
  const removeHeader = (key: string) => {
    if (templateFormDialog.form.requestHead) {
      delete templateFormDialog.form.requestHead[key];
      // 更新文本框内容
      requestHeadersText.value = JSON.stringify(templateFormDialog.form.requestHead, null, 2);
    }
  };

  // 添加字段规则
  const addFieldRule = () => {
    if (!templateFormDialog.form.fieldRules) {
      templateFormDialog.form.fieldRules = [];
    }
    templateFormDialog.form.fieldRules.push({
      name: '',
      rule: '',
      desc: ''
    });
  };

  // 移除字段规则
  const removeFieldRule = (index: number) => {
    if (templateFormDialog.form.fieldRules) {
      templateFormDialog.form.fieldRules.splice(index, 1);
    }
  };

  // 提交表单
  const submitTemplateForm = async () => {
    const success = await templateFormDialog.submit(async (formData) => {
      // 解析最新的请求头
      parseRequestHeaders();
      
      if (templateFormDialog.isEditMode.value) {
        await templateConfigApi.update(formData);
        ElMessage.success('更新成功');
      } else {
        await templateConfigApi.create(formData);
        ElMessage.success('创建成功');
      }
    });

    if (success) {
      fetchData();
    }
  };

  // 分页处理
  const handlePageSizeChange = (val: number) => {
    handleSizeChange(val);
    fetchData();
  };

  const handlePageCurrentChange = (val: number) => {
    handleCurrentChange(val);
    fetchData();
  };

  return {
    // 状态
    loading,
    tableData,
    searchForm,
    searchFormRef,
    pagination,
    
    // 表单弹窗
    templateFormDialog,
    requestHeadersText,
    
    // 查看弹窗
    viewDialogVisible,
    viewTemplate,
    
    // 方法
    fetchData,
    handleSearch,
    handleReset,
    handleRefresh,
    handleAdd,
    handleEdit,
    handleCopy,
    handleView,
    handleDelete,
    parseRequestHeaders,
    removeHeader,
    addFieldRule,
    removeFieldRule,
    submitTemplateForm,
    handlePageSizeChange,
    handlePageCurrentChange,
  };
}
