document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('testButton').addEventListener('click', () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'injectPrompt', toggles: { personalized: true, futureTrends: true, exploratory: true } });
    });
  });
});
