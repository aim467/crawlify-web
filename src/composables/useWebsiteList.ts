import { ref, reactive } from 'vue';
import type { FormInstance } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { Website } from '../types/website';
import { websiteApi } from '../api/website';
import { convertToString } from '../utils/httpConfigUtils';

export interface SearchForm {
  name: string;
  baseUrl: string;
  domain: string;
  charset: string;
  timeOut: number | null;
  retryTimes: number | null;
  cycleRetryTimes: number | null;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  total: number;
}

export const useWebsiteList = () => {
  const loading = ref(false);
  const tableData = ref<Website[]>([]);
  
  const searchForm = reactive<SearchForm>({
    name: '',
    baseUrl: '',
    domain: '',
    charset: '',
    timeOut: null,
    retryTimes: null,
    cycleRetryTimes: null
  });
  
  const pagination = reactive<Pagination>({
    currentPage: 1,
    pageSize: 10,
    total: 0
  });

  const fetchData = async () => {
    try {
      loading.value = true;
      const { data } = await websiteApi.list({
        page: pagination.currentPage,
        size: pagination.pageSize,
        name: searchForm.name,
        baseUrl: searchForm.baseUrl,
        domain: searchForm.domain
      });
      
      tableData.value = data.records.map(record => ({
        ...record,
        headers: convertToString(record.headers, ': '),
        cookies: convertToString(record.cookies, '='),
        timeOut: record.timeOut ? record.timeOut / 1000 : undefined
      }));
      pagination.total = data.total;
    } catch (error) {
      ElMessage.error('获取网站列表失败');
    } finally {
      loading.value = false;
    }
  };

  const handleSearch = () => {
    pagination.currentPage = 1;
    fetchData();
  };

  const handleReset = (searchFormRef?: FormInstance) => {
    searchFormRef?.resetFields();
    pagination.currentPage = 1;
    fetchData();
  };

  const handleDelete = async (row: Website) => {
    try {
      await ElMessageBox.confirm(`确定要删除网站 '${row.name}' 吗?`, '警告', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning',
      });
      
      await websiteApi.delete(row.id);
      ElMessage.success('删除成功');
      fetchData();
    } catch (error) {
      if (error !== 'cancel') {
        ElMessage.error('删除网站失败');
      }
    }
  };

  const handleSizeChange = (val: number) => {
    pagination.pageSize = val;
    pagination.currentPage = 1;
    fetchData();
  };

  const handleCurrentChange = (val: number) => {
    pagination.currentPage = val;
    fetchData();
  };

  return {
    loading,
    tableData,
    searchForm,
    pagination,
    fetchData,
    handleSearch,
    handleReset,
    handleDelete,
    handleSizeChange,
    handleCurrentChange
  };
}; 