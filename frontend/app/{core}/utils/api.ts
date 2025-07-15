import axios from 'axios';

const api = axios.create({
  baseURL: 'https://wmglsx4kt1.execute-api.us-west-2.amazonaws.com/dev',
});

export default api; 