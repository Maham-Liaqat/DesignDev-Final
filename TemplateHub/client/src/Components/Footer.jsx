// Footer.js
import React from 'react';

const Footer = () => {
  const footerStyle = {
    backgroundColor: 'white',
    color: 'black',
    padding: '1rem',
    textAlign: 'center'

  };

  const linkStyle = {
    color: 'blue',
    margin: '0 0.5rem'
  };

  return (
    <footer style={footerStyle}>
      <div>
        <p>&copy; 2025 DesignDev. All rights reserved.</p>
        <div>
          <a href="https://facebook.com" style={{ ...linkStyle, color: '#3b5998' }}>Facebook</a>
          <a href="https://twitter.com" style={{ ...linkStyle, color: '#1da1f2' }}>Twitter</a>
          <a href="https://instagram.com" style={{ ...linkStyle, color: '#e1306c' }}>Instagram</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
