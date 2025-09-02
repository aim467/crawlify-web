<template>
  <div class="template-management-container">
    <!-- Tab 导航 -->
    <el-card shadow="never" class="tab-card">
      <el-tabs v-model="activeTab" class="template-tabs" @tab-change="handleTabChange">
        <el-tab-pane label="模板配置" name="config">
          <template #label>
            <div class="tab-label">
              <el-icon><Setting /></el-icon>
              <span>模板配置</span>
            </div>
          </template>
        </el-tab-pane>
        <el-tab-pane label="模板任务" name="task">
          <template #label>
            <div class="tab-label">
              <el-icon><Timer /></el-icon>
              <span>模板任务</span>
            </div>
          </template>
        </el-tab-pane>
      </el-tabs>
    </el-card>

    <!-- 模板配置页面 -->
    <div v-show="activeTab === 'config'" class="tab-content">
      <!-- 搜索表单 -->
      <el-card shadow="never" class="search-card">
      <el-form :model="searchForm" ref="searchFormRef" inline label-position="left" label-width="auto">
        <el-form-item label="配置名称:" prop="configName">
          <el-input
            v-model="searchForm.configName"
            placeholder="请输入配置名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button @click="handleReset">重置</el-button>
          <el-button
            type="primary"
            icon="Search"
            @click="handleSearch"
            :loading="loading"
          >
            查询
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <!-- 表格操作头部 -->
      <div class="table-header">
        <div class="table-title">
          模板配置列表
        </div>
        <div class="table-actions">
          <el-button type="primary" icon="Plus" @click="handleAdd">新增模板</el-button>
          <el-button icon="Refresh" circle @click="handleRefresh" />
        </div>
      </div>

      <!-- 表格 -->
              <el-table 
          :data="tableData" 
          style="width: 100%" 
          v-loading="loading" 
          border 
          :height="configTableHeight"
        >
        <el-table-column prop="configId" label="配置ID" width="200" align="center" fixed />
        <el-table-column prop="configName" label="配置名称" min-width="180" fixed />
        <el-table-column prop="columnUrl" label="基础URL" min-width="250" show-overflow-tooltip />
        <el-table-column prop="requestType" label="请求类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getRequestTypeTag(row.requestType)">
              {{ row.requestType || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="resultType" label="结果类型" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getResultTypeTag(row.resultType)">
              {{ row.resultType || '未知' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="pageStart" label="起始页" width="100" align="center" />
        <el-table-column prop="pageLen" label="最大页数" width="100" align="center" />
        <el-table-column prop="useScript" label="使用脚本" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="row.useScript === 1 ? 'success' : 'info'" size="small">
              {{ row.useScript === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" min-width="180" />
        <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
        <el-table-column label="操作" width="250" align="center" fixed="right">
          <template #default="{ row }">
            <el-tooltip content="编辑" placement="top">
              <el-button link type="primary" icon="Edit" @click="handleEdit(row)" />
            </el-tooltip>
            <el-tooltip content="代码编辑" placement="top">
              <el-button link type="warning" icon="DocumentCopy" @click="handleCodeEdit(row)" />
            </el-tooltip>
            <el-tooltip content="复制" placement="top">
              <el-button link type="success" icon="CopyDocument" @click="handleCopy(row)" />
            </el-tooltip>
            <el-tooltip content="查看" placement="top">
              <el-button link type="info" icon="View" @click="handleView(row)" />
            </el-tooltip>
            <el-tooltip content="删除" placement="top">
              <el-button link type="danger" icon="Delete" @click="handleDelete(row)" />
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination 
          :current-page="pagination.currentPage" 
          :page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]" 
          :total="pagination.total" 
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange" 
          @current-change="handleCurrentChange" 
        />
      </div>
    </el-card>

    <!-- 模板配置表单抽屉 -->
    <el-drawer
      v-model="dialogVisible"
      :title="isEditMode ? '编辑模板配置' : '新增模板配置'"
      direction="rtl"
      :size="drawerSize"
      :close-on-click-modal="false"
      class="template-drawer"
      destroy-on-close
    >
      <div class="drawer-content">
        <!-- 导入命令区域 -->
        <div class="import-section" v-if="!isEditMode">
          <h3>快速导入</h3>
          <p class="section-desc">支持 curl 或 fetch 命令一键导入配置</p>
          <el-input
            v-model="importCommand"
            type="textarea"
            :rows="4"
            placeholder="请输入curl或fetch命令，例如: curl -X GET 'https://example.com/api' -H 'Content-Type: application/json'"
            class="import-input"
          />
          <el-button type="primary" class="import-btn" @click="handleImport">
            <el-icon><Upload /></el-icon>
            导入配置
          </el-button>
        </div>

        <!-- 表单区域 -->
        <div class="form-content">
          <el-form :model="templateForm" :rules="formRules" ref="templateFormRef" label-width="120px">
        <!-- 基础配置区域 -->
        <el-card shadow="never" class="form-section-card">
          <template #header>
            <div class="section-header">
              <i class="el-icon-setting"></i>
              <span>基础配置</span>
            </div>
          </template>
          
          <el-row :gutter="24">
            <el-col :span="8">
              <el-form-item label="配置名称" prop="configName">
                <el-input 
                  v-model="templateForm.configName" 
                  placeholder="请输入配置名称" 
                  maxlength="100"
                  show-word-limit
                />
              </el-form-item>
            </el-col>
            <el-col :span="16">
              <el-form-item label="基础URL" prop="columnUrl">
                <el-input 
                  v-model="templateForm.columnUrl" 
                  placeholder="请输入基础URL，例如：https://api.example.com/data"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="20">
            <el-col :span="8">
              <el-form-item label="请求类型" prop="requestType">
                <el-select v-model="templateForm.requestType" placeholder="请选择请求类型" style="width: 100%">
                  <el-option 
                    v-for="item in REQUEST_TYPES" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="起始页码" prop="pageStart">
                <el-input-number 
                  v-model="templateForm.pageStart" 
                  :min="0" 
                  :max="999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
            <el-col :span="8">
              <el-form-item label="最大页数" prop="pageLen">
                <el-input-number 
                  v-model="templateForm.pageLen" 
                  :min="1" 
                  :max="9999"
                  style="width: 100%"
                />
              </el-form-item>
            </el-col>
          </el-row>

          <el-row :gutter="24">
            <el-col :span="14">
              <el-form-item label="下一页URL模板" prop="nextPage">
                <el-input 
                  v-model="templateForm.nextPage" 
                  placeholder="包含 &lt;pageNum&gt; 占位符的URL模板，例如：https://api.example.com/data?page=&lt;pageNum&gt;"
                />
                <div class="form-tip">
                  <i class="el-icon-info"></i>
                  使用 &lt;pageNum&gt; 作为页码占位符，主要用于GET请求的分页
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="10">
              <el-form-item label="父页面链接" prop="parentLink">
                <el-input 
                  v-model="templateForm.parentLink" 
                  placeholder="请输入父页面链接"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <!-- 增加一个，useScript 0/否 1/是 下拉框 -->
          <el-row>
            <el-col :span="12">
              <el-form-item label="是否使用脚本" prop="useScript">
                <el-select v-model="templateForm.useScript" placeholder="请选择是否使用脚本">
                  <el-option label="否" :value="0" />
                  <el-option label="是" :value="1" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>
        </el-card>

        <!-- 请求配置区域 -->
        <el-card shadow="never" class="form-section-card">
          <template #header>
            <div class="section-header">
              <i class="el-icon-connection"></i>
              <span>请求配置</span>
            </div>
          </template>

          <el-form-item label="请求体模板" prop="requestBody">
            <el-input 
              v-model="templateForm.requestBody" 
              type="textarea" 
              :rows="4"
              placeholder="POST请求时的请求体模板，可包含 &lt;pageNum&gt; 占位符"
            />
            <div class="form-tip">
              <i class="el-icon-info"></i>
              仅在POST请求时需要填写，支持JSON格式
            </div>
          </el-form-item>

          <el-form-item label="请求头配置" prop="requestHead">
            <div class="request-headers-container">
              <div class="headers-input-area">
                <el-input 
                  v-model="requestHeadersText" 
                  type="textarea" 
                  :rows="6"
                  placeholder='请输入JSON格式的请求头配置，例如：&#10;{&#10;  "Content-Type": "application/json",&#10;  "Authorization": "Bearer your-token",&#10;  "User-Agent": "Mozilla/5.0..."&#10;}'
                  @blur="parseRequestHeaders"
                />
              </div>
              <div class="headers-preview" v-if="Object.keys(templateForm.requestHead || {}).length > 0">
                <div class="preview-title">当前配置预览：</div>
                <el-tag 
                  v-for="(value, key) in templateForm.requestHead" 
                  :key="key" 
                  closable 
                  @close="removeHeader(key)"
                  class="header-tag"
                >
                  {{ key }}: {{ value }}
                </el-tag>
              </div>
            </div>
          </el-form-item>
        </el-card>

        <!-- 结果处理配置区域 -->
        <el-card shadow="never" class="form-section-card">
          <template #header>
            <div class="section-header">
              <i class="el-icon-document"></i>
              <span>结果处理配置</span>
            </div>
          </template>

          <el-row :gutter="24">
            <el-col :span="6">
              <el-form-item label="结果类型" prop="resultType">
                <el-select v-model="templateForm.resultType" placeholder="请选择结果类型" style="width: 100%">
                  <el-option 
                    v-for="item in RESULT_TYPES" 
                    :key="item.value" 
                    :label="item.label" 
                    :value="item.value" 
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item label="结果清洗正则" prop="resultClean">
                <el-input 
                  v-model="templateForm.resultClean" 
                  placeholder="用于清洗结果的正则表达式，例如：^.*?({.*}).*$ 用于提取JSON部分"
                />
                <div class="form-tip">
                  <i class="el-icon-info"></i>
                  可选字段，用于从响应中提取有效的数据部分
                </div>
              </el-form-item>
            </el-col>
          </el-row>

          <el-form-item label="列表获取表达式" prop="resultListRule">
            <el-input 
              v-model="templateForm.resultListRule" 
              placeholder="用于从结果中提取列表的表达式，如JSONPath: $.data.list 或 XPath: //item"
            />
            <div class="form-tip">
              <i class="el-icon-info"></i>
              JSON类型使用JSONPath语法（如：$.data.list），XML类型使用XPath语法（如：//item）
            </div>
          </el-form-item>
        </el-card>

        <!-- 字段规则配置区域 -->
        <el-card shadow="never" class="form-section-card">
          <template #header>
            <div class="section-header">
              <i class="el-icon-menu"></i>
              <span>字段提取规则配置</span>
              <el-button 
                type="primary" 
                size="small" 
                icon="Plus" 
                @click="addFieldRule"
                style="margin-left: auto;"
              >
                添加字段规则
              </el-button>
            </div>
          </template>

          <div class="field-rules-container">
            <div 
              v-for="(rule, index) in templateForm.fieldRules" 
              :key="index" 
              class="field-rule-item"
            >
              <div class="field-rule-header">
                <span class="rule-index">字段规则 #{{ index + 1 }}</span>
                <el-button 
                  type="danger" 
                  size="small" 
                  icon="Delete" 
                  circle 
                  @click="removeFieldRule(index)"
                />
              </div>
              <el-row :gutter="24">
                <el-col :span="6">
                  <el-form-item :prop="`fieldRules.${index}.name`" label="字段名称">
                    <el-input 
                      v-model="rule.name" 
                      placeholder="如：title, price, url"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="8">
                  <el-form-item :prop="`fieldRules.${index}.desc`" label="字段描述">
                    <el-input 
                      v-model="rule.desc" 
                      placeholder="如：文章标题, 商品价格, 详情链接"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="10">
                  <el-form-item :prop="`fieldRules.${index}.rule`" label="提取规则">
                    <el-input 
                      v-model="rule.rule" 
                      placeholder="如：$.title, //h1/text(), .title"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
            
            <div v-if="!templateForm.fieldRules || templateForm.fieldRules.length === 0" class="empty-field-rules">
              <el-empty 
                description="暂无字段规则配置" 
                :image-size="80"
              >
                <el-button type="primary" @click="addFieldRule">添加第一个字段规则</el-button>
              </el-empty>
            </div>
          </div>
        </el-card>
          </el-form>
        </div>
        
        <!-- 抽屉底部操作栏 -->
        <div class="drawer-footer">
          <el-button @click="dialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" @click="submitTemplateForm" :loading="submitLoading" size="large">
            {{ isEditMode ? '更新' : '创建' }}
          </el-button>
        </div>
      </div>
    </el-drawer>

    <!-- 查看模板内容弹窗 -->
    <el-dialog 
      v-model="viewDialogVisible" 
      title="查看模板配置详情" 
      width="1200px"
      class="template-view-dialog"
    >
      <div class="template-view-container">
        <!-- 基础信息卡片 -->
        <el-card shadow="never" class="view-info-card">
          <template #header>
            <div class="card-header">
              <i class="el-icon-info-filled"></i>
              <span>基础信息</span>
            </div>
          </template>
          <el-descriptions :column="2" border size="default">
            <el-descriptions-item label="配置ID" label-align="right">
              <el-tag type="info">{{ viewTemplate.configId }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="配置名称" label-align="right">
              <span class="config-name">{{ viewTemplate.configName }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="基础URL" label-align="right" :span="2">
              <a :href="viewTemplate.columnUrl" target="_blank" class="url-link">
                {{ viewTemplate.columnUrl }}
              </a>
            </el-descriptions-item>
            <el-descriptions-item label="请求类型" label-align="right">
              <el-tag :type="getRequestTypeTag(viewTemplate.requestType)" size="default">
                {{ viewTemplate.requestType || '未知' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="结果类型" label-align="right">
              <el-tag :type="getResultTypeTag(viewTemplate.resultType)" size="default">
                {{ viewTemplate.resultType || '未知' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="分页配置" label-align="right">
              <span class="pagination-info">
                起始页: <strong>{{ viewTemplate.pageStart }}</strong> | 
                最大页数: <strong>{{ viewTemplate.pageLen }}</strong>
              </span>
            </el-descriptions-item>
            <el-descriptions-item label="下一页URL" label-align="right">
              <span class="next-page-url">{{ viewTemplate.nextPage || '无' }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="使用脚本" label-align="right">
              <el-tag :type="viewTemplate.useScript === 1 ? 'success' : 'info'" size="default">
                {{ viewTemplate.useScript === 1 ? '是' : '否' }}
              </el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="创建时间" label-align="right">
              <span class="time-info">{{ viewTemplate.createdAt }}</span>
            </el-descriptions-item>
            <el-descriptions-item label="更新时间" label-align="right">
              <span class="time-info">{{ viewTemplate.updatedAt }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
        
        <!-- 请求配置卡片 -->
        <el-card shadow="never" class="view-info-card" v-if="viewTemplate.requestBody || (viewTemplate.requestHead && Object.keys(viewTemplate.requestHead).length > 0)">
          <template #header>
            <div class="card-header">
              <i class="el-icon-connection"></i>
              <span>请求配置</span>
            </div>
          </template>
          
          <div v-if="viewTemplate.requestHead && Object.keys(viewTemplate.requestHead).length > 0" class="config-section">
            <h5 class="section-title">请求头配置</h5>
            <div class="headers-preview-enhanced">
              <el-tag 
                v-for="(value, key) in viewTemplate.requestHead" 
                :key="key" 
                class="header-tag-enhanced"
                size="default"
              >
                <strong>{{ key }}</strong>: {{ value }}
              </el-tag>
            </div>
          </div>

          <div v-if="viewTemplate.requestBody" class="config-section">
            <h5 class="section-title">请求体模板</h5>
            <el-input 
              :model-value="viewTemplate.requestBody" 
              type="textarea" 
              :rows="6"
              readonly
              class="code-display-enhanced"
            />
          </div>
        </el-card>

        <!-- 结果处理配置卡片 -->
        <el-card shadow="never" class="view-info-card" v-if="viewTemplate.resultListRule || viewTemplate.resultClean">
          <template #header>
            <div class="card-header">
              <i class="el-icon-document"></i>
              <span>结果处理配置</span>
            </div>
          </template>
          
          <div v-if="viewTemplate.resultClean" class="config-section">
            <h5 class="section-title">结果清洗正则</h5>
            <el-input 
              :model-value="viewTemplate.resultClean" 
              readonly
              class="code-display-enhanced"
            />
          </div>

          <div v-if="viewTemplate.resultListRule" class="config-section">
            <h5 class="section-title">列表获取表达式</h5>
            <el-input 
              :model-value="viewTemplate.resultListRule" 
              readonly
              class="code-display-enhanced"
            />
          </div>
        </el-card>

        <!-- 字段提取规则卡片 -->
        <el-card shadow="never" class="view-info-card" v-if="viewTemplate.fieldRules && viewTemplate.fieldRules.length > 0">
          <template #header>
            <div class="card-header">
              <i class="el-icon-menu"></i>
              <span>字段提取规则</span>
              <el-tag type="info" size="small" style="margin-left: auto;">
                共 {{ viewTemplate.fieldRules.length }} 条规则
              </el-tag>
            </div>
          </template>
          
          <el-table :data="viewTemplate.fieldRules" border stripe class="rules-table">
            <el-table-column prop="name" label="字段名称" width="150" align="center">
              <template #default="{ row }">
                <el-tag type="primary" size="small">{{ row.name }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="desc" label="字段描述" min-width="200" />
            <el-table-column prop="rule" label="提取规则" min-width="250" show-overflow-tooltip>
              <template #default="{ row }">
                <code class="rule-code">{{ row.rule }}</code>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </div>
    </el-dialog>

    <!-- 代码编辑抽屉 -->
    <el-drawer
      v-model="codeEditorVisible"
      title="代码编辑器"
      direction="rtl"
      :size="codeEditorSize"
      :close-on-click-modal="false"
      class="code-editor-drawer"
      destroy-on-close
    >
      <template #header>
        <div class="code-editor-header">
          <div class="header-title">
            <el-icon><DocumentCopy /></el-icon>
            <span>代码编辑器</span>
          </div>
          <div class="header-info" v-if="currentTemplate">
            <el-tag type="info" size="small">{{ currentTemplate.configName }}</el-tag>
          </div>
        </div>
      </template>
      
      <div class="code-editor-content">
        <CodeEditor 
          v-model="codeContent"
          :language="codeLanguage"
          :theme="codeTheme"
          placeholder="开始编写或上传代码文件..."
          @change="handleCodeChange"
        />
      </div>
      
      <template #footer>
        <div class="code-editor-footer">
          <el-button @click="codeEditorVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCode" :loading="saveCodeLoading">
            保存代码
          </el-button>
        </div>
      </template>
    </el-drawer>
    </div>

    <!-- 模板任务页面 -->
    <div v-show="activeTab === 'task'" class="tab-content">
      <!-- 任务搜索表单 -->
      <el-card shadow="never" class="search-card">
        <el-form :model="taskSearchForm" ref="taskSearchFormRef" inline label-position="left" label-width="auto">
          <el-form-item label="任务ID:" prop="taskId">
            <el-input
              v-model="taskSearchForm.taskId"
              placeholder="请输入任务ID"
              clearable
              @keyup.enter="handleTaskSearch"
            />
          </el-form-item>
          <el-form-item label="配置ID:" prop="configId">
            <el-input
              v-model="taskSearchForm.configId"
              placeholder="请输入配置ID"
              clearable
              @keyup.enter="handleTaskSearch"
            />
          </el-form-item>
          <el-form-item label="任务状态:" prop="status">
            <el-select v-model="taskSearchForm.status" placeholder="请选择状态" clearable style="width: 160px">
              <el-option 
                v-for="item in TASK_STATUS_OPTIONS" 
                :key="item.value" 
                :label="item.label" 
                :value="item.value" 
              />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button @click="handleTaskReset">重置</el-button>
            <el-button
              type="primary"
              icon="Search"
              @click="handleTaskSearch"
              :loading="taskLoading"
            >
              查询
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>

      <!-- 任务表格区域 -->
      <el-card shadow="never" class="table-card">
        <!-- 表格操作头部 -->
        <div class="table-header">
          <div class="table-title">
            模板任务列表
          </div>
          <div class="table-actions">
            <el-button type="primary" icon="Plus" @click="handleTaskAdd">新增任务</el-button>
            <el-button icon="Refresh" circle @click="handleTaskRefresh" />
          </div>
        </div>

        <!-- 任务表格 -->
        <el-table 
          :data="taskTableData" 
          style="width: 100%" 
          v-loading="taskLoading" 
          border 
          :height="taskTableHeight"
        >
          <el-table-column prop="taskId" label="任务ID" width="280" align="center" fixed />
          <el-table-column prop="configId" label="配置ID" width="280" align="center" />
          <el-table-column prop="configName" label="配置名称" min-width="180" show-overflow-tooltip />
          <el-table-column prop="status" label="任务状态" width="120" align="center">
            <template #default="{ row }">
              <el-tag :type="getTaskStatusTag(row.status)" size="default">
                {{ getTaskStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="pid" label="线程ID" width="120" align="center">
            <template #default="{ row }">
              <span>{{ row.pid || '-' }}</span>
            </template>
          </el-table-column>
          <el-table-column prop="createdAt" label="创建时间" min-width="180" />
          <el-table-column prop="updatedAt" label="更新时间" min-width="180" />
          <el-table-column label="操作" width="280" align="center" fixed="right">
            <template #default="{ row }">
              <!-- 运行中任务 -->
              <template v-if="row.status === '1'">
                <el-tooltip content="停止任务" placement="top">
                  <el-button link type="warning" icon="VideoPause" @click="handleTaskStop(row)" />
                </el-tooltip>
              </template>
              <!-- 已停止/失败任务 -->
              <template v-else-if="row.status === '2' || row.status === '4'">
                <el-tooltip content="启动任务" placement="top">
                  <el-button link type="success" icon="VideoPlay" @click="handleTaskStart(row)" />
                </el-tooltip>
                <el-tooltip content="重新启动" placement="top">
                  <el-button link type="primary" icon="RefreshRight" @click="handleTaskRestart(row)" />
                </el-tooltip>
              </template>
              <!-- 已完成任务 -->
              <template v-else-if="row.status === '3'">
                <el-tooltip content="重新启动" placement="top">
                  <el-button link type="primary" icon="RefreshRight" @click="handleTaskRestart(row)" />
                </el-tooltip>
              </template>
              
              <!-- 通用操作 -->
              <el-tooltip content="编辑" placement="top">
                <el-button link type="primary" icon="Edit" @click="handleTaskEdit(row)" />
              </el-tooltip>
              <el-tooltip content="查看" placement="top">
                <el-button link type="info" icon="View" @click="handleTaskView(row)" />
              </el-tooltip>
              <el-tooltip content="删除" placement="top">
                <el-button 
                  link 
                  type="danger" 
                  icon="Delete" 
                  @click="handleTaskDelete(row)"
                  :disabled="row.status === '1'"
                />
              </el-tooltip>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination 
            :current-page="taskPagination.currentPage" 
            :page-size="taskPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]" 
            :total="taskPagination.total" 
            layout="total, sizes, prev, pager, next, jumper"
            @size-change="handleTaskSizeChange" 
            @current-change="handleTaskCurrentChange" 
          />
        </div>
      </el-card>

      <!-- 任务表单抽屉 -->
      <el-drawer
        v-model="taskDialogVisible"
        :title="isTaskEditMode ? '编辑模板任务' : '新增模板任务'"
        direction="rtl"
        :size="taskDrawerSize"
        :close-on-click-modal="false"
        class="task-drawer"
        destroy-on-close
      >
        <div class="drawer-content">
          <!-- 表单区域 -->
          <div class="form-content">
            <el-form :model="taskForm" :rules="taskFormRules" ref="taskFormRef" label-width="120px">
              <!-- 基础配置区域 -->
              <el-card shadow="never" class="form-section-card">
                <template #header>
                  <div class="section-header">
                    <i class="el-icon-setting"></i>
                    <span>任务配置</span>
                  </div>
                </template>
                
                <el-row :gutter="24">
                  <el-col :span="24">
                    <el-form-item label="关联配置" prop="configId">
                      <el-select 
                        v-model="taskForm.configId" 
                        placeholder="请选择模板配置" 
                        style="width: 100%"
                        filterable
                      >
                        <el-option 
                          v-for="config in configOptions" 
                          :key="config.configId" 
                          :label="`${config.configName} (${config.configId})`" 
                          :value="config.configId" 
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>

                <el-row :gutter="24">
                  <el-col :span="12">
                    <el-form-item label="父任务ID" prop="pid">
                      <el-input-number 
                        v-model="taskForm.pid" 
                        :min="0" 
                        style="width: 100%"
                        placeholder="可选，用于任务层级管理"
                      />
                    </el-form-item>
                  </el-col>
                  <el-col :span="12">
                    <el-form-item label="任务状态" prop="status">
                      <el-select v-model="taskForm.status" placeholder="请选择状态" style="width: 100%">
                        <el-option 
                          v-for="item in TASK_STATUS_OPTIONS" 
                          :key="item.value" 
                          :label="item.label" 
                          :value="item.value" 
                        />
                      </el-select>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-card>
            </el-form>
          </div>
          
          <!-- 抽屉底部操作栏 -->
          <div class="drawer-footer">
            <el-button @click="taskDialogVisible = false" size="large">取消</el-button>
            <el-button type="primary" @click="submitTaskForm" :loading="taskSubmitLoading" size="large">
              {{ isTaskEditMode ? '更新' : '创建' }}
            </el-button>
          </div>
        </div>
      </el-drawer>

      <!-- 查看任务详情弹窗 -->
      <el-dialog 
        v-model="taskViewDialogVisible" 
        title="查看任务详情" 
        width="800px"
        class="task-view-dialog"
      >
        <div class="task-view-container">
          <!-- 任务信息卡片 -->
          <el-card shadow="never" class="view-info-card">
            <template #header>
              <div class="card-header">
                <i class="el-icon-info-filled"></i>
                <span>任务信息</span>
              </div>
            </template>
            <el-descriptions :column="2" border size="default">
              <el-descriptions-item label="任务ID" label-align="right">
                <el-tag type="info">{{ viewTask.taskId }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="配置ID" label-align="right">
                <el-tag type="primary">{{ viewTask.configId }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="配置名称" label-align="right" :span="2">
                <span class="config-name">{{ viewTask.configName || '未知配置' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="任务状态" label-align="right">
                <el-tag :type="getTaskStatusTag(viewTask.status)" size="default">
                  {{ getTaskStatusLabel(viewTask.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="父任务ID" label-align="right">
                <span>{{ viewTask.pid || '无' }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="创建时间" label-align="right">
                <span class="time-info">{{ viewTask.createdAt }}</span>
              </el-descriptions-item>
              <el-descriptions-item label="更新时间" label-align="right">
                <span class="time-info">{{ viewTask.updatedAt }}</span>
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onUnmounted, computed } from 'vue';
import type { FormInstance, FormRules } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Upload, DocumentCopy, Setting, Timer } from '@element-plus/icons-vue';
import { templateConfigApi } from '../api/templateConfig';
import { templateTaskApi } from '../api/templateTask';
import type { TemplateConfig } from '../types/templateConfig';
import type { TemplateTask } from '../types/templateTask';
import { REQUEST_TYPES, RESULT_TYPES } from '../types/templateConfig';
import { TASK_STATUS_OPTIONS, TASK_STATUS_MAP } from '../types/templateTask';
import { parseCommand } from '../utils/commandParser';
import { CodeEditor } from '../components';

// Tab 管理
const activeTab = ref('config');

// 模板配置响应式数据
const loading = ref(false);
const submitLoading = ref(false);
const dialogVisible = ref(false);
const viewDialogVisible = ref(false);
const isEditMode = ref(false);
const searchFormRef = ref<FormInstance>();
const templateFormRef = ref<FormInstance>();
const requestHeadersText = ref('');
const importCommand = ref('');

// 模板任务响应式数据
const taskLoading = ref(false);
const taskSubmitLoading = ref(false);
const taskDialogVisible = ref(false);
const taskViewDialogVisible = ref(false);
const isTaskEditMode = ref(false);
const taskSearchFormRef = ref<FormInstance>();
const taskFormRef = ref<FormInstance>();

// 代码编辑器相关
const codeEditorVisible = ref(false);
const saveCodeLoading = ref(false);
const codeContent = ref('');
const codeLanguage = ref('javascript');
const codeTheme = ref('light');
const currentTemplate = ref<TemplateConfig | null>(null);

// 响应式抽屉大小
const drawerSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '95%';      // 手机端
    if (width < 1200) return '85%';     // 平板端
    if (width < 1600) return '75%';     // 小桌面
    return '65%';                       // 大桌面
  }
  return '80%';
});

// 代码编辑器抽屉大小
const codeEditorSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '100%';     // 手机端全屏
    if (width < 1200) return '90%';     // 平板端
    return '80%';                       // 桌面端
  }
  return '80%';
});

// 任务抽屉大小
const taskDrawerSize = computed(() => {
  if (typeof window !== 'undefined') {
    const width = window.innerWidth;
    if (width < 768) return '95%';      // 手机端
    if (width < 1200) return '70%';     // 平板端
    return '50%';                       // 桌面端（任务表单相对简单）
  }
  return '60%';
});

// 窗口高度响应式数据
const windowHeight = ref(0);

// 配置表格高度计算
const configTableHeight = computed(() => {
  if (windowHeight.value > 0) {
    const headerHeight = 60;  // 页面头部
    const tabHeight = 60;     // Tab导航高度
    const searchHeight = 80;  // 搜索表单高度
    const tableHeaderHeight = 80; // 表格头部操作区高度
    const paginationHeight = 60; // 分页高度
    const padding = 40;       // 各种边距
    
    const availableHeight = windowHeight.value - headerHeight - tabHeight - searchHeight - tableHeaderHeight - paginationHeight - padding;
    return Math.max(300, Math.min(availableHeight, 700)); // 最小300px，最大700px
  }
  return 450; // 默认高度
});

// 任务表格高度计算  
const taskTableHeight = computed(() => {
  if (windowHeight.value > 0) {
    const headerHeight = 60;  // 页面头部
    const tabHeight = 60;     // Tab导航高度
    const searchHeight = 120; // 任务搜索表单高度（任务搜索字段更多）
    const tableHeaderHeight = 80; // 表格头部操作区高度
    const paginationHeight = 60; // 分页高度
    const padding = 40;       // 各种边距
    
    const availableHeight = windowHeight.value - headerHeight - tabHeight - searchHeight - tableHeaderHeight - paginationHeight - padding;
    return Math.max(300, Math.min(availableHeight, 700)); // 最小300px，最大700px
  }
  return 400; // 默认高度
});

// 更新窗口高度
const updateWindowHeight = () => {
  if (typeof window !== 'undefined') {
    windowHeight.value = window.innerHeight;
  }
};

// 搜索表单
const searchForm = reactive({
  configName: '',
});

// 分页数据
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 表格数据
const tableData = ref<TemplateConfig[]>([]);

// 任务搜索表单
const taskSearchForm = reactive({
  taskId: '',
  configId: '',
  status: '',
});

// 任务分页数据
const taskPagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0,
});

// 任务表格数据
const taskTableData = ref<TemplateTask[]>([]);

// 配置选项列表（用于任务表单）
const configOptions = ref<TemplateConfig[]>([]);

// 模板表单
const templateForm = reactive<TemplateConfig>({
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
});

// 查看模板数据
const viewTemplate = ref<TemplateConfig>({
  configName: '',
  columnUrl: '',
  requestType: '',
  pageStart: 0,
  pageLen: 0,
  resultType: '',
  useScript: 0
});

// 任务表单
const taskForm = reactive<TemplateTask>({
  configId: '',
  status: '2', // 默认停止状态
  pid: undefined,
});

// 查看任务数据
const viewTask = ref<TemplateTask>({
  configId: '',
  status: '2'
});

// 表单验证规则
const formRules: FormRules = {
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

// 任务表单验证规则
const taskFormRules: FormRules = {
  configId: [
    { required: true, message: '请选择关联配置', trigger: 'change' }
  ],
  status: [
    { required: true, message: '请选择任务状态', trigger: 'change' }
  ]
};

// 获取请求类型标签样式
const getRequestTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'GET': 'success',
    'POST': 'primary'
  };
  return typeMap[type] || 'default';
};

// 获取结果类型标签样式
const getResultTypeTag = (type: string) => {
  const typeMap: Record<string, string> = {
    'json': 'primary',
    'xml': 'success'
  };
  return typeMap[type] || 'default';
};

// 获取任务状态标签样式
const getTaskStatusTag = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.type || 'default';
};

// 获取任务状态标签文本
const getTaskStatusLabel = (status: string) => {
  return TASK_STATUS_MAP[status as keyof typeof TASK_STATUS_MAP]?.label || '未知状态';
};

// 解析请求头JSON文本
const parseRequestHeaders = () => {
  if (!requestHeadersText.value.trim()) {
    templateForm.requestHead = {};
    return;
  }
  
  try {
    const parsed = JSON.parse(requestHeadersText.value);
    templateForm.requestHead = parsed;
  } catch (error) {
    ElMessage.warning('请求头JSON格式不正确，请检查语法');
  }
};

// 移除请求头
const removeHeader = (key: string) => {
  if (templateForm.requestHead) {
    delete templateForm.requestHead[key];
    // 更新文本框内容
    requestHeadersText.value = JSON.stringify(templateForm.requestHead, null, 2);
  }
};

// 添加字段规则
const addFieldRule = () => {
  if (!templateForm.fieldRules) {
    templateForm.fieldRules = [];
  }
  templateForm.fieldRules.push({
    name: '',
    rule: '',
    desc: ''
  });
};

// 移除字段规则
const removeFieldRule = (index: number) => {
  if (templateForm.fieldRules) {
    templateForm.fieldRules.splice(index, 1);
  }
};

// Tab 切换处理
const handleTabChange = (tabName: string) => {
  activeTab.value = tabName;
  if (tabName === 'task') {
    fetchTaskData();
    fetchConfigOptions(); // 获取配置选项
  } else if (tabName === 'config') {
    fetchData();
  }
};

// 获取配置选项列表
const fetchConfigOptions = async () => {
  try {
    const { data } = await templateConfigApi.list({
      page: 1,
      size: 1000, // 获取所有配置作为选项
    });
    
    if (data?.records) {
      configOptions.value = data.records;
    }
  } catch (error) {
    console.error('获取配置选项失败:', error);
  }
};

// 获取任务数据
const fetchTaskData = async () => {
  try {
    taskLoading.value = true;
    const { data } = await templateTaskApi.list({
      page: taskPagination.currentPage,
      size: taskPagination.pageSize,
      taskId: taskSearchForm.taskId || undefined,
      configId: taskSearchForm.configId || undefined,
      status: taskSearchForm.status || undefined,
    });
    
    if (data?.records) {
      // 关联配置名称
      const configMap = new Map(configOptions.value.map(config => [config.configId, config.configName]));
      taskTableData.value = data.records.map((task: TemplateTask) => ({
        ...task,
        configName: configMap.get(task.configId) || '未知配置'
      }));
      taskPagination.total = data.total || 0;
      taskPagination.pageSize = data.size || 10;
      taskPagination.currentPage = data.current || 1;
    }
  } catch (error) {
    ElMessage.error('获取任务列表失败');
  } finally {
    taskLoading.value = false;
  }
};

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
      pagination.total = data.total || 0;
      pagination.pageSize = data.size || 10;
      pagination.currentPage = data.current || 1;
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

// 重置
const handleReset = () => {
  searchFormRef.value?.resetFields();
  pagination.currentPage = 1;
  fetchData();
};

// 刷新
const handleRefresh = () => {
  fetchData();
};

// 重置表单
const resetTemplateForm = () => {
  Object.assign(templateForm, {
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
  });
  requestHeadersText.value = '';
};

// 新增
const handleAdd = () => {
  isEditMode.value = false;
  resetTemplateForm();
  importCommand.value = '';
  dialogVisible.value = true;
};

// 编辑
const handleEdit = async (row: TemplateConfig) => {
  try {
    const { data } = await templateConfigApi.getById(row.configId!);
    Object.assign(templateForm, data);
    
    // 设置请求头文本
    if (data.requestHead && Object.keys(data.requestHead).length > 0) {
      requestHeadersText.value = JSON.stringify(data.requestHead, null, 2);
    } else {
      requestHeadersText.value = '';
    }
    
    isEditMode.value = true;
    dialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取模板配置详情失败');
  }
};

// 复制
const handleCopy = async (row: TemplateConfig) => {
  try {
    const { data } = await templateConfigApi.getById(row.configId!);
    Object.assign(templateForm, { 
      ...data, 
      configId: undefined,
      configName: `${data.configName}_副本`
    });
    
    // 设置请求头文本
    if (data.requestHead && Object.keys(data.requestHead).length > 0) {
      requestHeadersText.value = JSON.stringify(data.requestHead, null, 2);
    } else {
      requestHeadersText.value = '';
    }
    
    isEditMode.value = false;
    dialogVisible.value = true;
    
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

// 导入命令
const handleImport = async () => {
  if (!importCommand.value.trim()) {
    ElMessage.warning('请输入curl或fetch命令');
    return;
  }

  try {
    const result = parseCommand(importCommand.value);
    
    // 更新表单字段
    templateForm.columnUrl = result.url;
    templateForm.nextPage = result.url;
    templateForm.requestType = result.method;

    // 处理请求头
    if (result.headers && Object.keys(result.headers).length > 0) {
      templateForm.requestHead = result.headers;
      requestHeadersText.value = JSON.stringify(result.headers, null, 2);
    } else {
      templateForm.requestHead = {};
      requestHeadersText.value = '';
    }

    // 处理请求体
    templateForm.requestBody = typeof result.body === 'string' 
      ? result.body 
      : JSON.stringify(result.body, null, 2);

    ElMessage.success('导入成功');
  } catch (error) {
    ElMessage.error(`导入失败: ${(error as Error).message}`);
  }
};

// 提交表单
const submitTemplateForm = async () => {
  if (!templateFormRef.value) return;
  
  await templateFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        submitLoading.value = true;
        
        // 解析最新的请求头
        parseRequestHeaders();
        
        if (isEditMode.value) {
          await templateConfigApi.update(templateForm);
          ElMessage.success('更新成功');
        } else {
          await templateConfigApi.create(templateForm);
          ElMessage.success('创建成功');
        }
        dialogVisible.value = false;
        fetchData();
      } catch (error) {
        ElMessage.error(isEditMode.value ? '更新失败' : '创建失败');
      } finally {
        submitLoading.value = false;
      }
    }
  });
};

// 分页处理
const handleSizeChange = (val: number) => {
  pagination.pageSize = val;
  fetchData();
};

const handleCurrentChange = (val: number) => {
  pagination.currentPage = val;
  fetchData();
};

// 代码编辑相关函数
const handleCodeEdit = async (row: TemplateConfig) => {
  try {
    loading.value = true;
    
    // 获取模板配置基础信息
    const { data: templateData } = await templateConfigApi.getById(row.configId!);
    currentTemplate.value = templateData;
    
    try {
      // 尝试获取已保存的脚本内容
      const { data: scriptContent } = await templateConfigApi.getScript(row.configId!);
      codeContent.value = (scriptContent && typeof scriptContent === 'string' ? scriptContent : '') || generateTemplateCode(templateData);
    } catch (scriptError) {
      // 如果没有保存的脚本，则生成基于模板配置的示例代码
      console.log('未找到已保存的脚本，生成示例代码');
      codeContent.value = generateTemplateCode(templateData);
    }
    
    codeLanguage.value = 'javascript'; // 默认JavaScript，可以根据需要修改
    codeTheme.value = 'light';
    codeEditorVisible.value = true;
    
  } catch (error) {
    ElMessage.error('获取模板配置失败');
  } finally {
    loading.value = false;
  }
};

// 生成基于模板配置的示例代码
const generateTemplateCode = (template: TemplateConfig): string => {
  return `// 模板配置: ${template.configName}
// 基础URL: ${template.columnUrl}
// 请求类型: ${template.requestType}
// 结果类型: ${template.resultType}

class TemplateProcessor {
  constructor() {
    this.config = {
      name: '${template.configName}',
      baseUrl: '${template.columnUrl}',
      requestType: '${template.requestType}',
      resultType: '${template.resultType}',
      pageStart: ${template.pageStart || 1},
      pageLen: ${template.pageLen || 1},
      nextPage: '${template.nextPage || ''}',
      requestHeaders: ${JSON.stringify(template.requestHead || {}, null, 2)},
      requestBody: '${template.requestBody || ''}',
      resultListRule: '${template.resultListRule || ''}',
      resultClean: '${template.resultClean || ''}'
    };
  }

  // 处理请求数据
  processRequest(requestData) {
    const result = {
      url: this.config.baseUrl,
      method: this.config.requestType,
      headers: this.config.requestHeaders || {}
    };

    // 处理分页
    if (requestData.pageNum && this.config.nextPage) {
      result.url = this.config.nextPage.replace('<pageNum>', requestData.pageNum.toString());
    }

    // 处理请求体
    if (this.config.requestType === 'POST' && this.config.requestBody) {
      let body = this.config.requestBody;
      if (requestData.pageNum) {
        body = body.replace('<pageNum>', requestData.pageNum.toString());
      }
      try {
        result.body = JSON.parse(body);
      } catch (e) {
        result.body = body;
      }
    }

    return result;
  }

  // 处理响应数据
  processResponse(responseData) {
    let result = responseData;

    // 结果清洗
    if (this.config.resultClean) {
      try {
        const regex = new RegExp(this.config.resultClean);
        const match = responseData.match(regex);
        if (match && match[1]) {
          result = match[1];
        }
      } catch (e) {
        console.warn('结果清洗正则表达式无效:', e.message);
      }
    }

    // 根据结果类型处理数据
    if (this.config.resultType === 'json') {
      try {
        result = typeof result === 'string' ? JSON.parse(result) : result;
      } catch (e) {
        console.error('JSON解析失败:', e.message);
        return { error: 'JSON解析失败' };
      }
    }

    // 提取列表数据
    if (this.config.resultListRule && result) {
      try {
        // 简单的JSONPath支持
        if (this.config.resultListRule.startsWith('$.')) {
          const path = this.config.resultListRule.substring(2).split('.');
          let data = result;
          for (const key of path) {
            data = data[key];
            if (!data) break;
          }
          result = data || [];
        }
      } catch (e) {
        console.error('列表提取失败:', e.message);
      }
    }

    // 字段规则处理
    if (Array.isArray(result) && this.config.fieldRules && this.config.fieldRules.length > 0) {
      result = result.map(item => {
        const processedItem = {};
        this.config.fieldRules.forEach(rule => {
          try {
            // 简单的字段提取支持
            if (rule.rule.startsWith('$.')) {
              const path = rule.rule.substring(2).split('.');
              let value = item;
              for (const key of path) {
                value = value[key];
                if (value === undefined) break;
              }
              processedItem[rule.name] = value;
            } else {
              processedItem[rule.name] = item[rule.rule] || null;
            }
          } catch (e) {
            console.error(\`字段 \${rule.name} 提取失败:\`, e.message);
            processedItem[rule.name] = null;
          }
        });
        return processedItem;
      });
    }

    return result;
  }

  // 执行完整的处理流程
  async execute(requestData = {}) {
    try {
      // 1. 准备请求
      const requestConfig = this.processRequest(requestData);
      console.log('请求配置:', requestConfig);

      // 2. 发送请求 (这里需要根据实际情况实现)
      // const response = await fetch(requestConfig.url, {
      //   method: requestConfig.method,
      //   headers: requestConfig.headers,
      //   body: requestConfig.body ? JSON.stringify(requestConfig.body) : undefined
      // });
      // const responseData = await response.text();

      // 3. 模拟响应数据
      const mockResponse = \`{
        "data": {
          "list": [
            {"title": "示例标题1", "url": "http://example.com/1"},
            {"title": "示例标题2", "url": "http://example.com/2"}
          ]
        }
      }\`;

      // 4. 处理响应
      const result = this.processResponse(mockResponse);
      console.log('处理结果:', result);

      return result;
    } catch (error) {
      console.error('执行失败:', error.message);
      return { error: error.message };
    }
  }
}

// 使用示例
const processor = new TemplateProcessor();

// 处理请求
const requestData = { pageNum: 1 };
const request = processor.processRequest(requestData);
console.log('请求配置:', request);

// 执行完整流程
processor.execute({ pageNum: 1 }).then(result => {
  console.log('最终结果:', result);
});`;
};

// 代码变更处理
const handleCodeChange = (content: string) => {
  codeContent.value = typeof content === 'string' ? content : '';
};

// ===== 任务管理相关方法 =====

// 任务搜索
const handleTaskSearch = () => {
  taskPagination.currentPage = 1;
  fetchTaskData();
};

// 任务重置
const handleTaskReset = () => {
  taskSearchFormRef.value?.resetFields();
  taskPagination.currentPage = 1;
  fetchTaskData();
};

// 任务刷新
const handleTaskRefresh = () => {
  fetchTaskData();
};

// 重置任务表单
const resetTaskForm = () => {
  Object.assign(taskForm, {
    configId: '',
    status: '2',
    pid: undefined,
  });
};

// 新增任务
const handleTaskAdd = () => {
  isTaskEditMode.value = false;
  resetTaskForm();
  taskDialogVisible.value = true;
};

// 编辑任务
const handleTaskEdit = async (row: TemplateTask) => {
  try {
    const { data } = await templateTaskApi.getById(row.taskId!);
    Object.assign(taskForm, data);
    isTaskEditMode.value = true;
    taskDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取任务详情失败');
  }
};

// 查看任务
const handleTaskView = async (row: TemplateTask) => {
  try {
    const { data } = await templateTaskApi.getById(row.taskId!);
    // 关联配置名称
    const config = configOptions.value.find(c => c.configId === data.configId);
    viewTask.value = {
      ...data,
      configName: config?.configName || '未知配置'
    };
    taskViewDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('获取任务详情失败');
  }
};

// 删除任务
const handleTaskDelete = (row: TemplateTask) => {
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
      fetchTaskData();
    } catch (error) {
      ElMessage.error('删除失败');
    }
  }).catch(() => {});
};

// 启动任务
const handleTaskStart = async (row: TemplateTask) => {
  try {
    await templateTaskApi.start(row.taskId!);
    ElMessage.success('任务启动成功');
    fetchTaskData();
  } catch (error) {
    ElMessage.error('任务启动失败');
  }
};

// 停止任务
const handleTaskStop = async (row: TemplateTask) => {
  ElMessageBox.confirm('确认停止该任务吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning',
  }).then(async () => {
    try {
      await templateTaskApi.stop(row.taskId!);
      ElMessage.success('任务已停止');
      fetchTaskData();
    } catch (error) {
      ElMessage.error('停止任务失败');
    }
  }).catch(() => {});
};

// 重新启动任务
const handleTaskRestart = async (row: TemplateTask) => {
  try {
    await templateTaskApi.restart(row.taskId!);
    ElMessage.success('任务重新启动成功');
    fetchTaskData();
  } catch (error) {
    ElMessage.error('重新启动任务失败');
  }
};

// 提交任务表单
const submitTaskForm = async () => {
  if (!taskFormRef.value) return;
  
  await taskFormRef.value.validate(async (valid: boolean) => {
    if (valid) {
      try {
        taskSubmitLoading.value = true;
        
        if (isTaskEditMode.value) {
          await templateTaskApi.update(taskForm);
          ElMessage.success('更新成功');
        } else {
          await templateTaskApi.create(taskForm);
          ElMessage.success('创建成功');
        }
        taskDialogVisible.value = false;
        fetchTaskData();
      } catch (error) {
        ElMessage.error(isTaskEditMode.value ? '更新失败' : '创建失败');
      } finally {
        taskSubmitLoading.value = false;
      }
    }
  });
};

// 任务分页处理
const handleTaskSizeChange = (val: number) => {
  taskPagination.pageSize = val;
  fetchTaskData();
};

const handleTaskCurrentChange = (val: number) => {
  taskPagination.currentPage = val;
  fetchTaskData();
};

// 保存代码
const saveCode = async () => {
  if (!currentTemplate.value) {
    ElMessage.error('模板信息不存在');
    return;
  }
  
  if (!codeContent.value.trim()) {
    ElMessage.warning('请输入脚本内容');
    return;
  }

  try {
    saveCodeLoading.value = true;
    
    // 调用保存脚本接口
    await templateConfigApi.saveScript({
      configId: currentTemplate.value.configId!,
      configName: currentTemplate.value.configName,
      scriptContent: codeContent.value
    });
    
    ElMessage.success('脚本保存成功');
    codeEditorVisible.value = false;
  } catch (error) {
    console.error('保存脚本失败:', error);
    ElMessage.error(`脚本保存失败: ${(error as Error).message || '未知错误'}`);
  } finally {
    saveCodeLoading.value = false;
  }
};

// 初始化
onMounted(() => {
  fetchData();
  fetchConfigOptions(); // 初始化时就加载配置选项
  
  // 初始化窗口高度
  updateWindowHeight();
  
  // 监听窗口大小变化
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateWindowHeight);
  }
});

// 清理监听器
onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateWindowHeight);
  }
});
</script>

