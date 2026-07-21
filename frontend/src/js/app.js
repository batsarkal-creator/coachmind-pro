/**
 * CoachMind Pro - Main Application
 * Entry point and global event handlers
 */

// Import utility functions and services
import { api } from './api.js';
import { formatFileSize, getFileIcon, getDifficultyClass, getDifficultyName, dataService, appState } from './data.js';
import { dashboardView } from './dashboard.js';
import { folderView } from './folders.js';
import { aiCoachView } from './ai-coach.js';

class ModalView {
    constructor() {
        this.overlay = document.getElementById('modalOverlay');
        this.title = document.getElementById('modalTitle');
        this.body = document.getElementById('modalBody');
        this.closeBtn = document.getElementById('modalClose');

        this.init();
    }

    init() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.overlay.addEventListener('click', (e) => {
            if (e.target === this.overlay) this.close();
        });

        // ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });
    }

    open(title, content) {
        this.title.textContent = title;
        this.body.innerHTML = content;
        this.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    openFile(fileId) {
        return this.openFileById(fileId);
    }

    async openFileById(fileId) {
        try {
            const file = await dataService.getFile(fileId);
            if (!file) return;

            this.open(file.name, `
                <p>${file.description || ''}</p>
                <div class="workout-detail">
                    <h5>📂 معلومات الملف</h5>
                    <p>النوع: ${file.file_type} | الحجم: ${file.file_size ? formatFileSize(file.file_size) : 'غير معروف'} | المشاهدات: ${file.view_count || 0}</p>
                </div>
                <div class="workout-detail">
                    <h5>🏷️ الوسوم</h5>
                    <p>${(file.tags || []).map(t => `<span class="tag tag-ai">${t}</span>`).join(' ')}</p>
                </div>
                <div class="workout-detail">
                    <h5>💪 العضلات المستهدفة</h5>
                    <p>${(file.muscle_groups || []).map(m => `<span class="tag">${m}</span>`).join(' ')}</p>
                </div>
                ${this.renderModalActions()}
            `);
        } catch (error) {
            console.error('Failed to load file:', error);
            this.open('خطأ', '<p>تعذر تحميل بيانات الملف</p>');
        }
    }

    showInsightDetails(insight) {
        const iconMap = { tip: '💡', warning: '⚠️', recommendation: '📋', analysis: '📊', info: 'ℹ️', goal: '🎯' };
        const icon = insight.icon || iconMap[insight.insight_type || insight.type] || '💡';
        const typeLabel = (insight.insight_type || insight.type) === 'warning' ? 'تنبيه' : 'توصية';
        this.open(insight.title, `
            <div class="workout-detail">
                <h5>${icon} ${typeLabel}</h5>
                <p>${insight.content}</p>
            </div>
            <div class="workout-detail">
                <h5>📊 التحليل</h5>
                <p>تم إنشاء هذه التوصية بناءً على تحليل بياناتك الأخيرة باستخدام نموذج المدرب الذكي.</p>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn-primary" style="flex:1;" onclick="aiCoachView.handleAction(${insight.id}, 'read'); modalView.close();">
                    ✓ تم الفهم
                </button>
                <button class="btn" style="flex:1;" onclick="modalView.close();">
                    إغلاق
                </button>
            </div>
        `);
    }

    showCreateModal(type) {
        const options = {
            file: [
                { icon: '📄', title: 'ملف PDF', desc: 'رفع ملف PDF' },
                { icon: '🎥', title: 'فيديو تدريبي', desc: 'رفع فيديو توضيحي' },
                { icon: '📊', title: 'جدول بيانات', desc: 'إنشاء جدول Excel' },
                { icon: '🖼️', title: 'صور توضيحية', desc: 'رفع صور' }
            ],
            plan: [
                { icon: '💪', title: 'خطة بناء عضلات', desc: '3-6 أيام/أسبوع' },
                { icon: '🔥', title: 'خطة حرق دهون', desc: 'HIIT + كارديو' },
                { icon: '🏃', title: 'خطة تحمل', desc: 'تدريب marathon' },
                { icon: '🤖', title: 'خطة AI مخصصة', desc: 'حسب بياناتك' }
            ]
        };

        const items = options[type] || options.file;

        this.open('إنشاء جديد', `
            <div style="display:grid; gap:12px;">
                ${items.map(item => `
                    <button class="btn" style="padding:18px; justify-content:flex-start; gap:16px; text-align:right;"
                            onmouseover="this.style.borderColor='var(--accent)'" 
                            onmouseout="this.style.borderColor='var(--border)'">
                        <span style="font-size:28px;">${item.icon}</span>
                        <div>
                            <div style="font-weight:800; color:var(--text-primary); font-size:15px;">${item.title}</div>
                            <div style="font-size:13px; color:var(--text-muted); margin-top:4px;">${item.desc}</div>
                        </div>
                    </button>
                `).join('')}
            </div>
        `);
    }

    renderModalActions() {
        return `
            <div style="display:flex; gap:12px; margin-top:24px; padding-top:20px; border-top:1px solid var(--border);">
                <button class="btn btn-primary" style="flex:1; justify-content:center;">
                    ▶️ بدء التمرين
                </button>
                <button class="btn" style="flex:1; justify-content:center;">
                    📥 تحميل PDF
                </button>
                <button class="btn" style="flex:1; justify-content:center;">
                    ⭐ حفظ
                </button>
            </div>
        `;
    }
}

