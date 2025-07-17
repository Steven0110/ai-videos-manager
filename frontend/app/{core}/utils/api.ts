import axios from 'axios';

const api = axios.create({
  baseURL: 'https://wmglsx4kt1.execute-api.us-west-2.amazonaws.com/dev',
});

export const downloadProject = async (projectId: string): Promise<string> => {
  const response = await api.get(`/project/${projectId}/download`);
  return response.data.zipUrl;
};

export default api; 