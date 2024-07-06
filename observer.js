import { createInvisibleIframe } from './iframe.js';
import { createPlaceholderDiv } from './ui.js';

export function initMutationObserver(isInjectionActive) {
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
