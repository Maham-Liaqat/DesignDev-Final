// API Configuration
const API_CONFIG = {
  // Development URL (localhost)
  DEV_URL: 'http://localhost:8080',
  // Production URL (Render)
  PROD_URL: 'https://designdev-final.onrender.com',
  // Use production URL by default, but can be overridden for development
  // You can also set VITE_API_URL environment variable to override this
  BASE_URL: import.meta.env.VITE_API_URL ||
  (import.meta.env.MODE === 'development' ? 'http://localhost:8080' : 'https://designdev-final.onrender.com')
};

export default API_CONFIG;


