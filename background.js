chrome.commands.onCommand.addListener((command) => {
  if (command === "add-to-reading-list") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab && tab.url && (tab.url.startsWith('http:') || tab.url.startsWith('https:'))) {
        chrome.readingList.addEntry({
          url: tab.url,
          title: tab.title,
          hasBeenRead: false
        }).catch(error => {
          console.error("Error adding to reading list:", error);
        });
      } else {
        console.log("Cannot add this page to the reading list.");
      }
    });
  }
});
