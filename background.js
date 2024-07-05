chrome.runtime.onInstalled.addListener(() => {
  console.log('ChatStarter installed');
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'fetchTopics') {
    fetchTopics(message.toggles).then(response => {
      sendResponse({ categories: parseCategories(response) });
    });
    return true;
  }
});

async function fetchTopics(toggles) {
  let basePrompt = "Go through my chat history and come up with a long list of topics that are relevant starting points for another discussion we can have right now. Categorize them into high-level categories. Under each category, using the topics, come up with a couple of imaginative and exploratory suggestions that initiate good conversations.";

  if (toggles.personalized) {
    basePrompt += " Refine the suggestions to be much more tied to the nuanced topics that have been explored in my chat history. Ensure these suggestions are significantly different and more specific compared to the original suggestions to reflect a higher level of personalization. Make sure the results are quite distinct from those provided under the standard personalized setting.";
  }

  if (toggles.futureTrends) {
    basePrompt += " Focus on speculative and emerging trends that look into the future of various fields. These suggestions should highlight visionary, forward-thinking ideas that extend beyond current developments. Ensure the results are significantly different from those focused on current trends.";
  }

  if (toggles.exploratory) {
    basePrompt += " Provide suggestions that delve deeper into creative and adventurous areas, pushing the boundaries of conventional ideas. These suggestions should encourage innovative thinking and exploration beyond the usual scope. Ensure the results are notably distinct from less exploratory suggestions.";
  }

  const response = await fetch('https://api.openai.com/v1/engines/davinci/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer YOUR_OPENAI_API_KEY`
    },
    body: JSON.stringify({
      prompt: basePrompt,
      max_tokens: 1500
    })
  });

  const data = await response.json();
  return data.choices[0].text;
}

function parseCategories(responseText) {
  // Implement your parsing logic here
  // This is a placeholder function
  return responseText.split('\n\n').map(section => {
    const [category, ...topics] = section.split('\n').filter(Boolean);
    return { category, topics };
  });
}
