import axios from 'axios';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('msrcasc_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('msrcasc_token');
      localStorage.removeItem('msrcasc_user');
      // Only redirect if not already on login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ─── AUTH API ───
export const authAPI = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  getMe: () => API.get('/auth/me'),
};

// ─── PROFILE API ───
export const profileAPI = {
  getMyProfile: () => API.get('/profiles/me'),
  createProfile: (data) => API.post('/profiles', data),
  getProfile: (userId) => API.get(`/profiles/${userId}`),
  getAllProfiles: (params) => API.get('/profiles', { params }),
};

// ─── JOB API ───
export const jobAPI = {
  getAllJobs: (params) => API.get('/jobs', { params }),
  getJob: (id) => API.get(`/jobs/${id}`),
  createJob: (data) => API.post('/jobs', data),
  applyToJob: (id) => API.post(`/jobs/${id}/apply`),
  getApplicants: (id) => API.get(`/jobs/${id}/applicants`),
};

// ─── MESSAGE API ───
export const messageAPI = {
  getMessages: (userId) => API.get(`/messages/${userId}`),
  getConversations: () => API.get('/messages/conversations/list'),
  getChatUsers: () => API.get('/messages/users/list'),
};

// ─── AI API ───
export const aiAPI = {
  analyzeResume: (resumeText) => API.post('/ai/analyze-resume', { resumeText }),
  recommendJobs: (skills) => API.post('/ai/recommend-jobs', { skills }),
  analyzeSkillGap: (skills, jobId) => API.post('/ai/skill-gap', { skills, jobId }),
};

export default API;
