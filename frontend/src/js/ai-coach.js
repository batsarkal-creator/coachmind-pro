/**
 * CoachMind Pro - AI Coach Module
 * Manages AI insights panel and modal interactions
 */

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
        this.renderInsights();
    }

    togglePanel() {
        this.isCollapsed = !this.isCollapsed;
        this.panel.classList.toggle('collapsed', this.isCollapsed);
    }

    renderInsights() {
        const insights = MOCK_AI_INSIGHTS;

        this.panelBody.innerHTML = insights.map(insight => `
            <div class="insight-item ${insight.is_read ? '' : 'unread'}" data-id="${insight.id}">
                <div class="insight-priority ${this.getPriorityClass(insight.priority)}"></div>
                <div class="insight-icon ${insight.type}">${insight.icon}</div>
                <div class="insight-content">
                    <div class="insight-title">${insight.title}</div>
                    <div class="insight-text">${insight.content}</div>
                    <div class="insight-time">🕐 ${insight.time}</div>
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

    getPriorityClass(priority) {
        if (priority >= 4) return 'high';
        if (priority >= 2) return 'medium';
        return 'low';
    }

    handleAction(insightId, action) {
        const insight = MOCK_AI_INSIGHTS.find(i => i.id === insightId);
        if (!insight) return;

        if (action === 'read') {
            insight.is_read = true;
            this.renderInsights();
            appState.addToast({
                type: 'success',
                title: 'تم التحديث',
                message: 'تم تحديد التوصية كمقروءة',
                duration: 2000
            });
        } else if (action === 'details') {
            modalView.showInsightDetails(insight);
        }
    }

    addInsight(insight) {
        MOCK_AI_INSIGHTS.unshift({
            ...insight,
            id: Date.now(),
            time: 'الآن',
            is_read: false
        });
        this.renderInsights();

        // Show notification
        appState.addToast({
            type: 'info',
            title: 'توصية جديدة',
            message: insight.title,
            duration: 5000
        });
    }

    // Simulate AI generating insights
    simulateAIInsight() {
        const templates = [
            {
                title: 'وقت التمرين الأمثل',
                content: 'بناءً على بياناتك، أفضل وقت للتمرين هو الساعة 6 مساءً حيث أداؤك يكون بذروته.',
                type: 'tip',
                priority: 2,
                icon: '⏰'
            },
            {
                title: 'تنبيه: إرهاق زائد',
                content: 'لاحظت علامات إرهاق زائد. أنصح بيوم راحة كامل قبل التمرين القادم.',
                type: 'warning',
                priority: 5,
                icon: '🚨'
            },
            {
                title: 'هدف أسبوعي محقق!',
                content: 'مبروك! أكملت هدفك الأسبوعي من 4 جلسات تدريب. استمر في هذا الزخم!',
                type: 'goal',
                priority: 1,
                icon: '🎉'
            }
        ];

        const random = templates[Math.floor(Math.random() * templates.length)];
        this.addInsight(random);
    }
}

const aiCoachView = new AICoachView();
