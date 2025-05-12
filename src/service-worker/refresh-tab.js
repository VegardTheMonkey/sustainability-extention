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
          // Force immediate scroll to top with multiple approaches
          window.scrollTo(0, 0); 
          document.documentElement.scrollTop = 0; 
          document.body.scrollTop = 0; 
          
          return window.pageYOffset || document.documentElement.scrollTop;
        }
      })
      .then((results) => {
        const scrollPosition = results[0]?.result || 0;
        console.log('Page scrolled to top, position:', scrollPosition);
        
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
                    // the total height of the page to scroll through
                    const totalHeight = Math.max(
                      document.body.scrollHeight,
                      document.documentElement.scrollHeight
                    );
                    
                    const scrollDuration = 4000; 
                    const scrollStep = Math.max(30, Math.ceil(totalHeight / 200)); 
                    const scrollInterval = scrollDuration / (totalHeight / scrollStep);
                    
                    let currentScroll = 0;
                    let scrollTimer = setInterval(() => {
                      currentScroll += scrollStep;
                      window.scrollTo(0, currentScroll);
                      
                      // Stop when we reach the bottom with extra buffer
                      if (currentScroll >= totalHeight + 200) {
                        clearInterval(scrollTimer);
                        // Final scroll to ensure we hit absolute bottom
                        window.scrollTo(0, document.body.scrollHeight);
                        console.log('Completed scrolling down the page');
                      }
                    }, scrollInterval);
                  }
                })
                .then(() => {
                  console.log('Started page scroll-down process');                
                  setTimeout(() => resolve(tabs[0]), 4000);
                })
                .catch(error => {
                  console.error('Failed to execute scroll-down script:', error);
                  resolve(tabs[0]); 
                });
              }, 1000); 
            }
          });
        }, 400); 
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
