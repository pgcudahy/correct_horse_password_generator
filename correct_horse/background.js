// Load and parse the words file
let wordList = [];

fetch(chrome.runtime.getURL('words.csv'))
  .then(response => response.text())
  .then(text => {
    wordList = text.split('\n').slice(1); // Skip header
  });

// Create context menu item
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "generateXKCDPassword",
    title: "Generate XKCD style password (copied to clipboard)",
    contexts: ["editable"]
  });
});

// Generate cryptographically secure random numbers
function getRandomValues() {
  const array = new Uint32Array(4);
  crypto.getRandomValues(array);
  return Array.from(array);
}

// Add text to clipboard using offscreen document
async function addToClipboard(value) {
  try {
    // Check if offscreen document already exists
    const existingContexts = await chrome.runtime.getContexts({
      contextTypes: ['OFFSCREEN_DOCUMENT']
    });

    if (existingContexts.length === 0) {
      // Create the offscreen document
      await chrome.offscreen.createDocument({
        url: 'offscreen.html',
        reasons: [chrome.offscreen.Reason.CLIPBOARD],
        justification: 'Write text to the clipboard.'
      });
    }

    // Send the message to the offscreen document with retry logic
    await sendMessageWithRetry({
      type: 'copy-data-to-clipboard',
      target: 'offscreen-doc',
      data: value
    });
  } catch (e) {
    console.error('Error handling clipboard:', e);
  }
}

// Helper function to send message with retry logic
async function sendMessageWithRetry(message, maxRetries = 3, delay = 100) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await chrome.runtime.sendMessage(message);
      return; // Success, exit the retry loop
    } catch (error) {
      console.log(`Message send attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        throw error; // Re-throw on final attempt
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * attempt));
    }
  }
}

// Handle context menu click
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "generateXKCDPassword") {
    const randomValues = getRandomValues();
    const selectedWords = randomValues.map(value => {
      const index = value % wordList.length;
      return wordList[index];
    });
    
    const password = selectedWords.join('');
    await addToClipboard(password);
  }
});
