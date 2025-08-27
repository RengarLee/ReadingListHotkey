// Helper function to show a notification
function showNotification(title, message) {
  // Use a random ID to ensure a new notification is created each time
  const notificationId = `reading-list-ext-${Date.now()}`;
  chrome.notifications.create(notificationId, {
    type: 'basic',
    // iconUrl: 'images/icon48.png', // Icon is still commented out
    title: title,
    message: message,
    priority: 1
  });
}

// Make the command listener async
chrome.commands.onCommand.addListener(async (command) => {
  let tabs;
  try {
    tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  } catch (error) {
    console.error("Error querying tabs:", error);
    return;
  }

  const tab = tabs[0];
  if (!tab || !tab.url || !(tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
    showNotification("Error", "This action cannot be performed on the current page.");
    return;
  }

  const url = tab.url;
  const title = tab.title;

  try {
    switch (command) {
      case "add-to-reading-list":
        await chrome.readingList.addEntry({ url: url, title: title, hasBeenRead: false });
        showNotification("Success", `"${title}" was added to your reading list.`);
        break;
      case "remove-from-reading-list":
        await chrome.readingList.removeEntry({ url: url });
        showNotification("Success", `"${title}" was removed from your reading list.`);
        break;
      case "mark-as-read":
        await chrome.readingList.updateEntry({ url: url, hasBeenRead: true });
        showNotification("Success", `"${title}" was marked as read.`);
        break;
      default:
        // This case should not be reached if manifest is correct
        console.log(`Command ${command} not found`);
        break;
    }
  } catch (error) {
    // A single catch block for all reading list errors
    console.error(`Error processing command ${command}:`, error);
    showNotification("Error", `Operation failed for "${title}". Is the page in your reading list?`);
  }
});
