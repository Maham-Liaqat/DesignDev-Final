# API Configuration Guide

This document explains how to configure the API URL for your frontend application.

## Current Configuration

The API URL is now centralized in `src/config/api.js` and will automatically use:
- **Production URL**: `https://design-dev-final-api.vercel.app` (default)
- **Development URL**: `http://localhost:8080` (when running in development mode)

## How to Change API URL

### Option 1: Environment Variable (Recommended)
Create a `.env` file in the client directory and set:
```
VITE_API_URL=https://your-api-url.com
```

### Option 2: Modify config/api.js
Edit `src/config/api.js` and change the `BASE_URL` value.

### Option 3: Development Mode
When running `npm run dev`, the app will automatically use localhost:8080.

## Files Updated

The following components have been updated to use the centralized API configuration:

- `src/Components/UserProfile.jsx`
- `src/Components/Chat.jsx`
- `src/Components/Template.jsx`
- `src/Components/Inbox.jsx`
- `src/Components/EditProfile.jsx`
- `src/Components/Navbar.jsx`
- `src/Components/TemplateList.jsx`
- `src/Components/ReviewPage.jsx`
- `src/Components/SuccessPage.jsx`
- `src/seller/SellerMode.jsx`
- `src/contexts/ChatContext.jsx`

## Production Deployment

For production deployment, the app will automatically use the Vercel API URL. No additional configuration is needed unless you want to use a different API endpoint. 