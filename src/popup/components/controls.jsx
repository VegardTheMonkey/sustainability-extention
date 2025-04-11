import React, { useState } from 'react';

const Controls = () => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Preset sizes
  const presetSizes = [
    { id: 'mobile', name: 'Mobile', width: 375, height: 667 },
    { id: 'tablet', name: 'Tablet', width: 768, height: 1024 },
    { id: 'desktop', name: 'Desktop', width: 1366, height: 768 },
    { id: 'large-desktop', name: 'Large Desktop', width: 1920, height: 1080 }
  ];
  
  // Function to resize the window
  const resizeWindow = (width, height) => {
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
      action: 'sustainable-analysis',
      width: width,
      height: height
    });
  };
  
  // Handle preset selection
  const handlePresetSelect = (preset) => {
    setSelectedPreset(preset);
  };
  
  // Handle apply button click
  const handleApplyClick = () => {
    if (selectedPreset) {
      resizeWindow(selectedPreset.width, selectedPreset.height);
    } else {
      alert('Please select a screen size first');
    }
  };
  
  return (
    <div className="controls">
      <div className="preset-sizes">
        <h3>Select Screen Size:</h3>
        {presetSizes.map(size => (
          <div className="size-option" key={size.id}>
            <button 
              onClick={() => handlePresetSelect(size)}
              id={size.id}
              className={selectedPreset && selectedPreset.id === size.id ? 'selected' : ''}
            >
              {size.name} ({size.width}x{size.height})
            </button>
          </div>
        ))}
      </div>
      
      <div className="apply-section">
        <button 
          id="apply-preset"
          onClick={handleApplyClick}
          disabled={!selectedPreset}
        >
          Apply Selected Size
        </button>
        {selectedPreset && (
          <p className="selected-info">
            Selected: {selectedPreset.name} ({selectedPreset.width}x{selectedPreset.height})
          </p>
        )}
      </div>
    </div>
  );
};

export default Controls;
