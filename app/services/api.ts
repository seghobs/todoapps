import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

// Axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('API Request:', {
    url: config.url,
    method: config.method,
    data: config.data,
    headers: config.headers,
  });
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: async (username: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', username);
    formData.append('password', password);
    const response = await api.post('/login', formData, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
    const { access_token } = response.data;
    localStorage.setItem('token', access_token);
    return response.data;
  },

  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/register', { email, username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
  },

  getProfile: async () => {
    const response = await api.get('/me');
    return response.data;
  },
};

// Todo services
export const todoService = {
  getAllTodos: async () => {
    const response = await api.get('/todos');
    return response.data;
  },

  createTodo: async (todo: {
    text: string;
    description?: string;
    category: string;
    priority: 'low' | 'medium' | 'high';
    stage: 'todo' | 'in_progress' | 'done';
    due_date?: string;
  }) => {
    const response = await api.post('/todos', todo);
    return response.data;
  },

  updateTodo: async (id: number, todo: {
    text?: string;
    description?: string;
    completed?: boolean;
    category?: string;
    priority?: 'low' | 'medium' | 'high';
    stage?: 'todo' | 'in_progress' | 'done';
    due_date?: string;
  }) => {
    const response = await api.put(`/todos/${id}`, todo);
    return response.data;
  },

  deleteTodo: async (id: number) => {
    await api.delete(`/todos/${id}`);
  },

  addSubtask: async (todoId: number, text: string) => {
    const response = await api.post(`/todos/${todoId}/subtasks`, {
      text,
      completed: false,
    });
    return response.data;
  },

  addTag: async (todoId: number, tagName: string) => {
    const response = await api.post(`/todos/${todoId}/tags`, {
      name: tagName,
    });
    return response.data;
  },

  removeTag: async (todoId: number, tagId: number) => {
    await api.delete(`/todos/${todoId}/tags/${tagId}`);
  },

  getTodosByTag: async (tagName: string) => {
    const response = await api.get(`/todos/tags/${tagName}`);
    return response.data;
  },
}; 