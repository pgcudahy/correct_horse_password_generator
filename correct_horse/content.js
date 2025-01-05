// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "insertPassword") {
    // Get the active element (should be the text input)
    const activeElement = document.activeElement;
    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      // Insert the password at the cursor position
      const startPos = activeElement.selectionStart;
      const endPos = activeElement.selectionEnd;
      const beforeText = activeElement.value.substring(0, startPos);
      const afterText = activeElement.value.substring(endPos);
      activeElement.value = beforeText + request.password + afterText;
      
      // Move cursor to end of inserted password
      const newPos = startPos + request.password.length;
      activeElement.setSelectionRange(newPos, newPos);
    }
  } else if (request.action === "copyToClipboard") {
    // Create a temporary textarea element
    const textarea = document.createElement('textarea');
    textarea.value = request.text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }
});
