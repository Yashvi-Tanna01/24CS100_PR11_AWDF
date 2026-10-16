/**
 * Central API Service - Practical 11: Containerization with Docker and Docker Compose
 * Student: Maitri Sheta (ID: D25CS120)
 */

const BASE_URL = '/api';

export const getToken = () => localStorage.getItem('maitri_docker_jwt_token');
export const setToken = (token) => localStorage.setItem('maitri_docker_jwt_token', token);
export const removeToken = () => {
  localStorage.removeItem('maitri_docker_jwt_token');
  localStorage.removeItem('maitri_docker_user_info');
};

export const getStoredUser = () => {
  try {
    return JSON.parse(localStorage.getItem('maitri_docker_user_info') || 'null');
  } catch {
    return null;
  }
};

export const setStoredUser = (user) => {
  localStorage.setItem('maitri_docker_user_info', JSON.stringify(user));
};

const getAuthHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// ==========================================
// Health & Docker Diagnostics API
// ==========================================

export const fetchHealthAPI = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`);
    if (!res.ok) throw new Error('Backend health check returned status ' + res.status);
    return await res.json();
  } catch (err) {
    return {
      status: 'unreachable',
      error: err.message,
      service: 'backend',
      container: 'task-backend',
      database: { status: 'unknown', host: 'mongodb' }
    };
  }
};

// ==========================================
// Authentication APIs
// ==========================================

export const registerAPI = async ({ name, studentId, email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, studentId, email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Registration failed');
  }
  setToken(data.token);
  setStoredUser(data.user);
  return data;
};

export const loginAPI = async ({ email, password }) => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Login failed');
  }
  setToken(data.token);
  setStoredUser(data.user);
  return data;
};

export const getMeAPI = async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    removeToken();
    throw new Error(data.error || 'Session expired');
  }
  return data.user;
};

// ==========================================
// Protected Task APIs
// ==========================================

export const fetchTasksAPI = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.completed !== undefined && params.completed !== '') query.append('completed', params.completed);
  if (params.priority) query.append('priority', params.priority);
  if (params.search) query.append('search', params.search);

  const url = query.toString() ? `${BASE_URL}/tasks?${query.toString()}` : `${BASE_URL}/tasks`;
  const res = await fetch(url, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error('401_UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to fetch tasks');
  }
  return data.data;
};

export const createTaskAPI = async (taskData) => {
  const res = await fetch(`${BASE_URL}/tasks`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(taskData)
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error('401_UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to create task');
  }
  return data.data;
};

export const updateTaskAPI = async (id, updates) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(updates)
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error('401_UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to update task');
  }
  return data.data;
};

export const deleteTaskAPI = async (id) => {
  const res = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401) {
      removeToken();
      throw new Error('401_UNAUTHORIZED');
    }
    throw new Error(data.error || 'Failed to delete task');
  }
  return data.data;
};