const modalView = new ModalView();

// ==================== TOAST SYSTEM ====================

class ToastSystem {
    constructor() {
        this.container = null;
        this.toasts = new Map();
        this.init();
    }

    init() {
        // Create container
        this.container = document.createElement('div');
        this.container.className = 'toast-container';
        document.body.appendChild(this.container);

        // Subscribe to state
        appState.subscribe('toastAdded', (toast) => this.show(toast));
        appState.subscribe('toastRemoved', (id) => this.remove(id));
    }

    show(toast) {
        const el = document.createElement('div');
        el.className = `toast ${toast.type}`;
        el.innerHTML = `
            <span class="toast-icon">${this.getIcon(toast.type)}</span>
            <div class="toast-content">
                <div class="toast-title">${toast.title}</div>
                <div class="toast-message">${toast.message}</div>
            </div>
            <button class="toast-close" onclick="toastSystem.dismiss(${toast.id})">✕</button>
            <div class="toast-progress" style="width: 100%;"></div>
        `;

        this.container.appendChild(el);
        this.toasts.set(toast.id, el);

        // Animate progress
        const progress = el.querySelector('.toast-progress');
        progress.style.transition = `width ${toast.duration || 5000}ms linear`;
        requestAnimationFrame(() => {
            progress.style.width = '0%';
        });
    }

    remove(id) {
        const el = this.toasts.get(id);
        if (el) {
            el.classList.add('removing');
            setTimeout(() => {
                el.remove();
                this.toasts.delete(id);
            }, 300);
        }
    }

    dismiss(id) {
        appState.removeToast(id);
    }

    getIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || 'ℹ️';
    }
}

const toastSystem = new ToastSystem();

// ==================== NAVIGATION ====================

class Navigation {
    constructor() {
        this.sidebar = document.getElementById('sidebar');
        this.currentPath = document.getElementById('currentPath');
        this.container = document.getElementById('contentArea');
        this.init();
    }