<style scoped>
.template-management-container {
  padding: 12px;
  background: #f0f2f5;
  height: 100vh;
  max-height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.tab-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.tab-card :deep(.el-card__body) {
  padding: 0;
}

.template-tabs :deep(.el-tabs__header) {
  margin: 0;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 6px 6px 0 0;
}

.template-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 20px;
}

.template-tabs :deep(.el-tabs__nav-scroll) {
  display: flex;
}

.template-tabs :deep(.el-tabs__item) {
  height: 60px;
  line-height: 60px;
  font-size: 15px;
  font-weight: 500;
  color: #6c757d;
  border: none;
  margin-right: 30px;
  padding: 0 15px;
  position: relative;
  transition: all 0.3s ease;
}

.template-tabs :deep(.el-tabs__item.is-active) {
  color: #667eea;
  font-weight: 600;
}

.template-tabs :deep(.el-tabs__item:hover) {
  color: #667eea;
}

.template-tabs :deep(.el-tabs__active-bar) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  height: 3px;
  border-radius: 2px;
}

.tab-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.tab-label .el-icon {
  font-size: 16px;
}

.tab-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-card {
  margin-bottom: 12px;
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
}

.el-form--inline .el-form-item {
  margin-right: 15px;
  margin-bottom: 18px;
}

