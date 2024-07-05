document.addEventListener('DOMContentLoaded', () => {
  chrome.runtime.sendMessage({ action: 'fetchTopics', toggles: { personalized: false, futureTrends: false, exploratory: false } }, (response) => {
    displayCategories(response.categories);
  });
});

function displayCategories(categories) {
  const treeContainer = document.getElementById('categoriesTree');
  treeContainer.innerText = categories;
}
