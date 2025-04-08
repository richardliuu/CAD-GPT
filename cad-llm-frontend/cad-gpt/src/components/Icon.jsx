import React from 'react';

function Icon({ path }) {
  return (
    <a href="#">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d={path} />
      </svg>
    </a>
  );
}

export default Icon;