export function createPlaceholderDiv() {
  const logoElement = document.querySelector('svg.h-12.w-12[role="img"]');
  if (logoElement) {
    const categoriesDiv = document.createElement('div');
    categoriesDiv.id = 'categoriesTree';
    categoriesDiv.style.padding = '20px';
    categoriesDiv.style.marginTop = '20px';
    categoriesDiv.style.color = 'rgba(103, 103, 103, 1)';
    categoriesDiv.style.border = '1px solid rgb(54, 54, 54)'; // rgb(54, 54, 54) in dark mode, #ddd in light mode
    categoriesDiv.style.borderRadius = '16px';
    categoriesDiv.style.boxShadow = '0 0 2px 0 rgba(0,0,0,.05), 0 4px 6px 0 rgba(0,0,0,.02)';
    categoriesDiv.innerText = 'Loading ChatInspire suggestions...';

    logoElement.parentNode.insertBefore(categoriesDiv, logoElement.nextSibling);
  }
}

export function displayCategories(categories) {
  console.log('ChatInspire displayCategories');
  const categoriesDiv = document.getElementById('categoriesTree');

  if (categoriesDiv) {
    categoriesDiv.innerHTML = ''; // Clear the placeholder text

    const title = document.createElement('h2');
    title.innerText = 'ChatInspire';
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
          console.log('chatInputBox', chatInputBox);
          const submitButton = chatInputBox.parentNode.parentNode.querySelector('.rounded-full');
          console.log('submitButton', submitButton);

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

    document.getElementById('togglePersonalized').addEventListener('change', updateSuggestions);
    document.getElementById('toggleFutureTrends').addEventListener('change', updateSuggestions);
    document.getElementById('toggleExploratory').addEventListener('change', updateSuggestions);
  }
}

export function parseCategories(responseText) {
  console.log('ChatInspire parseCategories');
  return responseText.split('\n\n').map((section) => {
    const [category, ...topics] = section.split('\n').filter(Boolean);
    return { category, topics };
  });
}

export function updateSuggestions() {
  console.log('ChatInspire updateSuggestions');
  const toggles = {
    personalized: document.getElementById('togglePersonalized').checked,
    futureTrends: document.getElementById('toggleFutureTrends').checked,
    exploratory: document.getElementById('toggleExploratory').checked,
  };

  const iframe = document.querySelector('iframe');
  injectPrompt({ personalized: toggles.personalized, futureTrends: toggles.futureTrends, exploratory: toggles.exploratory }, iframe.contentDocument).then(
    (response) => {
      displayCategories(parseCategories(response));
    }
  );
}
