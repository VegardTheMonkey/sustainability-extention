/**
 * Image efficiency utilities for calculating bytes per pixel and grading images
 */

/**
 * Calculate bytes per pixel for an image
 * @param {Object} image - Image object with size, elementWidth and elementHeight
 * @returns {Number|null} Bytes per pixel or null if dimensions unavailable
 */
export const getBytesPerPixel = (image) => {
  if (!image.elementWidth || !image.elementHeight || !image.size) {
    return null;
  }
  
  const totalPixels = image.elementWidth * image.elementHeight;
  return image.size / totalPixels;
};

/**
 * Get efficiency grade based on bytes per pixel
 * @param {Object} image - Image object with size, elementWidth and elementHeight
 * @returns {String} Efficiency grade (A-F) with description
 */
export const calculateEfficiencyGrade = (image) => {
  // If dimensions aren't available, we can't calculate
  if (!image.elementWidth || !image.elementHeight || !image.size) {
    return 'Unknown';
  }
  
  const bytesPerPixel = getBytesPerPixel(image);
  
  // Grading scale (in bytes per pixel)
  if (bytesPerPixel < 0.3) return 'A (Excellent)';
  if (bytesPerPixel < 0.9) return 'B (Good)';
  if (bytesPerPixel < 1.8) return 'C (Average)';
  if (bytesPerPixel < 4.0) return 'D (Poor)';
  return 'F (Inefficient)';
};

/**
 * Format bytes per pixel with 2 decimal places
 * @param {Object} image - Image object with size, elementWidth and elementHeight
 * @returns {String|null} Formatted bytes per pixel or null if unavailable
 */
export const getFormattedBytesPerPixel = (image) => {
  const bpp = getBytesPerPixel(image);
  return bpp !== null ? bpp.toFixed(2) : null;
};
