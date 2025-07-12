import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import { Outlet, useLocation } from "react-router-dom"

const Layout = () => {
  const location = useLocation();

  // Hide footer on seller and chat routes
  const hideFooterRoutes = ["/seller"];
  const isChatPage = location.pathname.startsWith('/chat/');
  const hideFooter = hideFooterRoutes.includes(location.pathname) || isChatPage;

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
