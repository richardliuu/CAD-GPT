import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/ContentSection.css';

function ContentSection() {
  return (
    <section className="content-section">
      <div className="container">
        <h2 className="section-title">The Role of AI in Modern CAD Design</h2>
        <div className="section-content">
          <p>
            Artificial Intelligence has been making waves across numerous sectors, and its impact on CAD software is no exception. 
            Traditionally, creating detailed 3D models involved manually using CAD tools, which required expertise in various design 
            principles, as well as proficiency with the software itself. While CAD programs like AutoCAD, SolidWorks, and Blender 
            provide robust tools for these tasks, they often come with steep learning curves, particularly for beginners or users 
            without specialized design knowledge.
          </p>
          <p>
            CADGPT represents a major leap forward by removing many of the barriers to entry associated with traditional CAD modeling. 
            Instead of needing to master complex software, users can simply provide natural language prompts to CADGPT, which will 
            interpret the input and generate a 3D model based on the instructions. This opens up the possibility of creating 
            professional-level CAD models without requiring extensive training in CAD software or design principles.
          </p>
          <Link to="/learn-more" className="secondary-button">Learn More</Link>
        </div>
      </div>
    </section>
  );
}

export default ContentSection;