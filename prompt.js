import { displayCategories, parseCategories } from './ui.js';

export function injectPromptInIframe(iframe) {
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

export function injectPrompt(toggles, document) {
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
      chatInputBox.value = basePrompt;
      chatInputBox.dispatchEvent(new Event('input', { bubbles: true }));
      submitButton.click();

      const observer = new MutationObserver((mutations, obs) => {
        const responseContainer = document.querySelector('.group.conversation-turn');
        if (responseContainer && responseContainer.textContent.includes('System Design and Interviews')) {
          // Adjust the condition as needed
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
