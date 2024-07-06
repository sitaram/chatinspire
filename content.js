console.log('ChatInspire root');

let isInjectionActive = false;

function initChatInspire() {
  console.log('ChatInspire initialized');

  const targetNode = document.body;
  const config = { childList: true, subtree: true };

  const callback = function (mutationsList, observer) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && !isInjectionActive) {
        const logoElement = document.querySelector('svg.h-12.w-12[role="img"]');
        if (logoElement) {
          console.log('ChatInspire logo found');
          isInjectionActive = true;
          observer.disconnect();
          createInvisibleIframe();
          createPlaceholderDiv();
          return;
        }
      }
    }
  };

  const observer = new MutationObserver(callback);
  observer.observe(targetNode, config);

  // Reconnect the observer if it's disconnected and injection is not active
  setInterval(() => {
    if (!isInjectionActive) {
      observer.observe(targetNode, config);
    }
  }, 1000);
}

function createInvisibleIframe() {
  const iframe = document.createElement('iframe');
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  iframe.src = 'https://chatgpt.com/?model=gpt-4o'; // Change URL to your ChatGPT page

  iframe.onload = () => {
    console.log('ChatInspire iframe loaded');
    injectPromptInIframe(iframe);
  };

  document.body.appendChild(iframe);
}

function createPlaceholderDiv() {
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

function injectPromptInIframe(iframe) {
  const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

  const checkElements = setInterval(() => {
    const chatInputBox = iframeDocument.querySelector('#prompt-textarea');
    const submitButton = chatInputBox?.parentNode?.parentNode?.querySelector('.rounded-full');

    if (chatInputBox && submitButton) {
      clearInterval(checkElements);
      console.log('ChatInspire elements found in iframe');

      injectPrompt({ personalized: true, futureTrends: true, exploratory: true }, iframeDocument)
        .then((response) => {
          console.log('Response received from iframe:', response);
          displayCategories(parseCategories(response));
          // Remove the iframe after the injection is complete
          document.body.removeChild(iframe);
          isInjectionActive = false;
        })
        .catch((error) => {
          console.error('Error during automatic injection in iframe:', error);
          // Remove the iframe and reset the flag on error
          document.body.removeChild(iframe);
          isInjectionActive = false;
        });
    } else {
      console.log('ChatInspire elements not found in iframe yet');
    }
  }, 100); // Check every 100ms until elements are found
}

function injectPrompt(toggles, document) {
  console.log('ChatInspire injectPrompt');
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

  return new Promise((resolve, reject) => {
    const chatInputBox = document.querySelector('#prompt-textarea');
    const submitButton = chatInputBox.parentNode.parentNode.querySelector('.rounded-full');

    if (chatInputBox && submitButton) {
      console.log('ChatInspire input box and submit button found');
      chatInputBox.value = basePrompt;
      chatInputBox.dispatchEvent(new Event('input', { bubbles: true }));
      submitButton.click();
      console.log('ChatInspire prompt submitted');

      const observer = new MutationObserver((mutations, obs) => {
        const responseContainer = document.querySelector('.group.conversation-turn');
        if (responseContainer && responseContainer.textContent.includes('System Design and Interviews')) {
          // Adjust the condition as needed
          console.log('ChatInspire response detected');
          obs.disconnect();
          resolve(responseContainer.textContent);
        }
      });

      observer.observe(document.body, { childList: true, subtree: true });
    } else {
      reject('Chat input box or submit button not found.');
    }
  });
}

function parseCategories(responseText) {
  console.log('ChatInspire parseCategories');
  return responseText.split('\n\n').map((section) => {
    const [category, ...topics] = section.split('\n').filter(Boolean);
    return { category, topics };
  });
}

function displayCategories(categories) {
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
            console.log(`Topic "${topic}" submitted`);
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

function updateSuggestions() {
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

initChatInspire();
