(function () {
  window.injectPromptInIframe = function (iframe) {
    const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;

    const checkElements = setInterval(() => {
      const chatInputBox = iframeDocument.querySelector('#prompt-textarea');
      const submitButton = chatInputBox?.parentNode?.parentNode?.querySelector('.rounded-full');

      if (chatInputBox && submitButton) {
        clearInterval(checkElements);
        console.log('ChatInspire elements found in iframe');

        injectPrompt({ personalized: false, futureTrends: false, exploratory: false }, iframeDocument)
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
  };

  window.injectPrompt = function (toggles, document) {
    console.log('ChatInspire injectPrompt');
    let basePrompt = window.PROMPT_BASE;

    if (toggles.personalized) {
      basePrompt += window.PROMPT_PERSONALIZED;
    }

    if (toggles.futureTrends) {
      basePrompt += window.PROMPT_FUTURE_TRENDS;
    }

    if (toggles.exploratory) {
      basePrompt += window.PROMPT_EXPLORATORY;
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
  };
})();
