document.addEventListener('DOMContentLoaded', function() {
  // Get all preset size buttons
  const presetButtons = document.querySelectorAll('.preset-sizes button');
  const applyCustomButton = document.getElementById('apply-custom');
  const customWidthInput = document.getElementById('custom-width');
  const customHeightInput = document.getElementById('custom-height');
  
  // Function to resize the window
  function resizeWindow(width, height) {
    // Ensure integers
    width = parseInt(width, 10);
    height = parseInt(height, 10);
    
    if (isNaN(width) || isNaN(height)) {
      console.error('Invalid dimensions:', width, height);
      return;
    }
    
    console.log('Requesting resize to:', width, 'x', height);
    
    // Send message to the background script
    chrome.runtime.sendMessage({
      action: 'resizeWindow',
      width: width,
      height: height
    });
  }
  
  // Add event listeners to preset buttons
  presetButtons.forEach(button => {
    button.addEventListener('click', function() {
      const width = this.getAttribute('data-width');
      const height = this.getAttribute('data-height');
      resizeWindow(width, height);
    });
  });
  
  // Add event listener for custom size button
  applyCustomButton.addEventListener('click', function() {
    const width = customWidthInput.value;
    const height = customHeightInput.value;
    
    // Basic validation
    if (!width || !height || parseInt(width, 10) < 200 || parseInt(height, 10) < 200) {
      alert('Please enter valid dimensions (minimum 200px)');
      return;
    }
    
    resizeWindow(width, height);
  });
  
  // Get current window size and display it
  chrome.windows.getCurrent({}, function(currentWindow) {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
      return;
    }
    
    // Populate custom input fields with current dimensions
    if (currentWindow.width && currentWindow.height) {
      customWidthInput.value = currentWindow.width;
      customHeightInput.value = currentWindow.height;
    }
  });
}); 