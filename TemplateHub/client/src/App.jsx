import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './Components/Navbar'
import LandingPage from './Components/LandingPage'
import TemplateList from './Components/TemplateList'
import Footer from './Components/Footer'
import FeaturedTemplate from './Components/FeaturedTemplate'
// import LandingPage2 from './Components/LandingPage2'
import Pricingtable from './Components/Pricingtable'
import Template from './Components/Template'
import ResetPassword from "./Components/ResetPassword";
import Inbox from './Components/Inbox';

const App = () => {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "625126719914-vuv6sg9gksmpngji7qm1o10p48bng7r4.apps.googleusercontent.com"}>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={
            <>
              <LandingPage/>
              <TemplateList/>
              {/* <LandingPage2></LandingPage2> */}
              <FeaturedTemplate/>
              {/* <Pricingtable/> */}
              <Footer/>
              {/* <Template/> */}
            </>
          } />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/inbox" element={<Inbox />} />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  )
}

export default App
