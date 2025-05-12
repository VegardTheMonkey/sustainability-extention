import React from 'react';

const Loading = ({ onCancel }) => {
  return (
    <div className="loading-container">
      <div className="loading-spinner"></div>
      <p>Analysis in progress...</p>
      <button 
        className="cancel-button"
        onClick={onCancel}
      >
        Cancel
      </button>
      
      <style jsx>{`
        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
        }
        
        .loading-spinner {
          border: 4px solid rgba(0, 0, 0, 0.1);
          border-radius: 50%;
          border-top: 4px solid rgb(64, 122, 57);
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .cancel-button {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
          display: none;
        }
        
        .cancel-button:hover {
          background-color: #d32f2f;
        }
      `}</style>
    </div>
  );
};

export default Loading;
