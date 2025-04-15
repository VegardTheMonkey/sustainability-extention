import React, { useState } from 'react';

const ImageResizer = ({ image, onResize }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  
  // Common image formats to offer
  const formats = ['jpeg', 'png', 'webp', 'avif'];
  
  const handleResize = () => {
    // Call the resize function passed from parent with selected parameters
    onResize(image, selectedFormat);
    setShowOptions(false);
  };
  
  return (
    <div className="image-resizer">
      <button 
        className="resize-button"
        onClick={() => setShowOptions(!showOptions)}
      >
        Resize Image
      </button>
      
      {showOptions && (
        <div className="resize-options">
          <div className="format-selector">
            <label>Format:</label>
            <select 
              value={selectedFormat} 
              onChange={(e) => setSelectedFormat(e.target.value)}
            >
              {formats.map(format => (
                <option key={format} value={format}>{format.toUpperCase()}</option>
              ))}
            </select>
          </div>
          <div className="size-info">
            <p>Resize to rendered size: {image.elementWidth}x{image.elementHeight}</p>
          </div>
          <button 
            className="apply-resize"
            onClick={handleResize}
          >
            Apply Resize
          </button>
        </div>
      )}
      
      <style jsx>{`
        .image-resizer {
          margin-top: 10px;
        }
        
        .resize-button {
          padding: 6px 12px;
          background-color: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .resize-button:hover {
          background-color: #45a049;
        }
        
        .resize-options {
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .format-selector {
          margin-bottom: 10px;
          display: flex;
          align-items: center;
        }
        
        .format-selector label {
          margin-right: 10px;
        }
        
        .apply-resize {
          padding: 6px 12px;
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .apply-resize:hover {
          background-color: #0b7dda;
        }
      `}</style>
    </div>
  );
};

export default ImageResizer;
