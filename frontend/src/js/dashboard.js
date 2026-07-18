/**
 * CoachMind Pro - Dashboard Module
 * Renders dashboard view with stats, folders, and recent files
 */

class DashboardView {
    constructor() {
        this.container = document.getElementById('contentArea');
    }

    render() {
        this.container.innerHTML = `
            ${this.renderAIBanner()}
            ${this.renderStats()}
            ${this.renderQuickActions()}
            ${this.renderFolders()}
            ${this.renderRecentFiles()}
        `;

        this.attachEventListeners();
    }

    renderAIBanner() {
        return `
            <div class="ai-banner">
                <div class="ai-banner-content">
                    <div class="ai-avatar">🧠</div>
                    <div class="ai-text">
                        <h3>المدرب الذكي يعمل الآن</h3>
                        <p>يحلل أداءك ويقترح خطة تدريب مخصصة لهذا الأسبوع</p>
                    </div>
                </div>
                <div class="ai-status">
                    <span class="dot"></span>
                    <span>نشط الآن</span>
                </div>
            </div>
        `;
    }

    renderStats() {
        const stats = [
            { value: '48', label: 'تمارين مخزنة', change: '+5', positive: true },
            { value: '12', label: 'خطة تدريب', change: '+2', positive: true },
            { value: '156', label: 'ساعة تدريب', change: '+12', positive: true },
            { value: '89%', label: 'معدل التقدم', change: '+3%', positive: true }
        ];

        return `
            <div class="stats-grid">
                ${stats.map(s => `
                    <div class="stat-card">
                        <div class="stat-value">${s.value}</div>
                        <div class="stat-label">${s.label}</div>
                        <div class="stat-change ${s.positive ? 'positive' : 'negative'}">
                            ${s.positive ? '📈' : '📉'} ${s.change} هذا الشهر
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderQuickActions() {
        const actions = [
            { icon: '➕', title: 'تمرين جديد', desc: 'ابدأ تمريناً جديداً', color: 'var(--accent)' },
            { icon: '📋', title: 'خطة تدريب', desc: 'إنشاء خطة مخصصة', color: 'var(--purple)' },
            { icon: '📊', title: 'تتبع التقدم', desc: 'سجل قياساتك', color: 'var(--info)' },
            { icon: '🤖', title: 'تحليل AI', desc: 'احصل على تحليل ذكي', color: 'var(--warning)' }
        ];

        return `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">⚡</span>
                    إجراءات سريعة
                </div>
            </div>
            <div class="quick-actions">
                ${actions.map(a => `
                    <div class="quick-action" onclick="dashboardView.handleQuickAction('${a.title}')">
                        <div class="quick-action-icon" style="background: ${a.color}20; color: ${a.color};">
                            ${a.icon}
                        </div>
                        <div class="quick-action-title">${a.title}</div>
                        <div class="quick-action-desc">${a.desc}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderFolders() {
        const folderIcons = {
            strength: '💪', cardio: '🏃', flexibility: '🧘',
            nutrition: '🥗', recovery: '🛌', plans: '📋'
        };

        const folderColors = {
            strength: '#ef4444', cardio: '#3b82f6', flexibility: '#8b5cf6',
            nutrition: '#f59e0b', recovery: '#10b981', plans: '#ec4899'
        };

        return `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">📁</span>
                    المجلدات الرئيسية
                </div>
                <div class="view-toggle">
                    <button class="view-btn active" data-view="grid" onclick="dashboardView.toggleView(this)">⊞</button>
                    <button class="view-btn" data-view="list" onclick="dashboardView.toggleView(this)">☰</button>
                </div>
            </div>
            <div class="folders-grid" id="foldersGrid">
                ${MOCK_FOLDERS.map(f => `
                    <div class="folder-card" onclick="folderView.openFolder(${f.id})">
                        <div class="folder-icon" style="background: ${folderColors[f.icon.replace(/[^a-z]/g, '')] || f.color}18;">
                            ${folderIcons[f.icon.replace(/[^a-z]/g, '')] || f.icon}
                        </div>
                        <div class="folder-name">${f.name}</div>
                        <div class="folder-meta">
                            <span>📄 ${f.file_count} ملف</span>
                            <span>🕐 منذ يوم</span>
                        </div>
                        <div class="folder-progress">
                            <div class="folder-progress-bar" style="width: ${f.progress}%; background: linear-gradient(90deg, ${f.color}, ${f.color}88);"></div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderRecentFiles() {
        const recentFiles = MOCK_FILES.slice(0, 4);
        const iconMap = { pdf: '📄', video: '🎥', image: '🖼️', spreadsheet: '📊' };
        const tagClass = { beginner: 'tag-beginner', intermediate: 'tag-intermediate', advanced: 'tag-advanced' };
        const tagName = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم' };

        return `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">📄</span>
                    الملفات الأخيرة
                </div>
                <button class="btn btn-sm" onclick="appState.setView('folders')">عرض الكل</button>
            </div>
            <div class="files-list">
                <div class="file-row header">
                    <div>الملف</div>
                    <div>المستوى</div>
                    <div>التاريخ</div>
                    <div>الحجم</div>
                    <div></div>
                </div>
                ${recentFiles.map(f => `
                    <div class="file-row" onclick="modalView.openFile('${f.name.toLowerCase().replace(/\s+/g, '_').substring(0, 10)}')">
                        <div class="file-info">
                            <div class="file-icon ${f.file_type}">${iconMap[f.file_type] || '📄'}</div>
                            <div class="file-details">
                                <div class="file-name">${f.name}</div>
                                <div class="file-desc">${f.description}</div>
                            </div>
                        </div>
                        <div><span class="tag ${tagClass[f.difficulty]}">${tagName[f.difficulty]}</span></div>
                        <div class="file-date">${f.date}</div>
                        <div class="file-size">${f.size}</div>
                        <div class="file-actions">
                            <button class="tooltip" data-tooltip="عرض">👁️</button>
                            <button class="tooltip" data-tooltip="مفضل">⭐</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }
    }

    handleSearch(query) {
        if (!query) {
            this.render();
            return;
        }

        const filtered = MOCK_FILES.filter(f => 
            f.name.includes(query) || 
            f.description.includes(query) ||
            f.tags.some(t => t.includes(query))
        );

        // Would update view with filtered results
        console.log('Search results:', filtered);
    }

    handleQuickAction(action) {
        appState.addToast({
            type: 'info',
            title: 'قيد التنفيذ',
            message: `جاري فتح: ${action}`,
            duration: 3000
        });
    }

    toggleView(btn) {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
    }
}

const dashboardView = new DashboardView();