.table-card {
  background: #ffffff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.04);
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.table-card :deep(.el-card__body) {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.table-title {
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
}

.table-actions .el-button {
  margin-left: 10px;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.el-table .el-button+.el-button {
  margin-left: 8px;
}

/* 抽屉表单样式 */
.template-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.drawer-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.template-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.template-drawer :deep(.el-drawer__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.template-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.template-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 导入区域 */
.import-section {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(255, 255, 255, 0.95) 100%);
  padding: 24px;
  border-bottom: 1px solid rgba(102, 126, 234, 0.15);
  position: relative;
  z-index: 2;
}

.import-section::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 50%, transparent 100%);
  border-radius: 0 0 2px 2px;
}

.import-section h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
  position: relative;
  display: flex;
  align-items: center;
}

.import-section h3::before {
  content: '';
  width: 4px;
  height: 18px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 10px;
  flex-shrink: 0;
}

.section-desc {
  font-size: 14px;
  color: #64748b;
  margin: 0 0 16px 0;
  font-weight: 500;
}

.import-input {
  margin-bottom: 12px;
}

.import-input :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  border-radius: 6px;
}

.import-btn {
  border-radius: 6px;
  font-weight: 500;
}

.form-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.template-drawer .form-content .el-form {
  flex: 1;
  overflow-y: auto;
  padding-right: 10px;
}

