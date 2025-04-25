/**
 * Sends a message to the content script to scroll to a specific image on the page
 * @param {Object} image - The image object containing all necessary data
 * @returns {Promise} A promise that resolves when the message is sent
 */
export const scrollToImageElement = (image) => {
  return new Promise((resolve, reject) => {
    try {
      // Create a message with all the image data
      const message = {
        action: 'scrollToImage',
        imageData: {
          url: image.url,
          size: image.size,
          type: image.type,
          elementTag: image.elementTag,
          elementWidth: image.elementWidth,
          elementHeight: image.elementHeight
          // Include any other properties from the image object that might be useful for identification
        }
      };

      // Send the message to the content script
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (tabs && tabs[0] && tabs[0].id) {
          chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
            if (chrome.runtime.lastError) {
              console.error('Error sending message:', chrome.runtime.lastError);
              reject(chrome.runtime.lastError);
            } else {
              console.log('Successfully sent scroll message:', response);
              resolve(response);
            }
          });
        } else {
          const error = new Error('No active tab found to send message to');
          console.error(error);
          reject(error);
        }
      });
    } catch (error) {
      console.error('Error in scrollToImageElement:', error);
      reject(error);
    }
  });
};

export default scrollToImageElement;
