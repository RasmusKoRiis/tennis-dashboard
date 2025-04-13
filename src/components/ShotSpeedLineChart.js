// src/components/ShotSpeedLineChart.js
import React from 'react';
import Plot from 'react-plotly.js';

const ShotSpeedLineChart = ({ speedData, style }) => {
  if (!speedData || speedData.length === 0) return null;

  return (
    <Plot
      data={[
        {
          x: speedData.map(d => d.date),
          y: speedData.map(d => d.serveSpeed),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Serve Speed',
          line: { color: '#c1121f', shape: "spline", width: 3 },
        },
        {
          x: speedData.map(d => d.date),
          y: speedData.map(d => d.forehandSpeed),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Forehand Speed',
          line: { color: '#2a9d8f', shape: "spline", width: 3 },
        },
        {
          x: speedData.map(d => d.date),
          y: speedData.map(d => d.backhandSpeed),
          type: 'scatter',
          mode: 'lines+markers',
          name: 'Backhand Speed',
          line: { color: '#fca311', shape: "spline", width: 3 },
        },
      ]}
      layout={{
        title: 'Shot Speed Over Time',
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#000' },
        xaxis: { title: '' },
        yaxis: { title: 'Speed (km/h)', rangemode: 'tozero' },
        margin: { l: 60, r: 20, t: 50, b: 50 },
        autosize: true,
      }}
      config={{ responsive: true }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default ShotSpeedLineChart;