.drawer-footer {
  background: #f8f9fa;
  border-top: 1px solid #e4e7ed;
  padding: 20px;
  margin: 0;
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

.form-section-card {
  margin-bottom: 20px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
}

.form-section-card :deep(.el-card__header) {
  background: #f8f9fa;
  border-bottom: 1px solid #e4e7ed;
  padding: 15px 20px;
}

.form-section-card :deep(.el-card__body) {
  padding: 20px;
}

.section-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.section-header i {
  margin-right: 8px;
  color: #409eff;
}

.form-tip {
  margin-top: 5px;
  font-size: 12px;
  color: #909399;
  display: flex;
  align-items: center;
}

.form-tip i {
  margin-right: 4px;
}

/* 请求头配置样式 */
.request-headers-container {
  width: 100%;
}

.headers-input-area {
  margin-bottom: 15px;
}

.headers-preview {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 10px;
}

.preview-title {
  font-size: 13px;
  color: #606266;
  margin-bottom: 8px;
  font-weight: 500;
}

.header-tag {
  margin: 4px 8px 4px 0;
  max-width: 300px;
}

/* 字段规则配置样式 */
.field-rules-container {
  min-height: 100px;
}

.field-rule-item {
  background: #f8f9fa;
  border: 1px solid #e4e7ed;
  border-radius: 6px;
  padding: 15px;
  margin-bottom: 15px;
}

.field-rule-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.rule-index {
  font-weight: 600;
  color: #409eff;
}

.empty-field-rules {
  text-align: center;
  padding: 20px;
}

/* 查看详情样式 */
.template-view-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background: #f8fafc;
}

