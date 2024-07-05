chrome.runtime.sendMessage({ action: 'fetchTopics', toggles: { personalized: false, futureTrends: false, exploratory: false } }, (response) => {
  displayCategories(response.categories);
});

function displayCategories(categories) {
  const mainContainer = document.querySelector('.group/conversation-turn');
  if (mainContainer) {
    const categoriesDiv = document.createElement('div');
    categoriesDiv.id = 'categoriesTree';
    categoriesDiv.style.padding = '20px';
    categoriesDiv.style.backgroundColor = '#f7f7f8'; // Match ChatGPT color scheme
    categoriesDiv.style.borderRadius = '8px';
    categoriesDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

    const title = document.createElement('h2');
    title.innerText = 'ChatStarter';
    title.style.color = '#333'; // Match ChatGPT color scheme
    title.style.marginBottom = '10px';
    title.style.fontSize = '24px';

    categoriesDiv.appendChild(title);

    const toggles = document.createElement('div');
    toggles.style.marginBottom = '20px';
    toggles.innerHTML = `
      <label>
        <input type="checkbox" id="togglePersonalized"> Highly Personalized
      </label>
      <label>
        <input type="checkbox" id="toggleFutureTrends"> Future Trends
      </label>
      <label>
        <input type="checkbox" id="toggleExploratory"> More Exploratory
      </label>
    `;

    categoriesDiv.appendChild(toggles);

    const categoriesList = document.createElement('ul');
    categoriesList.style.listStyleType = 'none';
    categoriesList.style.padding = '0';

    categories.forEach(({ category, topics }) => {
      const categoryItem = document.createElement('li');
      categoryItem.style.marginBottom = '10px';

      const categoryTitle = document.createElement('h3');
      categoryTitle.innerText = category;
      categoryTitle.style.color = '#444'; // Match ChatGPT color scheme
      categoryTitle.style.marginBottom = '5px';

      const topicsList = document.createElement('ul');
      topicsList.style.listStyleType = 'disc';
      topicsList.style.marginLeft = '20px';

      topics.forEach((topic) => {
        const topicItem = document.createElement('li');
        topicItem.innerText = topic;
        topicItem.style.color = '#555'; // Match ChatGPT color scheme
        topicItem.style.cursor = 'pointer';

        topicItem.addEventListener('click', () => {
          const chatInputBox = document.querySelector('#prompt-textarea');
          const submitButton = chatInputBox.parentNode.parentNode.querySelector('.rounded-full');

          if (chatInputBox && submitButton) {
            chatInputBox.value = topic;
            chatInputBox.dispatchEvent(new Event('input', { bubbles: true }));
            submitButton.click();
          }
        });

        topicsList.appendChild(topicItem);
      });

      categoryItem.appendChild(categoryTitle);
      categoryItem.appendChild(topicsList);
      categoriesList.appendChild(categoryItem);
    });

    categoriesDiv.appendChild(categoriesList);
    mainContainer.insertBefore(categoriesDiv, mainContainer.firstChild);

    document.getElementById('togglePersonalized').addEventListener('change', () => {
      updateSuggestions();
    });
    document.getElementById('toggleFutureTrends').addEventListener('change', () => {
      updateSuggestions();
    });
    document.getElementById('toggleExploratory').addEventListener('change', () => {
      updateSuggestions();
    });
  }
}

function updateSuggestions() {
  const toggles = {
    personalized: document.getElementById('togglePersonalized').checked,
    futureTrends: document.getElementById('toggleFutureTrends').checked,
    exploratory: document.getElementById('toggleExploratory').checked,
  };

  chrome.runtime.sendMessage({ action: 'fetchTopics', toggles }, (response) => {
    displayCategories(response.categories);
  });
}
