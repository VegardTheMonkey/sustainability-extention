import React, { useState, useEffect } from 'react';
import Controls from './components/controls';
import Analysis from './components/analysis';
import Loading from './components/loading';
import Error from './components/error';

const App = () => {
  const [images, setImages] = useState([]);
  const [analysisState, setAnalysisState] = useState('idle');

  useEffect(() => {
    // Load state from storage when popup opens
    loadDataFromStorage();

    // Set up listener for real-time updates while popup is open
    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        if (changes.imageData) {
          setImages(changes.imageData.newValue || []);
        }
        if (changes.analysisState) {
          setAnalysisState(changes.analysisState.newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    // Cleanup function to remove listener when component unmounts
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const loadDataFromStorage = () => {
    chrome.storage.local.get(['imageData', 'analysisState'], (result) => {
      if (result.imageData) {
        setImages(result.imageData);
        console.log(`Loaded ${result.imageData.length} images from storage`);
      }
      
      if (result.analysisState) {
        setAnalysisState(result.analysisState);
        console.log(`Current analysis state: ${result.analysisState}`);
      }
    });
  };

  const handleBackToIdle = () => {
    setAnalysisState('idle');
    
    // Update storage state
    chrome.storage.local.set({ analysisState: 'idle' }, () => {
      console.log('Returned to idle state');
    });
  };

  const renderAnalysisStatus = () => {
    switch (analysisState) {
      case 'in-progress':
        return <div className="status in-progress">Analysis in progress...</div>;
      case 'completed':
        return <div className="status completed">Analysis completed</div>;
      case 'stopped':
        return <div className="status stopped">Analysis was stopped</div>;
      case 'error':
        return <div className="status error">Error during analysis</div>;
      default:
        return <div className="status idle">Ready to analyze</div>;
    }
  };

  return (
    <div className="app">
      <h2>Web Image Sustainabilifier</h2>
      {analysisState === 'idle' && <Controls />}
      {analysisState === 'in-progress' && <Loading onCancel={handleBackToIdle} />}
      {analysisState === 'completed' && <Analysis images={images} onBack={handleBackToIdle} />}
      {analysisState === 'error' && <Error onBack={handleBackToIdle} />}
    </div>
  );
};

export default App; 