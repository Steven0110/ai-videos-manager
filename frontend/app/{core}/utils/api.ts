import axios from 'axios';

const API_KEY = 'DbtvmtpYQijbfWeXM5cYRHHt7uMSdR6aDRoOs20T1JOM';

const api = axios.create({
  baseURL: 'https://wmglsx4kt1.execute-api.us-west-2.amazonaws.com/dev',
  headers: {
    'x-api-key': API_KEY,
  },
});

export const downloadProject = async (projectId: string): Promise<string> => {
  const response = await api.get(`/project/${projectId}/download`);
  return response.data.zipUrl;
};

export const publishProject = async (projectId: string): Promise<void> => {
  await api.put(`/project/${projectId}`, { isPublished: true });
};

export default api; 