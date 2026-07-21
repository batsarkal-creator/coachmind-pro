/**
 * CoachMind Pro - Data & State Management
 * Real API integration with local state management
 */

// ==================== STATE MANAGEMENT ====================

class AppState {
    constructor() {
        this.currentView = 'dashboard';
        this.currentFolder = null;
        this.user = null;
        this.isLoading = false;
        this.toasts = [];
        this.listeners = new Map();
    }

    // Subscribe to state changes
    subscribe(key, callback) {
        if (!this.listeners.has(key)) {
            this.listeners.set(key, new Set());
        }
        this.listeners.get(key).add(callback);

        // Return unsubscribe function
        return () => this.listeners.get(key).delete(callback);
    }

    // Emit state change
    emit(key, data) {
        if (this.listeners.has(key)) {
            this.listeners.get(key).forEach(cb => cb(data));
        }
    }

    // Set current view
    setView(view, params = {}) {
        this.currentView = view;
        this.currentFolder = params.folderId || null;
        this.emit('viewChanged', { view, params });
    }

    // Set user
    setUser(user) {
        this.user = user;
        this.emit('userChanged', user);
    }

    // Loading state
    setLoading(loading) {
        this.isLoading = loading;
        this.emit('loadingChanged', loading);
    }

    // Add toast
    addToast(toast) {
        const id = Date.now();
        this.toasts.push({ ...toast, id });
        this.emit('toastAdded', { ...toast, id });

        // Auto remove
        setTimeout(() => {
            this.removeToast(id);
        }, toast.duration || 5000);

        return id;
    }

    removeToast(id) {
        this.toasts = this.toasts.filter(t => t.id !== id);
        this.emit('toastRemoved', id);
    }
}

// Global state instance
const appState = new AppState();

// ==================== API WRAPPER WITH STATE ====================

