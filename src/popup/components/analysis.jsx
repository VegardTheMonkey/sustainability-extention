import React from 'react';
import ImageResizer from './image-resizer';
import PieChart from './pie-chart';

const Analysis = ({ images, onBack }) => {
  // Function to handle image resizing
  const handleImageResize = (image, format) => {
    // Implement the actual resizing logic here
    console.log(`Resizing image ${image.url} to ${image.elementWidth}x${image.elementHeight} in ${format} format`);
    
    // Example implementation:
    const img = new Image();
    img.crossOrigin = 'Anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = image.elementWidth;
      canvas.height = image.elementHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Convert to the selected format
      const mimeType = `image/${format}`;
      const dataUrl = canvas.toDataURL(mimeType);
      
      // Create download link
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `resized-image.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    };
    
    img.onerror = () => {
      console.error('Error loading image for resizing');
      alert('Could not resize image. The image might be from a different domain.');
    };
    
    img.src = image.url;
  };

  return (
    <div className="analysis-container">
      <div className="analysis-header">
        <h3>Images Found: {images.length}</h3>
        <button 
          className="back-button"
          onClick={onBack}
        >
          Back
        </button>
      </div>
      
      {images.length > 0 && <PieChart images={images} />}
      
      <div className="image-list">
        {images.map((image, index) => (
          <div key={index} className="image-item">
            <div className="image-thumbnail">
              <img 
                src={image.url} 
                alt="Thumbnail" 
                style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
              />
            </div>
            <div className="image-details">
              <p>URL: {image.url}</p>
              <p>Size: {image.size} bytes</p>
              <p>Type: {image.type}</p>
              <p>Element Tag: {image.elementTag}</p>
              <p>Dimensions: {image.elementWidth}x{image.elementHeight}</p>
              <ImageResizer image={image} onResize={handleImageResize} />
            </div>
          </div>
        ))}
      </div>
      
      <style jsx>{`
        .analysis-container {
          padding: 10px;
        }
        
        .analysis-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .back-button {
          padding: 6px 12px;
          background-color: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .back-button:hover {
          background-color: #0b7dda;
        }
        
        .image-item {
          display: flex;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
        }
        
        .image-thumbnail {
          margin-right: 15px;
          min-width: 100px;
        }
        
        .image-details {
          flex: 1;
        }
        
        .image-details p {
          margin: 5px 0;
        }
      `}</style>
    </div>
  );
};

export default Analysis;
