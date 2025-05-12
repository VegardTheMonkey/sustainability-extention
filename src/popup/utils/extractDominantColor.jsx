/**
 * Extracts the dominant color from an image URL
 * Uses advanced techniques to find the most representative non-white color
 * 
 * @param {string} imageUrl - URL of the image to analyze
 * @returns {Promise<string>} - Promise that resolves to an RGB color string
 */
export const extractDominantColor = async (imageUrl) => {
  return new Promise((resolve) => {
    // Create a new image object
    const img = new Image();
    img.crossOrigin = 'Anonymous'; // Handle CORS issues
    
    img.onload = () => {
      // Create a canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas dimensions to image dimensions (with a max for performance)
      const maxDimension = 150; 
      const scaleFactor = Math.min(1, maxDimension / Math.max(img.width, img.height));
      canvas.width = img.width * scaleFactor;
      canvas.height = img.height * scaleFactor;
      
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      
      // Get image data
      let data;
      try {
        data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      } catch (e) {
        console.error('Failed to get image data, CORS issue:', e);
        // Fall back to a random color
        resolve(generateRandomColor());
        return;
      }
      
      // Count color occurrences with improvements
      const colorBuckets = {}; // Use color buckets instead of exact colors
      const sampleRate = 4; // Sample more pixels
      const bucketSize = 16; // Color precision
      
      for (let i = 0; i < data.length; i += 4 * sampleRate) {
        // Skip transparent or nearly transparent pixels
        if (data[i + 3] < 128) continue;
        
        // Get rgb values
        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];
        
        // Skip very light/white pixels
        const brightness = (r + g + b) / 3;
        if (brightness > 245) continue;
        
        // Skip very dark/black pixels
        if (brightness < 10) continue;
        
        // Bucket the colors to reduce unique count
        r = Math.floor(r / bucketSize) * bucketSize;
        g = Math.floor(g / bucketSize) * bucketSize;
        b = Math.floor(b / bucketSize) * bucketSize;
        
        const bucketKey = `${r},${g},${b}`;
        
        if (colorBuckets[bucketKey]) {
          colorBuckets[bucketKey].count++;
          colorBuckets[bucketKey].r += data[i];
          colorBuckets[bucketKey].g += data[i + 1];
          colorBuckets[bucketKey].b += data[i + 2];
        } else {
          colorBuckets[bucketKey] = {
            count: 1,
            r: data[i],
            g: data[i + 1],
            b: data[i + 2]
          };
        }
      }
      
      // Convert buckets to weighted vibrant colors
      const weightedColors = [];
      for (const key in colorBuckets) {
        const bucket = colorBuckets[key];
        
        // Get average color within the bucket
        const avgR = Math.round(bucket.r / bucket.count);
        const avgG = Math.round(bucket.g / bucket.count);
        const avgB = Math.round(bucket.b / bucket.count);
        
        // Calculate color saturation
        const max = Math.max(avgR, avgG, avgB);
        const min = Math.min(avgR, avgG, avgB);
        const saturation = (max === 0) ? 0 : (max - min) / max;
        
        // Weight the color based on count and saturation
        // Prefer saturated colors (non-gray) with higher frequency
        const weight = bucket.count * (1 + saturation * 2);
        
        weightedColors.push({
          color: `rgb(${avgR}, ${avgG}, ${avgB})`,
          weight,
          saturation
        });
      }
      
      // Sort by weight
      weightedColors.sort((a, b) => b.weight - a.weight);
      
      // Default color if no good candidates found
      let dominantColor = 'rgb(80, 80, 80)';
      
      // Find the most prominent non-grayscale color
      if (weightedColors.length > 0) {
        // First try to find a sufficiently saturated color among the top candidates
        const topCandidates = weightedColors.slice(0, Math.min(5, weightedColors.length));
        const colorfulCandidate = topCandidates.find(c => c.saturation > 0.15);
        
        if (colorfulCandidate) {
          dominantColor = colorfulCandidate.color;
        } else {
          // Fall back to most frequent color
          dominantColor = weightedColors[0].color;
        }
      }
      
      resolve(dominantColor);
    };
    
    img.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      // Fall back to a random color
      resolve(generateRandomColor());
    };
    
    // Start loading the image
    img.src = imageUrl;
  });
};

/**
 * Generates a random RGB color
 * Used as a fallback when dominant color extraction fails
 * 
 * @returns {string} - RGB color string
 */
export const generateRandomColor = () => {
  const r = Math.floor(Math.random() * 200);
  const g = Math.floor(Math.random() * 200);
  const b = Math.floor(Math.random() * 200);
  return `rgb(${r}, ${g}, ${b})`;
};

export default extractDominantColor;
