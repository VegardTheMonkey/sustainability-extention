// Import the findElementByImageUrl function
import { findElementByImageUrl } from './findElement.js';

// Create arrays to store image data
let receivedImages = [];
let processedImages = [];
let isProcessing = false;

// Process all received images in batch
const processImages = () => {
  if (isProcessing || receivedImages.length === 0) return;
  
  isProcessing = true;
  console.log(`Processing batch of ${receivedImages.length} images`);
  
  // First, get existing images to check for duplicates
  chrome.storage.local.get(['imageData'], (result) => {
    const existingImages = result.imageData || [];
    const existingUrls = new Set(existingImages.map(img => img.url));
    
    // Process all received images
    receivedImages.forEach(imageData => {
      const { url, size, type } = imageData;
      
      // Skip images that are already stored
      if (existingUrls.has(url)) {
        console.log(`Skipping duplicate image: ${url}`);
        return;
      }
      
      // Skip images smaller than 1000 bytes
      if (size < 1000) {
        console.log(`Skipping small image (${size} bytes): ${url}`);
        return;
      }
      
      // Find the element associated with this image URL
      const imageElement = findElementByImageUrl(url);
      
      // Add the processed image data with element info
      processedImages.push({
        url,
        size,
        type,
        elementTag: imageElement ? imageElement.tagName : null,
        elementWidth: imageElement ? imageElement.offsetWidth : null,
        elementHeight: imageElement ? imageElement.offsetHeight : null
      });
    });
    
    // Clear the received images array after processing
    receivedImages = [];
    
    // Only store images if we have any that passed the filters
    if (processedImages.length > 0) {
      const updatedImages = [...existingImages, ...processedImages];
      
      chrome.storage.local.set({ 
        imageData: updatedImages
      }, () => {
        console.log(`Successfully stored batch of ${processedImages.length} processed images`);
        processedImages = [];
        isProcessing = false;
      });
    } else {
      console.log('No new images to store in this batch');
      isProcessing = false;
    }
  });
};

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check if the message is about logging image data
  if (message.action === 'logImageData' && message.imageData) {
    // Add the image data to our array
    receivedImages.push(message.imageData);
    
    // Send a response back to confirm receipt
    sendResponse({ received: true });
    
    // Schedule processing if not already in progress
    if (!isProcessing) {
      setTimeout(processImages, 500); // Process batch after a short delay
    }
  }
  
  // Check if this is a stop analysis message
  if (message.action === 'stopAnalysis') {
    console.log('Received stop analysis signal');
    
    // Process any remaining images before stopping
    if (receivedImages.length > 0) {
      processImages();
    }
    
    // Update the analysis state to completed
    chrome.storage.local.set({ analysisState: 'completed' }, () => {
      console.log('Analysis marked as complete in storage');
      sendResponse({ stopped: true });
    });
  }
  
  // Return true to indicate you want to send a response asynchronously
  return true;
});

// Log that the content script has been initialized
console.log('Image listener content script initialized');
