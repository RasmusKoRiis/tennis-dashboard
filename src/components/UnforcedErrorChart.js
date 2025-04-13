// src/components/UnforcedErrorChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const UnforcedErrorChart = ({ errorData, style }) => {
  return (
    <Plot
    data={[
        {
          x: errorData.map(d => d.date),
          y: errorData.map(d => d.hostRate),
          name: 'Rasmus',
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: '#c1121f', shape: "spline", width: 3 }
        },
        {
          x: errorData.map(d => d.date),
          y: errorData.map(d => d.guestRate),
          name: 'Rikard',
          type: 'scatter',
          mode: 'lines+markers',
          line: { color: '#2a9d8f', shape: "spline", width: 3 }
        }
      ]}
      
      layout={{
        autosize: true,
        title: '',
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#000' },
        xaxis: { title: '' },
        yaxis: { title: 'Unforced Errors' },
        margin: { t: 40, l: 60, r: 20, b: 40 }
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%', ...style }}
      config={{ responsive: true }}
    />
  );
};

export default UnforcedErrorChart;
