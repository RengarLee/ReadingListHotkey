// 自定义通知系统
class CustomNotification {
    constructor() {
        this.notificationId = 0;
        this.injectStyles(); // 注入CSS样式
    }

    // 注入CSS样式（基于temp/style.css）
    injectStyles() {
        if (document.getElementById('reading-list-notification-styles')) {
            return; // 已经注入过了
        }

        const style = document.createElement('style');
        style.id = 'reading-list-notification-styles';
        style.textContent = `
            .reading-list-notification-container {
                position: fixed;
                top: 20px;
                left: 50%;
                transform: translateX(-50%) translateY(-10px);
                z-index: 999999;
                background-color: #1d3558;
                color: #ffffff;
                padding: 6px;
                border-radius: 35px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
                display: none;
                align-items: center;
                width: fit-content;
                gap: 12px;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
                max-width: 400px;
                min-width: 250px;
                opacity: 0;
                transition: all 0.3s ease-in-out;
            }

            .reading-list-notification-container.show {
                display: flex !important;
                opacity: 1 !important;
                transform: translateX(-50%) translateY(0) !important;
            }

            .reading-list-notification-container.hide {
                opacity: 0 !important;
                transform: translateX(-50%) translateY(-10px) !important;
            }

            .reading-list-notification-content {
                display: flex;
                align-items: center;
                font-size: 12px;
                font-weight: 490;
                flex: 1;
                padding-left: 6px;
            }

            .reading-list-notification-icon {
                margin-right: 8px;
                color: #ffffff;
                flex-shrink: 0;
            }

            .reading-list-notification-text {
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }

            .reading-list-notification-actions {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .reading-list-action-btn {
                padding: 6px 12px;
                font-weight: 450;
                cursor: pointer;
                font-size: 12px;
                border-radius: 35px;
                transition: background-color 0.2s ease;
                white-space: nowrap;
                background-color: transparent;
                color: #ffffff;
                border: 1px solid #ffffff;
            }

            .reading-list-action-btn:hover {
                background-color: rgba(255, 255, 255, 0.1);
            }

            .reading-list-close-btn {
                background-color: transparent;
                color: #ffffff;
                border: none;
                font-size: 14px;
                cursor: pointer;
                line-height: 1;
                padding: 0 6px;
            }

            .reading-list-close-btn:hover {
                color: #dddddd;
            }
        `;
        document.head.appendChild(style);
    }

    // 显示自定义通知
    show(title, message, actions = []) {
        // 创建通知容器
        const notificationContainer = this.createNotificationElement(title, message, actions);
        
        // 添加到页面
        document.body.appendChild(notificationContainer);
        
        // 使用temp文件夹中的显示动画效果
        this.showNotification(notificationContainer);

        // 2秒后自动隐藏
        setTimeout(() => {
            this.hide(notificationContainer);
        }, 2000);

        return notificationContainer;
    }

    // 显示通知的函数（基于temp/script.js）
    showNotification(notification) {
        notification.style.display = 'flex';
        // 强制重绘，然后添加show类来触发动画
        notification.offsetHeight;
        notification.classList.add('show');
    }

    // 创建通知DOM元素
    createNotificationElement(title, message, actions) {
        // 创建主容器
        const container = document.createElement('div');
        container.className = 'reading-list-notification-container';

        // 创建并添加内容
        container.appendChild(this.createNotificationContent(message));
        
        // 添加动作按钮（如果有）
        if (actions.length > 0) {
            container.appendChild(this.createNotificationActions(actions, container));
        }
        
        // 添加关闭按钮
        container.appendChild(this.createCloseButton(container));

        return container;
    }

    // 创建通知内容区域
    createNotificationContent(message) {
        const content = document.createElement('div');
        content.className = 'reading-list-notification-content';

        // 创建图标
        const icon = document.createElement('div');
        icon.className = 'reading-list-notification-icon';
        icon.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="8" y1="6" x2="21" y2="6"/>
                <line x1="8" y1="12" x2="21" y2="12"/>
                <line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/>
                <line x1="3" y1="12" x2="3.01" y2="12"/>
                <line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
        `;

        // 创建文本
        const text = document.createElement('span');
        text.className = 'reading-list-notification-text';
        text.textContent = message;

        content.appendChild(icon);
        content.appendChild(text);
        return content;
    }

    // 创建动作按钮区域
    createNotificationActions(actions, container) {
        const actionsContainer = document.createElement('div');
        actionsContainer.className = 'reading-list-notification-actions';

        actions.forEach(action => {
            const button = document.createElement('button');
            button.className = 'reading-list-action-btn';
            button.textContent = action.title;
            button.addEventListener('click', () => {
                if (action.callback) action.callback();
                this.hide(container);
            });
            actionsContainer.appendChild(button);
        });

        return actionsContainer;
    }

    // 创建关闭按钮
    createCloseButton(container) {
        const closeBtn = document.createElement('button');
        closeBtn.className = 'reading-list-close-btn';
        closeBtn.innerHTML = '&times;';
        closeBtn.addEventListener('click', () => {
            this.hide(container);
        });
        return closeBtn;
    }

    // 隐藏通知（基于temp/script.js）
    hide(container) {
        container.classList.add('hide');
        container.classList.remove('show');
        
        // 等待动画完成后隐藏元素
        setTimeout(() => {
            if (container.parentNode) {
                container.parentNode.removeChild(container);
            }
        }, 300); // 与CSS transition时间一致
    }
}

// 创建全局通知实例
const customNotification = new CustomNotification();

// 监听来自background script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showCustomNotification') {
        // 根据操作类型显示不同的消息
        let displayMessage = request.message;
        if (request.operation === 'add' && request.type === 'success') {
            displayMessage = 'URL added to reading list';
        } else if (request.operation === 'remove' && request.type === 'success') {
            displayMessage = 'URL removed from reading list';
        } else if (request.operation === 'read' && request.type === 'success') {
            displayMessage = 'URL marked as read';
        }

        customNotification.show(request.title, displayMessage, []);
        sendResponse({ success: true });
    }
    
    return true; // 保持消息通道开放
});
