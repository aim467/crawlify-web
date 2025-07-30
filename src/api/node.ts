import request from '../utils/request';

export interface SpiderNode {
  nodeId: string;
  nodeIp: string;
  nodePort: number;
  status: number;
  taskCount: number;
}

export const nodeApi = {
  getNodeList: () => request.get('/nodeList'),
  refreshNode: () => request.post('/refreshNode'),
}; 