// src/components/PressureChart.js
import React from 'react';
import Plot from 'react-plotly.js';

/**
 * Pressure Chart - Last 3 Sessions Only + LOESS Trend
 * Expects dataBySession: [
 *   { session: '2025-02-26', points: [{ x: <pointIdx>, y: <cumScore> }, ...] },
 *   ...
 * ]
 * Renders only the three most recent sessions (initially hidden) with low-opacity lines,
 * and overlays a single LOESS-smoothed trend line based on averaged clutch across all sessions.
 */
const PressureChart = ({ dataBySession, style }) => {
  if (!dataBySession || dataBySession.length === 0) return null;

  const showCount = 3;
  const sessionsToShow = dataBySession.slice(-showCount);
  const colors = ['#c1121f', '#2a9d8f', '#fca311'];

  // Session traces: hidden by default (legendonly)
  const sessionTraces = sessionsToShow.map(({ session, points }, idx) => ({
    x: points.map(p => p.x),
    y: points.map(p => p.y),
    type: 'scatter',
    mode: 'lines',
    name: session,
    visible: 'legendonly',
    line: {
      shape: 'spline',
      width: 2,
      color: colors[idx % colors.length],
      opacity: 0.1
    }
  }));

  // Aggregate all points for trend: average per point index
  const allPoints = dataBySession.flatMap(s => s.points);
  const grouped = allPoints.reduce((acc, { x, y }) => {
    (acc[x] = acc[x] || []).push(y);
    return acc;
  }, {});
  const uniqueX = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  const avgY = uniqueX.map(x => grouped[x].reduce((sum, v) => sum + v, 0) / grouped[x].length);

  const loessSmooth = (xVals, yVals, f = 0.3) => {
    const n = xVals.length;
    const ySm = [];
    const bandwidth = Math.ceil(f * n);
    for (let i = 0; i < n; i++) {
      const x0 = xVals[i];
      const dists = xVals.map(xi => Math.abs(xi - x0)).sort((a, b) => a - b);
      const h = dists[bandwidth - 1] || 0;
      const w = xVals.map(xi => {
        const u = h === 0 ? 0 : Math.abs(xi - x0) / h;
        return u < 1 ? Math.pow(1 - u * u * u, 3) : 0;
      });
      let S0 = 0, S1 = 0, S2 = 0, Y0 = 0, Y1 = 0;
      for (let j = 0; j < n; j++) {
        const wj = w[j], xj = xVals[j], yj = yVals[j];
        S0 += wj; S1 += wj * xj; S2 += wj * xj * xj;
        Y0 += wj * yj; Y1 += wj * xj * yj;
      }
      const denom = S0 * S2 - S1 * S1;
      const beta = denom ? (S0 * Y1 - S1 * Y0) / denom : 0;
      const alpha = S0 ? (Y0 - beta * S1) / S0 : 0;
      ySm[i] = alpha + beta * x0;
    }
    return ySm;
  };

  const trendY = loessSmooth(uniqueX, avgY, 0.3);
  const trendTrace = {
    x: uniqueX,
    y: trendY,
    type: 'scatter',
    mode: 'lines',
    name: 'LOESS Trend',
    line: { shape: 'spline', dash: 'dash', width: 4, color: '#006BA2' }
  };

  return (
    <Plot
      data={[...sessionTraces, trendTrace]}
      layout={{
        title: { text: 'Pressure Timeline', font: { size: 18 } },
        paper_bgcolor: '#fdf0d5',
        plot_bgcolor: '#fdf0d5',
        font: { color: '#333', size: 12 },
        xaxis: { automargin: true, showtitle: false },
        yaxis: { title: { text: 'Clutch Score', font: { size: 14 } }, rangemode: 'tozero', automargin: true },
        legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.2, font: { size: 12 } },
        margin: { l: 60, r: 20, t: 50, b: 40 },
        autosize: true
      }}
      config={{ responsive: true }}
      useResizeHandler
      style={{ width: '100%', height: '100%', ...style }}
    />
  );
};

export default PressureChart;