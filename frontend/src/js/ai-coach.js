/**
 * CoachMind Pro - AI Coach Module
 * Manages AI insights panel and modal interactions with real API
 */

import { formatRelativeTime, dataService, appState } from './data.js';

class AICoachView {
    constructor() {
        this.panel = document.getElementById('insightPanel');
        this.panelBody = document.getElementById('insightBody');
        this.toggle = document.getElementById('insightToggle');
        this.isCollapsed = false;

        this.init();
    }

    init() {
        this.toggle.addEventListener('click', () => this.togglePanel());
    }

    togglePanel() {
        this.isCollapsed = !this.isCollapsed;
        this.panel.classList.toggle('collapsed', this.isCollapsed);
    }

    async loadInsights() {
        try {
            const insights = await dataService.getInsights(10, false);
            this.renderInsights(insights);
        } catch (error) {
            console.error('Failed to load insights:', error);
            this.renderFallbackInsights();
        }
    }

    renderInsights(insights) {
        if (!insights || insights.length === 0) {
            this.panelBody.innerHTML = `
                <div class="empty-state" style="padding: 20px;">
                    <div class="icon">🤖</div>
                    <p>لا توجد توصيات حالياً</p>
                    <button class="btn btn-primary btn-sm" onclick="aiCoachView.loadInsights()">تحديث</button>
                </div>
            `;
            return;
        }

        this.panelBody.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.is_read ? '' : 'unread'}" data-id="${insight.id}">
                <div class="insight-priority ${this.getPriorityClass(insight.priority)}"></div>
                <div class="insight-icon ${insight.insight_type}">${this.getIcon(insight.insight_type)}</div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.content}</div>
                    <div class="insight-time">🕐 ${formatRelativeTime(insight.created_at)}</div>
                    <div class="insight-actions">
                        <button class="insight-action-btn" onclick="aiCoachView.handleAction(${insight.id}, 'read')">
                            ✓ تم القراءة
                        </button>
                        <button class="insight-action-btn" onclick="aiCoachView.handleAction(${insight.id}, 'details')">
                            🔍 التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    renderFallbackInsights() {
        this.panelBody.innerHTML = `
            <div class="empty-state" style="padding: 20px;">
                <div class="icon">⚠️</div>
                <p>تعذر تحميل التوصيات من الخادم</p>
                <button class="btn btn-primary btn-sm" onclick="aiCoachView.loadInsights()">إعادة المحاولة</button>
            </div>
        `;
    }

    getPriorityClass(priority) {
        if (priority >= 4) return 'high';
        if (priority >= 2) return 'medium';
        return 'low';
    }

    getIcon(type) {
        const icons = {
            tip: '💡',
            warning: '⚠️',
            info: '📊',
            goal: '🎯',
            recommendation: '📋',
            analysis: '🔍'
        };
        return icons[type] || '💡';
    }

    async handleAction(insightId, action) {
        if (action === 'read') {
            try {
                await dataService.markInsightRead(insightId);
                appState.addToast({
                    type: 'success',
                    title: 'تم التحديث',
                    message: 'تم تحديد التوصية كمقروءة',
                    duration: 2000
                });
                this.loadInsights(); // Refresh
            } catch (error) {
                appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر تحديث الحالة' });
            }
        } else if (action === 'details') {
            const insights = await dataService.getInsights(20);
            const insight = insights.find(i => i.id === insightId);
            if (insight) {
                window.modalView.showInsightDetails(insight);
            }
        }
    }

    addInsight(insight) {
        // Would call API to create insight, then refresh
        this.loadInsights();
    }

    // Trigger AI analysis for current user
    async simulateAIInsight() {
        appState.addToast({ type: 'info', title: 'جاري التحليل', message: 'المدرب الذكي يحلل بياناتك...' });
        
        try {
            // Get user metrics and recent workouts for analysis
            const user = await dataService.getCurrentUser();
            const workouts = await dataService.getWorkouts('completed');
            
            const workoutData = {
                total_volume: workouts.reduce((sum, w) => sum + (w.total_volume || 0), 0),
                avg_heart_rate: workouts.reduce((sum, w) => sum + (w.avg_heart_rate || 0), 0) / Math.max(workouts.length, 1),
                max_heart_rate: Math.max(...workouts.map(w => w.max_heart_rate || 0), 0),
                exercises: workouts.flatMap(w => w.exercises || []),
                avg_intensity: 0.75
            };

            const userMetrics = {
                resting_heart_rate: user.resting_heart_rate || 70,
                avg_volume: workoutData.total_volume / Math.max(workouts.length, 1),
                last_workout_date: workouts[0]?.completed_at || new Date().toISOString(),
                hrv: user.hrv || 50,
                baseline_hrv: user.baseline_hrv || 55,
                sleep_hours: user.sleep_hours || 7,
                weekly_sessions: workouts.length
            };

            const result = await dataService.analyzeWorkout(workoutData, userMetrics);
            
            appState.addToast({ 
                type: 'success', 
                title: 'تم التحليل', 
                message: 'تم إنشاء توصيات جديدة بناءً على بياناتك' 
            });
            
            this.loadInsights(); // Refresh to show new insights
        } catch (error) {
            console.error('AI Analysis error:', error);
            appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر إجراء التحليل' });
        }
    }
}

export const aiCoachView = new AICoachView();
