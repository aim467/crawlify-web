import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { templateTaskApi } from '../api/templateTask';
import type { TemplateTask } from '../types/templateTask';
import type { TemplateConfig } from '../types/templateConfig';
import { usePagination } from './usePagination';
import { useFormDialog } from './useFormDialog';

const initialTaskForm: TemplateTask = {
  configId: '',
  status: '2', // 默认停止状态
  pid: undefined,
};

export function useTemplateTask() {
  const loading = ref(false);
  const tableData = ref<TemplateTask[]>([]);
  const searchFormRef = ref<FormInstance>();
  const configOptions = ref<TemplateConfig[]>([]);
  
  const searchForm = reactive({
    taskId: '',
    configId: '',
    status: '',
  });

  // 分页逻辑
  const { 
    pagination, 
    handleSizeChange, 
    handleCurrentChange, 
    updateFromResponse, 
    reset: resetPagination 
  } = usePagination();

  // 表单弹窗逻辑
  const taskFormDialog = useFormDialog(initialTaskForm);

  // 查看弹窗
  const viewDialogVisible = ref(false);
  const viewTask = ref<TemplateTask>({
    configId: '',
    status: '2'
  });

  // 获取数据
  const fetchData = async () => {
    try {
      loading.value = true;
      const { data } = await templateTaskApi.list({
        page: pagination.currentPage,
        size: pagination.pageSize,
        taskId: searchForm.taskId || undefined,
        configId: searchForm.configId || undefined,
        status: searchForm.status || undefined,
      });
      
      if (data?.records) {
        // 关联配置名称
        const configMap = new Map(configOptions.value.map(config => [config.configId, config.configName]));
        tableData.value = data.records.map((task: TemplateTask) => ({
          ...task,
          configName: configMap.get(task.configId) || '未知配置'
        }));
        updateFromResponse(data);
      }
    } catch (error) {
      ElMessage.error('获取任务列表失败');
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

  // 新增任务
  const handleAdd = () => {
    taskFormDialog.open();
  };

  // 编辑任务
  const handleEdit = async (row: TemplateTask) => {
    try {
      const { data } = await templateTaskApi.getById(row.taskId!);
      taskFormDialog.open(data);
    } catch (error) {
      ElMessage.error('获取任务详情失败');
    }
  };

  // 查看任务
  const handleView = async (row: TemplateTask) => {
    try {
      const { data } = await templateTaskApi.getById(row.taskId!);
      // 关联配置名称
      const config = configOptions.value.find(c => c.configId === data.configId);
      viewTask.value = {
        ...data,
        configName: config?.configName || '未知配置'
      };
      viewDialogVisible.value = true;
    } catch (error) {
      ElMessage.error('获取任务详情失败');
    }
  };

  // 删除任务
  const handleDelete = (row: TemplateTask) => {
    if (row.status === '1') {
      ElMessage.warning('运行中的任务无法删除，请先停止任务');
      return;
    }
    
    ElMessageBox.confirm('确认删除该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await templateTaskApi.delete(row.taskId!);
        ElMessage.success('删除成功');
        fetchData();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    }).catch(() => {});
  };

  // 启动任务
  const handleStart = async (row: TemplateTask) => {
    try {
      await templateTaskApi.start(row.taskId!);
      ElMessage.success('任务启动成功');
      fetchData();
    } catch (error) {
      ElMessage.error('任务启动失败');
    }
  };

  // 停止任务
  const handleStop = async (row: TemplateTask) => {
    ElMessageBox.confirm('确认停止该任务吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }).then(async () => {
      try {
        await templateTaskApi.stop(row.taskId!);
        ElMessage.success('任务已停止');
        fetchData();
      } catch (error) {
        ElMessage.error('停止任务失败');
      }
    }).catch(() => {});
  };

  // 重新启动任务
  const handleRestart = async (row: TemplateTask) => {
    try {
      await templateTaskApi.restart(row.taskId!);
      ElMessage.success('任务重新启动成功');
      fetchData();
    } catch (error) {
      ElMessage.error('重新启动任务失败');
    }
  };

  // 提交表单
  const submitTaskForm = async () => {
    const success = await taskFormDialog.submit(async (formData) => {
      if (taskFormDialog.isEditMode.value) {
        await templateTaskApi.update(formData);
        ElMessage.success('更新成功');
      } else {
        await templateTaskApi.create(formData);
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

  // 设置配置选项
  const setConfigOptions = (options: TemplateConfig[]) => {
    configOptions.value = options;
  };

  return {
    // 状态
    loading,
    tableData,
    searchForm,
    searchFormRef,
    pagination,
    configOptions,
    
    // 表单弹窗
    taskFormDialog,
    
    // 查看弹窗
    viewDialogVisible,
    viewTask,
    
    // 方法
    fetchData,
    handleSearch,
    handleReset,
    handleRefresh,
    handleAdd,
    handleEdit,
    handleView,
    handleDelete,
    handleStart,
    handleStop,
    handleRestart,
    submitTaskForm,
    handlePageSizeChange,
    handlePageCurrentChange,
    setConfigOptions,
  };
}