class DataService {
    constructor() {
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Generic cached fetch
    async fetchWithCache(key, fetchFn, forceRefresh = false) {
        const cached = this.cache.get(key);
        if (!forceRefresh && cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }

        appState.setLoading(true);
        try {
            const data = await fetchFn();
            this.cache.set(key, { data, timestamp: Date.now() });
            return data;
        } finally {
            appState.setLoading(false);
        }
    }

    // Invalidate cache
    invalidateCache(key) {
        this.cache.delete(key);
    }

    invalidateAll() {
        this.cache.clear();
    }

    // ==================== AUTH ====================

    async login(username, password) {
        const data = await api.login(username, password);
        if (data.user) {
            appState.setUser(data.user);
        }
        return data;
    }

    async register(userData) {
        return await api.register(userData);
    }

    async getCurrentUser() {
        return await this.fetchWithCache('currentUser', () => api.getMe());
    }

    async updateProfile(data) {
        const result = await api.updateProfile(data);
        this.invalidateCache('currentUser');
        return result;
    }

    logout() {
        api.clearToken();
        appState.setUser(null);
        this.invalidateAll();
    }

    // ==================== FOLDERS ====================

    async getFolders(parentId = null, skip = 0, limit = 20) {
        const key = `folders_${parentId || 'root'}_${skip}_${limit}`;
        return this.fetchWithCache(key, () => api.getFolders(parentId, skip, limit));
    }

    async getFolder(id) {
        return this.fetchWithCache(`folder_${id}`, () => api.getFolder(id));
    }

    async createFolder(data) {
        const result = await api.createFolder(data);
        this.invalidateCache(`folders_${data.parent_id || 'root'}`);
        return result;
    }

    async updateFolder(id, data) {
        const result = await api.updateFolder(id, data);
        this.invalidateCache(`folder_${id}`);
        this.invalidateCache(`folders_${data.parent_id || 'root'}`);
        return result;
    }

    async deleteFolder(id) {
        const result = await api.deleteFolder(id);
        this.invalidateAll(); // Folder deletion affects tree
        return result;
    }

    // ==================== FILES ====================

    async getFiles(filters = {}, skip = 0, limit = 20) {
        const key = `files_${JSON.stringify(filters)}_${skip}_${limit}`;
        return this.fetchWithCache(key, () => api.getFiles(filters, skip, limit));
    }

    async getFile(id) {
        return this.fetchWithCache(`file_${id}`, () => api.getFile(id));
    }

    async createFile(data) {
        const result = await api.createFile(data);
        this.invalidateCache(`files_${JSON.stringify({ folder_id: data.folder_id })}`);
        return result;
    }

    async uploadFile(folderId, file) {
        const result = await api.uploadFile(folderId, file);
        this.invalidateCache(`files_${JSON.stringify({ folder_id: folderId })}`);
        return result;
    }

    async updateFile(id, data) {
        const result = await api.updateFile(id, data);
        this.invalidateCache(`file_${id}`);
        return result;
    }

    async deleteFile(id) {
        const result = await api.deleteFile(id);
        this.invalidateAll();
        return result;
    }

    // ==================== WORKOUTS ====================

    async getWorkouts(status = null, skip = 0, limit = 20) {
        const key = `workouts_${status || 'all'}_${skip}_${limit}`;
        return this.fetchWithCache(key, () => api.getWorkouts(status, skip, limit));
    }

    async getWorkout(id) {
        return this.fetchWithCache(`workout_${id}`, () => api.getWorkout(id));
    }

    async createWorkout(data) {
        const result = await api.createWorkout(data);
        this.invalidateCache('workouts_all');
        return result;
    }

    async updateWorkout(id, data) {
        const result = await api.updateWorkout(id, data);
        this.invalidateCache(`workout_${id}`);
        this.invalidateCache('workouts_all');
        return result;
    }

    async deleteWorkout(id) {
        const result = await api.deleteWorkout(id);
        this.invalidateCache('workouts_all');
        return result;
    }

    // ==================== EXERCISES ====================

    async getExercises(filters = {}, skip = 0, limit = 20) {
        const key = `exercises_${JSON.stringify(filters)}_${skip}_${limit}`;
        return this.fetchWithCache(key, () => api.getExercises(filters, skip, limit));
    }

    async getExercise(id) {
        return this.fetchWithCache(`exercise_${id}`, () => api.getExercise(id));
    }

    // ==================== AI COACH ====================

    async analyzeWorkout(workoutData, userMetrics) {
        return await api.analyzeWorkout(workoutData, userMetrics);
    }

    async analyzeRecovery(userMetrics) {
        return await api.analyzeRecovery(userMetrics);
    }

    async generateTrainingPlan(request) {
        return await api.generatePlan(request);
    }

    async getInsights(limit = 10, unreadOnly = false) {
        return await api.getInsights(limit, unreadOnly);
    }

    async markInsightRead(id) {
        const result = await api.markInsightRead(id);
        this.invalidateCache('insights');
        return result;
    }

    // ==================== DASHBOARD ====================

    async getDashboard() {
        return this.fetchWithCache('dashboard', () => api.getDashboard());
    }

    // ==================== SEED DATA (for demo) ====================

    async seedDatabase() {
        // Call backend seed endpoint if available
        return await api.request('/seed', { method: 'POST' });
    }
}

// Global data service instance
const dataService = new DataService();

// ==================== UTILITY FUNCTIONS ====================

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function formatRelativeTime(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return formatDate(dateString);
}

function getDifficultyClass(difficulty) {
    const classes = {
        beginner: 'tag-beginner',
        intermediate: 'tag-intermediate',
        advanced: 'tag-advanced',
        elite: 'tag-elite'
    };
    return classes[difficulty] || 'tag-beginner';
}

function getDifficultyName(difficulty) {
    const names = {
        beginner: 'مبتدئ',
        intermediate: 'متوسط',
        advanced: 'متقدم',
        elite: 'محترف'
    };
    return names[difficulty] || difficulty;
}

function getFileIcon(fileType) {
    const icons = {
        pdf: '📄',
        video: '🎥',
        image: '🖼️',
        spreadsheet: '📊',
        audio: '🎵'
    };
    return icons[fileType] || '📄';
}

function getFileTypeClass(fileType) {
    return `file-icon-${fileType}`;
}

// ==================== MOCK DATA (Fallback only) ====================
// Used only if API fails during development

const FALLBACK_FOLDERS = [
    { id: 1, name: 'القوة البدنية', description: 'تمارين بناء العضلات والقوة', icon: '💪', color: '#ef4444', file_count: 12, total_size: 145000000, is_system: true, progress: 75 },
    { id: 2, name: 'اللياقة القلبية', description: 'تمارين الكارديو والتحمل', icon: '🏃', color: '#3b82f6', file_count: 8, total_size: 89000000, is_system: true, progress: 60 },
    { id: 3, name: 'المرونة والتمدد', description: 'تمارين اليوغا والتمدد', icon: '🧘', color: '#8b5cf6', file_count: 6, total_size: 45000000, is_system: true, progress: 45 },
    { id: 4, name: 'التغذية الرياضية', description: 'خطط غذائية ووصفات', icon: '🥗', color: '#f59e0b', file_count: 15, total_size: 32000000, is_system: true, progress: 82 },
    { id: 5, name: 'التعافي والاستشفاء', description: 'نصائح التعافي والنوم', icon: '🛌', color: '#10b981', file_count: 4, total_size: 18000000, is_system: true, progress: 30 },
    { id: 6, name: 'خطط التدريب الجاهزة', description: 'خطط تدريبية معدة مسبقاً', icon: '📋', color: '#ec4899', file_count: 20, total_size: 56000000, is_system: true, progress: 90 }
];

const FALLBACK_FILES = [
    { id: 1, name: 'تمرين الضغط المتقدم', description: 'فيديو توضيحي - 4 مجموعات', file_type: 'video', difficulty: 'advanced', tags: ['chest', 'strength', 'compound'], muscle_groups: ['chest', 'triceps', 'shoulders'], view_count: 234, rating: 4.8, folder_id: 1, size: '45 MB', date: '2026-07-17', is_ai_generated: false },
    { id: 2, name: 'برنامج HIIT لحرق الدهون', description: 'خطة 4 أسابيع مكثفة', file_type: 'pdf', difficulty: 'intermediate', tags: ['cardio', 'fat_loss', 'hiit'], muscle_groups: ['full_body'], view_count: 567, rating: 4.6, folder_id: 2, size: '2.3 MB', date: '2026-07-16', is_ai_generated: false },
    { id: 3, name: 'وضعيات اليوغا للاستشفاء', description: '12 وضعية مع شرح تفصيلي', file_type: 'image', difficulty: 'beginner', tags: ['recovery', 'flexibility', 'yoga'], muscle_groups: ['full_body'], view_count: 189, rating: 4.9, folder_id: 3, size: '18 MB', date: '2026-07-15', is_ai_generated: false },
    { id: 4, name: 'جدول التغذية الأسبوعي', description: 'حساب السعرات والماكروز تلقائياً', file_type: 'spreadsheet', difficulty: 'beginner', tags: ['nutrition', 'meal_plan', 'ai_generated'], muscle_groups: [], view_count: 892, rating: 4.7, folder_id: 4, size: '850 KB', date: '2026-07-14', is_ai_generated: true },
    { id: 5, name: 'برنامج Push Pull Legs', description: 'خطة 6 أيام للمتقدمين', file_type: 'pdf', difficulty: 'advanced', tags: ['strength', 'hypertrophy', 'split'], muscle_groups: ['full_body'], view_count: 445, rating: 4.8, folder_id: 1, size: '1.2 MB', date: '2026-07-13', is_ai_generated: false },
    { id: 6, name: 'تتبع جودة النوم', description: 'جدول يومي مع نصائح AI', file_type: 'spreadsheet', difficulty: 'beginner', tags: ['recovery', 'sleep', 'tracking'], muscle_groups: [], view_count: 123, rating: 4.5, folder_id: 5, size: '120 KB', date: '2026-07-12', is_ai_generated: true }
];

const FALLBACK_INSIGHTS = [
    { id: 1, title: 'زيادة الحمل التدريبي!', content: 'حجم تدريبك اليوم أعلى بـ 15% عن معدلك. استمر في هذا الإيقاع!', type: 'tip', priority: 2, is_read: false, time: 'منذ 5 دقائق', icon: '💡' },
    { id: 2, title: 'تنبيه التعافي', content: 'معدل ضربات قلبك أثناء الراحة مرتفع 12% عن المعدل الطبيعي. أنصح بيوم راحة إضافي.', type: 'warning', priority: 4, is_read: false, time: 'منذ 30 دقيقة', icon: '⚠️' },
    { id: 3, title: 'تحليل الأسبوع', content: 'أكملت 85% من خطتك هذا الأسبوع. الأداء أفضل بـ 15% من الأسبوع الماضي!', type: 'info', priority: 1, is_read: false, time: 'منذ ساعتين', icon: '📊' },
    { id: 4, title: 'هدف جديد مقترح', content: 'بناءً على تقدمك، يمكنك تحقيق هدف رفع 100 كجم في السكوات خلال 6 أسابيع.', type: 'goal', priority: 2, is_read: false, time: 'منذ 4 ساعات', icon: '🎯' },
    { id: 5, title: 'تحسن في المرونة', content: 'لاحظت تحسناً ملحوظاً في اختبار الوصول الأمامي. زد من جلسات اليوغا!', type: 'info', priority: 1, is_read: true, time: 'منذ يوم', icon: '🧘' }
];

// ==================== EXPORTS ====================

export {
    formatFileSize,
    formatDate,
    formatRelativeTime,
    getDifficultyClass,
    getDifficultyName,
    getFileIcon,
    getFileTypeClass,
    FALLBACK_FOLDERS,
    FALLBACK_FILES,
    FALLBACK_INSIGHTS,
    appState,
    dataService
};