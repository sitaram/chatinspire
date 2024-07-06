console.log('ChatInspire root');
import { initMutationObserver } from './observer.js';

let isInjectionActive = false;

function initChatInspire() {
  console.log('ChatInspire initialized');
  initMutationObserver(isInjectionActive);
}

initChatInspire();
