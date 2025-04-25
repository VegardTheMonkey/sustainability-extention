import React, { useState } from 'react';

const ImageResizer = ({ image, onResize }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [selectedFormat, setSelectedFormat] = useState('jpeg');
  
 
  const formats = ['jpeg', 'png', 'webp', 'avif'];
  
  const handleResize = () => {
    // Implementation of image resizing logic
    console.log(`Resizing image ${image.url} to ${image.elementWidth}x${image.elementHeight} in ${selectedFormat} format`);
    
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.elementWidth;
      canvas.height = image.elementHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to the selected format
      const mimeType = `image/${selectedFormat}`;
      const dataUrl = canvas.toDataURL(mimeType);
      
      // Create download link
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `resized-image.${selectedFormat}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.onerror = () => {
      console.error('Error loading image for resizing');
      alert('Could not resize image. The image might be from a different domain.');
    };
    
    img.src = image.url;
    
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
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .resize-button:hover {
          background-color: rgb(40, 97, 35);
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
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
        }
        
        .apply-resize:hover {
          background-color: rgb(40, 97, 35);
        }
      `}</style>
    </div>
  );
};

export default ImageResizer;
