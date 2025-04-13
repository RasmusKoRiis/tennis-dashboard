import React from 'react';
import './AnimatedButton.css';

const AnimatedButton = ({ title, onClick, extraClass = '' }) => {
  return (
    <button onClick={onClick} className={`button ${extraClass}`}>
      {/* Instead of putting text inside the span, we use a data attribute */}
      <span className="button__text" data-text={title}></span>
      <span className="button__mask"></span>
    </button>
  );
};

export default AnimatedButton;
