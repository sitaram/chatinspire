console.log('ChatInspire root');

let isInjectionActive = false;

(function initChatInspire() {
  console.log('ChatInspire initialized');
  initMutationObserver(isInjectionActive);
})();
