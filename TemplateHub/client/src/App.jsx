import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Components/Navbar'
import LandingPage from './Components/LandingPage'
import TemplateList from './Components/TemplateList'
import Footer from './Components/Footer'
import FeaturedTemplate from './Components/FeaturedTemplate'
// import LandingPage2 from './Components/LandingPage2'
import Pricingtable from './Components/Pricingtable'
import Template from './Components/Template'
import ResetPassword from './Components/ResetPassword';

const App = () => {
  return (
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
      </Routes>
    </BrowserRouter>
  )
}

export default App