.template-view-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 查看详情卡片样式 */
.view-info-card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  background: white;
}

.view-info-card :deep(.el-card__header) {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-bottom: 1px solid #e5e7eb;
  padding: 16px 20px;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  color: #374151;
  font-size: 15px;
}

.card-header i {
  margin-right: 8px;
  color: #6366f1;
  font-size: 16px;
}

.view-info-card :deep(.el-card__body) {
  padding: 20px;
}

/* 基础信息样式 */
.config-name {
  font-weight: 600;
  color: #1f2937;
  font-size: 15px;
}

.url-link {
  color: #3b82f6;
  text-decoration: none;
  word-break: break-all;
  transition: color 0.3s ease;
}

.url-link:hover {
  color: #1d4ed8;
  text-decoration: underline;
}

.pagination-info {
  color: #6b7280;
  font-size: 14px;
}

.pagination-info strong {
  color: #374151;
  font-weight: 600;
}

.next-page-url {
  color: #6b7280;
  font-size: 14px;
  word-break: break-all;
}

.time-info {
  color: #6b7280;
  font-size: 13px;
  font-family: 'Monaco', monospace;
}

/* 配置区域样式 */
.config-section {
  margin-bottom: 20px;
}

.config-section:last-child {
  margin-bottom: 0;
}

