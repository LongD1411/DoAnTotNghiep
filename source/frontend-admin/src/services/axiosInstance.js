import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const instance = axios.create({ baseURL: API_URL });

// ── Helpers ───────────────────────────────────────────────────────────────────

const getStorage = () =>
  localStorage.getItem('access_token') ? localStorage : sessionStorage;

const getToken  = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);
const saveToken = (key, val) => getStorage().setItem(key, val);

const clearAndRedirect = () => {
  ['access_token', 'refresh_token'].forEach(k => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
  window.location.href = '/dang-nhap';
};

// ── Request — attach Bearer token automatically ───────────────────────────────

instance.interceptors.request.use(config => {
  const token = getToken('access_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// ── Response — auto-refresh on 401 ───────────────────────────────────────────

let refreshing = false;
let queue = [];  // requests waiting while refresh is in progress

const drainQueue = (err, token) => {
  queue.forEach(({ resolve, reject }) => (err ? reject(err) : resolve(token)));
  queue = [];
};

instance.interceptors.response.use(
  res => res,
  async err => {
    const original = err.config;

    // Only intercept 401 once per request (avoid infinite loop)
    if (err.response?.status !== 401 || original._retry) {
      return Promise.reject(err);
    }

    // If a refresh is already in progress, queue this request
    if (refreshing) {
      return new Promise((resolve, reject) => queue.push({ resolve, reject }))
        .then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return instance(original);
        });
    }

    original._retry = true;
    refreshing      = true;

    const refreshToken = getToken('refresh_token');
    if (!refreshToken) {
      drainQueue(err, null);
      refreshing = false;
      clearAndRedirect();
      return Promise.reject(err);
    }

    try {
      // Use plain axios (not instance) to avoid interceptor loop
      const res = await axios.post(`${API_URL}/auth/refresh`, { refresh_token: refreshToken });
      const { access_token, refresh_token: newRefresh } = res.data.data;

      saveToken('access_token', access_token);
      saveToken('refresh_token', newRefresh);

      instance.defaults.headers.common.Authorization = `Bearer ${access_token}`;
      original.headers.Authorization = `Bearer ${access_token}`;

      drainQueue(null, access_token);
      return instance(original);
    } catch (refreshErr) {
      drainQueue(refreshErr, null);
      clearAndRedirect();
      return Promise.reject(refreshErr);
    } finally {
      refreshing = false;
    }
  }
);

export default instance;
