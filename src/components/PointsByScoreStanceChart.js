import React from 'react';
import Plot from 'react-plotly.js';

const PointsByScoreStanceChart = ({ stanceData }) => {
  const scoreLabels = Object.keys(stanceData).sort();

  return (
    <Plot
      data={[
        {
          x: scoreLabels,
          y: scoreLabels.map(score => stanceData[score]?.hostPct ?? 0),
          name: 'Rasmus',
          type: 'bar',
          marker: { color: '#c1121f' },
        },
        {
          x: scoreLabels,
          y: scoreLabels.map(score => stanceData[score]?.guestPct ?? 0),
          name: 'Rikard',
          type: 'bar',
          marker: { color: '#2a9d8f' },
        }
      ]}
      layout={{
        barmode: 'stack',
        autosize: true,
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#000' },
        xaxis: { title: '' },
        yaxis: { title: '', tickformat: ',.0%' },
        margin: { t: 30, l: 60, r: 20, b: 65 }
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '100%' }}
      config={{ responsive: true }}
    />
  );
};

export default PointsByScoreStanceChart;
