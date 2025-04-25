export const setupImageListener = () => {
    const imageRequestListener = (details) => {
        // Check if this is a completed request
        if (details.type === 'image') {
            // Get content length header, with fallback for when it's missing
            let contentLength = 'unknown';
            const contentLengthHeader = details.responseHeaders?.find(h => h.name.toLowerCase() === 'content-length');
            if (contentLengthHeader && contentLengthHeader.value) {
                contentLength = contentLengthHeader.value;
            }
            
            const imageData = {
                url: details.url,
                size: contentLength,
                type: details.responseHeaders?.find(h => h.name.toLowerCase() === 'content-type')?.value || 'unknown',
            };
            
            // Only log if we actually have a size
            if (contentLength !== 'unknown') {
                // Store the image data directly in storage rather than trying to send to content script immediately
                chrome.storage.local.get(['pendingImages'], (result) => {
                    const pendingImages = result.pendingImages || [];
                    pendingImages.push(imageData);
                    chrome.storage.local.set({ pendingImages }, () => {
                        // Try to notify active tab, but don't worry if it fails
                        chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                            if (tabs[0]) {
                                chrome.tabs.sendMessage(tabs[0].id, {
                                    action: 'checkPendingImages'
                                }, () => {
                                    // Ignore any communication errors
                                    if (chrome.runtime.lastError) {
                                        // Content script not ready, that's okay - it will check storage when it loads
                                    }
                                });
                            }
                        });
                    });
                });
            } else {
                console.log(`Image detected but size unknown: ${details.url}`);
            }
        }
        return { cancel: false };
    };

    // Add the listener
    chrome.webRequest.onHeadersReceived.addListener(
        imageRequestListener,
        { urls: ["<all_urls>"] },
        ["responseHeaders"]
    );

    // Return a function to remove the listener if needed
    return () => {
        chrome.webRequest.onHeadersReceived.removeListener(imageRequestListener);
    };
};