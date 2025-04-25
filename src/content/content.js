import { findElementByImageUrl } from './findElement.js';
import { handleImageSelection } from './selectImage.js';

// Create arrays to store image data
let receivedImages = [];
let processedImages = [];
let isProcessing = false;

// Process all received images in batch
const processImages = () => {
  if (isProcessing || receivedImages.length === 0) return;
  
  isProcessing = true;
  console.log(`Processing batch of ${receivedImages.length} images`);
  
  // get existing images to check for duplicates
  chrome.storage.local.get(['imageData'], (result) => {
    const existingImages = result.imageData || [];
    const existingUrls = new Set(existingImages.map(img => img.url));
    
    const processedUrls = new Set(processedImages.map(img => img.url));
    
    // Process all received images
    receivedImages.forEach(imageData => {
      const { url, size, type } = imageData;
      
      if (existingUrls.has(url) || processedUrls.has(url)) {
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
      
      // Add this URL to our set of processed URLs to prevent duplicates within the batch
      processedUrls.add(url);
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

// Function to check for pending images in storage
const checkPendingImages = () => {
  chrome.storage.local.get(['pendingImages'], (result) => {
    if (result.pendingImages && result.pendingImages.length > 0) {
      console.log(`Found ${result.pendingImages.length} pending images to process`);
      // Add pending images to our processing queue
      receivedImages.push(...result.pendingImages);
      
      // Clear the pending images from storage
      chrome.storage.local.set({ pendingImages: [] }, () => {
        // Schedule processing
        if (!isProcessing) {
          setTimeout(processImages, 500);
        }
      });
    }
  });
};

// Check for pending images when content script initializes
checkPendingImages();

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
  
  // Check if we need to look for pending images
  if (message.action === 'checkPendingImages') {
    checkPendingImages();
    sendResponse({ checking: true });
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

// Add a separate listener for image selection
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'imageSelected') {
    handleImageSelection(message.image);
  }
});

// Log that the content script has been initialized
console.log('Image listener content script initialized');
