// 现代化自定义通知系统
class CustomNotification {
    constructor() {
        this.loadStyles();
    }

    // 加载外部CSS文件
    loadStyles() {
        if (document.getElementById('notification-styles')) return;

        const link = document.createElement('link');
        link.id = 'notification-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('notification.css');
        document.head.appendChild(link);
    }

    // 显示通知
    show(title, message, actions = []) {
        const notification = this.createElement(message, actions);
        document.body.appendChild(notification);
        
        // 使用 requestAnimationFrame 确保动画触发
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // 2秒后自动隐藏
        setTimeout(() => this.hide(notification), 2000);
        
        return notification;
    }

    // 创建通知元素 - 使用模板字符串，简洁优雅
    createElement(message, actions) {
        const actionsHtml = actions.length > 0 ? 
            `<div class="actions">${actions.map(action => 
                `<button class="action-btn" data-action="${action.title}">${action.title}</button>`
            ).join('')}</div>` : '';

        const template = `
            <div class="content">
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                <span class="text">${message}</span>
            </div>
            ${actionsHtml}
            <button class="close-btn">&times;</button>
        `;

        return this.createElementFromHTML(`<div class="notification">${template}</div>`, actions);
    }

    // 从 HTML 字符串创建元素并绑定事件
    createElementFromHTML(htmlString, actions) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstElementChild;

        // 事件委托 - 更优雅的事件处理
        element.addEventListener('click', (e) => {
            if (e.target.classList.contains('close-btn')) {
                this.hide(element);
            } else if (e.target.classList.contains('action-btn')) {
                const actionTitle = e.target.dataset.action;
                const action = actions.find(a => a.title === actionTitle);
                action?.callback?.();
                this.hide(element);
            }
        });

        return element;
    }

    // 隐藏通知
    hide(container) {
        container.classList.add('hide');
        setTimeout(() => container.remove(), 300);
    }
}

// 创建全局通知实例
const customNotification = new CustomNotification();

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showCustomNotification') {
        // 根据操作类型显示不同的消息
        const messages = {
            add: 'URL added to reading list',
            remove: 'URL removed from reading list', 
            read: 'URL marked as read'
        };
        
        const displayMessage = request.type === 'success' && messages[request.operation] 
            ? messages[request.operation] 
            : request.message;

        customNotification.show(request.title, displayMessage, []);
        sendResponse({ success: true });
    }
    
    return true;
});
