/**
 * CoachMind Pro - API Client
 * Handles all backend communication with refresh token support
 */

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'https://coachmind-pro-1.onrender.com/api/v1';

class APIClient {
    constructor() {
        this.baseURL = API_BASE_URL;
        this.token = localStorage.getItem('coachmind_token');
        this.refreshToken = localStorage.getItem('coachmind_refresh_token');
        this.refreshPromise = null;
    }

    setToken(token, refreshToken) {
        this.token = token;
        localStorage.setItem('coachmind_token', token);
        if (refreshToken) {
            this.refreshToken = refreshToken;
            localStorage.setItem('coachmind_refresh_token', refreshToken);
        }
    }

    clearToken() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('coachmind_token');
        localStorage.removeItem('coachmind_refresh_token');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const timeout = options.timeout || 15000;

        const config = {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(options.headers || {})
            }
        };

        if (this.token) {
            config.headers['Authorization'] = `Bearer ${this.token}`;
        }

        if (options.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        delete config.timeout;

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        config.signal = controller.signal;

        try {
            const response = await fetch(url, config);
            clearTimeout(timeoutId);

            if (response.status === 401 && this.refreshToken && !endpoint.includes('/auth/')) {
                const refreshed = await this.tryRefreshToken();
                if (refreshed) {
                    config.headers['Authorization'] = `Bearer ${this.token}`;
                    const retryResponse = await fetch(url, config);
                    if (!retryResponse.ok) {
                        const error = await retryResponse.json().catch(() => ({ detail: 'حدث خطأ' }));
                        throw new Error(error.detail || `HTTP ${retryResponse.status}`);
                    }
                    if (retryResponse.status === 204) return null;
                    return await retryResponse.json();
                }
            }

            if (!response.ok) {
                const error = await response.json().catch(() => ({ detail: 'حدث خطأ غير متوقع' }));
                let message = 'حدث خطأ غير متوقع';
                if (typeof error.detail === 'string') {
                    message = error.detail;
                } else if (Array.isArray(error.detail)) {
                    const first = error.detail[0];
                    if (first && first.msg) {
                        const field = first.loc ? first.loc[first.loc.length - 1] : '';
                        const fieldAr = { password: 'كلمة المرور', email: 'البريد الإلكتروني', username: 'اسم المستخدم', full_name: 'الاسم' };
                        message = (fieldAr[field] || field) + ': ' + first.msg;
                    }
                }
                throw new Error(message);
            }

            if (response.status === 204) return null;
            return await response.json();
        } catch (error) {
            clearTimeout(timeoutId);
            if (error.name === 'AbortError') {
                throw new Error('الخادم يستغرق وقتاً طويلاً. جرب مرة أخرى.');
            }
            throw error;
        }
    }

    async tryRefreshToken() {
        if (this.refreshPromise) return this.refreshPromise;

        this.refreshPromise = (async () => {
            try {
                const response = await fetch(`${this.baseURL}/auth/refresh?refresh_token=${this.refreshToken}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' }
                });

                if (!response.ok) {
                    this.clearToken();
                    return false;
                }

                const data = await response.json();
                this.setToken(data.access_token, data.refresh_token);
                return true;
            } catch {
                this.clearToken();
                return false;
            } finally {
                this.refreshPromise = null;
            }
        })();

        return this.refreshPromise;
    }

    // ==================== AUTH ====================

    async login(username, password) {
        const formData = new URLSearchParams();
        formData.append('username', username);
        formData.append('password', password);

        const data = await this.request('/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: formData
        });

        this.setToken(data.access_token, data.refresh_token);
        return data;
    }

    async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    async getMe() {
        return await this.request('/auth/me');
    }

    async logout() {
        try {
            await this.request('/auth/logout', { method: 'POST' });
        } catch {}
        this.clearToken();
    }

    async requestPasswordReset(email) {
        return await this.request('/auth/password-reset-request', {
            method: 'POST',
            body: JSON.stringify({ email })
        });
    }

    async resetPassword(token, newPassword) {
        return await this.request('/auth/password-reset', {
            method: 'POST',
            body: JSON.stringify({ token, new_password: newPassword })
        });
    }

    // ==================== USERS ====================

    async getProfile() {
        return await this.request('/users/profile');
    }

    async updateProfile(data) {
        return await this.request('/users/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async uploadAvatar(file) {
        const formData = new FormData();
        formData.append('file', file);
        return await this.request('/users/avatar', {
            method: 'POST',
            body: formData
        });
    }

    // ==================== FOLDERS ====================

    async getFolders(parentId = null, skip = 0, limit = 20) {
        const params = new URLSearchParams();
        if (parentId) params.append('parent_id', parentId);
        if (skip) params.append('skip', skip);
        if (limit) params.append('limit', limit);
        const query = params.toString() ? `?${params.toString()}` : '';
        return await this.request(`/folders/${query}`);
    }

    async getFolder(id) {
        return await this.request(`/folders/${id}`);
    }

    async createFolder(data) {
        return await this.request('/folders/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateFolder(id, data) {
        return await this.request(`/folders/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteFolder(id) {
        return await this.request(`/folders/${id}`, { method: 'DELETE' });
    }

    // ==================== FILES ====================

    async getFiles(filters = {}, skip = 0, limit = 20) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        if (skip) params.append('skip', skip);
        if (limit) params.append('limit', limit);
        return await this.request(`/files/?${params.toString()}`);
    }

    async getFile(id) {
        return await this.request(`/files/${id}`);
    }

    async createFile(data) {
        return await this.request('/files/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async uploadFile(folderId, file) {
        const formData = new FormData();
        formData.append('file', file);
        return await this.request(`/files/upload?folder_id=${folderId}`, {
            method: 'POST',
            body: formData
        });
    }

    async updateFile(id, data) {
        return await this.request(`/files/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteFile(id) {
        return await this.request(`/files/${id}`, { method: 'DELETE' });
    }

    async downloadFile(id) {
        return `${this.baseURL}/files/${id}/download`;
    }

    // ==================== WORKOUTS ====================

    async getWorkouts(status = null, skip = 0, limit = 20) {
        const params = new URLSearchParams();
        if (status) params.append('status', status);
        if (skip) params.append('skip', skip);
        if (limit) params.append('limit', limit);
        return await this.request(`/workouts/?${params.toString()}`);
    }

    async getWorkout(id) {
        return await this.request(`/workouts/${id}`);
    }

    async createWorkout(data) {
        return await this.request('/workouts/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateWorkout(id, data) {
        return await this.request(`/workouts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteWorkout(id) {
        return await this.request(`/workouts/${id}`, { method: 'DELETE' });
    }

    // ==================== AI COACH ====================

    async analyzeWorkout(workoutData, userMetrics) {
        return await this.request('/ai/analyze-workout', {
            method: 'POST',
            body: JSON.stringify({ workout_data: workoutData, user_metrics: userMetrics })
        });
    }

    async analyzeRecovery(userMetrics) {
        return await this.request('/ai/analyze-recovery', {
            method: 'POST',
            body: JSON.stringify(userMetrics)
        });
    }

    async generatePlan(request) {
        return await this.request('/ai/generate-plan', {
            method: 'POST',
            body: JSON.stringify(request)
        });
    }

    async getInsights(limit = 10, unreadOnly = false) {
        return await this.request(`/ai/insights?limit=${limit}&unread_only=${unreadOnly}`);
    }

    async markInsightRead(id) {
        return await this.request(`/ai/insights/${id}/read`, { method: 'POST' });
    }

    // ==================== DASHBOARD ====================

    async getDashboard() {
        return await this.request('/dashboard/');
    }

    // ==================== EXERCISES ====================

    async getExercises(filters = {}, skip = 0, limit = 20) {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                params.append(key, value);
            }
        });
        if (skip) params.append('skip', skip);
        if (limit) params.append('limit', limit);
        return await this.request(`/exercises/?${params.toString()}`);
    }

    async getExercise(id) {
        return await this.request(`/exercises/${id}`);
    }

    async updateExercise(id, data) {
        return await this.request(`/exercises/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteExercise(id) {
        return await this.request(`/exercises/${id}`, { method: 'DELETE' });
    }

    // ==================== PROGRESS ====================

    async getProgressLogs(skip = 0, limit = 30) {
        return await this.request(`/progress/?skip=${skip}&limit=${limit}`);
    }

    async getLatestProgress() {
        return await this.request('/progress/latest');
    }

    async createProgressLog(data) {
        return await this.request('/progress/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deleteProgressLog(id) {
        return await this.request(`/progress/${id}`, { method: 'DELETE' });
    }

    // ==================== TRAINING PLANS ====================

    async getPlans(skip = 0, limit = 20) {
        return await this.request(`/plans/?skip=${skip}&limit=${limit}`);
    }

    async getPlan(id) {
        return await this.request(`/plans/${id}`);
    }

    async createPlan(data) {
        return await this.request('/plans/', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async deletePlan(id) {
        return await this.request(`/plans/${id}`, { method: 'DELETE' });
    }
}

export const api = new APIClient();
