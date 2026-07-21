/**
 * CoachMind Pro - Folders View Module
 * Folder browser with file management
 */

import { formatRelativeTime, dataService, appState } from './data.js';

class FolderView {
    constructor() {
        this.container = document.getElementById('contentArea');
        this.currentFolderId = null;
        this.breadcrumb = [];
    }

    async openFolder(folderId) {
        this.showLoading();
        try {
            const folder = await dataService.getFolder(folderId);
            this.currentFolderId = folderId;
            this.breadcrumb = [{ id: null, name: 'المجلدات' }, { id: folderId, name: folder.name }];
            appState.setView('folders', { folderId });
            this.renderFolderView(folder);
        } catch (error) {
            console.error('Failed to load folder:', error);
            this.renderError('تعذر تحميل المجلد');
        }
    }

    showLoading() {
        this.container.innerHTML = `
            <div class="loading-state">
                <div class="spinner"></div>
                <p>جاري تحميل المجلد...</p>
            </div>
        `;
    }

    renderError(message) {
        this.container.innerHTML = `
            <div class="alert alert-error">
                <h4>⚠️ خطأ</h4>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="dashboardView.render()">العودة للوحة التحكم</button>
            </div>
        `;
    }

    renderFolderView(folder) {
        const folderFiles = folder.files || [];

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
                        <p>${folder.description} • ${folder.file_count || 0} ملف</p>
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
                <input type="file" id="fileInput" multiple style="display: none;" onchange="folderView.handleFileSelect(event)">
            </div>
        `;
    }

    renderFilesTable(files) {
        const iconMap = { pdf: '📄', video: '🎥', image: '🖼️', spreadsheet: '📊', audio: '🎵' };
        const tagClass = { 
            beginner: 'tag-beginner', 
            intermediate: 'tag-intermediate', 
            advanced: 'tag-advanced',
            elite: 'tag-advanced'
        };
        const tagName = { 
            beginner: 'مبتدئ', 
            intermediate: 'متوسط', 
            advanced: 'متقدم',
            elite: 'محترف'
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
                                <div class="file-desc">${f.description || ''}</div>
                            </div>
                        </div>
                        <div>
                            <span class="tag ${tagClass[f.difficulty]}">${tagName[f.difficulty]}</span>
                            ${f.is_ai_generated ? '<span class="tag tag-ai">AI</span>' : ''}
                        </div>
                        <div class="file-date">
                            ⭐ ${f.rating || 0} (${f.view_count || 0})
                        </div>
                        <div class="file-size">${formatRelativeTime(f.created_at || f.date)}</div>
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
            window.dashboardView.render();
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
            this.uploadFiles(files);
        }
    }

    handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            this.uploadFiles(files);
        }
    }

    async uploadFiles(files) {
        if (!this.currentFolderId) return;
        
        appState.setLoading(true);
        const formData = new FormData();
        for (let file of files) {
            formData.append('file', file);
        }

        try {
            for (let file of files) {
                await dataService.uploadFile(this.currentFolderId, file);
            }
            appState.addToast({ type: 'success', title: 'تم الرفع', message: `تم رفع ${files.length} ملف بنجاح`, duration: 3000 });
            this.openFolder(this.currentFolderId); // Refresh
        } catch (error) {
            console.error('Upload error:', error);
            appState.addToast({ type: 'error', title: 'فشل الرفع', message: error.message, duration: 5000 });
        } finally {
            appState.setLoading(false);
        }
    }

    // Context Menu
    showContextMenu(e, fileId) {
        e.preventDefault();
        console.log('Context menu for file:', fileId);
    }

    // Actions
    showUploadModal() {
        const input = document.getElementById('fileInput');
        if (input) input.click();
    }

    async downloadFile(fileId) {
        try {
            const downloadUrl = await dataService.getDownloadUrl(fileId);
            window.open(downloadUrl, '_blank');
        } catch (error) {
            appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر تحميل الملف' });
        }
    }

    async deleteFile(fileId) {
        if (confirm('هل أنت متأكد من حذف هذا الملف؟')) {
            try {
                await dataService.deleteFile(fileId);
                appState.addToast({ type: 'success', title: 'تم الحذف', message: 'تم حذف الملف بنجاح', duration: 3000 });
                if (this.currentFolderId) {
                    this.openFolder(this.currentFolderId); // Refresh
                }
            } catch (error) {
                appState.addToast({ type: 'error', title: 'خطأ', message: 'تعذر حذف الملف' });
            }
        }
    }

    openFileById(fileId) {
        modalView.openFileById(fileId);
    }
}

export const folderView = new FolderView();
