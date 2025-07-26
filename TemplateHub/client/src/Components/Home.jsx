import React, { useState } from 'react'
import LandingPage from './LandingPage'
import FeaturedTemplate from './FeaturedTemplate'
import Template from './Template'
import TemplateList from './TemplateList'
// import LandingPage2 from './LandingPage2'
import Navbar from './Navbar'
import About from './About'

const Home = () => {
  
  const [searchTerm, setSearchTerm] = useState("");
  return (
    <div>
        <Navbar searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
        <div id="about-section" data-aos="fade-up" data-aos-duration="1000">
        <About />
      </div>
 <LandingPage data-aos="fade-up" data-aos-duration="1000" data-aos-delay="200"/>
 
      <TemplateList searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
      {/* <LandingPage2></LandingPage2> */}
      <FeaturedTemplate data-aos="fade-up" data-aos-duration="1000" data-aos-delay="400"/>





    </div>
  )
}

export default Home