// Helper function to show a notification
function showNotification(title, message) {
  // Use a random ID to ensure a new notification is created each time
  const notificationId = `reading-list-ext-${Date.now()}`;
  try {
    // 使用更简单的通知创建方式，避免异步问题
    chrome.notifications.create(notificationId, {
      type: 'basic',
      iconUrl: chrome.runtime.getURL('icon.png'), // Using a default icon name
      title: title,
      message: message,
      priority: 1,
      eventTime: Date.now() + 1000, // 设置显示时间为1秒后
      requireInteraction: false // 不需要用户交互
    });
    
    console.log('Notification requested:', notificationId);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
}

// Add action listener to test notifications directly when clicking the extension icon
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked, showing test notification");
  // 不要使用async函数，因为可能导致通道关闭问题
  showNotification("Test Notification", "This is a test notification from the Reading List extension.");
  
  // 在控制台打印一条消息，确认代码执行
  console.log("Test notification triggered");
});

// Make the command listener non-async to avoid message channel closing issues
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);
  
  // 使用Promise而不是await
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (!tabs || tabs.length === 0) {
        console.error("No active tabs found");
        showNotification("Error", "No active tab found");
        return;
      }

      const tab = tabs[0];
      if (!tab || !tab.url || !(tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
        showNotification("Error", "This action cannot be performed on the current page.");
        return;
      }

      const url = tab.url;
      const title = tab.title;

      console.log(`Executing command: ${command}`);
      
      switch (command) {
        case "add-to-reading-list":
          // 使用Promise链式处理，避免await可能引起的问题
          chrome.readingList.addEntry({ url: url, title: title, hasBeenRead: false })
            .then(() => {
              console.log("Added to reading list successfully");
              // 通知放在回调里，确保操作完成后再显示
              showNotification("Success", `"${title}" was added to your reading list.`);
            })
            .catch(err => {
              console.error("Error adding to reading list:", err);
              showNotification("Error", `Failed to add "${title}" to reading list.`);
            });
          break;
        case "remove-from-reading-list":
          chrome.readingList.removeEntry({ url: url })
            .then(() => {
              console.log("Removed from reading list successfully");
              showNotification("Success", `"${title}" was removed from your reading list.`);
            })
            .catch(err => {
              console.error("Error removing from reading list:", err);
              showNotification("Error", `Failed to remove "${title}" from reading list.`);
            });
          break;
        case "mark-as-read":
          chrome.readingList.updateEntry({ url: url, hasBeenRead: true })
            .then(() => {
              console.log("Marked as read successfully");
              showNotification("Success", `"${title}" was marked as read.`);
            })
            .catch(err => {
              console.error("Error marking as read:", err);
              showNotification("Error", `Failed to mark "${title}" as read.`);
            });
          break;
        default:
          // This case should not be reached if manifest is correct
          console.log(`Command ${command} not found`);
          break;
      }
    })
    .catch(error => {
      // 错误处理
      console.error(`Error processing command ${command}:`, error);
      showNotification("Error", "Failed to process command: " + command);
    });
});
