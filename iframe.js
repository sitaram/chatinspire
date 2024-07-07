(function() {
  window.createInvisibleIframe = function() {
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
  };
})();