.section-title {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
  display: flex;
  align-items: center;
}

.section-title::before {
  content: '';
  width: 3px;
  height: 16px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 2px;
  margin-right: 8px;
  flex-shrink: 0;
}

/* 请求头样式优化 */
.headers-preview-enhanced {
  background: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.header-tag-enhanced {
  background: white;
  border: 1px solid #d1d5db;
  color: #374151;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  max-width: 100%;
  word-break: break-all;
}

.header-tag-enhanced strong {
  color: #1f2937;
}

/* 代码显示样式优化 */
.code-display-enhanced :deep(.el-textarea__inner) {
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  background-color: #f8fafc;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  color: #374151;
  padding: 16px;
}

/* 规则表格样式 */
.rules-table {
  border-radius: 8px;
  overflow: hidden;
}

.rules-table :deep(.el-table__header) {
  background: #f8fafc;
}

.rules-table :deep(.el-table th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 600;
  border-bottom: 2px solid #e5e7eb;
}

.rule-code {
  background: #f1f5f9;
  color: #475569;
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 12px;
  border: 1px solid #e2e8f0;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .template-view-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: 20px auto;
  }
  
  .view-info-card :deep(.el-descriptions) {
    font-size: 13px;
  }
  
  .view-info-card :deep(.el-card__body) {
    padding: 15px;
  }
  
  .config-section {
    margin-bottom: 15px;
  }
}



