import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import API_CONFIG from '../config/api';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const sourcePath = query.get('sourcePath');
  const templateId = query.get('templateId');
  useEffect(() => {
    const downloadFile = async () => {
      try {
        if (!sourcePath) return;
        
        // Extract just the filename (remove any path segments)
        const filename = sourcePath.split(/\\|\//).pop();
        
        // Create the correct download URL (pointing to backend)
        const downloadUrl = `${API_CONFIG.BASE_URL}/uploads/${filename}`;
        
        // Check if file exists before attempting download
        try {
          const response = await fetch(downloadUrl, { method: 'HEAD' });
          if (!response.ok) {
            console.error('File not found on server:', filename);
            // Show error message to user
            const errorDiv = document.createElement('div');
            errorDiv.innerHTML = `
              <div style="background: #fee; border: 1px solid #fcc; padding: 15px; margin: 10px 0; border-radius: 5px; color: #c33;">
                <strong>Download Error:</strong> The source code file "${filename}" is not available. 
                This might be due to a server issue or the file was not uploaded properly. 
                Please contact the seller for assistance.
              </div>
            `;
            document.querySelector('.success-card')?.appendChild(errorDiv);
            return;
          }
        } catch (error) {
          console.error('Error checking file availability:', error);
        }
        
        // Create and trigger download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } catch (error) {
        console.error('Download failed:', error);
      }
    };

    downloadFile();
    
    // Redirect after 10 seconds
    const timer = setTimeout(() => {
      if (templateId) {
        navigate(`/ReviewPage?templateId=${templateId}`);
      } else {
        navigate('/ReviewPage');
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [sourcePath, navigate]);

  // Get display filename for the download button
  const displayFilename = sourcePath 
    ? sourcePath.split(/\\|\//).pop() 
    : 'template.zip';

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="success-icon">
          <svg viewBox="0 0 24 24">
            <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
          </svg>
        </div>
        <h1 className="success-title">Payment Successful!</h1>
        <p className="success-message">Thank you for your purchase. Your download should begin shortly.</p>
        
        {sourcePath && (
          <div className="download-section">
            <p className="download-text">If the download doesn't start automatically:</p>
            <a 
              href={`${API_CONFIG.BASE_URL}/uploads/${displayFilename}`}
              download={displayFilename}
              className="download-button"
              onClick={async (e) => {
                try {
                  const response = await fetch(`${API_CONFIG.BASE_URL}/uploads/${displayFilename}`, { method: 'HEAD' });
                  if (!response.ok) {
                    e.preventDefault();
                    alert(`File "${displayFilename}" is not available. Please contact the seller for assistance.`);
                  }
                } catch (error) {
                  e.preventDefault();
                  alert(`Error checking file availability. Please contact the seller for assistance.`);
                }
              }}
            >
              Click to Download {displayFilename}
            </a>
          </div>
        )}
        
        <div className="redirect-message">
          <p>You'll be redirected in 10 seconds...</p>
        </div>
      </div>
    </div>
  );
};

// CSS Styles
const styles = `
  .success-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f8f9fa;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }

  .success-card {
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

  .success-icon {
    width: 80px;
    height: 80px;
    margin: 0 auto 20px;
    background-color: #2c1d43;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .success-icon svg {
    width: 48px;
    height: 48px;
    color: white;
  }

  .success-title {
    color:rgb(77, 59, 103);
    margin-bottom: 15px;
    font-size: 28px;
    font-weight: 600;
  }

  .success-message {
    color: #555;
    font-size: 16px;
    line-height: 1.6;
    margin-bottom: 25px;
  }

  .download-section {
    margin: 25px 0;
    padding: 20px;
    background-color: #f1f8e9;
    border-radius: 8px;
  }

  .download-text {
    color:rgb(125, 83, 187);
    margin-bottom: 15px;
    font-size: 15px;
  }

  .download-button {
    display: inline-block;
    background-color:rgb(97, 80, 123);
    color: white;
    padding: 12px 24px;
    border-radius: 6px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
    border: none;
    cursor: pointer;
  }

  .download-button:hover {
    background-color:rgb(106, 95, 123);
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

export default Success;