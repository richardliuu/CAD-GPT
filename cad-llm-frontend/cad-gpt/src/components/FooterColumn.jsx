import React from 'react';

function FooterColumn({ title, links }) {
  return (
    <div className="footer-column">
      <h3>{title}</h3>
      <ul>
        {links.map((link, index) => (
          <li key={index}><a href={link.url}>{link.text}</a></li>
        ))}
      </ul>
    </div>
  );
}

export default FooterColumn;