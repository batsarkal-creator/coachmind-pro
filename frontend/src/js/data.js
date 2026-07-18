/**
 * CoachMind Pro - Data & State Management
 * Mock data for demo and state management
 */

// ==================== MOCK DATA ====================

const MOCK_FOLDERS = [
    {
        id: 1,
        name: 'القوة البدنية',
        description: 'تمارين بناء العضلات والقوة',
        icon: '💪',
        color: '#ef4444',
        file_count: 12,
        total_size: 145000000,
        is_system: true,
        progress: 75,
        children: []
    },
    {
        id: 2,
        name: 'اللياقة القلبية',
        description: 'تمارين الكارديو والتحمل',
        icon: '🏃',
        color: '#3b82f6',
        file_count: 8,
        total_size: 89000000,
        is_system: true,
        progress: 60,
        children: []
    },
    {
        id: 3,
        name: 'المرونة والتمدد',
        description: 'تمارين اليوغا والتمدد',
        icon: '🧘',
        color: '#8b5cf6',
        file_count: 6,
        total_size: 45000000,
        is_system: true,
        progress: 45,
        children: []
    },
    {
        id: 4,
        name: 'التغذية الرياضية',
        description: 'خطط غذائية ووصفات',
        icon: '🥗',
        color: '#f59e0b',
        file_count: 15,
        total_size: 32000000,
        is_system: true,
        progress: 82,
        children: []
    },
    {
        id: 5,
        name: 'التعافي والاستشفاء',
        description: 'نصائح التعافي والنوم',
        icon: '🛌',
        color: '#10b981',
        file_count: 4,
        total_size: 18000000,
        is_system: true,
        progress: 30,
        children: []
    },
    {
        id: 6,
        name: 'خطط التدريب الجاهزة',
        description: 'خطط تدريبية معدة مسبقاً',
        icon: '📋',
        color: '#ec4899',
        file_count: 20,
        total_size: 56000000,
        is_system: true,
        progress: 90,
        children: []
    }
];

const MOCK_FILES = [
    {
        id: 1,
        name: 'تمرين الضغط المتقدم',
        description: 'فيديو توضيحي - 4 مجموعات',
        file_type: 'video',
        difficulty: 'advanced',
        tags: ['chest', 'strength', 'compound'],
        muscle_groups: ['chest', 'triceps', 'shoulders'],
        view_count: 234,
        rating: 4.8,
        folder_id: 1,
        size: '45 MB',
        date: '17 يوليو 2026',
        is_ai_generated: false
    },
    {
        id: 2,
        name: 'برنامج HIIT لحرق الدهون',
        description: 'خطة 4 أسابيع مكثفة',
        file_type: 'pdf',
        difficulty: 'intermediate',
        tags: ['cardio', 'fat_loss', 'hiit'],
        muscle_groups: ['full_body'],
        view_count: 567,
        rating: 4.6,
        folder_id: 2,
        size: '2.3 MB',
        date: '16 يوليو 2026',
        is_ai_generated: false
    },
    {
        id: 3,
        name: 'وضعيات اليوغا للاستشفاء',
        description: '12 وضعية مع شرح تفصيلي',
        file_type: 'image',
        difficulty: 'beginner',
        tags: ['recovery', 'flexibility', 'yoga'],
        muscle_groups: ['full_body'],
        view_count: 189,
        rating: 4.9,
        folder_id: 3,
        size: '18 MB',
        date: '15 يوليو 2026',
        is_ai_generated: false
    },
    {
        id: 4,
        name: 'جدول التغذية الأسبوعي',
        description: 'حساب السعرات والماكروز تلقائياً',
        file_type: 'spreadsheet',
        difficulty: 'beginner',
        tags: ['nutrition', 'meal_plan', 'ai_generated'],
        muscle_groups: [],
        view_count: 892,
        rating: 4.7,
        folder_id: 4,
        size: '850 KB',
        date: '14 يوليو 2026',
        is_ai_generated: true
    },
    {
        id: 5,
        name: 'برنامج Push Pull Legs',
        description: 'خطة 6 أيام للمتقدمين',
        file_type: 'pdf',
        difficulty: 'advanced',
        tags: ['strength', 'hypertrophy', 'split'],
        muscle_groups: ['full_body'],
        view_count: 445,
        rating: 4.8,
        folder_id: 1,
        size: '1.2 MB',
        date: '13 يوليو 2026',
        is_ai_generated: false
    },
    {
        id: 6,
        name: 'تتبع جودة النوم',
        description: 'جدول يومي مع نصائح AI',
        file_type: 'spreadsheet',
        difficulty: 'beginner',
        tags: ['recovery', 'sleep', 'tracking'],
        muscle_groups: [],
        view_count: 123,
        rating: 4.5,
        folder_id: 5,
        size: '120 KB',
        date: '12 يوليو 2026',
        is_ai_generated: true
    }
];

