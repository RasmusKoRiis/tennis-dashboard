// src/components/StackedPointsWonChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const StackedPointsWonChart = ({ data, style }) => {
  return (
    <Plot
      data={[
        {
          x: data.map(d => d.game),
          y: data.map(d => d.rasmus),
          name: 'Rasmus',
          type: 'scatter',
          mode: 'lines',
          stackgroup: 'one', // This makes it part of a stacked area
          marker: { color: '#c1121f' } // Set desired color for Rasmus
        },
        {
          x: data.map(d => d.game),
          y: data.map(d => d.rikard),
          name: 'Rikard',
          type: 'scatter',
          mode: 'lines',
          stackgroup: 'one', // Same stack group for stacking
          marker: { color: '#2a9d8f' } // Set desired color for Rikard
        }
      ]}
      layout={{
        autosize: true,
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#000' },
        xaxis: { title: 'Game Number' },
        yaxis: { title: 'Points Won (%)' },
        margin: { t: 40, l: 60, r: 20, b: 40 },
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%', ...style }}
      config={{ responsive: true }}
    />
  );
};

export default StackedPointsWonChart;
