// src/components/ChartCard.js
import React, { useState, cloneElement } from 'react';
import AnimatedButton from './AnimatedButton';

const ChartCard = ({ title, description, children }) => {
  // Toggle state: if showDetail is true, we show the detail view; else, the chart view.
  const [showDetail, setShowDetail] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleToggleDetail = () => setShowDetail(!showDetail);
  const handleExpand = () => setExpanded(true);
  const handleMinimize = () => setExpanded(false);

  // When expanded, use a fixed overlay container.
  const containerClasses = expanded
    ? 'fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75'
    : 'relative';

  // The card dimensions change when expanded.
  const cardClasses = `
    ${expanded ? 'w-11/12 h-5/6' : 'w-full h-80'} 
    rounded shadow-lg transition transform duration-300 
    ${!expanded ? 'hover:scale-105' : ''} 
    relative overflow-hidden
  `;

  // In non-expanded mode add padding; in fullscreen let content fill.
  const contentClasses = expanded ? 'w-full h-full flex flex-col' : 'w-full h-full p-4';

  // If expanded and the child is a valid element (the chart), force it to fill its container.
  const enhancedChildren =
    expanded && React.isValidElement(children)
      ? cloneElement(children, {
          style: { width: '100%', height: '100%', ...children.props.style }
        })
      : children;

  return (
    <div className={containerClasses}>
      <div className={`chart-card ${cardClasses}`} style={{ backgroundColor: 'var(--ebg)', color: '#000', border: '2px solid #000' }}>
        {/* Chart View (when detail is NOT shown) */}
        {!showDetail && (
          <div className={`${contentClasses} flex flex-col items-center justify-center z-10`}>
            {/* Render the chart */}
            <div className="flex-1 w-full h-full">
              {enhancedChildren}
            </div>
            <div className={`flex space-x-2 mt-2 ${expanded ? 'mb-4' : ''}`}>
              {/* The "Detail" button will use the animated button style */}
              <AnimatedButton title="Detail" onClick={handleToggleDetail} extraClass={`btn-detail ${expanded ? "button--expanded" : ""}`} />
              {!expanded && (
                <AnimatedButton title="Fullscreen" onClick={handleExpand} extraClass="btn-full" />
              )}
              {expanded && (
                <AnimatedButton title="Minimize" onClick={handleMinimize} extraClass="btn-full" />
              )}
            </div>
          </div>
        )}

        {/* Detail View */}
        {showDetail && (
          <div className={`${contentClasses} flex flex-col items-center justify-center z-20`} style={{ backfaceVisibility: 'visible' }}>
            <p className="mb-2 text-center">{description}</p>
            <div className={`flex space-x-2 mt-2 ${expanded ? 'mb-4' : ''}`}>

              <AnimatedButton title="Chart" onClick={handleToggleDetail} extraClass="btn-chart" />
              {expanded && (
                <AnimatedButton title="Minimize" onClick={handleMinimize} extraClass="btn-full" />
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChartCard;
