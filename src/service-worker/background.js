import { resizeWindow, getWindowInfo, restoreWindow } from './resize-window.js';
import { refreshActiveTabWithoutCache } from './refresh-tab.js';
import { setupImageListener } from './image-listener.js';
import { stopAnalysis } from './stop-analysis.js';

// Use global variables in the service worker context instead of window
let removeImageListener = null;
let analysisInProgress = false;

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'sustainable-analysis') {
    // Reset the stored image data and set analysis state to 'in-progress'
    chrome.storage.local.set({ 
      imageData: [],
      analysisState: 'in-progress'
    }, () => {
      console.log('Reset stored image data and set analysis state to in-progress');
    });

    // Check if the tab is maximized and what width and height it is
    let originalWindowInfo;
    analysisInProgress = true;

    getWindowInfo()
      .then(windowInfo => {
        originalWindowInfo = windowInfo;
        console.log('Original window state saved:', originalWindowInfo);
        
        const width = parseInt(message.width, 10);
        const height = parseInt(message.height, 10);
        
        console.log('Attempting to resize window to:', width, height);
        return resizeWindow(width, height);
      })
      .then(updatedWindow => {
        console.log('Window resized successfully, now attempting to reload tab');
        return refreshActiveTabWithoutCache();
      })
      .then(tab => {
        console.log('Tab refresh completed for:', tab.url);
        // Setup the image listener after the tab is refreshed
        try {
          removeImageListener = setupImageListener();
          console.log('Image listener has been set up');
        } catch (error) {
          console.error('Failed to set up image listener:', error);
        }
        
        // make the window back to as it was before the resize
        return new Promise(resolve => {
          // Wait a bit to complete the analysis before restoring
          setTimeout(() => {
            analysisInProgress = false;
            restoreWindow(originalWindowInfo)
              .then(restoredWindow => {
                console.log('Window restored to original state:', restoredWindow);
                
                // Mark analysis as completed when window is restored
                chrome.storage.local.set({ analysisState: 'completed' }, () => {
                  console.log('Analysis marked as complete in storage');
                });
                
                resolve();
              })
              .catch(error => {
                console.error('Failed to restore window:', error);
                resolve();
              });
          }, 5000); // Wait 5 seconds before restoring
        });
      })
      .catch(error => {
        analysisInProgress = false;
        // Update storage to reflect the error
        chrome.storage.local.set({ analysisState: 'error' }, () => {
          console.log('Analysis state set to error due to failure');
        });
        console.error('Operation failed:', error);
      });
  }
  return true;
});

// Add a tab change listener to stop analysis when the user switches tabs
chrome.tabs.onActivated.addListener((activeInfo) => {
  // Check if analysis is in progress and stop it if user changes tabs
  if (analysisInProgress || removeImageListener) {
    const analysisInProgressRef = { value: analysisInProgress };
    const result = stopAnalysis(removeImageListener, analysisInProgressRef);
    
    // Update our variables based on the result
    removeImageListener = result.removeImageListenerFn;
    analysisInProgress = analysisInProgressRef.value;
    
    // Update the storage state if analysis was stopped
    if (!analysisInProgressRef.value && analysisInProgress) {
      chrome.storage.local.set({ analysisState: 'stopped' }, () => {
        console.log('Analysis marked as stopped in storage');
      });
    }
  }
});

// Log when the service worker starts up
console.log('Screen Size Changer service worker started'); 