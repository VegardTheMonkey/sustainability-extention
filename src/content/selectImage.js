/**
 * Handles the selection of an image and scrolls to it in the page
 * @param {Object} image - The image object with url and other properties
 */
export function handleImageSelection(image) {
  console.log('Image selected:', image);
  
  const selectedImageUrl = image.url;
  let foundElement = false;
  
  // try to find img elements with this source
  document.querySelectorAll('img').forEach(img => {
    if (img.src === selectedImageUrl || 
        (img.srcset && img.srcset.includes(selectedImageUrl)) || 
        img.currentSrc === selectedImageUrl) {
      highlightElement(img);
      foundElement = true;
    }
  });
  
  // If not found as an img tag, check for background images
  if (!foundElement) {
    document.querySelectorAll('*').forEach(element => {
      const bgImage = window.getComputedStyle(element).backgroundImage;
      if (bgImage && bgImage !== 'none') {
        const match = bgImage.match(/url\(['"]?([^'"]+)['"]?\)/);
        if (match && (match[1] === selectedImageUrl || match[1].includes(selectedImageUrl))) {
          highlightElement(element);
          foundElement = true;
        }
      }
    });
  }
  
  if (!foundElement) {
    console.log('Could not find the selected image in the DOM');
  }
}

/**
 * Highlights an element by adding a traveling vertical line across it
 * @param {HTMLElement} element - The element to highlight
 */
function highlightElement(element) {
  // Get element dimensions and position
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  const highlightEl = document.createElement('div');
  
  // unique ID for the animation
  const uniqueId = 'highlight-' + Math.random().toString(36).substr(2, 9);
  
  // Style the highlight element
  highlightEl.style.position = 'absolute';
  highlightEl.style.top = `${rect.top + scrollTop}px`;
  highlightEl.style.left = `${rect.left + scrollLeft}px`;
  highlightEl.style.width = '0px'; 
  highlightEl.style.height = `${rect.height}px`;
  highlightEl.style.backgroundColor = 'transparent';
  highlightEl.style.boxShadow = '0 0 2px 4px rgba(255, 0, 0, 0.46)'; 
  highlightEl.style.zIndex = '2147483647'; 
  highlightEl.style.pointerEvents = 'none'; 
  
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    @keyframes ${uniqueId}-scan {
      0% { transform: translateX(0); }
      100% { transform: translateX(${rect.width}px); }
    }
    
    .${uniqueId} {
      animation: ${uniqueId}-scan 1.5s ease-in forwards; 
    }
  `;
  
  document.head.appendChild(styleEl);
  
  highlightEl.classList.add(uniqueId);
  
  document.body.appendChild(highlightEl);
  
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
  
  // Clean up
  setTimeout(() => {
    highlightEl.remove();
    styleEl.remove();
  }, 2000); 
}
