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
  // Check if we have any existing offscreen document
  try {
    // Create the offscreen document
    await chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: 'Write text to the clipboard.'
    });

    // Send the message to the offscreen document
    chrome.runtime.sendMessage({
      type: 'copy-data-to-clipboard',
      target: 'offscreen-doc',
      data: value
    });
  } catch (e) {
    console.error('Error handling clipboard:', e);
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
