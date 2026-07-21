/**
 * CoachMind Pro - Dashboard Module
 * Renders dashboard view with stats, folders, and recent files using real API
 */

import { formatRelativeTime, formatFileSize, getDifficultyClass, getDifficultyName, dataService, appState, FALLBACK_FOLDERS, FALLBACK_FILES } from './data.js';

class DashboardView {
    constructor() {
        this.container = document.getElementById('contentArea');
    }

    async render() {
        this.showLoading();
        
        try {
            const [dashboard, folders, recentFiles] = await Promise.all([
                dataService.getDashboard().catch(() => null),
                dataService.getFolders().catch(() => null),
                dataService.getFiles({ limit: 4 }).catch(() => null)
            ]);

            // Update folder count badge
            const folderBadge = document.getElementById('folderCount');
            if (folderBadge && folders) folderBadge.textContent = folders.length;

            this.renderDashboard(dashboard, folders, recentFiles);
            this.attachEventListeners();
        } catch (error) {
            console.error('Dashboard load error:', error);
            this.renderFallbackDashboard();
        }
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل لوحة التحكم...</p>
            </div>
        `;
    }

    renderDashboard(dashboard, folders, recentFiles) {
        this.container.innerHTML = `
            ${this.renderAIBanner()}
            ${this.renderStats(dashboard?.stats || this.getDefaultStats())}
            ${this.renderQuickActions()}
            ${this.renderFolders(folders || FALLBACK_FOLDERS)}
            ${this.renderRecentFiles(recentFiles || FALLBACK_FILES)}
        `;
    }

    renderFallbackDashboard() {
        this.container.innerHTML = `
            <div class="alert alert-warning">
                <h4>⚠️ تعذر تحميل البيانات من الخادم</h4>
                <p>جاري عرض بيانات تجريبية. تأكد من تشغيل الخادم الخلفي.</p>
                <button class="btn btn-primary" onclick="dashboardView.render()">إعادة المحاولة</button>
            </div>
            ${this.renderAIBanner()}
            ${this.renderStats(this.getDefaultStats())}
            ${this.renderQuickActions()}
            ${this.renderFolders(FALLBACK_FOLDERS)}
            ${this.renderRecentFiles(FALLBACK_FILES)}
        `;
        this.attachEventListeners();
    }

    getDefaultStats() {
        return {
            total_exercises: 48,
            total_plans: 12,
            total_hours: 156,
            progress_rate: 89
        };
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

    renderStats(stats) {
        const statItems = [
            { key: 'total_exercises', label: 'تمارين مخزنة', icon: '🏋️' },
            { key: 'total_plans', label: 'خطة تدريب', icon: '📋' },
            { key: 'total_hours', label: 'ساعة تدريب', icon: '⏱️' },
            { key: 'progress_rate', label: 'معدل التقدم', icon: '📈', suffix: '%' }
        ];

        return `
            <div class="stats-grid">
                ${statItems.map(s => `
                    <div class="stat-card">
                        <div class="stat-icon">${s.icon}</div>
                        <div class="stat-value">${stats[s.key] || 0}${s.suffix || ''}</div>
                        <div class="stat-label">${s.label}</div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    renderQuickActions() {
        const actions = [
            { icon: '➕', title: 'تمرين جديد', desc: 'ابدأ تمريناً جديداً', color: 'var(--accent)', action: 'newWorkout' },
            { icon: '📋', title: 'خطة تدريب', desc: 'إنشاء خطة مخصصة', color: 'var(--purple)', action: 'newPlan' },
            { icon: '📊', title: 'تتبع التقدم', desc: 'سجل قياساتك', color: 'var(--info)', action: 'trackProgress' },
            { icon: '🤖', title: 'تحليل AI', desc: 'احصل على تحليل ذكي', color: 'var(--warning)', action: 'aiAnalysis' }
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
                    <div class="quick-action" onclick="dashboardView.handleQuickAction('${a.action}')">
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

    renderFolders(folders) {
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
                ${folders.map(f => {
                    const iconStr = (f.icon || '').toString();
                    const iconKey = iconStr.replace(/[^a-z]/g, '') || iconStr;
                    return `
                    <div class="folder-card" onclick="folderView.openFolder(${f.id})">
                        <div class="folder-icon" style="background: ${folderColors[iconKey] || f.color || '#3b82f6'}18;">
                            ${folderIcons[iconKey] || f.icon || '📁'}
                        </div>
                        <div class="folder-name">${f.name || ''}</div>
                        <div class="folder-meta">
                            <span>📄 ${f.file_count || 0} ملف</span>
                            <span>🕐 ${f.updated_at ? formatRelativeTime(f.updated_at) : 'منذ يوم'}</span>
                        </div>
                        <div class="folder-progress">
                            <div class="folder-progress-bar" style="width: ${f.progress || 0}%; background: linear-gradient(90deg, ${f.color || '#3b82f6'}, ${f.color || '#3b82f6'}88);"></div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
        `;
    }

    renderRecentFiles(files) {
        const iconMap = { pdf: '📄', video: '🎥', image: '🖼️', spreadsheet: '📊', audio: '🎵' };
        const tagClass = { beginner: 'tag-beginner', intermediate: 'tag-intermediate', advanced: 'tag-advanced', elite: 'tag-advanced' };
        const tagName = { beginner: 'مبتدئ', intermediate: 'متوسط', advanced: 'متقدم', elite: 'محترف' };

        return `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">📄</span>
                    الملفات الأخيرة
                </div>
                <button class="btn btn-sm" onclick="dashboardView.render()">عرض الكل</button>
            </div>
            <div class="files-list">
                <div class="file-row header">
                    <div>الملف</div>
                    <div>المستوى</div>
                    <div>التاريخ</div>
                    <div>الحجم</div>
                    <div></div>
                </div>
                ${files.slice(0, 4).map(f => `
                    <div class="file-row" onclick="modalView.openFileById(${f.id})">
                        <div class="file-info">
                            <div class="file-icon ${f.file_type}">${iconMap[f.file_type] || '📄'}</div>
                            <div class="file-details">
                                <div class="file-name">${f.name}</div>
                                <div class="file-desc">${f.description || ''}</div>
                            </div>
                        </div>
                        <div><span class="tag ${tagClass[f.difficulty]}">${tagName[f.difficulty]}</span></div>
                        <div class="file-date">${formatRelativeTime(f.created_at || f.date)}</div>
                        <div class="file-size">${f.file_size ? formatFileSize(f.file_size) : f.size}</div>
                        <div class="file-actions">
                            <button class="tooltip" data-tooltip="عرض" onclick="event.stopPropagation(); modalView.openFileById(${f.id})">👁️</button>
                            <button class="tooltip" data-tooltip="مفضل" onclick="event.stopPropagation()">⭐</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    attachEventListeners() {
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
    }

    async handleSearch(query) {
        if (!query || query.length < 2) {
            this.render();
            return;
        }

        this.container.innerHTML = `
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">🔍</span>
                    نتائج البحث: "${query}"
                </div>
                <button class="btn" onclick="dashboardView.render()">رجوع</button>
            </div>
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري البحث...</p>
            </div>
        `;

        try {
            const [exercises, files] = await Promise.all([
                dataService.getExercises({ search: query }, 0, 20),
                dataService.getFiles({ search: query }, 0, 20)
            ]);

            let html = `
                <div class="section-header">
                    <div class="section-title">
                        <span class="icon">🔍</span>
                        نتائج البحث: "${query}"
                    </div>
                    <button class="btn" onclick="dashboardView.render()">رجوع</button>
                </div>
            `;

            if (exercises && exercises.length > 0) {
                html += `
                    <div class="section-header">
                        <div class="section-title"><span class="icon">🏋️</span> التمارين (${exercises.length})</div>
                    </div>
                    <div class="files-list">
                        ${exercises.map(e => `
                            <div class="file-row">
                                <div class="file-info">
                                    <div class="file-icon" style="background:var(--accent-glow);font-size:20px;">🏋️</div>
                                    <div class="file-details">
                                        <div class="file-name">${e.name} (${e.name_en || ''})</div>
                                        <div class="file-desc">${e.primary_muscle || ''}</div>
                                    </div>
                                </div>
                                <div><span class="tag ${getDifficultyClass(e.difficulty)}">${getDifficultyName(e.difficulty)}</span></div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if (files && files.length > 0) {
                const iconMap = { pdf: '📄', video: '🎥', image: '🖼️', spreadsheet: '📊' };
                html += `
                    <div class="section-header" style="margin-top:24px;">
                        <div class="section-title"><span class="icon">📁</span> الملفات (${files.length})</div>
                    </div>
                    <div class="files-list">
                        ${files.map(f => `
                            <div class="file-row" onclick="modalView.openFileById(${f.id})">
                                <div class="file-info">
                                    <div class="file-icon">${iconMap[f.file_type] || '📄'}</div>
                                    <div class="file-details">
                                        <div class="file-name">${f.name}</div>
                                        <div class="file-desc">${f.description || ''}</div>
                                    </div>
                                </div>
                                <div class="file-date">${formatRelativeTime(f.created_at)}</div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }

            if ((!exercises || exercises.length === 0) && (!files || files.length === 0)) {
                html += `
                    <div class="empty-state" style="padding:40px;">
                        <div class="icon" style="font-size:48px;">🔍</div>
                        <h3>لا توجد نتائج</h3>
                        <p>جرب كلمات بحث مختلفة</p>
                    </div>
                `;
            }

            this.container.innerHTML = html;
        } catch (error) {
            console.error('Search error:', error);
            this.container.innerHTML = `
                <div class="empty-state" style="padding:40px;">
                    <div class="icon" style="font-size:48px;">⚠️</div>
                    <h3>خطأ في البحث</h3>
                    <p>تعذر إجراء البحث. حاول مرة أخرى.</p>
                    <button class="btn btn-primary" onclick="dashboardView.render()">رجوع</button>
                </div>
            `;
        }
    }

    handleQuickAction(action) {
        switch(action) {
            case 'newWorkout':
                this.showNewWorkoutModal();
                break;
            case 'newPlan':
                this.showNewPlanModal();
                break;
            case 'trackProgress':
                this.showProgressModal();
                break;
            case 'aiAnalysis':
                window.aiCoachView.simulateAIInsight();
                break;
        }
    }

    async showNewWorkoutModal() {
        const exercises = await dataService.getExercises({}, 0, 100);
        const exerciseOptions = (exercises || []).map(e =>
            `<label style="display:flex;align-items:center;gap:10px;padding:10px;border:1px solid var(--border);border-radius:8px;cursor:pointer;">
                <input type="checkbox" name="exercises" value="${e.id}" data-name="${e.name}">
                <span>${e.name} (${e.name_en || ''})</span>
            </label>`
        ).join('');

        window.modalView.open('تمرين جديد', `
            <div class="form-group">
                <label class="form-label">اسم التمرين</label>
                <input type="text" class="form-input" id="workoutName" placeholder="مثال: تمارين الصدر والأكتاف">
            </div>
            <div class="form-group">
                <label class="form-label">اختر التمارين</label>
                <div style="max-height:200px;overflow-y:auto;display:flex;flex-direction:column;gap:8px;">
                    ${exerciseOptions || '<p>لا توجد تمارين متاحة</p>'}
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">المجموعات</label>
                    <input type="number" class="form-input" id="workoutSets" value="3" min="1">
                </div>
                <div class="form-group">
                    <label class="form-label">التكرارات</label>
                    <input type="number" class="form-input" id="workoutReps" value="10" min="1">
                </div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="dashboardView.createWorkout()">
                ➕ إنشاء التمرين
            </button>
        `);
    }

    async createWorkout() {
        const name = document.getElementById('workoutName')?.value || 'تمرين جديد';
        const sets = parseInt(document.getElementById('workoutSets')?.value) || 3;
        const reps = parseInt(document.getElementById('workoutReps')?.value) || 10;
        const checked = document.querySelectorAll('input[name="exercises"]:checked');

        const exercises = Array.from(checked).map(cb => ({
            exercise_id: parseInt(cb.value),
            name: cb.dataset.name,
            sets: sets,
            reps: reps,
            weight: 0
        }));

        if (exercises.length === 0) {
            appState.addToast({ type: 'warning', title: 'تنبيه', message: 'اختر تمريناً واحداً على الأقل' });
            return;
        }

        try {
            await dataService.createWorkout({ name, exercises, notes: '' });
            window.modalView.close();
            appState.addToast({ type: 'success', title: 'تم الإنشاء', message: 'تم إنشاء التمرين بنجاح' });
        } catch (error) {
            appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر إنشاء التمرين' });
        }
    }

    showNewPlanModal() {
        window.modalView.open('خطة تدريب جديدة', `
            <div class="form-group">
                <label class="form-label">اسم الخطة</label>
                <input type="text" class="form-input" id="planName" placeholder="مثال: خطة بناء عضلات 8 أسابيع">
            </div>
            <div class="form-group">
                <label class="form-label">الهدف</label>
                <select class="form-input" id="planGoal">
                    <option value="muscle_gain">بناء عضلات</option>
                    <option value="fat_loss">حرق دهون</option>
                    <option value="endurance">تحمل</option>
                    <option value="strength">قوة</option>
                    <option value="flexibility">مرونة</option>
                </select>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">المدة (أسابيع)</label>
                    <input type="number" class="form-input" id="planWeeks" value="8" min="1" max="52">
                </div>
                <div class="form-group">
                    <label class="form-label">أيام/أسبوع</label>
                    <input type="number" class="form-input" id="planDays" value="4" min="1" max="7">
                </div>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="dashboardView.generateAIPlan()">
                🤖 إنشاء خطة بالذكاء الاصطناعي
            </button>
        `);
    }

    async generateAIPlan() {
        const name = document.getElementById('planName')?.value || 'خطة تدريب';
        const goal = document.getElementById('planGoal')?.value || 'muscle_gain';
        const weeks = parseInt(document.getElementById('planWeeks')?.value) || 8;
        const days = parseInt(document.getElementById('planDays')?.value) || 4;

        try {
            const result = await dataService.generateTrainingPlan({
                name, goal, duration_weeks: weeks, days_per_week: days
            });
            window.modalView.close();
            appState.addToast({ type: 'success', title: 'تم الإنشاء', message: 'تم إنشاء الخطة بنجاح' });
        } catch (error) {
            appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر إنشاء الخطة. تأكد من تشغيل الخادم.' });
        }
    }

    showProgressModal() {
        window.modalView.open('تسجيل التقدم', `
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">الوزن (كجم)</label>
                    <input type="number" class="form-input" id="progressWeight" step="0.1" placeholder="75.5">
                </div>
                <div class="form-group">
                    <label class="form-label">نسبة الدهون %</label>
                    <input type="number" class="form-input" id="progressBodyFat" step="0.1" placeholder="15">
                </div>
            </div>
            <div class="form-row">
                <div class="form-group">
                    <label class="form-label">العضلات (كجم)</label>
                    <input type="number" class="form-input" id="progressMuscle" step="0.1" placeholder="35">
                </div>
                <div class="form-group">
                    <label class="form-label">الطاقة (1-10)</label>
                    <input type="number" class="form-input" id="progressEnergy" min="1" max="10" placeholder="8">
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">ملاحظات</label>
                <textarea class="form-input" id="progressNotes" rows="3" placeholder="شعور ممتاز اليوم..."></textarea>
            </div>
            <button class="btn btn-primary" style="width:100%;margin-top:12px;" onclick="dashboardView.saveProgress()">
                💾 حفظ التقدم
            </button>
        `);
    }

    async saveProgress() {
        const data = {};
        const weight = document.getElementById('progressWeight')?.value;
        const bodyFat = document.getElementById('progressBodyFat')?.value;
        const muscle = document.getElementById('progressMuscle')?.value;
        const energy = document.getElementById('progressEnergy')?.value;
        const notes = document.getElementById('progressNotes')?.value;

        if (weight) data.weight = parseFloat(weight);
        if (bodyFat) data.body_fat = parseFloat(bodyFat);
        if (muscle) data.muscle_mass = parseFloat(muscle);
        if (energy) data.energy_level = parseInt(energy);
        if (notes) data.notes = notes;

        if (Object.keys(data).length === 0) {
            appState.addToast({ type: 'warning', title: 'تنبيه', message: 'أدخل قيماً واحدة على الأقل' });
            return;
        }

        try {
            await dataService.createProgressLog(data);
            window.modalView.close();
            appState.addToast({ type: 'success', title: 'تم الحفظ', message: 'تم تسجيل تقدمك بنجاح' });
        } catch (error) {
            appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر حفظ البيانات' });
        }
    }

    toggleView(btn) {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        // View toggle logic would go here
    }
}

export const dashboardView = new DashboardView();