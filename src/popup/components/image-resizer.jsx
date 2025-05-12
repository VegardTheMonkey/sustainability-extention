import React, { useState, useEffect, useCallback } from 'react';

const ImageResizer = ({ image, onResize }) => {
  const [showOptions, setShowOptions] = useState(false);
  const [quality, setQuality] = useState(75);
  
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [sizePercentage, setSizePercentage] = useState(100);

  const [originalImageWidth, setOriginalImageWidth] = useState(0);
  const [originalImageHeight, setOriginalImageHeight] = useState(0);
  const [originalAspectRatio, setOriginalAspectRatio] = useState(1);

  const [estimatedSize, setEstimatedSize] = useState(0);
  const [isCompressing, setIsCompressing] = useState(false);
  const [error, setError] = useState('');

  // Always use WebP format
  const format = 'webp';

  useEffect(() => {
    if (image && image.url) {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        setOriginalImageWidth(img.naturalWidth);
        setOriginalImageHeight(img.naturalHeight);
        setOriginalAspectRatio(img.naturalWidth / img.naturalHeight);
        setWidth(img.naturalWidth);
        setHeight(img.naturalHeight);
        setSizePercentage(100);
        setEstimatedSize(0);
        setError('');
      };
      img.onerror = () => {
        console.error('Error loading original image for dimensions');
        setError('Could not load the image to get its dimensions. It might be a cross-origin issue or the URL is invalid.');
        setOriginalImageWidth(0);
        setOriginalImageHeight(0);
        if (image.elementWidth && image.elementHeight) {
            setOriginalImageWidth(image.elementWidth);
            setOriginalImageHeight(image.elementHeight);
            setOriginalAspectRatio(image.elementWidth / image.elementHeight);
            setWidth(image.elementWidth);
            setHeight(image.elementHeight);
        }
      };
      img.src = image.url;
    }
  }, [image]);

  useEffect(() => {
    if (originalImageWidth > 0 && originalImageHeight > 0) {
      const newWidth = Math.round((originalImageWidth * sizePercentage) / 100);
      const newHeight = Math.round(newWidth / originalAspectRatio);
      setWidth(newWidth);
      setHeight(newHeight);
    }
  }, [sizePercentage, originalImageWidth, originalImageHeight, originalAspectRatio]);

  const [qualityWarning, setQualityWarning] = useState('');
  
  useEffect(() => {
    if (quality > 90) {
      setQualityWarning('High quality may produce larger files than needed. Consider 70-85% for most images.');
    } else if (quality < 45) {
      setQualityWarning('Very low quality may result in visible imperfections.');
    } else {
      setQualityWarning('');
    }
  }, [quality]);

  const handleResizeAndDownload = async () => {
    if (!image || !image.url || width <= 0 || height <= 0) {
      alert('Image data is not available or dimensions are zero.');
      return;
    }
    setIsCompressing(true);
    setError('');

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      
      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Failed to load image for compression'));
        img.src = image.url;
      });

      const loadedImg = await imageLoadPromise;
      
      console.log('Original image loaded:', {
        naturalWidth: loadedImg.naturalWidth,
        naturalHeight: loadedImg.naturalHeight,
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      
      ctx.drawImage(loadedImg, 0, 0, width, height);
      
      const adjustedQuality = Math.min(quality, 95) / 100;
      
      // Use WebP format directly
      let dataUrl;
      try {
        dataUrl = canvas.toDataURL(`image/${format}`, adjustedQuality);
        
        if (dataUrl.length < 100) {
          throw new Error('Generated image data is invalid or empty');
        }
      } catch (e) {
        console.warn(`WebP compression failed:`, e);
        // Fall back to JPEG as a last resort
        dataUrl = canvas.toDataURL('image/jpeg', adjustedQuality);
        setError('WebP compression failed. Using JPEG as fallback.');
      }
      
      try {
        const byteString = atob(dataUrl.split(',')[1]);
        const mimeTypeFromDataUrl = dataUrl.split(',')[0].split(':')[1].split(';')[0];
        
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const blob = new Blob([ab], {type: mimeTypeFromDataUrl});
        
        console.log('Compression successful:', {
          targetWidth: width,
          targetHeight: height, 
          quality: adjustedQuality,
          format: mimeTypeFromDataUrl.split('/')[1],
          dataUrlLength: dataUrl.length,
          blobSize: formatBytes(blob.size)
        });
        
        setEstimatedSize(blob.size);
        
        // Get actual format from the mime type
        const actualFormat = mimeTypeFromDataUrl.split('/')[1];
        
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `resized-${Date.now()}.${actualFormat}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);

        if (onResize) {
          onResize({
            format: actualFormat,
            quality: adjustedQuality * 100,
            width: width,
            height: height,
            compressedSize: blob.size,
          });
        }
      } catch (blobError) {
        console.error('Error creating blob from data URL:', blobError);
        setError(`Failed to create downloadable image: ${blobError.message}`);
      }
    } catch (err) {
      console.error('Error during image processing:', err);
      setError(`Image processing failed: ${err.message}`);
      
      if (err.message && (err.message.toLowerCase().includes('cors') || 
          err.message.toLowerCase().includes('tainted canvas'))) {
        setError('Compression failed due to cross-origin restrictions. The image cannot be processed as it is hosted on a different domain that does not allow access.');
      }
    } finally {
      setIsCompressing(false);
    }
  };

  const estimateSizeAndUpdate = useCallback(async () => {
    if (!image || !image.url || width <= 0 || height <= 0) {
      setEstimatedSize(0);
      return;
    }
    setError('');

    try {
      const img = new Image();
      img.crossOrigin = 'Anonymous';

      const imageLoadPromise = new Promise((resolve, reject) => {
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(new Error('Failed to load image for estimation'));
        img.src = image.url;
      });

      const loadedImg = await imageLoadPromise;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(loadedImg, 0, 0, width, height);

      const adjustedQuality = Math.min(quality, 95) / 100;
      
      // Always use WebP for estimation
      const dataUrl = canvas.toDataURL(`image/${format}`, adjustedQuality);
      
      const base64Data = dataUrl.split(',')[1];
      const approximateByteSize = Math.ceil((base64Data.length * 3) / 4);
      
      console.log('Estimation completed:', {
        format, 
        quality: adjustedQuality, 
        width, 
        height,
        estimatedSize: formatBytes(approximateByteSize)
      });
      
      setEstimatedSize(approximateByteSize);
    } catch (err) {
      console.error('Error estimating size:', err);
      setError(`Error estimating size: ${err.message}`);
      setEstimatedSize(0);
    }
  }, [image, width, height, quality]);

  useEffect(() => {
    if (showOptions && originalImageWidth > 0 && width > 0 && height > 0) {
      const timer = setTimeout(() => {
        estimateSizeAndUpdate();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [showOptions, estimateSizeAndUpdate, originalImageWidth, width, height]);

  const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  return (
    <div className="image-resizer">
      <button 
        className="resize-button"
        onClick={() => setShowOptions(!showOptions)}
        disabled={!image || !image.url || !originalImageWidth}
      >
        {showOptions ? 'Hide Options' : 'Resize & Compress Image'}
      </button>
      
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {showOptions && originalImageWidth > 0 && (
        <div className="resize-options">
          {/* Format selector removed - always using WebP */}
          
          <div className="quality-selector">
            <label htmlFor="quality-slider">Quality: {quality}%</label>
            <input 
              id="quality-slider"
              type="range" 
              min="10" 
              max="95" 
              value={quality} 
              onChange={(e) => setQuality(parseInt(e.target.value))}
              className="slider"
            />
            {qualityWarning && <p className="quality-warning">{qualityWarning}</p>}
          </div>
          
          <div className="size-selector">
            <label htmlFor="size-percentage-slider">Size: {sizePercentage}% (of original)</label>
            <input 
              id="size-percentage-slider"
              type="range" 
              min="10"
              max="100"
              value={sizePercentage} 
              onChange={(e) => setSizePercentage(parseInt(e.target.value))}
              className="slider"
            />
          </div>
          
          <div className="size-info">
            <p>Original: {originalImageWidth}x{originalImageHeight}</p>
            <p>New target: {width}x{height}</p>
            <p>Estimated size: {estimatedSize > 0 ? formatBytes(estimatedSize) : 'Estimating...'}</p>
            <p>Format: WebP (efficient web format)</p>
          </div>
          
          <button 
            className="apply-resize"
            onClick={handleResizeAndDownload}
            disabled={isCompressing || width === 0 || height === 0}
          >
            {isCompressing ? 'Compressing...' : 'Download Resized Image'}
          </button>
        </div>
      )}
      {showOptions && !originalImageWidth && !error && <p>Loading image details...</p>}
      
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

        .resize-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .resize-options {
          margin-top: 10px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background-color: #f9f9f9;
        }
        
        .quality-selector, .size-selector {
          margin-bottom: 15px;
          display: flex;
          flex-direction: column;
        }
        
        .quality-selector label, .size-selector label {
          margin-bottom: 5px;
        }
        
        /* Basic slider styling */
        .slider {
          width: 100%;
          height: 15px;
          -webkit-appearance: none;
          appearance: none;
          background: #e0e0e0;
          outline: none;
          border-radius: 10px;
          overflow: hidden;
        }
        
        /* Chrome/Safari styling for the slider thumb */
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(64, 122, 57);
          cursor: pointer;
          border: none;
          box-shadow: -210px 0 0 200px rgb(64, 122, 57);
        }
        
        /* Firefox styling for the slider */
        .slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: rgb(64, 122, 57);
          cursor: pointer;
          border: none;
        }
        
        .slider::-moz-range-progress {
          background-color: rgb(64, 122, 57);
          height: 15px;
          border-radius: 10px;
        }
        
        /* Button styling */
        .apply-resize {
          padding: 6px 12px;
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          margin-top: 10px;
          width: 100%;
        }
        
        .apply-resize:hover {
          background-color: rgb(40, 97, 35);
        }

        .apply-resize:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .size-info {
          margin: 10px 0;
          font-size: 14px;
        }
        .size-info p {
          margin: 4px 0;
        }

        .quality-warning {
          font-size: 12px;
          color: #d97706;
          margin-top: 4px;
        }
      `}</style>
    </div>
  );
};

export default ImageResizer;
