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
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);

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
      
      const generatedCode = response.data.code;
      setCadCode(generatedCode);
      
      renderOpenScadCode(generatedCode);
      
    } catch (err) {
      console.error("Error details:", err);
      setError('Error generating CAD code: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const renderOpenScadCode = (code) => {
    if (!code) {
      setError('No OpenSCAD code to render');
      return;
    }
    
    const encodedCode = encodeURIComponent(code);
    const viewerUrl = `https://openscad.cloud/openscad/#script=${encodedCode}`;
    
    setRenderUrl(viewerUrl);
    
    // Scroll to show results after rendering
    setTimeout(() => {
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }, 100);
  };

  const handleRenderCAD = () => {
    renderOpenScadCode(cadCode);
  };

  // Auto resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + 'px';
    }
  }, [prompt]);

  // Fix for iframe loading issues
  useEffect(() => {
    if (renderUrl && iframeRef.current) {
      const handleIframeLoad = () => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      };
      
      iframeRef.current.addEventListener('load', handleIframeLoad);
      
      return () => {
        if (iframeRef.current) {
          iframeRef.current.removeEventListener('load', handleIframeLoad);
        }
      };
    }
  }, [renderUrl]);

  // Handle Enter key to submit
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleGenerateCAD();
    }
  };

  return (
    <div className="App">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>CAD-GPT</h1>
        </div>
        <div className="sidebar-content">
          <div></div> {/* This empty div pushes the footer to the bottom */}
          <div className="sidebar-footer">
            Powered by AI - Generate 3D models using natural language
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="content">
        <div className="content-header">
          <p>Generate and render 3D models with AI</p>
        </div>
        
        {/* Chat area */}
        <div className="chat-container" ref={chatContainerRef}>
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
              <button onClick={handleRenderCAD}>Re-render Model</button>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="input-container">
          <div className="prompt-tip">
            Describe the 3D model you want to create (e.g., "a simple chess pawn" or "gear with 12 teeth")
          </div>
          <div className="input-section">
            <textarea
              ref={textareaRef}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe your 3D model..."
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button
              className="send-button"
              onClick={handleGenerateCAD}
              disabled={loading}
              title="Generate model"
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
          {error && <div className="error-message">{error}</div>}
        </div>
      </div>
    </div>
  );
}

export default App;