const MOCK_AI_INSIGHTS = [
    {
        id: 1,
        title: 'زيادة الحمل التدريبي!',
        content: 'حجم تدريبك اليوم أعلى بـ 15% عن معدلك. استمر في هذا الإيقاع!',
        type: 'tip',
        priority: 2,
        is_read: false,
        time: 'منذ 5 دقائق',
        icon: '💡'
    },
    {
        id: 2,
        title: 'تنبيه التعافي',
        content: 'معدل ضربات قلبك أثناء الراحة مرتفع 12% عن المعدل الطبيعي. أنصح بيوم راحة إضافي.',
        type: 'warning',
        priority: 4,
        is_read: false,
        time: 'منذ 30 دقيقة',
        icon: '⚠️'
    },
    {
        id: 3,
        title: 'تحليل الأسبوع',
        content: 'أكملت 85% من خطتك هذا الأسبوع. الأداء أفضل بـ 15% من الأسبوع الماضي!',
        type: 'info',
        priority: 1,
        is_read: false,
        time: 'منذ ساعتين',
        icon: '📊'
    },
    {
        id: 4,
        title: 'هدف جديد مقترح',
        content: 'بناءً على تقدمك، يمكنك تحقيق هدف رفع 100 كجم في السكوات خلال 6 أسابيع.',
        type: 'goal',
        priority: 2,
        is_read: false,
        time: 'منذ 4 ساعات',
        icon: '🎯'
    },
    {
        id: 5,
        title: 'تحسن في المرونة',
        content: 'لاحظت تحسناً ملحوظاً في اختبار الوصول الأمامي. زد من جلسات اليوغا!',
        type: 'info',
        priority: 1,
        is_read: true,
        time: 'منذ يوم',
        icon: '🧘'
    }
];

