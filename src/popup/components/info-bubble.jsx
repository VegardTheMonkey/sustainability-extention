import React, { useState, useRef, useEffect } from 'react';

const InfoBubble = ({ content }) => {
  const [isHovering, setIsHovering] = useState(false);
  const iconRef = useRef(null);
  const bubbleRef = useRef(null);

  // Base styles that don't change with position
  const staticBubbleStyles = {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #ccc',
    borderRadius: '4px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.15)',
    zIndex: 1000,
    minWidth: '150px', 
  };

  const [dynamicBubbleStyles, setDynamicBubbleStyles] = useState({
    position: 'absolute',
    visibility: 'hidden', 
  });

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  useEffect(() => {
    if (isHovering && iconRef.current && bubbleRef.current) {
      const iconNode = iconRef.current;
      const bubbleNode = bubbleRef.current;
      const containerNode = iconNode.parentElement; 

      const viewportWidth = document.documentElement.clientWidth;
      const viewportHeight = document.documentElement.clientHeight;

      // Temporarily make bubble visible with opacity 0 to measure its actual size with content
      // This is a common technique to get dimensions before final positioning.
      bubbleNode.style.visibility = 'hidden';
      bubbleNode.style.position = 'absolute'; 
      bubbleNode.style.opacity = '0'; 
      // Apply static styles that affect size
      Object.assign(bubbleNode.style, staticBubbleStyles);


      const bubbleInitialWidth = bubbleNode.offsetWidth;
      const bubbleInitialHeight = bubbleNode.offsetHeight;

      let newStyles = {
        position: 'absolute',
        visibility: 'visible',
        opacity: '1',
        top: '0px', 
        left: `${iconNode.offsetWidth + 10}px`, 
        right: 'auto',
        maxWidth: `${viewportWidth - 20}px`, 
      };

      // Get container's position relative to the viewport
      const containerRect = containerNode.getBoundingClientRect();
      const iconRect = iconNode.getBoundingClientRect(); // Icon's position in viewport

      // Calculate available space and decide bubble's final position and maxWidth
      

      const spaceToRightStart = iconRect.right + 10; // Where bubble would start if right of icon
      if (spaceToRightStart + bubbleInitialWidth > viewportWidth - 5) { 
        // Try to position to the left of the icon
        const spaceToLeftStart = iconRect.left - 10 - bubbleInitialWidth;
        if (spaceToLeftStart < 5) { // Also overflows left or not enough space
          // Fallback: Position it relative to container, constrained by viewport
          newStyles.left = `${-(containerRect.left - 5)}px`;
          newStyles.maxWidth = `${viewportWidth - 10}px`;
        } else {
          // Position to the left of icon
          newStyles.left = 'auto';
          newStyles.right = `${containerNode.offsetWidth - iconNode.offsetLeft + 10}px`;
        }
      } else {
        // Stays on the right
        newStyles.left = `${iconNode.offsetLeft + iconNode.offsetWidth + 10}px`;
      }
      
      // Adjust maxWidth based on final horizontal position
      if (newStyles.left !== 'auto') {
        const finalLeftEdgeInViewport = containerRect.left + parseFloat(newStyles.left);
        newStyles.maxWidth = `${viewportWidth - finalLeftEdgeInViewport - 5}px`;
      } else if (newStyles.right !== 'auto') {
        // Bubble's right edge is (containerRect.right - parseFloat(newStyles.right))
        // Bubble's left edge is (containerRect.right - parseFloat(newStyles.right) - bubbleInitialWidth)
        const finalLeftEdgeInViewport = containerRect.right - parseFloat(newStyles.right) - bubbleInitialWidth;
        newStyles.maxWidth = `${(containerRect.right - parseFloat(newStyles.right)) - finalLeftEdgeInViewport - 5}px`;

      }


      // Vertical positioning:
      let proposedTop = 0; // Relative to container, aligns bubble top with icon top
      if (containerRect.top + bubbleInitialHeight > viewportHeight - 5) { 
        proposedTop = containerNode.offsetHeight - bubbleInitialHeight - 5; 
        if (containerRect.top + proposedTop < 5) { 
          proposedTop = -(containerRect.top - 5); 
          newStyles.maxHeight = `${viewportHeight - 10}px`;
          newStyles.overflowY = 'auto';
        }
      }
      newStyles.top = `${proposedTop}px`;
      
      // Ensure minWidth is respected if possible
      if (parseFloat(newStyles.maxWidth) < parseFloat(staticBubbleStyles.minWidth)) {
          newStyles.maxWidth = staticBubbleStyles.minWidth;
      }
      // Clamp final maxWidth again to ensure it's not negative or excessively large
      newStyles.maxWidth = `${Math.max(0, Math.min(parseFloat(newStyles.maxWidth), viewportWidth - 10))}px`;


      setDynamicBubbleStyles(newStyles);

    } else {
      setDynamicBubbleStyles({ // Reset when not hovering
        position: 'absolute',
        visibility: 'hidden',
        opacity: '0',
      });
    }
  }, [isHovering, content]); 

  const iconStyle = {
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px solid #ccc',
    backgroundColor: '#f0f0f0',
    color: '#333',
    fontSize: '14px',
    fontWeight: 'bold',
    userSelect: 'none',
  };

  const containerStyle = {
    position: 'relative',
    display: 'inline-block',
  };

  return (
    <div
      style={containerStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span ref={iconRef} style={iconStyle}>i</span>
      {/* Render bubble div always for ref to be available, control visibility with style */}
      <div ref={bubbleRef} style={{ ...staticBubbleStyles, ...dynamicBubbleStyles }}>
        {content}
      </div>
    </div>
  );
};

export default InfoBubble;
