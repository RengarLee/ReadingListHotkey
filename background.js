// Helper function to show a custom notification
function showNotification(title, message, type = 'info', operation = '') {
  // Query current active tab
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (tabs && tabs.length > 0) {
        const tab = tabs[0];
        // Only show custom notifications on http/https pages
        if (tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
          // Send message to content script to display custom notification
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
          // For non-http/https pages, use console output
          console.log(`${title}: ${message}`);
        }
      } else {
        console.log(`${title}: ${message}`);
      }
    })
    .catch(err => {
      console.info('Error querying tabs:', err);
      console.log(`${title}: ${message}`);
    });
}

// Make the command listener non-async to avoid message channel closing issues
chrome.commands.onCommand.addListener((command) => {
  console.log(`Command received: ${command}`);
  
  // Use Promise instead of await
  chrome.tabs.query({ active: true, currentWindow: true })
    .then(tabs => {
      if (!tabs || tabs.length === 0) {
        console.info("No active tabs found");
        return;
      }

      const tab = tabs[0];
      if (!tab || !tab.url || !(tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
        console.log("This action cannot be performed on the current page.");
        return;
      }

      const url = tab.url;
      const title = tab.title;

      console.log(`Executing command: ${command}`);
      
      switch (command) {
        case "add-to-reading-list":
          // Use Promise chaining to avoid potential issues with await
          chrome.readingList.addEntry({ url: url, title: title, hasBeenRead: false })
            .then(() => {
              console.log("Added to reading list successfully");
              // Show notification in callback to ensure operation completes first
              showNotification("Success", `"${title}" was added to your reading list.`, "success", "add");
            })
            .catch(err => {
              console.info("Error adding to reading list:", err);
            });
          break;
        case "remove-from-reading-list":
          chrome.readingList.removeEntry({ url: url })
            .then(() => {
              console.log("Removed from reading list successfully");
              showNotification("Success", `"${title}" was removed from your reading list.`, "success", "remove");
            })
            .catch(err => {
              console.info("Error removing from reading list:", err);
            });
          break;
        case "mark-as-read":
          chrome.readingList.updateEntry({ url: url, hasBeenRead: true })
            .then(() => {
              console.log("Marked as read successfully");
              showNotification("Success", `"${title}" was marked as read.`, "success", "read");
            })
            .catch(err => {
              console.info("Error marking as read:", err);
            });
          break;
        default:
          // This case should not be reached if manifest is correct
          console.log(`Command ${command} not found`);
          break;
      }
    })
    .catch(error => {
      // Error handling
      console.info(`Error processing command ${command}:`, error);
    });
});
