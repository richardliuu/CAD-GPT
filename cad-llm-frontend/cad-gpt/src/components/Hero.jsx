import React from 'react';
import { Link } from 'react-router-dom';

function Hero() {
  return (
    <section className="hero">
      <div className="container hero-container">
        <h2 className="hero-title">Revolutionize Your CAD Design with AI</h2>
        <p className="hero-subtitle">CADGPT brings the power of artificial intelligence to CAD design, making professional 3D modeling accessible to everyone.</p>
        <Link to="/chat" className="cta-button">Try CADGPT Chat</Link>
      </div>
    </section>
  );
}

export default Hero;