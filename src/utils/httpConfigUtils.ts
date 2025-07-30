export interface HttpConfigItem {
  id: string;
  key: string;
  value: string;
}

/**
 * 将文本格式转换为表格数据
 * 使用 Map 存储数据，相同的 key 会被覆盖
 */
export const textToTableData = (text: string, separator: string): HttpConfigItem[] => {
  if (!text) return [];
  
  const dataMap = new Map<string, string>();
  
  text.split('\n')
    .filter(line => line.trim())
    .forEach(line => {
      const separatorIndex = line.indexOf(separator);
      if (separatorIndex === -1) {
        const key = line.trim();
        if (key) {
          dataMap.set(key, '');
        }
      } else {
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + separator.length).trim();
        if (key) {
          dataMap.set(key, value);
        }
      }
    });
  
  // 将 Map 转换为数组格式
  return Array.from(dataMap.entries()).map(([key, value], index) => ({
    id: `${Date.now()}-${index}`,
    key,
    value
  }));
};

/**
 * 将表格数据转换为文本格式
 */
export const tableDataToText = (tableData: HttpConfigItem[], separator: string): string => {
  return tableData
    .filter(item => item.key.trim())
    .map(item => `${item.key}${separator} ${item.value}`)
    .join('\n');
};

/**
 * 将字符串格式转换为对象格式
 * 使用 Map 存储数据，相同的 key 会被覆盖
 */
export const convertToObject = (str: string | undefined, separator: string): Record<string, string> => {
  if (!str) return {};
  
  const dataMap = new Map<string, string>();
  
  str.split('\n')
    .filter(line => line.trim())
    .forEach(line => {
      const separatorIndex = line.indexOf(separator);
      if (separatorIndex === -1) {
        const key = line.trim();
        if (key) {
          dataMap.set(key, '');
        }
      } else {
        const key = line.substring(0, separatorIndex).trim();
        const value = line.substring(separatorIndex + separator.length).trim();
        if (key) {
          dataMap.set(key, value);
        }
      }
    });
  
  // 将 Map 转换为对象格式
  return Object.fromEntries(dataMap);
};

/**
 * 将对象格式转换为字符串格式
 */
export const convertToString = (obj: Record<string, string> | string | undefined, separator: string): string => {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return Object.entries(obj)
    .map(([key, value]) => `${key}${separator}${value}`)
    .join('\n');
};

/**
 * 生成新的配置项ID
 */
export const generateConfigId = (): string => {
  return `${Date.now()}-${Math.random()}`;
}; 