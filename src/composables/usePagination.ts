import { reactive } from 'vue';

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  total: number;
}

export interface PaginationConfig {
  defaultPageSize?: number;
  pageSizes?: number[];
}

export function usePagination(config: PaginationConfig = {}) {
  const {
    defaultPageSize = 10,
    pageSizes = [10, 20, 50, 100]
  } = config;

  const pagination = reactive<PaginationState>({
    currentPage: 1,
    pageSize: defaultPageSize,
    total: 0,
  });

  const reset = () => {
    pagination.currentPage = 1;
    pagination.total = 0;
  };

  const handleSizeChange = (newSize: number) => {
    pagination.pageSize = newSize;
    pagination.currentPage = 1;
  };

  const handleCurrentChange = (newPage: number) => {
    pagination.currentPage = newPage;
  };

  const updateFromResponse = (responseData: any) => {
    if (responseData) {
      pagination.total = responseData.total || 0;
      pagination.pageSize = responseData.size || defaultPageSize;
      pagination.currentPage = responseData.current || 1;
    }
  };

  return {
    pagination,
    pageSizes,
    reset,
    handleSizeChange,
    handleCurrentChange,
    updateFromResponse,
  };
}
