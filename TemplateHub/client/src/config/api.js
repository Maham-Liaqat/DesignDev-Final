// API Configuration
const API_CONFIG = {
  // Development URL (localhost)
  DEV_URL: 'http://localhost:8080',
  // Production URL (Vercel)
  PROD_URL: 'https://design-dev-final-api.vercel.app',
  // Use production URL by default, but can be overridden for development
  // You can also set VITE_API_URL environment variable to override this
  BASE_URL: import.meta.env.VITE_API_URL || 
            (import.meta.env.MODE === 'development' ? 'http://localhost:8080' : 'https://design-dev-final-api.vercel.app')
};

export default API_CONFIG; 