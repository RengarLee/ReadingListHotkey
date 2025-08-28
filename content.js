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
            .reading-list-notification-container.show {
                display: flex !important;
                opacity: 1 !important;
                transform: translateX(-50%) translateY(0) !important;
            }

            .reading-list-notification-container.hide {
                opacity: 0 !important;
                transform: translateX(-50%) translateY(-10px) !important;
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
        const container = document.createElement('div');
        container.className = 'reading-list-notification-container';
        container.style.cssText = `
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
        `;

        // 创建内容区域
        const content = document.createElement('div');
        content.style.cssText = `
            display: flex;
            align-items: center;
            font-size: 12px;
            font-weight: 490;
            flex: 1;
            padding-left: 6px;
        `;

        // 添加图标
        const icon = document.createElement('div');
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
        icon.style.cssText = `
            margin-right: 8px;
            color: #ffffff;
            flex-shrink: 0;
        `;

        // 添加文本
        const text = document.createElement('span');
        text.textContent = message;
        text.style.cssText = `
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        `;

        content.appendChild(icon);
        content.appendChild(text);

        // 创建按钮区域
        const actionsContainer = document.createElement('div');
        actionsContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 8px;
        `;

        // 添加动作按钮
        if (actions.length > 0) {
            actions.forEach(action => {
                const button = document.createElement('button');
                button.textContent = action.title;
                button.style.cssText = `
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
                `;
                button.addEventListener('mouseenter', () => {
                    button.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                });
                button.addEventListener('mouseleave', () => {
                    button.style.backgroundColor = 'transparent';
                });
                button.addEventListener('click', () => {
                    if (action.callback) action.callback();
                    this.hide(container);
                });
                actionsContainer.appendChild(button);
            });
        }

        // 创建关闭按钮
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.style.cssText = `
            background-color: transparent;
            color: #ffffff;
            border: none;
            font-size: 14px;
            cursor: pointer;
            line-height: 1;
            padding: 0 6px;
        `;
        closeBtn.addEventListener('mouseenter', () => {
            closeBtn.style.color = '#dddddd';
        });
        closeBtn.addEventListener('mouseleave', () => {
            closeBtn.style.color = '#ffffff';
        });
        closeBtn.addEventListener('click', () => {
            this.hide(container);
        });

        // 组装元素
        container.appendChild(content);
        if (actions.length > 0) {
            container.appendChild(actionsContainer);
        }
        container.appendChild(closeBtn);

        return container;
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
