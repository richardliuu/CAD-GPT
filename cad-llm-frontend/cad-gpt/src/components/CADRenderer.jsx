// CADRenderer.jsx
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// This component renders CAD models from OpenSCAD-like code using Three.js
// OpenSCAD code is parsed and converted to 3D geometry
const CADRenderer = () => {
  const [prompt, setPrompt] = useState('');
  const [cadCode, setCadCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewerReady, setViewerReady] = useState(false);
  
  const viewerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);

  // Initialize the 3D viewer
  useEffect(() => {
    if (!viewerRef.current) return;
    
    // Set up Three.js scene, camera, renderer
    const container = viewerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    
    // Create camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.z = 5;
    cameraRef.current = camera;
    
    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    
    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);
    
    // Add orbit controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controlsRef.current = controls;
    
    // Add grid helper
    const gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
    
    // Add axes helper
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);
    
    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    
    animate();
    setViewerReady(true);
    
    // Cleanup on unmount
    return () => {
      if (renderer) {
        container.removeChild(renderer.domElement);
        renderer.dispose();
      }
    };
  }, []);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (!viewerRef.current || !rendererRef.current || !cameraRef.current) return;
      
      const width = viewerRef.current.clientWidth;
      const height = viewerRef.current.clientHeight;
      
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Function to generate CAD code from Gemini
  const generateCAD = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await axios.post('http://localhost:8000/api/generate-cad', {
        prompt: prompt,
        model: "gemini-2.5-pro-exp-03-25"
      });
      
      setCadCode(response.data.code);
    } catch (err) {
      setError('Failed to generate CAD code: ' + (err.response?.data?.detail || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  // Parse and render the OpenSCAD code
  useEffect(() => {
    if (cadCode && viewerReady && sceneRef.current) {
      try {
        // Clear existing objects (except lights, grid, and axes)
        sceneRef.current.children = sceneRef.current.children.filter(
          child => child.isLight || child instanceof THREE.GridHelper || child instanceof THREE.AxesHelper
        );
        
        // Parse the OpenSCAD code and create Three.js objects
        const parsedObjects = parseOpenSCADToThree(cadCode);
        
        // Add parsed objects to the scene
        parsedObjects.forEach(obj => sceneRef.current.add(obj));
        
        // Center camera on objects
        centerCameraOnObjects(parsedObjects, cameraRef.current, controlsRef.current);
      } catch (err) {
        setError(`Error rendering CAD: ${err.message}`);
      }
    }
  }, [cadCode, viewerReady]);

  // Function to parse OpenSCAD code into Three.js objects
  const parseOpenSCADToThree = (code) => {
    // This is a simplified parser that handles basic OpenSCAD primitives
    // In a real implementation, you would use a proper parser/interpreter
    
    const objects = [];
    
    // Example: Parse a cube declaration: cube([width, depth, height]);
    const cubeRegex = /cube\(\s*\[\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*,\s*(\d+\.?\d*)\s*\]\s*\)/g;
    let cubeMatch;
    
    while ((cubeMatch = cubeRegex.exec(code)) !== null) {
      const width = parseFloat(cubeMatch[1]);
      const depth = parseFloat(cubeMatch[2]);
      const height = parseFloat(cubeMatch[3]);
      
      const geometry = new THREE.BoxGeometry(width, height, depth);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x1e90ff,
        metalness: 0.1,
        roughness: 0.5,
      });
      
      const cube = new THREE.Mesh(geometry, material);
      objects.push(cube);
    }
    
    // Example: Parse a sphere declaration: sphere(r=radius);
    const sphereRegex = /sphere\(\s*r\s*=\s*(\d+\.?\d*)\s*\)/g;
    let sphereMatch;
    
    while ((sphereMatch = sphereRegex.exec(code)) !== null) {
      const radius = parseFloat(sphereMatch[1]);
      
      const geometry = new THREE.SphereGeometry(radius, 32, 16);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x1e90ff,
        metalness: 0.1,
        roughness: 0.5,
      });
      
      const sphere = new THREE.Mesh(geometry, material);
      objects.push(sphere);
    }
    
    // Example: Parse a cylinder declaration: cylinder(h=height, r=radius);
    const cylinderRegex = /cylinder\(\s*h\s*=\s*(\d+\.?\d*)\s*,\s*r\s*=\s*(\d+\.?\d*)\s*\)/g;
    let cylinderMatch;
    
    while ((cylinderMatch = cylinderRegex.exec(code)) !== null) {
      const height = parseFloat(cylinderMatch[1]);
      const radius = parseFloat(cylinderMatch[2]);
      
      const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0x1e90ff,
        metalness: 0.1,
        roughness: 0.5,
      });
      
      const cylinder = new THREE.Mesh(geometry, material);
      objects.push(cylinder);
    }
    
    // If no objects were created, create a simple demo object
    if (objects.length === 0) {
      setError("Warning: Could not parse any objects from the generated code. Showing sample object instead.");
      
      const geometry = new THREE.BoxGeometry(2, 2, 2);
      const material = new THREE.MeshStandardMaterial({ 
        color: 0xff4500,
        metalness: 0.1,
        roughness: 0.5,
      });
      
      const demoObject = new THREE.Mesh(geometry, material);
      objects.push(demoObject);
    }
    
    return objects;
  };

  // Function to center camera on objects
  const centerCameraOnObjects = (objects, camera, controls) => {
    if (!objects.length || !camera || !controls) return;
    
    // Calculate bounding box
    const boundingBox = new THREE.Box3();
    objects.forEach(obj => boundingBox.expandByObject(obj));
    
    // Get center and size
    const center = new THREE.Vector3();
    boundingBox.getCenter(center);
    
    const size = new THREE.Vector3();
    boundingBox.getSize(size);
    
    // Calculate distance based on size
    const maxDim = Math.max(size.x, size.y, size.z);
    const fov = camera.fov * (Math.PI / 180);
    const distance = maxDim / (2 * Math.tan(fov / 2));
    
    // Position camera
    camera.position.set(
      center.x + distance * 1.5,
      center.y + distance * 1.5,
      center.z + distance * 1.5
    );
    
    camera.lookAt(center);
    
    // Update controls target
    controls.target.copy(center);
    controls.update();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">AI-Powered CAD Generator</h1>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-2" htmlFor="prompt">
          Describe what you want to create:
        </label>
        <textarea
          id="prompt"
          className="w-full p-2 border border-gray-300 rounded"
          rows="3"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., A simple coffee mug with a handle, or a basic smartphone stand"
        />
      </div>
      
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        onClick={generateCAD}
        disabled={isLoading || !prompt.trim()}
      >
        {isLoading ? 'Generating...' : 'Generate CAD Model'}
      </button>
      
      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}
      
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 className="text-xl font-semibold mb-2">Generated OpenSCAD Code:</h2>
          <pre className="bg-gray-100 p-4 rounded h-96 overflow-auto">{cadCode || "Code will appear here..."}</pre>
        </div>
        
        <div>
          <h2 className="text-xl font-semibold mb-2">Rendered 3D Model:</h2>
          <div 
            ref={viewerRef}
            className="border border-gray-300 rounded h-96 bg-white"
          >
            {/* 3D viewer will be rendered here */}
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Tip: Click and drag to rotate. Scroll to zoom.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CADRenderer;