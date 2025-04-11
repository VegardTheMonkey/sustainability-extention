export const stopAnalysis = (removeImageListenerFn, analysisInProgressRef) => {
  // Send a message to the active tab to stop the analysis
  chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
    if (tabs[0]) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'stopAnalysis'
      }, (response) => {
        // Handle any errors in message sending
        if (chrome.runtime.lastError) {
          console.log('Error sending stop analysis signal:', chrome.runtime.lastError);
        } else if (response) {
          console.log('Stop analysis signal sent successfully');
        }
      });
    }
  });
  
  // Remove any active image listeners
  if (typeof removeImageListenerFn === 'function') {
    removeImageListenerFn();
    console.log('Image listener removed');
  }
  
  // Set analysis in progress to false if it's a reference to a variable
  if (analysisInProgressRef && typeof analysisInProgressRef === 'object') {
    analysisInProgressRef.value = false;
  }
  
  console.log('Analysis stopped due to tab change');
  
  return { removeImageListenerFn: null };
};
