import React from 'react';

const Error = ({ errorMessage, onBack }) => {
  return (
    <div className="error-container">
      <div className="error-icon">❌</div>
      <h3>Something went wrong</h3>
      {errorMessage && <p className="error-message">{errorMessage}</p>}
      <p>The analysis couldn't be completed. Please try again.</p>
      
      <button 
        className="back-button"
        onClick={onBack}
      >
        Back
      </button>
      
      <style jsx>{`
        .error-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 20px;
          text-align: center;
        }
        
        .error-icon {
          font-size: 48px;
          margin-bottom: 15px;
          color: #f44336;
        }
        
        h3 {
          color: #f44336;
          margin-bottom: 10px;
        }
        
        .error-message {
          background-color: #ffebee;
          padding: 10px;
          border-radius: 4px;
          border: 1px solid #ffcdd2;
          margin-bottom: 15px;
          max-width: 100%;
          overflow-wrap: break-word;
        }
        
        .back-button {
          margin-top: 15px;
          padding: 8px 16px;
          background-color: rgb(64, 122, 57);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: bold;
        }
        
        .back-button:hover {
          background-color: rgb(40, 97, 35);
        }
      `}</style>
    </div>
  );
};

export default Error;
