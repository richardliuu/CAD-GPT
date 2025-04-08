import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './styles/App.css';

function App() {
  const [prompt, setPrompt] = useState('');
  const [cadCode, setCadCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [renderUrl, setRenderUrl] = useState('');
  const iframeRef = useRef(null);
  const appRef = useRef(null);

  // Function to generate OpenSCAD code
  const handleGenerateCAD = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/generate-cad', {
        prompt: prompt
      });
      
      setCadCode(response.data.code);
      
      // Clear previous render URL
      setRenderUrl('');
    } catch (err) {
      console.error("Error details:", err);
      setError('Error generating CAD code: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Function to render OpenSCAD code using OpenSCAD.org online viewer
  const handleRenderCAD = () => {
    if (!cadCode) {
      setError('No OpenSCAD code to render');
      return;
    }
    
    // Save current scroll position before opening viewer
    const scrollPos = window.scrollY;
    
    // Create URL for OpenSCAD Online viewer
    const encodedCode = encodeURIComponent(cadCode);
    const viewerUrl = `https://openscad.cloud/openscad/#script=${encodedCode}`;
    
    setRenderUrl(viewerUrl);
    
    // Scroll back to preserved position after a short delay
    setTimeout(() => {
      window.scrollTo(0, scrollPos);
    }, 100);
  };

  // Fix for iframe loading issues
  useEffect(() => {
    if (renderUrl && iframeRef.current) {
      const handleIframeLoad = () => {
        // Ensure the page doesn't jump when iframe loads
        window.scrollTo(0, window.scrollY);
      };
      
      iframeRef.current.addEventListener('load', handleIframeLoad);
      
      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleIframeLoad);
        }
      };
    }
  }, [renderUrl]);

  return (
    <div className="App" ref={appRef}>
      <header className="App-header">
        <h1>CAD-GPT</h1>
        <p>Generate and render 3D models with AI</p>
      </header>
      
      <main className="App-main">
        <div className="input-section">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe the 3D model you want to create..."
            rows={4}
          />
          
          <div className="button-group">
            <button
              onClick={handleGenerateCAD}
              disabled={loading}
            >
              {loading ? 'Generating...' : 'Generate OpenSCAD Code'}
            </button>
            
            <button
              onClick={handleRenderCAD}
              disabled={!cadCode}
            >
              Render in OpenSCAD Viewer
            </button>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
        
        {cadCode && (
          <div className="cad-section">
            <h2>OpenSCAD Code:</h2>
            <pre className="cad-code">{cadCode}</pre>
            <div className="button-row">
              <button onClick={() => navigator.clipboard.writeText(cadCode)}>
                Copy to Clipboard
              </button>
              <a
                href={`data:text/plain;charset=utf-8,${encodeURIComponent(cadCode)}`}
                download="model.scad"
                className="download-link"
              >
                Download .scad File
              </a>
            </div>
          </div>
        )}
        
        {renderUrl && (
          <div className="render-section">
            <h2>3D Model Preview:</h2>
            <div className="iframe-container">
              <iframe
                ref={iframeRef}
                src={renderUrl}
                title="OpenSCAD Viewer"
                className="openscad-iframe"
                sandbox="allow-scripts allow-same-origin"
              ></iframe>
            </div>
            <p className="note">Note: If the model doesn't render correctly, you can use the downloaded .scad file with desktop OpenSCAD.</p>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;