/* 表格现代化样式优化 */
.table-card :deep(.el-card__body) {
  padding: 24px;
}

.table-header {
  background: white;
  padding: 20px 0;
  border-radius: 12px 12px 0 0;
}

.table-title {
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  display: flex;
  align-items: center;
}

.table-title::before {
  content: '';
  width: 4px;
  height: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 2px;
  margin-right: 12px;
}

.table-actions .el-button {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.table-actions .el-button:hover {
  transform: translateY(-1px);
}

.table-card :deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

.table-card :deep(.el-table th.el-table__cell) {
  background: #f8fafc;
  color: #475569;
  font-weight: 600;
  border-bottom: 2px solid #e2e8f0;
}

/* 搜索卡片样式优化 */
.search-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.search-card :deep(.el-card__body) {
  padding: 20px 24px;
}

/* 抽屉滚动条样式 */
.template-drawer .el-form::-webkit-scrollbar {
  width: 8px;
}

.template-drawer .el-form::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.template-drawer .el-form::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

.template-drawer .el-form::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 抽屉内容区域优化 */
.template-drawer .form-section-card {
  margin-bottom: 24px;
}

.template-drawer .form-section-card:last-of-type {
  margin-bottom: 30px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .template-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
  
  .template-drawer :deep(.el-drawer__body) {
    padding: 15px;
  }
  
  .drawer-footer {
    padding: 15px;
    margin: 0 -15px -15px;
  }
  
  .template-drawer .el-row {
    margin: 0 !important;
  }
  
  .template-drawer .el-col {
    padding: 0 8px !important;
  }
  
  .form-section-card :deep(.el-card__body) {
    padding: 15px;
  }
  
  .template-drawer :deep(.el-form-item__label) {
    font-size: 13px;
  }
}

/* 平板端适配 */
@media (max-width: 1200px) and (min-width: 769px) {
  .template-drawer :deep(.el-form-item__label) {
    font-size: 14px;
  }
}

/* 代码编辑器抽屉样式 */
.code-editor-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.code-editor-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.code-editor-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.header-title {
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: 600;
  color: white;
}

.header-title .el-icon {
  margin-right: 8px;
  font-size: 20px;
}

.header-info {
  display: flex;
  align-items: center;
}

.code-editor-content {
  flex: 1;
  padding: 20px;
  background: #f8f9fa;
  overflow: hidden;
}

.code-editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 20px;
  background: #ffffff;
  border-top: 1px solid #e4e7ed;
}

