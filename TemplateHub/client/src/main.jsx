import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import Layout from './Components/Layout.jsx'
import Home from './Components/Home.jsx'
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"; // Fixed import
import Template from './Components/Template.jsx'
import ScrollToTop from './Components/ScrollTop.jsx'
import SellerMode from './seller/SellerMode.jsx'
import SuccessPage from './Components/SuccessPage.jsx'
import Cancel from './Components/Cancel.jsx'
import ReviewPage from './Components/ReviewPage.jsx'
import UserProfile from './Components/UserProfile.jsx'
import EditProfile from './Components/EditProfile.jsx'
import Inbox from './Components/Inbox.jsx'
import ResetPassword from './Components/ResetPassword.jsx'
import { ChatProvider } from './contexts/ChatContext.jsx'
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "625126719914-vuv6sg9gksmpngji7qm1o10p48bng7r4.apps.googleusercontent.com"}>
    <StrictMode>
      <ChatProvider>
        <BrowserRouter>
          <ScrollToTop/>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path='/template/:id' element={<Template />} />
              <Route path='/seller' element={<SellerMode />} />
              <Route path='/success' element={<SuccessPage />} />
              <Route path='/Cancel' element={<Cancel/>} />
              <Route path='/ReviewPage' element={<ReviewPage/>} />
              <Route path='/profile/:identifier' element={<UserProfile />} />
              <Route path='/profile/edit' element={<EditProfile />} />
              <Route path='/inbox' element={<Inbox />} />
            </Route>
            <Route path='/reset-password' element={<ResetPassword />} />
            <Route path='/login' element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ChatProvider>
    </StrictMode>
  </GoogleOAuthProvider>
)