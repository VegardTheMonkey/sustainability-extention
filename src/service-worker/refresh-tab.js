/**
 * Scrolls to the top of the active tab, refreshes it without using cache,
 * waits 1 second, then scrolls down the entire page over 4 seconds
 * @returns {Promise} Promise that resolves when the entire process is complete
 */
export function refreshActiveTabWithoutCache() {
  return new Promise((resolve, reject) => {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      if (!tabs[0]) {
        const error = new Error('No active tab found');
        console.error(error.message);
        return reject(error);
      }
      
      const tabId = tabs[0].id;
      console.log('Found active tab with ID:', tabId);
      
      // First scroll to top
      chrome.scripting.executeScript({
        target: {tabId: tabId},
        func: () => {
          // Force immediate scroll to top
          window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'auto' // 'auto' is more immediate than 'smooth'
          });
        }
      })
      .then(() => {
        console.log('Page scrolled to top, now refreshing');
        
        // Add small delay to ensure scroll completes
        setTimeout(() => {
          // Then reload the tab without cache
          chrome.tabs.reload(tabId, {bypassCache: true}, () => {
            if (chrome.runtime.lastError) {
              console.error('Error reloading tab:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              console.log('Tab refreshed successfully');
              
              // Wait 1 second after refresh, then scroll down the page over 4 seconds
              setTimeout(() => {
                chrome.scripting.executeScript({
                  target: {tabId: tabId},
                  func: () => {
                    // Get the total height of the page to scroll through
                    const totalHeight = Math.max(
                      document.body.scrollHeight,
                      document.documentElement.scrollHeight
                    );
                    
                    const scrollDuration = 4000; // 4 seconds
                    const scrollStep = 20; // Update scroll position every 20ms
                    const scrollInterval = scrollDuration / (totalHeight / scrollStep);
                    
                    let currentScroll = 0;
                    let scrollTimer = setInterval(() => {
                      currentScroll += scrollStep;
                      window.scrollTo(0, currentScroll);
                      
                      // Stop when we reach the bottom
                      if (currentScroll >= totalHeight) {
                        clearInterval(scrollTimer);
                        console.log('Completed scrolling down the page');
                      }
                    }, scrollInterval);
                  }
                })
                .then(() => {
                  console.log('Started page scroll-down process');
                  // Resolve after roughly the time it takes to complete the scroll
                  setTimeout(() => resolve(tabs[0]), 4000);
                })
                .catch(error => {
                  console.error('Failed to execute scroll-down script:', error);
                  resolve(tabs[0]); // Still resolve even if the scroll fails
                });
              }, 1000); // 1 second delay after refresh before scrolling down
            }
          });
        }, 50); // Small delay to ensure scroll takes effect
      })
      .catch(error => {
        console.error('Failed to scroll to top:', error);
        // If scroll fails, still try to refresh
        chrome.tabs.reload(tabId, {bypassCache: true}, () => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(tabs[0]);
          }
        });
      });
    });
  });
}
