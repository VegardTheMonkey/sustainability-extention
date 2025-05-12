import React, { useState } from 'react';

const Controls = () => {
  const [selectedPreset, setSelectedPreset] = useState(null);
  
  // Preset sizes with added icons
  const presetSizes = [
    { id: 'mobile', name: 'Mobile', width: 375, height: 800, icon: '📱' },
    { id: 'tablet', name: 'Tablet', width: 768, height: 1024, icon: '📔' },
    { id: 'desktop', name: 'Desktop', width: 1366, height: 768, icon: '🖥️' },
    { id: 'large-desktop', name: 'Large Desktop', width: 1920, height: 1080, icon: '🖥️' }
  ];
  
  // Function to reset storage data
  const resetStorageData = () => {
    return new Promise((resolve) => {
      chrome.storage.local.set({ imageData: [] }, () => {
        console.log('Cleared previous image data');
        resolve();
      });
    });
  };
  
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
  const handleApplyClick = async () => {
    if (selectedPreset) {
      // Reset storage data before starting analysis
      await resetStorageData();
      
      // Set analysis state to in-progress
      chrome.storage.local.set({ analysisState: 'in-progress' }, () => {
        console.log('Started new analysis');
      });
      
      // Resize window to start analysis
      resizeWindow(selectedPreset.width, selectedPreset.height);
    } else {
      alert('Please select a screen size first');
    }
  };
  
  return (
    <div className="controls">
      <div className="preset-sizes">
        <div className="preset-sizes-header">
          <h3>
            Select device type to render page as:
          </h3>
          <p>See how well the images of a page perfroms on different screen widths.</p>
        </div>
        {presetSizes.map(size => (
          <div className="size-option" key={size.id}>
            <button 
              onClick={() => handlePresetSelect(size)}
              id={size.id}
              className={`device-button ${selectedPreset && selectedPreset.id === size.id ? 'selected' : ''}`}
            >
              <span className="device-icon">{size.icon}</span>
              <span className="device-info">
                {size.name} <span className="device-dimensions">({size.width}x{size.height})</span>
              </span>
            </button>
          </div>
        ))}
      </div>
      
      <div className="apply-section">
        <button 
          id="apply-preset"
          onClick={handleApplyClick}
          className="apply-button"
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

      <style jsx>{`
        .device-button {
          display: flex;
          align-items: center;
          padding: 10px 15px;
          border-radius: 8px;
          border: 1px solid #ccc;
          background-color: white;
          cursor: pointer;
          width: 100%;
          margin-bottom: 8px;
          transition: all 0.2s ease;
        }

        .device-button:hover {
          background-color: #f0f0f0;
          border-color: #aaa;
        }

        .device-button.selected {
          background-color: #e6f7ff;
          border-color: rgb(64, 122, 57);
          box-shadow: 0 0 0 2px rgba(162, 255, 39, 0.2);
        }

        .device-icon {
          font-size: 1.5rem;
          margin-right: 12px;
        }

        .device-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          text-align: left;
        }

        .device-dimensions {
          font-size: 0.8rem;
          color: #666;
        }

        .apply-button {
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 10px 16px;
          cursor: pointer;
          font-weight: 600;
          transition: background-color 0.2s;
        }

        .apply-button:hover {
          background-color: rgb(40, 97, 35);
        }

        .apply-button:disabled {
          background-color: #d9d9d9;
          cursor: not-allowed;
        }

        .size-option {
          margin-bottom: 8px;
        }

        .controls {
          padding: 16px;
        }

        .preset-sizes {
          margin-bottom: 20px;
        }
        
        .preset-sizes-header {
          display: column;
          align-items: center;
          margin-bottom: 20px;
        }

        .preset-sizes-header h3 {
          font-size: 16px;
        }
          
        .preset-sizes-header p {
          font-size: 14px;
        }

        .apply-section {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .selected-info {
          margin-top: 8px;
          font-size: 0.9rem;
          color: #333;
        }
      `}</style>
    </div>
  );
};

export default Controls;
