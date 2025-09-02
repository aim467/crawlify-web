import type { FormRules } from 'element-plus';

// 模板配置表单验证规则
export const templateConfigFormRules: FormRules = {
  configName: [
    { required: true, message: '请输入配置名称', trigger: 'blur' },
    { min: 2, max: 100, message: '配置名称长度在 2 到 100 个字符', trigger: 'blur' }
  ],
  columnUrl: [
    { required: true, message: '请输入基础URL', trigger: 'blur' },
    { type: 'url', message: '请输入有效的URL格式', trigger: 'blur' }
  ],
  requestType: [
    { required: true, message: '请选择请求类型', trigger: 'change' }
  ],
  pageStart: [
    { required: true, message: '请输入起始页码', trigger: 'blur' },
    { type: 'number', min: 0, message: '起始页码不能小于0', trigger: 'blur' }
  ],
  pageLen: [
    { required: true, message: '请输入最大页数', trigger: 'blur' },
    { type: 'number', min: 1, message: '最大页数不能小于1', trigger: 'blur' }
  ],
  resultType: [
    { required: true, message: '请选择结果类型', trigger: 'change' }
  ],
  useScript: [
    { required: true, message: '请选择是否使用脚本', trigger: 'change' }
  ]
};

// 模板任务表单验证规则
export const templateTaskFormRules: FormRules = {
  configId: [
    { required: true, message: '请选择关联配置', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择任务状态', trigger: 'change' }
  ]
};
