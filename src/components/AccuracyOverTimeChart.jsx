// src/components/AccuracyOverTimeChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const AccuracyOverTimeChart = ({ chartData, style }) => {
  return (
    <Plot
      data={[
        {
          x: chartData.map(item => item.date),
          y: chartData.map(item => item.serveAccuracy),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Serve Accuracy',
          marker: { color: '#c1121f' }, // set trace color explicitly
          line: { color: '#c1121f', shape: "spline", width: 3 }
        },
        {
          x: chartData.map(item => item.date),
          y: chartData.map(item => item.forehandAccuracy),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Forehand Accuracy',
          marker: { color: '#fca311' },
          line: { color: '#fca311', shape: "spline", width: 3 }
        },
        {
          x: chartData.map(item => item.date),
          y: chartData.map(item => item.backhandAccuracy),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Backhand Accuracy',
          marker: { color: '#2a9d8f' },
          line: { color: '#2a9d8f', shape: "spline", width: 3 }
        }
      ]}
      layout={{
        autosize: true,
        title: '', // Remove any title text
        paper_bgcolor: '#fdf0d5',  // Use your desired beige background
        plot_bgcolor: '#fdf0d5',   // Same for the plotting area
        font: { color: '#000' },   // Black text throughout
        xaxis: { title: '' },
        yaxis: { title: 'Accuracy (%)', range: [0, 100] },
        margin: { t: 40, l: 40, r: 20, b: 40 }
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%', ...style }}
      config={{ responsive: true }}
    />
  );
};

export default AccuracyOverTimeChart;
