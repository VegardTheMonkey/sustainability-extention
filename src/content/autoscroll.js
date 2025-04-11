export function autoScrollPage() {
    console.log('Starting auto-scroll through page');
    
    // Calculate the total scroll height
    const scrollHeight = Math.max(
      document.body.scrollHeight,
      document.documentElement.scrollHeight
    ) - window.innerHeight;
    
    // Create scroll parameters
    const duration = 10000; // 10 seconds total
    const stepDelay = 50; // 50ms between steps
    const steps = duration / stepDelay;
    const scrollStep = scrollHeight / steps;
    
    let currentStep = 0;
    let scrollInterval = setInterval(() => {
      currentStep++;
      
      // Calculate current scroll position
      const scrollPosition = currentStep * scrollStep;
      
      // Scroll to the new position
      window.scrollTo({
        top: scrollPosition,
        behavior: 'smooth'
      });
      
      // Check if we've reached the end
      if (currentStep >= steps || scrollPosition >= scrollHeight) {
        clearInterval(scrollInterval);
        console.log('Auto-scroll completed');
      }
    }, stepDelay);
  }