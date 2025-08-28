// Helper function to show a custom notification
function showNotification(title, message, type = 'info', operation = '') {
  // 查询当前活动的标签页
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        // 只在http/https页面显示自定义通知
        if (tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
          // 发送消息给content script显示自定义通知
          chrome.tabs.sendMessage(tab.id, {
            action: 'showCustomNotification',
            title: title,
            message: message,
            type: type,
            operation: operation
          }).catch(err => {
            console.log(`${title}: ${message}`);
          });
        } else {
          // 对于非http/https页面，使用控制台输出
          console.log(`${title}: ${message}`);
        }
      } else {
        console.log(`${title}: ${message}`);
      }
    })
    .catch(err => {
      console.error('Error querying tabs:', err);
      console.log(`${title}: ${message}`);
    });
}

// Add action listener to test notifications directly when clicking the extension icon
chrome.action.onClicked.addListener((tab) => {
  console.log("Extension icon clicked, showing test notification");
  // 不要使用async函数，因为可能导致通道关闭问题
  showNotification("Test Notification", "This is a test notification from the Reading List extension.", "info", "test");
  
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
        showNotification("Error", "No active tab found", "error");
        return;
      }

      const tab = tabs[0];
      if (!tab || !tab.url || !(tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
        showNotification("Error", "This action cannot be performed on the current page.", "error");
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
              showNotification("Success", `"${title}" was added to your reading list.`, "success", "add");
            })
            .catch(err => {
              console.error("Error adding to reading list:", err);
              showNotification("Error", `Failed to add "${title}" to reading list.`, "error", "add");
            });
          break;
        case "remove-from-reading-list":
          chrome.readingList.removeEntry({ url: url })
            .then(() => {
              console.log("Removed from reading list successfully");
              showNotification("Success", `"${title}" was removed from your reading list.`, "success", "remove");
            })
            .catch(err => {
              console.error("Error removing from reading list:", err);
              showNotification("Error", `Failed to remove "${title}" from reading list.`, "error", "remove");
            });
          break;
        case "mark-as-read":
          chrome.readingList.updateEntry({ url: url, hasBeenRead: true })
            .then(() => {
              console.log("Marked as read successfully");
              showNotification("Success", `"${title}" was marked as read.`, "success", "read");
            })
            .catch(err => {
              console.error("Error marking as read:", err);
              showNotification("Error", `Failed to mark "${title}" as read.`, "error", "read");
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
      showNotification("Error", "Failed to process command: " + command, "error");
    });
});

// 处理来自content script的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'openReadingList') {
    // 打开Chrome的阅读列表页面
    chrome.tabs.create({ url: 'chrome://reading-list/' });
    sendResponse({ success: true });
  }
});
