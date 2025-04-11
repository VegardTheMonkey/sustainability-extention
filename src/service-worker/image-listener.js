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
                // Send image data to content script for logging
                chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
                    if (tabs[0]) {
                        chrome.tabs.sendMessage(tabs[0].id, {
                            action: 'logImageData',
                            imageData: imageData
                        }, (response) => {
                            // Add error handling for message sending
                            if (chrome.runtime.lastError) {
                                console.log('Error sending image data to content script:', chrome.runtime.lastError);
                            } else if (response) {
                                console.log('Image data sent to content script successfully');
                            }
                        });
                    }
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