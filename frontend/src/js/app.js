/**
 * CoachMind Pro - Main Application
 * Entry point and global event handlers
 */

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

    openFile(fileKey) {
        const data = MOCK_WORKOUT_DATA[fileKey];
        if (!data) {
            this.open('ملف غير موجود', '<p>عذراً، لم يتم العثور على بيانات هذا الملف.</p>');
            return;
        }
        this.open(data.title, data.content + this.renderModalActions());
    }

    openFileById(fileId) {
        const file = MOCK_FILES.find(f => f.id === fileId);
        if (!file) return;

        // Map file name to workout data key
        const keyMap = {
            'تمرين الضغط المتقدم': 'bench',
            'برنامج HIIT لحرق الدهون': 'hiit',
            'وضعيات اليوغا للاستشفاء': 'yoga',
            'جدول التغذية الأسبوعي': 'meal'
        };

        const key = keyMap[file.name];
        if (key && MOCK_WORKOUT_DATA[key]) {
            this.openFile(key);
        } else {
            this.open(file.name, `
                <p>${file.description}</p>
                <div class="workout-detail">
                    <h5>📂 معلومات الملف</h5>
                    <p>النوع: ${file.file_type} | الحجم: ${file.size} | المشاهدات: ${file.view_count}</p>
                </div>
                <div class="workout-detail">
                    <h5>🏷️ الوسوم</h5>
                    <p>${file.tags.map(t => `<span class="tag tag-ai">${t}</span>`).join(' ')}</p>
                </div>
                ${this.renderModalActions()}
            `);
        }
    }

    showInsightDetails(insight) {
        this.open(insight.title, `
            <div class="workout-detail">
                <h5>${insight.icon} ${insight.type === 'warning' ? 'تنبيه' : 'توصية'}</h5>
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

    renderPlansView() {
        document.getElementById('contentArea').innerHTML = `
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
                ${[
                    { name: 'بناء العضلات - 12 أسبوع', icon: '💪', desc: '3 أيام/أسبوع', color: '#ef4444' },
                    { name: 'حرق الدهون - 8 أسابيع', icon: '🔥', desc: '5 أيام/أسبوع', color: '#f59e0b' },
                    { name: 'القوة الخارقة - 16 أسبوع', icon: '🏋️', desc: '4 أيام/أسبوع', color: '#8b5cf6' },
                    { name: 'الماراثون - 20 أسبوع', icon: '🏃', desc: '6 أيام/أسبوع', color: '#3b82f6' },
                    { name: 'YOGA Flow - 6 أسابيع', icon: '🧘', desc: '4 أيام/أسبوع', color: '#10b981' },
                    { name: 'خطة AI مخصصة', icon: '🤖', desc: 'حسب بياناتك', color: '#ec4899' }
                ].map(p => `
                    <div class="folder-card" style="cursor:pointer;">
                        <div class="folder-icon" style="background: ${p.color}18; font-size: 32px;">${p.icon}</div>
                        <div class="folder-name">${p.name}</div>
                        <div class="folder-meta">
                            <span>${p.desc}</span>
                            <span>⭐ 4.8</span>
                        </div>
                        <div class="folder-progress">
                            <div class="folder-progress-bar" style="width: ${Math.floor(Math.random() * 40 + 30)}%; background: linear-gradient(90deg, ${p.color}, ${p.color}88);"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderExercisesView() {
        document.getElementById('contentArea').innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">🏋️</span>
                    مكتبة التمارين
                </div>
                <div class="search-box" style="width: 300px;">
                    <span>🔍</span>
                    <input type="text" placeholder="ابحث عن تمرين...">
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
                ${[
                    { name: 'Bench Press', ar: 'الضغط', muscle: 'الصدر', level: 'متقدم', rating: 4.9, icon: '🏋️' },
                    { name: 'Squat', ar: 'السكوات', muscle: 'الفخذ', level: 'متوسط', rating: 4.8, icon: '🦵' },
                    { name: 'Deadlift', ar: 'الديدليفت', muscle: 'الظهر', level: 'متقدم', rating: 4.7, icon: '🏋️' },
                    { name: 'Pull Up', ar: 'السحب', muscle: 'الظهر', level: 'متوسط', rating: 4.6, icon: '💪' },
                    { name: 'Plank', ar: 'البلانك', muscle: 'البطن', level: 'مبتدئ', rating: 4.5, icon: '🧘' },
                    { name: 'Burpees', ar: 'البربيز', muscle: 'كامل الجسم', level: 'متقدم', rating: 4.4, icon: '🔥' }
                ].map(e => `
                    <div class="file-row" style="cursor:pointer;">
                        <div class="file-info">
                            <div class="file-icon" style="background: var(--accent-glow); font-size: 20px;">${e.icon}</div>
                            <div class="file-details">
                                <div class="file-name">${e.ar} (${e.name})</div>
                                <div class="file-desc">تمرين مركب أساسي</div>
                            </div>
                        </div>
                        <div class="file-date">${e.muscle}</div>
                        <div><span class="tag ${e.level === 'مبتدئ' ? 'tag-beginner' : e.level === 'متوسط' ? 'tag-intermediate' : 'tag-advanced'}">${e.level}</span></div>
                        <div class="file-size">⭐ ${e.rating}</div>
                        <div class="file-actions">
                            <button>▶️</button>
                            <button>⭐</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
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
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;

        console.log('🧠 CoachMind Pro initializing...');

        // Render dashboard
        dashboardView.render();

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
