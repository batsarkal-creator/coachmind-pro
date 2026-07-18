/**
 * CoachMind Pro - Folders View Module
 * Folder browser with file management
 */

class FolderView {
    constructor() {
        this.container = document.getElementById('contentArea');
        this.currentFolderId = null;
        this.breadcrumb = [];
    }

    openFolder(folderId) {
        const folder = MOCK_FOLDERS.find(f => f.id === folderId);
        if (!folder) return;

        this.currentFolderId = folderId;
        this.breadcrumb = [{ id: null, name: 'المجلدات' }, { id: folderId, name: folder.name }];

        appState.setView('folders', { folderId });
        this.renderFolderView(folder);
    }

    renderFolderView(folder) {
        const folderFiles = MOCK_FILES.filter(f => f.folder_id === folder.id);

        this.container.innerHTML = `
            ${this.renderBreadcrumb()}
            ${this.renderFolderHeader(folder)}
            ${this.renderDropZone()}
            ${this.renderFilesTable(folderFiles)}
        `;
    }

    renderBreadcrumb() {
        return `
            <div class="folder-breadcrumb">
                ${this.breadcrumb.map((item, i) => `
                    <span class="folder-breadcrumb-item ${i === this.breadcrumb.length - 1 ? 'active' : ''}"
                          onclick="folderView.navigateTo(${item.id})">
                        ${item.name}
                    </span>
                    ${i < this.breadcrumb.length - 1 ? '<span class="folder-breadcrumb-sep">/</span>' : ''}
                `).join('')}
            </div>
        `;
    }

    renderFolderHeader(folder) {
        return `
            <div class="folder-header">
                <div class="folder-header-info">
                    <div class="folder-header-icon" style="background: ${folder.color}18; color: ${folder.color};">
                        ${folder.icon}
                    </div>
                    <div class="folder-header-title">
                        <h2>${folder.name}</h2>
                        <p>${folder.description} • ${folder.file_count} ملف</p>
                    </div>
                </div>
                <div class="folder-header-actions">
                    <button class="btn" onclick="dashboardView.render()">⬅️ رجوع</button>
                    <button class="btn btn-primary" onclick="folderView.showUploadModal()">
                        <span>⬆️</span> رفع ملف
                    </button>
                </div>
            </div>
        `;
    }

    renderDropZone() {
        return `
            <div class="drop-zone" id="dropZone"
                 ondragover="folderView.handleDragOver(event)"
                 ondragleave="folderView.handleDragLeave(event)"
                 ondrop="folderView.handleDrop(event)">
                <div class="drop-zone-icon">📤</div>
                <div class="drop-zone-text">اسحب الملفات هنا</div>
                <div class="drop-zone-hint">أو انقر لاختيار الملفات من جهازك</div>
            </div>
        `;
    }

    renderFilesTable(files) {
        const iconMap = { pdf: '📄', video: '🎥', image: '🖼️', spreadsheet: '📊', audio: '🎵' };
        const tagClass = { 
            beginner: 'tag-beginner', 
            intermediate: 'tag-intermediate', 
            advanced: 'tag-advanced' 
        };
        const tagName = { 
            beginner: 'مبتدئ', 
            intermediate: 'متوسط', 
            advanced: 'متقدم' 
        };

        if (files.length === 0) {
            return `
                <div class="empty-state">
                    <div class="icon">📂</div>
                    <h3>المجلد فارغ</h3>
                    <p>لا توجد ملفات في هذا المجلد بعد. ابدأ برفع ملفاتك!</p>
                </div>
            `;
        }

        return `
            <div class="files-list">
                <div class="file-row header">
                    <div>الملف</div>
                    <div>المستوى</div>
                    <div>التقييم</div>
                    <div>التاريخ</div>
                    <div></div>
                </div>
                ${files.map(f => `
                    <div class="file-row" onclick="modalView.openFileById(${f.id})"
                         oncontextmenu="folderView.showContextMenu(event, ${f.id})">
                        <div class="file-info">
                            <div class="file-icon ${f.file_type}">${iconMap[f.file_type] || '📄'}</div>
                            <div class="file-details">
                                <div class="file-name">${f.name}</div>
                                <div class="file-desc">${f.description}</div>
                            </div>
                        </div>
                        <div>
                            <span class="tag ${tagClass[f.difficulty]}">${tagName[f.difficulty]}</span>
                            ${f.is_ai_generated ? '<span class="tag tag-ai">AI</span>' : ''}
                        </div>
                        <div class="file-date">
                            ⭐ ${f.rating} (${f.view_count})
                        </div>
                        <div class="file-size">${f.date}</div>
                        <div class="file-actions">
                            <button onclick="event.stopPropagation(); modalView.openFileById(${f.id})">👁️</button>
                            <button onclick="event.stopPropagation(); folderView.downloadFile(${f.id})">⬇️</button>
                            <button onclick="event.stopPropagation(); folderView.deleteFile(${f.id})">🗑️</button>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // Navigation
    navigateTo(folderId) {
        if (folderId === null) {
            dashboardView.render();
            return;
        }
        this.openFolder(folderId);
    }

    // Drag & Drop
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            appState.addToast({
                type: 'info',
                title: 'جاري الرفع',
                message: `تم اكتشاف ${files.length} ملف`,
                duration: 3000
            });
        }
    }

    // Context Menu
    showContextMenu(e, fileId) {
        e.preventDefault();
        // Would show custom context menu
        console.log('Context menu for file:', fileId);
    }

    // Actions
    showUploadModal() {
        modalView.showCreateModal('file');
    }

    downloadFile(fileId) {
        appState.addToast({
            type: 'success',
            title: 'تم التحميل',
            message: 'جاري تحميل الملف...',
            duration: 3000
        });
    }

    deleteFile(fileId) {
        if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
            appState.addToast({
                type: 'success',
                title: 'تم الحذف',
                message: 'تم حذف الملف بنجاح',
                duration: 3000
            });
        }
    }

    openFileById(fileId) {
        modalView.openFileById(fileId);
    }
}

const folderView = new FolderView();
