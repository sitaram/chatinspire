console.log('content root');

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('content addListener', message, sender);
  if (message.action === 'injectPrompt' && window.location.href.includes('https://chat.openai.com/?model=')) {
    injectPrompt(message.toggles).then((response) => {
      sendResponse({ categories: parseCategories(response) });
    });
    return true;
  }
});

async function injectPrompt(toggles) {
  console.log('content injectPrompt', toggles);
  let basePrompt =
    'Go through my chat history and come up with a long list of topics that are relevant starting points for another discussion we can have right now. Categorize them into high-level categories. Under each category, using the topics, come up with a couple of imaginative and exploratory suggestions that initiate good conversations.';

  if (toggles.personalized) {
    basePrompt +=
      ' Refine the suggestions to be much more tied to the nuanced topics that have been explored in my chat history. Ensure these suggestions are significantly different and more specific compared to the original suggestions to reflect a higher level of personalization. Make sure the results are quite distinct from those provided under the standard personalized setting.';
  }

  if (toggles.futureTrends) {
    basePrompt +=
      ' Focus on speculative and emerging trends that look into the future of various fields. These suggestions should highlight visionary, forward-thinking ideas that extend beyond current developments. Ensure the results are significantly different from those focused on current trends.';
  }

  if (toggles.exploratory) {
    basePrompt +=
      ' Provide suggestions that delve deeper into creative and adventurous areas, pushing the boundaries of conventional ideas. These suggestions should encourage innovative thinking and exploration beyond the usual scope. Ensure the results are notably distinct from less exploratory suggestions.';
  }

  const chatInputBox = document.querySelector('textarea');
  const submitButton = chatInputBox.closest('form').querySelector('button[type="submit"]');

  if (chatInputBox && submitButton) {
    chatInputBox.value = basePrompt;
    chatInputBox.dispatchEvent(new Event('input', { bubbles: true }));
    submitButton.click();

    return new Promise((resolve) => {
      const observer = new MutationObserver(() => {
        const responseContainer = document.querySelector('.response-container'); // Adjust the selector as needed
        if (responseContainer && responseContainer.textContent.includes('System Design and Interviews')) {
          // Adjust the condition as needed
          observer.disconnect();
          resolve(responseContainer.textContent);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    });
  } else {
    throw new Error('Chat input box or submit button not found.');
  }
}

function parseCategories(responseText) {
  // Implement your parsing logic here
  // This is a placeholder function
  return responseText.split('\n\n').map((section) => {
    const [category, ...topics] = section.split('\n').filter(Boolean);
    return { category, topics };
  });
}

function displayCategories(categories) {
  const mainContainer = document.querySelector('.main-container'); // Adjust the selector as needed
  if (mainContainer) {
    const categoriesDiv = document.createElement('div');
    categoriesDiv.id = 'categoriesTree';
    categoriesDiv.style.padding = '20px';
    categoriesDiv.style.backgroundColor = '#f7f7f8'; // Match ChatGPT color scheme
    categoriesDiv.style.borderRadius = '8px';
    categoriesDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.1)';

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
          const chatInputBox = document.querySelector('textarea');
          const submitButton = chatInputBox.closest('form').querySelector('button[type="submit"]');

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

    document.getElementById('togglePersonalized').addEventListener('change', updateSuggestions);
    document.getElementById('toggleFutureTrends').addEventListener('change', updateSuggestions);
    document.getElementById('toggleExploratory').addEventListener('change', updateSuggestions);
  }
}

function updateSuggestions() {
  const toggles = {
    personalized: document.getElementById('togglePersonalized').checked,
    futureTrends: document.getElementById('toggleFutureTrends').checked,
    exploratory: document.getElementById('toggleExploratory').checked,
  };

  chrome.runtime.sendMessage({ action: 'injectPrompt', toggles }, (response) => {
    displayCategories(response.categories);
  });
}
