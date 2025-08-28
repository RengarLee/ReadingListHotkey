// Modern custom notification system
class CustomNotification {
    constructor() {
        this.loadStyles();
    }

    // Load external CSS file
    loadStyles() {
        if (document.getElementById('notification-styles')) return;

        const link = document.createElement('link');
        link.id = 'notification-styles';
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = chrome.runtime.getURL('notification.css');
        document.head.appendChild(link);
    }

    // Show notification
    show(title, message, actions = []) {
        const notification = this.createElement(message, actions);
        document.body.appendChild(notification);
        
        // Use requestAnimationFrame to ensure animation triggers
        requestAnimationFrame(() => {
            notification.classList.add('show');
        });

        // Auto-hide after 2 seconds
        setTimeout(() => this.hide(notification), 2000);
        
        return notification;
    }

    // Create notification element - using template strings for elegance
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

    // Create element from HTML string and bind events
    createElementFromHTML(htmlString, actions) {
        const div = document.createElement('div');
        div.innerHTML = htmlString;
        const element = div.firstElementChild;

        // Event delegation - more elegant event handling
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

    // Hide notification
    hide(container) {
        container.classList.add('hide');
        setTimeout(() => container.remove(), 300);
    }
}

// Create global notification instance
const customNotification = new CustomNotification();

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'showCustomNotification') {
        // Display different messages based on operation type
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
