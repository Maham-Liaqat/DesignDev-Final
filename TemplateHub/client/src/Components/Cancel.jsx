import React from 'react';
import { useNavigate } from 'react-router-dom';

const Cancel = () => {
  const navigate = useNavigate();

  // Redirect to home after 8 seconds
  React.useEffect(() => {
    const timer = setTimeout(() => navigate('/'), 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="cancel-container">
      <div className="cancel-card">
        <div className="cancel-icon">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2C17.53,2 22,6.47 22,12C22,17.53 17.53,22 12,22C6.47,22 2,17.53 2,12C2,6.47 6.47,2 12,2M15.59,7L12,10.59L8.41,7L7,8.41L10.59,12L7,15.59L8.41,17L12,13.41L15.59,17L17,15.59L13.41,12L17,8.41L15.59,7Z" />
          </svg>
        </div>
        <h1 className="cancel-title">Payment Canceled</h1>
        <p className="cancel-message">You've canceled the payment process. No charges have been made to your account.</p>
        
        <div className="action-buttons">
          <button 
            onClick={() => navigate('/')}
            className="home-button"
          >
            Return Home
          </button>
          <button 
            onClick={() => window.history.back()}
            className="retry-button"
          >
            Try Again
          </button>
        </div>
        
        <div className="redirect-message">
          <p>You'll be redirected to the homepage in 8 seconds...</p>
        </div>
      </div>
    </div>
  );
};

export default Cancel;

// CSS Styles
const styles = `
  .cancel-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .cancel-card {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    padding: 40px;
    max-width: 500px;
    width: 100%;
    text-align: center;
    animation: fadeIn 0.5s ease-in-out;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .cancel-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background-color: #f44336;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cancel-icon svg {
    width: 48px;
    height: 48px;
    color: white;
  }

  .cancel-title {
    color: #c62828;
    margin-bottom: 15px;
    font-size: 28px;
    font-weight: 600;
  }

  .cancel-message {
    color: #555;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 25px;
  }

  .action-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin: 30px 0;
  }

  .home-button, .retry-button {
    padding: 12px 24px;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.3s ease;
    cursor: pointer;
    border: none;
    font-size: 15px;
  }

  .home-button {
    background-color: #f5f5f5;
    color: #333;
  }

  .home-button:hover {
    background-color: #e0e0e0;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .retry-button {
    background-color: #2196F3;
    color: white;
  }

  .retry-button:hover {
    background-color: #0d8aee;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .redirect-message {
    margin-top: 30px;
    color: #777;
    font-size: 14px;
    font-style: italic;
  }
`;

// Add styles to the document
const styleElement = document.createElement('style');
styleElement.innerHTML = styles;
document.head.appendChild(styleElement);