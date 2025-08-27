// Helper function to show a notification
function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    // iconUrl: 'images/icon48.png', // Icon is commented out as we don't have one
    title: title,
    message: message,
    priority: 1
  });
}

chrome.commands.onCommand.addListener((command) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const tab = tabs[0];
    if (!tab || !tab.url || !(tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
      showNotification("Error", "This action cannot be performed on the current page.");
      return;
    }

    const url = tab.url;
    const title = tab.title;

    switch (command) {
      case "add-to-reading-list":
        chrome.readingList.addEntry({
          url: url,
          title: title,
          hasBeenRead: false
        })
        .then(() => {
          showNotification("Success", `"${title}" was added to your reading list.`);
        })
        .catch(error => {
          showNotification("Error", "Failed to add the page to your reading list.");
          console.error("Error adding to reading list:", error);
        });
        break;
      case "remove-from-reading-list":
        chrome.readingList.removeEntry({ url: url })
        .then(() => {
          showNotification("Success", `"${title}" was removed from your reading list.`);
        })
        .catch(error => {
          showNotification("Error", "Failed to remove the page. Was it in the list?");
          console.error("Error removing from reading list:", error);
        });
        break;
      case "mark-as-read":
        chrome.readingList.updateEntry({
          url: url,
          hasBeenRead: true
        })
        .then(() => {
          showNotification("Success", `"${title}" was marked as read.`);
        })
        .catch(error => {
          showNotification("Error", "Failed to mark the page as read. Was it in the list?");
          console.error("Error marking as read:", error);
        });
        break;
      default:
        console.log(`Command ${command} not found`);
    }
  });
});