const MOCK_WORKOUT_DATA = {
    bench: {
        title: 'تمرين الضغط المتقدم',
        content: `
            <p>تمرين الضغط (Bench Press) هو أحد أهم تمارين الجزء العلوي من الجسم. يستهدف الصدر والأكتاف والترايسبس.</p>
            <h4>🔥 الخطة المقترحة من المدرب الذكي:</h4>
            <div class="workout-detail">
                <h5>المجموعة 1 - الإحماء</h5>
                <p>12 تكرار × 60% من الوزن الأقصى - راحة 90 ثانية</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 90s راحة</span>
                    <span>🔥 RPE 6</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>المجموعة 2 - التحميل</h5>
                <p>8 تكرارات × 75% من الوزن الأقصى - راحة 120 ثانية</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 120s راحة</span>
                    <span>🔥 RPE 7</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>المجموعة 3 - العمل الرئيسي</h5>
                <p>5 تكرارات × 85% من الوزن الأقصى - راحة 180 ثانية</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 180s راحة</span>
                    <span>🔥 RPE 8</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>المجموعة 4 - الفشل</h5>
                <p>تكرارات حتى الفشل × 80% - راحة 120 ثانية</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 120s راحة</span>
                    <span>🔥 RPE 9-10</span>
                </div>
            </div>
            <h4>💡 نصائح المدرب الذكي:</h4>
            <ul>
                <li>حافظ على قوس طبيعي في ظهرك السفلي</li>
                <li>أنزل القضيب ببطء (3 ثوانٍ نزولاً)</li>
                <li>تنفس: شهيق عند النزول، زفير عند الدفع</li>
                <li>لا ترتخِ أكتافك - اضغطها للخلف والأسفل</li>
                <li>استخدم قبضة عرض الكتفين أو أعرض بقليل</li>
            </ul>
            <h4>⚠️ أخطاء شائعة:</h4>
            <ul>
                <li>رفع الأرداف عن البنش</li>
                <li>ثني المعصمين للخلف</li>
                <li>عدم خفض القضيب للصدر الكامل</li>
            </ul>
        `
    },
    hiit: {
        title: 'برنامج HIIT لحرق الدهون',
        content: `
            <p>تدريب الفترات العالية الكثافة (HIIT) هو الأفضل لحرق الدهون في وقت قصير. يستهدف الجسم كاملاً.</p>
            <h4>📋 الخطة الأسبوعية (4 أسابيع):</h4>
            <div class="workout-detail">
                <h5>الأسبوع 1 - التأسيس</h5>
                <p>20 ثانية عمل / 40 ثانية راحة × 8 جولات - 3 أيام/أسبوع</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 12 دقيقة</span>
                    <span>🔥 RPE 7</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>الأسبوع 2 - التقدم</h5>
                <p>30 ثانية عمل / 30 ثانية راحة × 10 جولات - 4 أيام/أسبوع</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 15 دقيقة</span>
                    <span>🔥 RPE 8</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>الأسبوع 3 - التكثيف</h5>
                <p>40 ثانية عمل / 20 ثانية راحة × 12 جولة - 4 أيام/أسبوع</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 18 دقيقة</span>
                    <span>🔥 RPE 8-9</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>الأسبوع 4 - الذروة</h5>
                <p>45 ثانية عمل / 15 ثانية راحة × 15 جولة - 5 أيام/أسبوع</p>
                <div class="workout-detail-meta">
                    <span>⏱️ 22 دقيقة</span>
                    <span>🔥 RPE 9</span>
                </div>
            </div>
            <h4>🏃 التمارين المقترحة:</h4>
            <ul>
                <li><strong>القفز بالحبل</strong> - 3 دقائق إحماء</li>
                <li><strong>القرفصاء القافز</strong> - 20 تكرار</li>
                <li><strong>الضغط المتفجر</strong> - 15 تكرار</li>
                <li><strong>الركض الثابت المرتفع</strong> - 30 ثانية</li>
                <li><strong>البلانك المتفجر</strong> - 12 تكرار</li>
                <li><strong>القفز على الصندوق</strong> - 12 تكرار</li>
            </ul>
            <h4>💡 نصيحة المدرب الذكي:</h4>
            <p>لا تتخطى الإحماء! 5 دقائق من القفز الخفيف تحمي مفاصلك وتجهز عضلاتك.</p>
        `
    },
    yoga: {
        title: 'وضعيات اليوغا للاستشفاء',
        content: `
            <p>وضعيات اليوغا المستعادة تساعد في تخفيف آلام العضلات وتحسين مرونة الجسم بعد التدريبات الشاقة.</p>
            <h4>🧘 جلسة الاستشفاء (30 دقيقة):</h4>
            <div class="workout-detail">
                <h5>1. وضعية الطفل (Child's Pose) - 3 دقائق</h5>
                <p>استرخِ ظهرك وافرد ذراعيك للأمام. تنفس بعمق وشعوري.</p>
                <div class="workout-detail-meta">
                    <span>🫁 تنفس بطيء</span>
                    <span>🎯 استرخاء الظهر</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>2. وضعية الكلب الأسفل (Downward Dog) - 2 دقائق</h5>
                <p>افرد ظهرك بالكامل واضغط الكعبين للأرض. حرك رأسك برفق.</p>
                <div class="workout-detail-meta">
                    <span>🫁 تنفس طبيعي</span>
                    <span>🎯 تمديد الساقين</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>3. وضعية الحمامة (Pigeon Pose) - 3 دقائق/جانب</h5>
                <p>ممتاز لفتح الوركين وتخفيف آلام أسفل الظهر.</p>
                <div class="workout-detail-meta">
                    <span>🫁 تنفس عميق</span>
                    <span>🎯 فتح الوركين</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>4. وضعية الجسر (Bridge Pose) - 2 دقائق</h5>
                <p>نشط عضلات المؤخرة والفخذين الخلفية بلطف.</p>
                <div class="workout-detail-meta">
                    <span>🫁 شهيق عند الرفع</span>
                    <span>🎯 تقوية المؤخرة</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>5. وضعية الإبرة (Thread the Needle) - 2 دقائق/جانب</h5>
                <p>تدوير العمود الفقري بلطف لتخفيف التوتر.</p>
                <div class="workout-detail-meta">
                    <span>🫁 تنفس بطيء</span>
                    <span>🎯 تدوير العمود الفقري</span>
                </div>
            </div>
            <h4>💡 نصيحة المدرب الذكي:</h4>
            <ul>
                <li>أجرِ هذه الجلسة بعد 24 ساعة من التدريب الشاق</li>
                <li>استخدم زيت اللافندر للتدليك قبل الجلسة</li>
                <li>حافظ على درجة حرارة الغرفة دافئة (22-24°م)</li>
                <li>استخدم موسيقى هادئة أو أصوات الطبيعة</li>
            </ul>
        `
    },
    meal: {
        title: 'جدول التغذية الأسبوعي',
        content: `
            <p>جدول غذائي متوازن تم إنشاؤه بواسطة المدرب الذكي بناءً على أهدافك (بناء عضلات + تقليل دهون).</p>
            <h4>🍳 اليوم 1 - يوم تدريب القوة:</h4>
            <div class="workout-detail">
                <h5>🌅 الإفطار (7:00 ص)</h5>
                <p>4 بيض + 2 شريحة توست بني + 1 أفوكادو + قهوة سوداء</p>
                <div class="workout-detail-meta">
                    <span>🔥 520 سعرة</span>
                    <span>💪 32g بروتين</span>
                    <span>🍞 28g كارب</span>
                    <span>🥑 28g دهون</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>🥜 وجبة ما قبل التمرين (11:00 ص)</h5>
                <p>موزة + ملعقة زبدة فول سوداني + بروتين واي</p>
                <div class="workout-detail-meta">
                    <span>🔥 380 سعرة</span>
                    <span>💪 25g بروتين</span>
                    <span>🍞 35g كارب</span>
                    <span>🥑 12g دهون</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>🍗 الغداء (2:00 م)</h5>
                <p>200g صدر دجاج مشوي + 150g أرز بني + سلطة خضراء + زيت زيتون</p>
                <div class="workout-detail-meta">
                    <span>🔥 650 سعرة</span>
                    <span>💪 48g بروتين</span>
                    <span>🍞 55g كارب</span>
                    <span>🥑 18g دهون</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>🥤 وجبة ما بعد التمرين (5:00 م)</h5>
                <p>بروتين واي + حليب لوز + توت بري</p>
                <div class="workout-detail-meta">
                    <span>🔥 280 سعرة</span>
                    <span>💪 30g بروتين</span>
                    <span>🍞 20g كارب</span>
                    <span>🥑 5g دهون</span>
                </div>
            </div>
            <div class="workout-detail">
                <h5>🐟 العشاء (8:00 م)</h5>
                <p>150g سمك سلمون + خضار مشوية + بطاطا حلوة</p>
                <div class="workout-detail-meta">
                    <span>🔥 480 سعرة</span>
                    <span>💪 35g بروتين</span>
                    <span>🍞 40g كارب</span>
                    <span>🥑 18g دهون</span>
                </div>
            </div>
            <h4>📊 ملخص الأسبوع:</h4>
            <ul>
                <li><strong>متوسط السعرات اليومية:</strong> 2,400 سعرة</li>
                <li><strong>نسبة البروتين:</strong> 35% (210g)</li>
                <li><strong>نسبة الكارب:</strong> 40% (240g)</li>
                <li><strong>نسبة الدهون:</strong> 25% (67g)</li>
                <li><strong>الماء:</strong> 3.5 لتر يومياً</li>
                <li><strong>الألياف:</strong> 35g يومياً</li>
            </ul>
            <h4>💡 نصيحة المدرب الذكي:</h4>
            <p>تناول وجبتك الأخيرة قبل النوم بـ 3 ساعات على الأقل. إذا شعرت بالجوع، تناول كوب من الكازين (بروتين بطيء الهضم).</p>
        `
    }
};

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