    init() {
        // Nav item clicks
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const view = item.dataset.view;
                if (view) {
                    this.switchView(view, item);
                }
            });
        });

        // Create button
        document.getElementById('createBtn').addEventListener('click', () => {
            modalView.showCreateModal('file');
        });

        // Notification button
        document.getElementById('notifBtn').addEventListener('click', () => {
            aiCoachView.togglePanel();
        });
    }

    switchView(view, element) {
        // Update active state
        document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
        if (element) element.classList.add('active');

        // Update breadcrumb
        const paths = {
            dashboard: 'لوحة التحكم',
            folders: 'المجلدات',
            plans: 'خطط التدريب',
            exercises: 'تمارين',
            ai: 'محلل AI',
            analytics: 'التحليلات',
            clients: 'المتدربين',
            settings: 'الإعدادات',
            help: 'المساعدة'
        };
        this.currentPath.textContent = paths[view] || view;

        // Render view
        switch(view) {
            case 'dashboard':
                dashboardView.render();
                break;
            case 'folders':
                dashboardView.render(); // Show folders overview
                break;
            case 'plans':
                this.renderPlansView();
                break;
            case 'exercises':
                this.renderExercisesView();
                break;
            case 'ai':
                this.renderAIView();
                break;
            default:
                this.renderPlaceholder(view);
        }
    }

    async renderPlansView() {
        this.container.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">📋</span>
                    خطط التدريب
                </div>
                <button class="btn btn-primary" onclick="modalView.showCreateModal('plan')">
                    <span>➕</span> خطة جديدة
                </button>
            </div>
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل الخطط...</p>
            </div>
        `;

        try {
            const plans = await dataService.getFiles({ file_type: 'pdf', tags: 'training_plan' });
            this.container.innerHTML = `
                <div class="section-header">
                    <div class="section-title">
                        <span class="icon">📋</span>
                        خطط التدريب
                    </div>
                    <button class="btn btn-primary" onclick="modalView.showCreateModal('plan')">
                        <span>➕</span> خطة جديدة
                    </button>
                </div>
                <div class="folders-grid">
                    ${(plans || []).map(p => `
                        <div class="folder-card" style="cursor:pointer;" onclick="modalView.openFileById(${p.id})">
                            <div class="folder-icon" style="background: ${p.color}18; font-size: 32px;">📋</div>
                            <div class="folder-name">${p.name}</div>
                            <div class="folder-meta">
                                <span>${p.description || 'خطة تدريبية'}</span>
                                <span>⭐ ${p.rating || 'جديد'}</span>
                            </div>
                            <div class="folder-progress">
                                <div class="folder-progress-bar" style="width: ${p.progress || 0}%; background: linear-gradient(90deg, ${p.color || '#ef4444'}, ${p.color || '#ef4444'}88);"></div>
                            </div>
                        </div>
                    `).join('') || '<div class="empty-state"><p>لا توجد خطط متاحة</p></div>'}
                </div>
            `;
        } catch (error) {
            console.error('Failed to load plans:', error);
            this.container.innerHTML = `
                <div class="alert alert-warning">
                    <h4>⚠️ تعذر تحميل الخطط</h4>
                    <p>جاري عرض بيانات تجريبية. تأكد من تشغيل الخادم الخلفي.</p>
                    <button class="btn btn-primary" onclick="navigation.renderPlansView()">إعادة المحاولة</button>
                </div>
            `;
        }
    }

    async renderExercisesView() {
        this.container.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">🏋️</span>
                    مكتبة التمارين
                </div>
                <div class="search-box" style="width: 300px;">
                    <span>🔍</span>
                    <input type="text" placeholder="ابحث عن تمرين..." id="exerciseSearch">
                </div>
            </div>
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل التمارين...</p>
            </div>
        `;

        try {
            const exercises = await dataService.getExercises();
            this.container.innerHTML = `
                <div class="section-header">
                    <div class="section-title">
                        <span class="icon">🏋️</span>
                        مكتبة التمارين
                    </div>
                    <div class="search-box" style="width: 300px;">
                        <span>🔍</span>
                        <input type="text" placeholder="ابحث عن تمرين..." id="exerciseSearch">
                    </div>
                </div>
                <div class="files-list">
                    <div class="file-row header">
                        <div>التمرين</div>
                        <div>العضلة المستهدفة</div>
                        <div>المستوى</div>
                        <div>التقييم</div>
                        <div></div>
                    </div>
                    ${(exercises || []).map(e => `
                        <div class="file-row" style="cursor:pointer;" onclick="modalView.open('${e.name}', '<div class=\\'workout-detail\\'><h5>📋 معلومات التمرين</h5><p>${e.name} (${e.name_en || ''})</p></div><div class=\\'workout-detail\\'><h5>💪 العضلة المستهدفة</h5><p>${e.primary_muscle || ''}</p></div><div class=\\'workout-detail\\'><h5>📊 المستوى</h5><p>${e.difficulty || ''}</p></div><div class=\\'workout-detail\\'><h5>📝 الوصف</h5><p>${e.description || 'تمرين'}</p></div>')">
                            <div class="file-info">
                                <div class="file-icon" style="background: var(--accent-glow); font-size: 20px;">${getFileIcon(e.category)}</div>
                                <div class="file-details">
                                    <div class="file-name">${e.name} (${e.name_en || ''})</div>
                                    <div class="file-desc">${e.description || 'تمرين'}</div>
                                </div>
                            </div>
                            <div class="file-date">${e.primary_muscle || ''}</div>
                            <div><span class="tag ${getDifficultyClass(e.difficulty)}">${getDifficultyName(e.difficulty)}</span></div>
                            <div class="file-size">⭐ ${e.avg_rating || 'جديد'}</div>
                            <div class="file-actions">
                                <button>▶️</button>
                                <button>⭐</button>
                            </div>
                        </div>
                    `).join('') || '<div class="empty-state"><p>لا توجد تمارين متاحة</p></div>'}
                </div>
            `;
        } catch (error) {
            console.error('Failed to load exercises:', error);
            this.container.innerHTML = `
                <div class="alert alert-warning">
                    <h4>⚠️ تعذر تحميل التمارين</h4>
                    <p>جاري عرض بيانات تجريبية. تأكد من تشغيل الخادم الخلفي.</p>
                    <button class="btn btn-primary" onclick="navigation.renderExercisesView()">إعادة المحاولة</button>
                </div>
            `;
        }
    }

    renderAIView() {
        document.getElementById('contentArea').innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">🤖</span>
                    محلل المدرب الذكي
                </div>
            </div>
            <div class="ai-banner" style="margin-bottom: 24px;">
                <div class="ai-banner-content">
                    <div class="ai-avatar" style="animation: none;">🧠</div>
                    <div class="ai-text">
                        <h3>تحليل شامل لبياناتك</h3>
                        <p>المدرب الذكي يحلل أداءك ويقدم توصيات مخصصة</p>
                    </div>
                </div>
            </div>
            <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 24px;">85%</div>
                    <div class="stat-label">دقة التحليل</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 24px;">12</div>
                    <div class="stat-label">توصية هذا الأسبوع</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value" style="font-size: 24px;">+15%</div>
                    <div class="stat-label">تحسن الأداء</div>
                </div>
            </div>
            <div style="margin-top: 24px;">
                <button class="btn btn-primary btn-lg" style="width: 100%;" onclick="aiCoachView.simulateAIInsight()">
                    🔄 تحديث التحليل
                </button>
            </div>
        `;
    }

    renderPlaceholder(view) {
        document.getElementById('contentArea').innerHTML = `
            <div class="empty-state" style="padding: 100px 20px;">
                <div class="icon" style="font-size: 80px;">🚧</div>
                <h3>قيد التطوير</h3>
                <p>هذه الصفحة قيد التطوير. سيتم إضافتها قريباً!</p>
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="dashboardView.render()">
                    العودة للوحة التحكم
                </button>
            </div>
        `;
    }
}

// ==================== APP INITIALIZATION ====================

class App {
    constructor() {
        this.navigation = new Navigation();
        window.navigation = this.navigation;
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        console.log('🧠 CoachMind Pro initializing...');

        // Auto-login if no token
        if (!api.token) {
            try {
                await api.login('demo', 'demo123');
                console.log('✅ Auto-logged in as demo user');
            } catch (e) {
                console.warn('Auto-login failed:', e);
            }
        }

        // Render dashboard
        dashboardView.render();

        // Load AI insights
        aiCoachView.loadInsights();

        // Simulate periodic AI insights
        setInterval(() => {
            if (Math.random() > 0.7) {
                aiCoachView.simulateAIInsight();
            }
        }, 30000);

        this.initialized = true;
        console.log('✅ CoachMind Pro ready!');

        // Welcome toast
        setTimeout(() => {
            appState.addToast({
                type: 'success',
                title: 'أهلاً بك في CoachMind Pro!',
                message: 'المدرب الذكي جاهز لمساعدتك في تحقيق أهدافك',
                duration: 6000
            });
        }, 1000);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const app = new App();
    app.init();
});

// Export global instances for inline event handlers
window.modalView = modalView;
window.dashboardView = dashboardView;
window.folderView = folderView;
window.aiCoachView = aiCoachView;
window.appState = appState;
window.toastSystem = toastSystem;
