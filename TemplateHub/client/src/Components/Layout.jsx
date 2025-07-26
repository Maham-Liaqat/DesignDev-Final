import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet, useLocation } from "react-router-dom"

const Layout = () => {
  const location = useLocation();

  // Hide footer on seller routes
  const hideFooterRoutes = ["/seller"];
  const hideFooter = hideFooterRoutes.includes(location.pathname);

  return (
    <div>
      {/* You can show Navbar here if needed */}
      
      <Outlet />

      {/* Conditionally render footer */}
      {!hideFooter && <Footer />}
    </div>
  );
}

export default Layout
