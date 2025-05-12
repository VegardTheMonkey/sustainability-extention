import React from 'react';
import ImageResizer from './image-resizer';
import InfoBubble from './info-bubble';
import { 
  calculateEfficiencyGrade, 
  getBytesPerPixel, 
  getFormattedBytesPerPixel 
} from '../utils/bytePerPixel';

const Image = ({ image, onBack }) => {
  // Calculate image size in KB
  const sizeInKB = (image.size / 1024).toFixed(2);
  
  // Extract filename from URL
  const fileName = image.url.split('/').pop() || 'Image';
  
  return (
    <div className="single-image-container">
      <div className="image-header">
        <button 
          className="back-button"
          onClick={onBack}
        >
          Back to Analysis
        </button>
      </div>
      
      <div className="image-content">
        <div className="image-preview">
          <img 
            src={image.url} 
            alt={fileName} 
            className="full-image"
          />
        </div>
        
        <div className="image-info">
          <div className="info-section">
            <h4>Image Details</h4>
            <table className="details-table">
              <tbody>
                <tr>
                  <td>File Size:</td>
                  <td><strong>{sizeInKB} KB</strong></td>
                </tr>
                <tr>
                  <td>Efficiency Grade:</td>
                  <td>
                    {calculateEfficiencyGrade(image)}
                    <InfoBubble content="The efficiency grade is calculated based on the image's compression and format relative to its dimensions." />
                    {getBytesPerPixel(image) !== null && (
                      <>
                        <br />
                        <span className="bytes-per-pixel">
                          ({getFormattedBytesPerPixel(image)} bytes/pixel)
                        </span>
                      </>
                    )}
                  </td>
                </tr>
                <tr>
                  <td>Type:</td>
                  <td>{image.type || 'Unknown'}</td>
                </tr>
                <tr>
                  <td>Dimensions:</td>
                  <td>
                    {image.elementWidth || '?'}x{image.elementHeight || '?'}
                    <InfoBubble content="The dimensions of the image element in the HTML. Not the original dimensions of the image file." />
                  </td>
                </tr>
                <tr>
                  <td>Element Tag:</td>
                  <td>{image.elementTag || 'img'}</td>
                </tr>
              </tbody>
            </table>
            
          </div>
          <div className="tip-box">
              <div className="tip-content">
                <h5>Pro Tip: Responsive Images</h5>
                <p>Use the <code>srcset</code> attribute to serve different image sizes based on device screen width, improving loading times, reducing bandwidth usage and is more eco-friendly.</p>
                <a href="https://developer.mozilla.org/en-US/docs/Learn/HTML/Multimedia_and_embedding/Responsive_images" target="_blank" rel="noopener noreferrer">Read more about responsive images</a>
              </div>
            </div>
          <div className="info-section">
            <h4>Optimization</h4>
            <ImageResizer image={image} />
          </div>
        </div>
      </div>
      
      <style jsx>{`
        .single-image-container {
          padding: 15px;
          max-width: 100%;
        }
        
        .image-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 10px;
        }
        
        .back-button {
          padding: 8px 15px;
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          transition: background-color 0.2s;
        }
        
        .back-button:hover {
          background-color: rgb(40, 97, 35);
        }
        
        .image-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .image-preview {
          text-align: center;
          background-color: #f5f5f5;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .full-image {
          max-width: 100%;
          max-height: 300px;
          object-fit: contain;
        }
        
        .image-info {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        
        .info-section {
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #ddd;
        }
        
        .info-section h4 {
          margin-top: 0;
          margin-bottom: 15px;
          padding-bottom: 5px;
          border-bottom: 1px solid #eee;
          color: #333;
        }
        
        .details-table {
          width: 100%;
          border-collapse: collapse;
        }
        
        .details-table td {
          padding: 8px 5px;
          border-bottom: 1px solid #eee;
        }
        
        .details-table td:first-child {
          width: 30%;
          color: #666;
        }
        
        .url-cell {
          max-width: 300px;
          overflow: hidden;
        }
        
        .url-wrapper {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .bytes-per-pixel {
          margin-left: 8px;
          font-size: 0.9em;
          color: #666;
        }

        .bytes-per-pixel {
          margin-left: 8px;
          font-size: 0.9em;
          color: #666;
        }
        
        .tip-box {
          background-color: #f0fff0;
          border-left: 4px solid rgb(64, 122, 57);
          margin-top: 15px;
        }
        
        .tip-content {
          padding: 10px;
        }
        
        .tip-content h5 {
          margin-top: 0;
          margin-bottom: 8px;
          color: rgb(64, 122, 57);
          font-size: 1em;
        }
        
        .tip-content p {
          margin-bottom: 8px;
          font-size: 12px;
        }
        
        .tip-content code {
          background-color: #e8f5e8;
          padding: 2px 4px;
          border-radius: 3px;
          font-family: monospace;
        }
        
        .tip-content a {
          color: rgb(64, 122, 57);
          text-decoration: none;
          font-size: 0.9em;
          display: inline-block;
          margin-top: 5px;
        }
        
        .tip-content a:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
};

export default Image;
