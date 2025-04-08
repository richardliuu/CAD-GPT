import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import '../styles/Header.css';

function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container header-container">
        <div className="logo-container">
          <Link to="/" className="logo-link">
            <Logo />
            <span className="logo-text">CADGPT</span>
          </Link>
        </div>

        <div className="mobile-menu-toggle" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <nav className={`main-nav ${mobileMenuOpen ? 'open' : ''}`}>
          <ul className="nav-list">
            <li><Link to="/" className="nav-link active">Home</Link></li>
            <li><Link to="/features" className="nav-link">Features</Link></li>
            <li><Link to="/solutions" className="nav-link">Solutions</Link></li>
            <li><Link to="/pricing" className="nav-link">Pricing</Link></li>
            <li><Link to="/about" className="nav-link">About</Link></li>
            <li><Link to="/chat" className="nav-link">Chat</Link></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;