import React from 'react';
import Plot from 'react-plotly.js';

const PointsWonChart = ({ data }) => {
  return (
    <Plot
      data={[
        {
          x: data.map(d => d.date),
          y: data.map(d => d.rate),
          name: 'Points Won',
          type: 'scatter',
          mode: 'lines+markers',
          fill: 'tozeroy', // Area below the line
          line: {
            color: '#2a9d8f',
            shape: 'spline', // Smooth curve
            width: 3
          },
          marker: {
            size: 6
          }
        }
      ]}
      layout={{
        autosize: true,
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#000' },
        xaxis: { title: 'Session Date' },
        yaxis: {
          title: 'Points Won (%)',
          tickformat: ',.0%',
          range: [0, 1]
        },
        margin: { t: 30, l: 60, r: 20, b: 40 }
      }}
      useResizeHandler
      style={{ width: '100%', height: '100%' }}
      config={{ responsive: true }}
    />
  );
};

export default PointsWonChart;
