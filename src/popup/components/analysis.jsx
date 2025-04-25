import React, { useState } from 'react';
import PieChart from './pie-chart';
import Image from './image';
import { calculateEfficiencyGrade, getFormattedBytesPerPixel } from '../utils/bytePerPixel';

const Analysis = ({ images, onBack }) => {
  // Set chart view as default Chart View
  const [showPieChart, setShowPieChart] = useState(true);
  // State for selected image
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle selecting an image from the pie chart
  const handleImageSelect = (image) => {
    // Send message to content script
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, {
        action: 'imageSelected',
        image: image,
        elementTag: image.elementTag 
      });
    });
    
    setSelectedImage(image);
  };

  const handleBackToAnalysis = () => {
    setSelectedImage(null);
  };

  // If an image is selected, show the single image view
  if (selectedImage) {
    return <Image image={selectedImage} onBack={handleBackToAnalysis} />;
  }

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
      
      <div className="view-toggle-container">
        <div className="view-toggle">
          <button 
            className={showPieChart ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setShowPieChart(true)}
          >
            Chart View
          </button>
          <button 
            className={!showPieChart ? "toggle-btn active" : "toggle-btn"}
            onClick={() => setShowPieChart(false)}
          >
            List View
          </button>
        </div>
      </div>
      
      {/* Conditionally render either the pie chart or the image list */}
      {images.length > 0 && showPieChart && <PieChart images={images} onImageSelect={handleImageSelect} />}
      
      {!showPieChart && (
        <div className="image-list">
          {images
            .slice() // Create a copy of the array to avoid mutating the original
            .sort((a, b) => b.size - a.size) // Sort images by size (largest first)
            .map((image, index) => (
              <div 
                key={index} 
                className="image-item"
                onClick={() => handleImageSelect(image)}
              >
                <div className="image-thumbnail">
                  <img 
                    src={image.url} 
                    alt="Thumbnail" 
                    style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                  />
                </div>
                <div className="image-details">
                  <div className="image-size">
                    {(image.size / 1024).toFixed(2)} KB
                  </div>
                  
                  <div className="image-dimensions">
                    {image.elementWidth || '?'}x{image.elementHeight || '?'}
                  </div>
                  
                  <div className="image-efficiency">
                    <strong>Grade: {calculateEfficiencyGrade(image)}</strong>
                    {getFormattedBytesPerPixel(image) && (
                      <span className="bytes-details">
                        {getFormattedBytesPerPixel(image)} bytes/pixel
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}
      
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
          background-color:rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .back-button:hover {
          background-color: rgb(40, 97, 35);
        }
        
        /* Improved toggle styling */
        .view-toggle-container {
          display: flex;
          justify-content: center;
          margin-bottom: 20px;
        }
        
        .view-toggle {
          display: inline-flex;
          background-color: #f1f1f1;
          border-radius: 4px;
          overflow: hidden;
          border: 1px solid #ddd;
        }
        
        .toggle-btn {
          padding: 8px 15px;
          border: none;
          background: none;
          cursor: pointer;
          font-size: 14px;
          outline: none;
          transition: background-color 0.3s;
        }
        
        .toggle-btn:hover:not(.active) {
          background-color:rgb(235, 252, 227);
        }
        
        .toggle-btn.active {
          background-color: rgb(64, 122, 57);
          color: white;
          font-weight: bold;
        }
        
        .image-item {
          display: flex;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .image-item:hover {
          background-color: #f5f5f5;
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
        
        .image-size {
          font-weight: bold;
          color: #333;
        }
        
        .image-dimensions {
          color: #666;
        }
        
        .image-efficiency {
          display: flex;
          flex-direction: column;
        }
        
        .bytes-details {
          font-size: 0.85em;
          color: #666;
        }
      `}</style>
    </div>
  );
};

export default Analysis;
