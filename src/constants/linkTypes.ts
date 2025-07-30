export const LINK_TYPE_OPTIONS = [
  { label: '未知', value: 0 },
  { label: '网页', value: 1 },
  { label: 'CSS', value: 2 },
  { label: 'JavaScript', value: 3 },
  { label: '图片', value: 4 },
  { label: '文档', value: 5 },
  { label: '字体', value: 6 },
  { label: '视频', value: 7 },
  { label: '压缩包', value: 8 },
  { label: '数据', value: 9 }
];

export const LINK_TYPE_MAP: Record<number, string> = {
  0: '未知',
  1: '网页',
  2: 'CSS',
  3: 'JavaScript',
  4: '图片',
  5: '文档',
  6: '字体',
  7: '视频',
  8: '压缩包',
  9: '数据'
}; 