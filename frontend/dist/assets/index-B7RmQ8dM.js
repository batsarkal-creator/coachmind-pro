(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=new class{constructor(){this.currentView=`dashboard`,this.currentFolder=null,this.user=null,this.isLoading=!1,this.toasts=[],this.listeners=new Map}subscribe(e,t){return this.listeners.has(e)||this.listeners.set(e,new Set),this.listeners.get(e).add(t),()=>this.listeners.get(e).delete(t)}emit(e,t){this.listeners.has(e)&&this.listeners.get(e).forEach(e=>e(t))}setView(e,t={}){this.currentView=e,this.currentFolder=t.folderId||null,this.emit(`viewChanged`,{view:e,params:t})}setUser(e){this.user=e,this.emit(`userChanged`,e)}setLoading(e){this.isLoading=e,this.emit(`loadingChanged`,e)}addToast(e){let t=Date.now();return this.toasts.push({...e,id:t}),this.emit(`toastAdded`,{...e,id:t}),setTimeout(()=>{this.removeToast(t)},e.duration||5e3),t}removeToast(e){this.toasts=this.toasts.filter(t=>t.id!==e),this.emit(`toastRemoved`,e)}},t=new class{constructor(){this.cache=new Map,this.cacheTimeout=300*1e3}async fetchWithCache(t,n,r=!1){let i=this.cache.get(t);if(!r&&i&&Date.now()-i.timestamp<this.cacheTimeout)return i.data;e.setLoading(!0);try{let e=await n();return this.cache.set(t,{data:e,timestamp:Date.now()}),e}finally{e.setLoading(!1)}}invalidateCache(e){this.cache.delete(e)}invalidateAll(){this.cache.clear()}async login(t,n){let r=await api.login(t,n);return r.user&&e.setUser(r.user),r}async register(e){return await api.register(e)}async getCurrentUser(){return await this.fetchWithCache(`currentUser`,()=>api.getMe())}async updateProfile(e){let t=await api.updateProfile(e);return this.invalidateCache(`currentUser`),t}logout(){api.clearToken(),e.setUser(null),this.invalidateAll()}async getFolders(e=null){let t=`folders_${e||`root`}`;return this.fetchWithCache(t,()=>api.getFolders(e))}async getFolder(e){return this.fetchWithCache(`folder_${e}`,()=>api.getFolder(e))}async createFolder(e){let t=await api.createFolder(e);return this.invalidateCache(`folders_${e.parent_id||`root`}`),t}async updateFolder(e,t){let n=await api.updateFolder(e,t);return this.invalidateCache(`folder_${e}`),this.invalidateCache(`folders_${t.parent_id||`root`}`),n}async deleteFolder(e){let t=await api.deleteFolder(e);return this.invalidateAll(),t}async getFiles(e={}){let t=`files_${JSON.stringify(e)}`;return this.fetchWithCache(t,()=>api.getFiles(e))}async getFile(e){return this.fetchWithCache(`file_${e}`,()=>api.getFile(e))}async createFile(e){let t=await api.createFile(e);return this.invalidateCache(`files_${JSON.stringify({folder_id:e.folder_id})}`),t}async uploadFile(e,t){let n=await api.uploadFile(e,t);return this.invalidateCache(`files_${JSON.stringify({folder_id:e})}`),n}async updateFile(e,t){let n=await api.updateFile(e,t);return this.invalidateCache(`file_${e}`),n}async deleteFile(e){let t=await api.deleteFile(e);return this.invalidateAll(),t}async getWorkouts(e=null){let t=`workouts_${e||`all`}`;return this.fetchWithCache(t,()=>api.getWorkouts(e))}async getWorkout(e){return this.fetchWithCache(`workout_${e}`,()=>api.getWorkout(e))}async createWorkout(e){let t=await api.createWorkout(e);return this.invalidateCache(`workouts_all`),t}async updateWorkout(e,t){let n=await api.updateWorkout(e,t);return this.invalidateCache(`workout_${e}`),this.invalidateCache(`workouts_all`),n}async deleteWorkout(e){let t=await api.deleteWorkout(e);return this.invalidateCache(`workouts_all`),t}async getExercises(e={}){let t=`exercises_${JSON.stringify(e)}`;return this.fetchWithCache(t,()=>api.getExercises(e))}async getExercise(e){return this.fetchWithCache(`exercise_${e}`,()=>api.getExercise(e))}async analyzeWorkout(e,t){return await api.analyzeWorkout(e,t)}async analyzeRecovery(e){return await api.analyzeRecovery(e)}async generateTrainingPlan(e){return await api.generatePlan(e)}async getInsights(e=10,t=!1){return await api.getInsights(e,t)}async markInsightRead(e){let t=await api.markInsightRead(e);return this.invalidateCache(`insights`),t}async getDashboard(){return this.fetchWithCache(`dashboard`,()=>api.getDashboard())}async seedDatabase(){return await api.request(`/seed`,{method:`POST`})}};function n(e){if(e===0)return`0 Bytes`;let t=1024,n=[`Bytes`,`KB`,`MB`,`GB`],r=Math.floor(Math.log(e)/Math.log(t));return parseFloat((e/t**r).toFixed(2))+` `+n[r]}function r(e){return new Date(e).toLocaleDateString(`ar-SA`,{year:`numeric`,month:`short`,day:`numeric`})}function i(e){let t=new Date(e),n=new Date-t,i=Math.floor(n/6e4),a=Math.floor(n/36e5),o=Math.floor(n/864e5);return i<1?`الآن`:i<60?`منذ ${i} دقيقة`:a<24?`منذ ${a} ساعة`:o<7?`منذ ${o} يوم`:r(e)}function a(e){return{beginner:`tag-beginner`,intermediate:`tag-intermediate`,advanced:`tag-advanced`,elite:`tag-elite`}[e]||`tag-beginner`}function o(e){return{beginner:`مبتدئ`,intermediate:`متوسط`,advanced:`متقدم`,elite:`محترف`}[e]||e}function s(e){return{pdf:`📄`,video:`🎥`,image:`🖼️`,spreadsheet:`📊`,audio:`🎵`}[e]||`📄`}var c=`https://coachmind-backend.onrender.com/api/v1`;new class{constructor(){this.baseURL=c,this.token=localStorage.getItem(`coachmind_token`)}setToken(e){this.token=e,localStorage.setItem(`coachmind_token`,e)}clearToken(){this.token=null,localStorage.removeItem(`coachmind_token`)}async request(e,t={}){let n=`${this.baseURL}${e}`,r={headers:{"Content-Type":`application/json`,...t.headers},...t};this.token&&(r.headers.Authorization=`Bearer ${this.token}`),t.body instanceof FormData&&delete r.headers[`Content-Type`];try{let e=await fetch(n,r);if(!e.ok){let t=await e.json().catch(()=>({detail:`حدث خطأ غير متوقع`}));throw Error(t.detail||`HTTP ${e.status}`)}return e.status===204?null:await e.json()}catch(e){throw console.error(`API Error:`,e),e}}async login(e,t){let n=new URLSearchParams;n.append(`username`,e),n.append(`password`,t);let r=await this.request(`/auth/login`,{method:`POST`,headers:{"Content-Type":`application/x-www-form-urlencoded`},body:n});return this.setToken(r.access_token),r}async register(e){return await this.request(`/auth/register`,{method:`POST`,body:JSON.stringify(e)})}async getMe(){return await this.request(`/auth/me`)}async getProfile(){return await this.request(`/users/profile`)}async updateProfile(e){return await this.request(`/users/profile`,{method:`PUT`,body:JSON.stringify(e)})}async getFolders(e=null){let t=e?`?parent_id=${e}`:``;return await this.request(`/folders/${t}`)}async getFolder(e){return await this.request(`/folders/${e}`)}async createFolder(e){return await this.request(`/folders/`,{method:`POST`,body:JSON.stringify(e)})}async updateFolder(e,t){return await this.request(`/folders/${e}`,{method:`PUT`,body:JSON.stringify(t)})}async deleteFolder(e){return await this.request(`/folders/${e}`,{method:`DELETE`})}async getFiles(e={}){let t=new URLSearchParams(e).toString();return await this.request(`/files/?${t}`)}async getFile(e){return await this.request(`/files/${e}`)}async createFile(e){return await this.request(`/files/`,{method:`POST`,body:JSON.stringify(e)})}async uploadFile(e,t){let n=new FormData;return n.append(`file`,t),await this.request(`/files/upload?folder_id=${e}`,{method:`POST`,body:n})}async updateFile(e,t){return await this.request(`/files/${e}`,{method:`PUT`,body:JSON.stringify(t)})}async deleteFile(e){return await this.request(`/files/${e}`,{method:`DELETE`})}async getWorkouts(e=null){let t=e?`?status=${e}`:``;return await this.request(`/workouts/${t}`)}async getWorkout(e){return await this.request(`/workouts/${e}`)}async createWorkout(e){return await this.request(`/workouts/`,{method:`POST`,body:JSON.stringify(e)})}async updateWorkout(e,t){return await this.request(`/workouts/${e}`,{method:`PUT`,body:JSON.stringify(t)})}async deleteWorkout(e){return await this.request(`/workouts/${e}`,{method:`DELETE`})}async analyzeWorkout(e,t){return await this.request(`/ai/analyze-workout`,{method:`POST`,body:JSON.stringify({workout_data:e,user_metrics:t})})}async analyzeRecovery(e){return await this.request(`/ai/analyze-recovery`,{method:`POST`,body:JSON.stringify(e)})}async generatePlan(e){return await this.request(`/ai/generate-plan`,{method:`POST`,body:JSON.stringify(e)})}async getInsights(e=10,t=!1){return await this.request(`/ai/insights?limit=${e}&unread_only=${t}`)}async markInsightRead(e){return await this.request(`/ai/insights/${e}/read`,{method:`POST`})}async getDashboard(){return await this.request(`/dashboard/`)}async getExercises(e={}){let t=new URLSearchParams(e).toString();return await this.request(`/exercises/?${t}`)}async getExercise(e){return await this.request(`/exercises/${e}`)}};var l=new class{constructor(){this.container=document.getElementById(`contentArea`)}async render(){this.showLoading();try{let[e,t,n]=await Promise.all([dataService.getDashboard(),dataService.getFolders(),dataService.getFiles({limit:4,sort:`-created_at`})]);this.renderDashboard(e,t,n),this.attachEventListeners()}catch(e){console.error(`Dashboard load error:`,e),this.renderFallbackDashboard()}}showLoading(){this.container.innerHTML=`
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل لوحة التحكم...</p>
            </div>
        `}renderDashboard(e,t,n){this.container.innerHTML=`
            ${this.renderAIBanner()}
            ${this.renderStats(e?.stats||this.getDefaultStats())}
            ${this.renderQuickActions()}
            ${this.renderFolders(t||FALLBACK_FOLDERS)}
            ${this.renderRecentFiles(n||FALLBACK_FILES)}
        `}renderFallbackDashboard(){this.container.innerHTML=`
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
        `,this.attachEventListeners()}getDefaultStats(){return{total_exercises:48,total_plans:12,total_hours:156,progress_rate:89}}renderAIBanner(){return`
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
        `}renderStats(e){return`
            <div class="stats-grid">
                ${[{key:`total_exercises`,label:`تمارين مخزنة`,icon:`🏋️`},{key:`total_plans`,label:`خطة تدريب`,icon:`📋`},{key:`total_hours`,label:`ساعة تدريب`,icon:`⏱️`},{key:`progress_rate`,label:`معدل التقدم`,icon:`📈`,suffix:`%`}].map(t=>`
                    <div class="stat-card">
                        <div class="stat-icon">${t.icon}</div>
                        <div class="stat-value">${e[t.key]||0}${t.suffix||``}</div>
                        <div class="stat-label">${t.label}</div>
                    </div>
                `).join(``)}
            </div>
        `}renderQuickActions(){return`
            <div class="section-header">
                <div class="section-title">
                    <span class="icon">⚡</span>
                    إجراءات سريعة
                </div>
            </div>
            <div class="quick-actions">
                ${[{icon:`➕`,title:`تمرين جديد`,desc:`ابدأ تمريناً جديداً`,color:`var(--accent)`,action:`newWorkout`},{icon:`📋`,title:`خطة تدريب`,desc:`إنشاء خطة مخصصة`,color:`var(--purple)`,action:`newPlan`},{icon:`📊`,title:`تتبع التقدم`,desc:`سجل قياساتك`,color:`var(--info)`,action:`trackProgress`},{icon:`🤖`,title:`تحليل AI`,desc:`احصل على تحليل ذكي`,color:`var(--warning)`,action:`aiAnalysis`}].map(e=>`
                    <div class="quick-action" onclick="dashboardView.handleQuickAction('${e.action}')">
                        <div class="quick-action-icon" style="background: ${e.color}20; color: ${e.color};">
                            ${e.icon}
                        </div>
                        <div class="quick-action-title">${e.title}</div>
                        <div class="quick-action-desc">${e.desc}</div>
                    </div>
                `).join(``)}
            </div>
        `}renderFolders(e){let t={strength:`💪`,cardio:`🏃`,flexibility:`🧘`,nutrition:`🥗`,recovery:`🛌`,plans:`📋`},n={strength:`#ef4444`,cardio:`#3b82f6`,flexibility:`#8b5cf6`,nutrition:`#f59e0b`,recovery:`#10b981`,plans:`#ec4899`};return`
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
                ${e.map(e=>`
                    <div class="folder-card" onclick="folderView.openFolder(${e.id})">
                        <div class="folder-icon" style="background: ${n[e.icon.replace(/[^a-z]/g,``)]||e.color}18;">
                            ${t[e.icon.replace(/[^a-z]/g,``)]||e.icon}
                        </div>
                        <div class="folder-name">${e.name}</div>
                        <div class="folder-meta">
                            <span>📄 ${e.file_count||0} ملف</span>
                            <span>🕐 منذ يوم</span>
                        </div>
                        <div class="folder-progress">
                            <div class="folder-progress-bar" style="width: ${e.progress||0}%; background: linear-gradient(90deg, ${e.color}, ${e.color}88);"></div>
                        </div>
                    </div>
                `).join(``)}
            </div>
        `}renderRecentFiles(e){let t={pdf:`📄`,video:`🎥`,image:`🖼️`,spreadsheet:`📊`,audio:`🎵`},r={beginner:`tag-beginner`,intermediate:`tag-intermediate`,advanced:`tag-advanced`},a={beginner:`مبتدئ`,intermediate:`متوسط`,advanced:`متقدم`};return`
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
                ${e.slice(0,4).map(e=>`
                    <div class="file-row" onclick="modalView.openFileById(${e.id})">
                        <div class="file-info">
                            <div class="file-icon ${e.file_type}">${t[e.file_type]||`📄`}</div>
                            <div class="file-details">
                                <div class="file-name">${e.name}</div>
                                <div class="file-desc">${e.description}</div>
                            </div>
                        </div>
                        <div><span class="tag ${r[e.difficulty]}">${a[e.difficulty]}</span></div>
                        <div class="file-date">${i(e.created_at||e.date)}</div>
                        <div class="file-size">${e.file_size?n(e.file_size):e.size}</div>
                        <div class="file-actions">
                            <button class="tooltip" data-tooltip="عرض" onclick="event.stopPropagation(); modalView.openFileById(${e.id})">👁️</button>
                            <button class="tooltip" data-tooltip="مفضل" onclick="event.stopPropagation()">⭐</button>
                        </div>
                    </div>
                `).join(``)}
            </div>
        `}attachEventListeners(){let e=document.getElementById(`searchInput`);e&&e.addEventListener(`input`,e=>this.handleSearch(e.target.value))}handleSearch(e){if(!e){this.render();return}console.log(`Search:`,e)}handleQuickAction(e){appState.addToast({type:`info`,title:`قيد التنفيذ`,message:`جاري فتح: ${e}`,duration:3e3})}toggleView(e){document.querySelectorAll(`.view-btn`).forEach(e=>e.classList.remove(`active`)),e.classList.add(`active`)}},u=new class{constructor(){this.container=document.getElementById(`contentArea`),this.currentFolderId=null,this.breadcrumb=[]}async openFolder(e){this.showLoading();try{let t=await dataService.getFolder(e);this.currentFolderId=e,this.breadcrumb=[{id:null,name:`المجلدات`},{id:e,name:t.name}],appState.setView(`folders`,{folderId:e}),this.renderFolderView(t)}catch(e){console.error(`Failed to load folder:`,e),this.renderError(`تعذر تحميل المجلد`)}}showLoading(){this.container.innerHTML=`
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل المجلد...</p>
            </div>
        `}renderError(e){this.container.innerHTML=`
            <div class="alert alert-error">
                <h4>⚠️ خطأ</h4>
                <p>${e}</p>
                <button class="btn btn-primary" onclick="dashboardView.render()">العودة للوحة التحكم</button>
            </div>
        `}renderFolderView(e){let t=e.files||[];this.container.innerHTML=`
            ${this.renderBreadcrumb()}
            ${this.renderFolderHeader(e)}
            ${this.renderDropZone()}
            ${this.renderFilesTable(t)}
        `}renderBreadcrumb(){return`
            <div class="folder-breadcrumb">
                ${this.breadcrumb.map((e,t)=>`
                    <span class="folder-breadcrumb-item ${t===this.breadcrumb.length-1?`active`:``}"
                          onclick="folderView.navigateTo(${e.id})">
                        ${e.name}
                    </span>
                    ${t<this.breadcrumb.length-1?`<span class="folder-breadcrumb-sep">/</span>`:``}
                `).join(``)}
            </div>
        `}renderFolderHeader(e){return`
            <div class="folder-header">
                <div class="folder-header-info">
                    <div class="folder-header-icon" style="background: ${e.color}18; color: ${e.color};">
                        ${e.icon}
                    </div>
                    <div class="folder-header-title">
                        <h2>${e.name}</h2>
                        <p>${e.description} • ${e.file_count||0} ملف</p>
                    </div>
                </div>
                <div class="folder-header-actions">
                    <button class="btn" onclick="dashboardView.render()">⬅️ رجوع</button>
                    <button class="btn btn-primary" onclick="folderView.showUploadModal()">
                        <span>⬆️</span> رفع ملف
                    </button>
                </div>
            </div>
        `}renderDropZone(){return`
            <div class="drop-zone" id="dropZone"
                 ondragover="folderView.handleDragOver(event)"
                 ondragleave="folderView.handleDragLeave(event)"
                 ondrop="folderView.handleDrop(event)">
                <div class="drop-zone-icon">📤</div>
                <div class="drop-zone-text">اسحب الملفات هنا</div>
                <div class="drop-zone-hint">أو انقر لاختيار الملفات من جهازك</div>
                <input type="file" id="fileInput" multiple style="display: none;" onchange="folderView.handleFileSelect(event)">
            </div>
        `}renderFilesTable(e){let t={pdf:`📄`,video:`🎥`,image:`🖼️`,spreadsheet:`📊`,audio:`🎵`},n={beginner:`tag-beginner`,intermediate:`tag-intermediate`,advanced:`tag-advanced`},r={beginner:`مبتدئ`,intermediate:`متوسط`,advanced:`متقدم`};return e.length===0?`
                <div class="empty-state">
                    <div class="icon">📂</div>
                    <h3>المجلد فارغ</h3>
                    <p>لا توجد ملفات في هذا المجلد بعد. ابدأ برفع ملفاتك!</p>
                </div>
            `:`
            <div class="files-list">
                <div class="file-row header">
                    <div>الملف</div>
                    <div>المستوى</div>
                    <div>التقييم</div>
                    <div>التاريخ</div>
                    <div></div>
                </div>
                ${e.map(e=>`
                    <div class="file-row" onclick="modalView.openFileById(${e.id})"
                         oncontextmenu="folderView.showContextMenu(event, ${e.id})">
                        <div class="file-info">
                            <div class="file-icon ${e.file_type}">${t[e.file_type]||`📄`}</div>
                            <div class="file-details">
                                <div class="file-name">${e.name}</div>
                                <div class="file-desc">${e.description||``}</div>
                            </div>
                        </div>
                        <div>
                            <span class="tag ${n[e.difficulty]}">${r[e.difficulty]}</span>
                            ${e.is_ai_generated?`<span class="tag tag-ai">AI</span>`:``}
                        </div>
                        <div class="file-date">
                            ⭐ ${e.rating||0} (${e.view_count||0})
                        </div>
                        <div class="file-size">${i(e.created_at||e.date)}</div>
                        <div class="file-actions">
                            <button onclick="event.stopPropagation(); modalView.openFileById(${e.id})">👁️</button>
                            <button onclick="event.stopPropagation(); folderView.downloadFile(${e.id})">⬇️</button>
                            <button onclick="event.stopPropagation(); folderView.deleteFile(${e.id})">🗑️</button>
                        </div>
                    </div>
                `).join(``)}
            </div>
        `}navigateTo(e){if(e===null){dashboardView.render();return}this.openFolder(e)}handleDragOver(e){e.preventDefault(),e.currentTarget.classList.add(`drag-over`)}handleDragLeave(e){e.currentTarget.classList.remove(`drag-over`)}handleDrop(e){e.preventDefault(),e.currentTarget.classList.remove(`drag-over`);let t=e.dataTransfer.files;t.length>0&&this.uploadFiles(t)}handleFileSelect(e){let t=e.target.files;t.length>0&&this.uploadFiles(t)}async uploadFiles(e){if(!this.currentFolderId)return;appState.setLoading(!0);let t=new FormData;for(let n of e)t.append(`file`,n);try{for(let t of e)await dataService.uploadFile(this.currentFolderId,t);appState.addToast({type:`success`,title:`تم الرفع`,message:`تم رفع ${e.length} ملف بنجاح`,duration:3e3}),this.openFolder(this.currentFolderId)}catch(e){console.error(`Upload error:`,e),appState.addToast({type:`error`,title:`فشل الرفع`,message:e.message,duration:5e3})}finally{appState.setLoading(!1)}}showContextMenu(e,t){e.preventDefault(),console.log(`Context menu for file:`,t)}showUploadModal(){let e=document.getElementById(`fileInput`);e&&e.click()}async downloadFile(e){try{let t=await dataService.getFile(e);t.file_path&&window.open(t.file_path,`_blank`)}catch{appState.addToast({type:`error`,title:`خطأ`,message:`تعذر تحميل الملف`})}}async deleteFile(e){if(confirm(`هل أنت متأكد من حذف هذا الملف؟`))try{await dataService.deleteFile(e),appState.addToast({type:`success`,title:`تم الحذف`,message:`تم حذف الملف بنجاح`,duration:3e3}),this.currentFolderId&&this.openFolder(this.currentFolderId)}catch{appState.addToast({type:`error`,title:`خطأ`,message:`تعذر حذف الملف`})}}openFileById(e){modalView.openFileById(e)}},d=new class{constructor(){this.panel=document.getElementById(`insightPanel`),this.panelBody=document.getElementById(`insightBody`),this.toggle=document.getElementById(`insightToggle`),this.isCollapsed=!1,this.init()}init(){this.toggle.addEventListener(`click`,()=>this.togglePanel()),this.loadInsights()}togglePanel(){this.isCollapsed=!this.isCollapsed,this.panel.classList.toggle(`collapsed`,this.isCollapsed)}async loadInsights(){try{let e=await dataService.getInsights(10,!1);this.renderInsights(e)}catch(e){console.error(`Failed to load insights:`,e),this.renderFallbackInsights()}}renderInsights(e){if(!e||e.length===0){this.panelBody.innerHTML=`
                <div class="empty-state" style="padding: 20px;">
                    <div class="icon">🤖</div>
                    <p>لا توجد توصيات حالياً</p>
                    <button class="btn btn-primary btn-sm" onclick="aiCoachView.loadInsights()">تحديث</button>
                </div>
            `;return}this.panelBody.innerHTML=e.map(e=>`
            <div class="insight-item ${e.is_read?``:`unread`}" data-id="${e.id}">
                <div class="insight-priority ${this.getPriorityClass(e.priority)}"></div>
                <div class="insight-icon ${e.insight_type}">${this.getIcon(e.insight_type)}</div>
                <div class="insight-content">
                    <div class="insight-title">${e.title}</div>
                    <div class="insight-text">${e.content}</div>
                    <div class="insight-time">🕐 ${i(e.created_at)}</div>
                    <div class="insight-actions">
                        <button class="insight-action-btn" onclick="aiCoachView.handleAction(${e.id}, 'read')">
                            ✓ تم القراءة
                        </button>
                        <button class="insight-action-btn" onclick="aiCoachView.handleAction(${e.id}, 'details')">
                            🔍 التفاصيل
                        </button>
                    </div>
                </div>
            </div>
        `).join(``)}renderFallbackInsights(){this.panelBody.innerHTML=`
            <div class="empty-state" style="padding: 20px;">
                <div class="icon">⚠️</div>
                <p>تعذر تحميل التوصيات من الخادم</p>
                <button class="btn btn-primary btn-sm" onclick="aiCoachView.loadInsights()">إعادة المحاولة</button>
            </div>
        `}getPriorityClass(e){return e>=4?`high`:e>=2?`medium`:`low`}getIcon(e){return{tip:`💡`,warning:`⚠️`,info:`📊`,goal:`🎯`,recommendation:`📋`,analysis:`🔍`}[e]||`💡`}async handleAction(e,t){if(t===`read`)try{await dataService.markInsightRead(e),appState.addToast({type:`success`,title:`تم التحديث`,message:`تم تحديد التوصية كمقروءة`,duration:2e3}),this.loadInsights()}catch{appState.addToast({type:`error`,title:`خطأ`,message:`تعذر تحديث الحالة`})}else if(t===`details`){let t=(await dataService.getInsights(20)).find(t=>t.id===e);t&&modalView.showInsightDetails(t)}}addInsight(e){this.loadInsights()}async simulateAIInsight(){appState.addToast({type:`info`,title:`جاري التحليل`,message:`المدرب الذكي يحلل بياناتك...`});try{let e=await dataService.getCurrentUser(),t=await dataService.getWorkouts(`completed`),n={total_volume:t.reduce((e,t)=>e+(t.total_volume||0),0),avg_heart_rate:t.reduce((e,t)=>e+(t.avg_heart_rate||0),0)/Math.max(t.length,1),max_heart_rate:Math.max(...t.map(e=>e.max_heart_rate||0),0),exercises:t.flatMap(e=>e.exercises||[]),avg_intensity:.75},r={resting_heart_rate:e.resting_heart_rate||70,avg_volume:n.total_volume/Math.max(t.length,1),last_workout_date:t[0]?.completed_at||new Date().toISOString(),hrv:e.hrv||50,baseline_hrv:e.baseline_hrv||55,sleep_hours:e.sleep_hours||7,weekly_sessions:t.length};await dataService.analyzeWorkout(n,r),appState.addToast({type:`success`,title:`تم التحليل`,message:`تم إنشاء توصيات جديدة بناءً على بياناتك`}),this.loadInsights()}catch(e){console.error(`AI Analysis error:`,e),appState.addToast({type:`error`,title:`خطأ`,message:`تعذر إجراء التحليل`})}}},f=new class{constructor(){this.overlay=document.getElementById(`modalOverlay`),this.title=document.getElementById(`modalTitle`),this.body=document.getElementById(`modalBody`),this.closeBtn=document.getElementById(`modalClose`),this.init()}init(){this.closeBtn.addEventListener(`click`,()=>this.close()),this.overlay.addEventListener(`click`,e=>{e.target===this.overlay&&this.close()}),document.addEventListener(`keydown`,e=>{e.key===`Escape`&&this.close()})}open(e,t){this.title.textContent=e,this.body.innerHTML=t,this.overlay.classList.add(`active`),document.body.style.overflow=`hidden`}close(){this.overlay.classList.remove(`active`),document.body.style.overflow=``}openFile(e){let t=MOCK_WORKOUT_DATA[e];if(!t){this.open(`ملف غير موجود`,`<p>عذراً، لم يتم العثور على بيانات هذا الملف.</p>`);return}this.open(t.title,t.content+this.renderModalActions())}async openFileById(e){try{let n=await t.getFile(e);if(!n)return;this.open(n.name,`
                <p>${n.description||``}</p>
                <div class="workout-detail">
                    <h5>📂 معلومات الملف</h5>
                    <p>النوع: ${n.file_type} | الحجم: ${n.file_size?formatFileSize(n.file_size):`غير معروف`} | المشاهدات: ${n.view_count||0}</p>
                </div>
                <div class="workout-detail">
                    <h5>🏷️ الوسوم</h5>
                    <p>${(n.tags||[]).map(e=>`<span class="tag tag-ai">${e}</span>`).join(` `)}</p>
                </div>
                <div class="workout-detail">
                    <h5>💪 العضلات المستهدفة</h5>
                    <p>${(n.muscle_groups||[]).map(e=>`<span class="tag">${e}</span>`).join(` `)}</p>
                </div>
                ${this.renderModalActions()}
            `)}catch(e){console.error(`Failed to load file:`,e),this.open(`خطأ`,`<p>تعذر تحميل بيانات الملف</p>`)}}showInsightDetails(e){this.open(e.title,`
            <div class="workout-detail">
                <h5>${e.icon} ${e.type===`warning`?`تنبيه`:`توصية`}</h5>
                <p>${e.content}</p>
            </div>
            <div class="workout-detail">
                <h5>📊 التحليل</h5>
                <p>تم إنشاء هذه التوصية بناءً على تحليل بياناتك الأخيرة باستخدام نموذج المدرب الذكي.</p>
            </div>
            <div style="display:flex; gap:12px; margin-top:20px;">
                <button class="btn btn-primary" style="flex:1;" onclick="aiCoachView.handleAction(${e.id}, 'read'); modalView.close();">
                    ✓ تم الفهم
                </button>
                <button class="btn" style="flex:1;" onclick="modalView.close();">
                    إغلاق
                </button>
            </div>
        `)}showCreateModal(e){let t={file:[{icon:`📄`,title:`ملف PDF`,desc:`رفع ملف PDF`},{icon:`🎥`,title:`فيديو تدريبي`,desc:`رفع فيديو توضيحي`},{icon:`📊`,title:`جدول بيانات`,desc:`إنشاء جدول Excel`},{icon:`🖼️`,title:`صور توضيحية`,desc:`رفع صور`}],plan:[{icon:`💪`,title:`خطة بناء عضلات`,desc:`3-6 أيام/أسبوع`},{icon:`🔥`,title:`خطة حرق دهون`,desc:`HIIT + كارديو`},{icon:`🏃`,title:`خطة تحمل`,desc:`تدريب marathon`},{icon:`🤖`,title:`خطة AI مخصصة`,desc:`حسب بياناتك`}]},n=t[e]||t.file;this.open(`إنشاء جديد`,`
            <div style="display:grid; gap:12px;">
                ${n.map(e=>`
                    <button class="btn" style="padding:18px; justify-content:flex-start; gap:16px; text-align:right;"
                            onmouseover="this.style.borderColor='var(--accent)'" 
                            onmouseout="this.style.borderColor='var(--border)'">
                        <span style="font-size:28px;">${e.icon}</span>
                        <div>
                            <div style="font-weight:800; color:var(--text-primary); font-size:15px;">${e.title}</div>
                            <div style="font-size:13px; color:var(--text-muted); margin-top:4px;">${e.desc}</div>
                        </div>
                    </button>
                `).join(``)}
            </div>
        `)}renderModalActions(){return`
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
        `}},p=new class{constructor(){this.container=null,this.toasts=new Map,this.init()}init(){this.container=document.createElement(`div`),this.container.className=`toast-container`,document.body.appendChild(this.container),appState.subscribe(`toastAdded`,e=>this.show(e)),appState.subscribe(`toastRemoved`,e=>this.remove(e))}show(e){let t=document.createElement(`div`);t.className=`toast ${e.type}`,t.innerHTML=`
            <span class="toast-icon">${this.getIcon(e.type)}</span>
            <div class="toast-content">
                <div class="toast-title">${e.title}</div>
                <div class="toast-message">${e.message}</div>
            </div>
            <button class="toast-close" onclick="toastSystem.dismiss(${e.id})">✕</button>
            <div class="toast-progress" style="width: 100%;"></div>
        `,this.container.appendChild(t),this.toasts.set(e.id,t);let n=t.querySelector(`.toast-progress`);n.style.transition=`width ${e.duration||5e3}ms linear`,requestAnimationFrame(()=>{n.style.width=`0%`})}remove(e){let t=this.toasts.get(e);t&&(t.classList.add(`removing`),setTimeout(()=>{t.remove(),this.toasts.delete(e)},300))}dismiss(e){appState.removeToast(e)}getIcon(e){return{success:`✅`,error:`❌`,warning:`⚠️`,info:`ℹ️`}[e]||`ℹ️`}},m=class{constructor(){this.sidebar=document.getElementById(`sidebar`),this.currentPath=document.getElementById(`currentPath`),this.init()}init(){document.querySelectorAll(`.nav-item`).forEach(e=>{e.addEventListener(`click`,t=>{let n=e.dataset.view;n&&this.switchView(n,e)})}),document.getElementById(`createBtn`).addEventListener(`click`,()=>{f.showCreateModal(`file`)}),document.getElementById(`notifBtn`).addEventListener(`click`,()=>{d.togglePanel()})}switchView(e,t){document.querySelectorAll(`.nav-item`).forEach(e=>e.classList.remove(`active`)),t&&t.classList.add(`active`);let n={dashboard:`لوحة التحكم`,folders:`المجلدات`,plans:`خطط التدريب`,exercises:`تمارين`,ai:`محلل AI`,analytics:`التحليلات`,clients:`المتدربين`,settings:`الإعدادات`,help:`المساعدة`};switch(this.currentPath.textContent=n[e]||e,e){case`dashboard`:l.render();break;case`folders`:l.render();break;case`plans`:this.renderPlansView();break;case`exercises`:this.renderExercisesView();break;case`ai`:this.renderAIView();break;default:this.renderPlaceholder(e)}}async renderPlansView(){this.container.innerHTML=`
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
        `;try{let e=await t.getFiles({file_type:`pdf`,tags:`training_plan`});this.container.innerHTML=`
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
                    ${(e||[]).map(e=>`
                        <div class="folder-card" style="cursor:pointer;" onclick="modalView.openFileById(${e.id})">
                            <div class="folder-icon" style="background: ${e.color}18; font-size: 32px;">📋</div>
                            <div class="folder-name">${e.name}</div>
                            <div class="folder-meta">
                                <span>${e.description||`خطة تدريبية`}</span>
                                <span>⭐ ${e.rating||`جديد`}</span>
                            </div>
                            <div class="folder-progress">
                                <div class="folder-progress-bar" style="width: ${e.progress||0}%; background: linear-gradient(90deg, ${e.color||`#ef4444`}, ${e.color||`#ef4444`}88);"></div>
                            </div>
                        </div>
                    `).join(``)||`<div class="empty-state"><p>لا توجد خطط متاحة</p></div>`}
                </div>
            `}catch(e){console.error(`Failed to load plans:`,e),this.container.innerHTML=`
                <div class="alert alert-warning">
                    <h4>⚠️ تعذر تحميل الخطط</h4>
                    <p>جاري عرض بيانات تجريبية. تأكد من تشغيل الخادم الخلفي.</p>
                    <button class="btn btn-primary" onclick="navigation.renderPlansView()">إعادة المحاولة</button>
                </div>
            `}}async renderExercisesView(){this.container.innerHTML=`
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
        `;try{let e=await t.getExercises();this.container.innerHTML=`
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
                    ${(e||[]).map(e=>`
                        <div class="file-row" style="cursor:pointer;" onclick="modalView.openFileById(${e.id})">
                            <div class="file-info">
                                <div class="file-icon" style="background: var(--accent-glow); font-size: 20px;">${s(e.category)}</div>
                                <div class="file-details">
                                    <div class="file-name">${e.name} (${e.name_en||``})</div>
                                    <div class="file-desc">${e.description||`تمرين`}</div>
                                </div>
                            </div>
                            <div class="file-date">${e.primary_muscle||``}</div>
                            <div><span class="tag ${a(e.difficulty)}">${o(e.difficulty)}</span></div>
                            <div class="file-size">⭐ ${e.avg_rating||`جديد`}</div>
                            <div class="file-actions">
                                <button>▶️</button>
                                <button>⭐</button>
                            </div>
                        </div>
                    `).join(``)||`<div class="empty-state"><p>لا توجد تمارين متاحة</p></div>`}
                </div>
            `}catch(e){console.error(`Failed to load exercises:`,e),this.container.innerHTML=`
                <div class="alert alert-warning">
                    <h4>⚠️ تعذر تحميل التمارين</h4>
                    <p>جاري عرض بيانات تجريبية. تأكد من تشغيل الخادم الخلفي.</p>
                    <button class="btn btn-primary" onclick="navigation.renderExercisesView()">إعادة المحاولة</button>
                </div>
            `}}renderAIView(){document.getElementById(`contentArea`).innerHTML=`
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
        `}renderPlaceholder(e){document.getElementById(`contentArea`).innerHTML=`
            <div class="empty-state" style="padding: 100px 20px;">
                <div class="icon" style="font-size: 80px;">🚧</div>
                <h3>قيد التطوير</h3>
                <p>هذه الصفحة قيد التطوير. سيتم إضافتها قريباً!</p>
                <button class="btn btn-primary" style="margin-top: 20px;" onclick="dashboardView.render()">
                    العودة للوحة التحكم
                </button>
            </div>
        `}},h=class{constructor(){this.navigation=new m,this.initialized=!1}init(){this.initialized||(console.log(`🧠 CoachMind Pro initializing...`),l.render(),setInterval(()=>{Math.random()>.7&&d.simulateAIInsight()},3e4),this.initialized=!0,console.log(`✅ CoachMind Pro ready!`),setTimeout(()=>{appState.addToast({type:`success`,title:`أهلاً بك في CoachMind Pro!`,message:`المدرب الذكي جاهز لمساعدتك في تحقيق أهدافك`,duration:6e3})},1e3))}};document.addEventListener(`DOMContentLoaded`,()=>{new h().init()}),window.modalView=f,window.dashboardView=l,window.folderView=u,window.aiCoachView=d,window.appState=appState,window.toastSystem=p,window.navigation=new m;