.code-editor-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.code-editor-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 代码编辑器响应式设计 */
@media (max-width: 768px) {
  .code-editor-header {
    flex-direction: column;
    gap: 10px;
    text-align: center;
  }
  
  .code-editor-content {
    padding: 10px;
  }
  
  .code-editor-footer {
    padding: 15px;
    gap: 8px;
  }
  
  .code-editor-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
}

/* 代码编辑器内容区域 */
.code-editor-content :deep(.code-editor-container) {
  height: 100%;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 任务抽屉样式 */
.task-drawer :deep(.el-drawer__body) {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.task-drawer :deep(.el-drawer__header) {
  background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
  color: white;
  padding: 20px;
  margin-bottom: 0;
}

.task-drawer :deep(.el-drawer__title) {
  color: white;
  font-size: 18px;
  font-weight: 600;
}

.task-drawer :deep(.el-drawer__close-btn) {
  color: white;
  font-size: 20px;
}

.task-drawer :deep(.el-drawer__close-btn):hover {
  color: rgba(255, 255, 255, 0.8);
}

/* 任务查看详情样式 */
.task-view-dialog :deep(.el-dialog__body) {
  padding: 20px;
  background: #f8fafc;
}

.task-view-container {
  padding: 0;
}

/* 任务表格操作按钮样式优化 */
.el-table .el-button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 任务状态相关样式 */
.el-tag.el-tag--warning {
  background: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.el-tag.el-tag--success {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.el-tag.el-tag--danger {
  background: #f8d7da;
  border-color: #f5c6cb;
  color: #721c24;
}

.el-tag.el-tag--info {
  background: #d1ecf1;
  border-color: #bee5eb;
  color: #0c5460;
}

/* Tab内容区响应式 */
@media (max-width: 768px) {
  .template-management-container {
    padding: 8px;
    height: 100vh;
    max-height: 100vh;
  }
  
  .template-tabs :deep(.el-tabs__item) {
    height: 50px;
    line-height: 50px;
    font-size: 14px;
    margin-right: 15px;
    padding: 0 10px;
  }
  
  .template-tabs :deep(.el-tabs__nav-wrap) {
    padding: 0 15px;
  }
  
  .tab-label {
    gap: 6px;
  }
  
  .tab-label .el-icon {
    font-size: 14px;
  }
  
  .task-drawer :deep(.el-drawer__header) {
    padding: 15px;
  }
  
  .search-card {
    margin-bottom: 8px;
  }
  
  .tab-card {
    margin-bottom: 8px;
  }
}

/* 确保表格容器不会溢出 */
.tab-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-height: 0;
}
</style>