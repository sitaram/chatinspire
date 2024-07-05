document.addEventListener('DOMContentLoaded', () => {
  console.log('addEventListener DOMContentLoaded');
  chrome.runtime.sendMessage({ action: 'injectPrompt', toggles: { personalized: false, futureTrends: false, exploratory: false } }, (response) => {
    displayCategories(response.categories);
  });
});

function displayCategories(categories) {
  console.log('displayCategories', categories);
  const treeContainer = document.getElementById('categoriesTree');
  treeContainer.innerText = categories;
}
