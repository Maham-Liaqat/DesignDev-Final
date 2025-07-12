import React from 'react'
import Navbar from './Components/Navbar'
import LandingPage from './Components/LandingPage'
import TemplateList from './Components/TemplateList'
import Footer from './Components/Footer'
import FeaturedTemplate from './Components/FeaturedTemplate'
// import LandingPage2 from './Components/LandingPage2'
import Pricingtable from './Components/Pricingtable'
import Template from './Components/Template'

const App = () => {
  return (
    <div>
      <Navbar/>
      <LandingPage/>
      <TemplateList/>
      {/* <LandingPage2></LandingPage2> */}
      <FeaturedTemplate/>
      {/* <Pricingtable/> */}
      <Footer/>
      {/* <Template/> */}
    </div>
  )
}

export default App
