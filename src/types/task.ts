export interface Task {
  taskId: string
  websiteId: number
  status: number
  createdAt: string
  updatedAt: string | null
  websiteName?: string
  subTasks?: SubTask[]
  subTasksLoading?: boolean
}

export interface SubTask {
  taskId: string
  websiteId: number
  status: number
  createdAt: string
  updatedAt: string | null
}