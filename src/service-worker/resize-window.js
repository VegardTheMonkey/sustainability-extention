/**
 * Resizes the current Chrome window to the specified dimensions
 * @param {number} width - The desired width in pixels
 * @param {number} height - The desired height in pixels
 * @returns {Promise} A promise that resolves when the window resize is complete
 */
function resizeWindow(width, height) {
  return new Promise((resolve, reject) => {
    if (isNaN(width) || isNaN(height)) {
      const error = new Error('Invalid dimensions: ' + width + 'x' + height);
      console.error(error.message);
      reject(error);
      return;
    }
    
    console.log('Resizing to:', width, 'x', height);
    
    // Get current window and update
    chrome.windows.getCurrent({}, (window) => {
      // First restore the window if it's maximized or minimized
      if (window.state === 'maximized' || window.state === 'minimized' || window.state === 'fullscreen') {
        chrome.windows.update(window.id, { state: 'normal' }, () => {
          // After restoring to normal state, resize the window
          setTimeout(() => {
            chrome.windows.update(window.id, { 
              width: width, 
              height: height 
            }, (updatedWindow) => {
              console.log('Window update completed:', updatedWindow);
              if (chrome.runtime.lastError) {
                const error = chrome.runtime.lastError;
                console.error('Error:', error);
                reject(error);
              } else {
                resolve(updatedWindow);
              }
            });
          }, 300); // Small delay to ensure the state change completes
        });
      } else {
        // Window is already in normal state, just resize it
        chrome.windows.update(window.id, { 
          width: width, 
          height: height 
        }, (updatedWindow) => {
          console.log('Window update completed:', updatedWindow);
          if (chrome.runtime.lastError) {
            const error = chrome.runtime.lastError;
            console.error('Error:', error);
            reject(error);
          } else {
            resolve(updatedWindow);
          }
        });
      }
    });
  });
}

/**
 * Gets current window information
 * @returns {Promise} A promise that resolves with window info
 */
function getWindowInfo() {
  return new Promise((resolve, reject) => {
    chrome.windows.getCurrent({}, (window) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      const windowInfo = {
        id: window.id,
        state: window.state,
        width: window.width,
        height: window.height,
        left: window.left,
        top: window.top
      };
      
      console.log('Current window info:', windowInfo);
      resolve(windowInfo);
    });
  });
}

/**
 * Restores window to previous state
 * @param {Object} windowInfo - The window info returned by getWindowInfo
 * @returns {Promise} A promise that resolves when the window restore is complete
 */
function restoreWindow(windowInfo) {
  return new Promise((resolve, reject) => {
    if (!windowInfo || !windowInfo.id) {
      reject(new Error('Invalid window info'));
      return;
    }
    
    console.log('Restoring window to:', windowInfo);
    
    // First set position and size, then state
    chrome.windows.update(windowInfo.id, {
      left: windowInfo.left,
      top: windowInfo.top,
      width: windowInfo.width,
      height: windowInfo.height
    }, () => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
        return;
      }
      
      // If the window was maximized/minimized/fullscreen, restore that state
      if (windowInfo.state !== 'normal') {
        setTimeout(() => {
          chrome.windows.update(windowInfo.id, { state: windowInfo.state }, (updatedWindow) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              console.log('Window restored to previous state:', updatedWindow);
              resolve(updatedWindow);
            }
          });
        }, 300); // Small delay to ensure size change completes first
      } else {
        chrome.windows.get(windowInfo.id, (window) => {
          console.log('Window restored to normal state:', window);
          resolve(window);
        });
      }
    });
  });
}

// Export the functions so they can be imported in background.js
export { resizeWindow, getWindowInfo, restoreWindow };
