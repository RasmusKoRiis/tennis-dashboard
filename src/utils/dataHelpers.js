// src/utils/dataHelpers.js

import Papa from 'papaparse';

// Load a CSV file from a given URL.
export function loadCSV(url) {
  return new Promise((resolve, reject) => {
    Papa.parse(url, {
      download: true,
      header: true,
      complete: (results) => resolve(results.data),
      error: (err) => reject(err)
    });
  });
}

// Load the manifest file listing all session folders.
export function loadManifest() {
  return fetch('/data/dataManifest.json').then((res) => res.json());
}

// Calculate KPIs from an array of session CSV data (Shots-Table 1).
export async function calculateKPIsForPlayer(playerName, sessionsShotsData) {
  let totalServeSpeed = 0;
  let serveCount = 0;
  let totalForehandSpeed = 0;
  let forehandCount = 0;
  let totalBackhandSpeed = 0;
  let backhandCount = 0;
  let serveInCount = 0;
  let totalServeShots = 0;
  let forehandInCount = 0;
  let totalForehandShots = 0;
  let backhandInCount = 0;
  let totalBackhandShots = 0;

  sessionsShotsData.forEach((sessionData) => {
    sessionData.forEach((shot) => {
      // Trim the player string in case of extra spaces
      if ((shot.Player && shot.Player.trim()) === playerName.trim()) {
        const speed = parseFloat(shot['Speed (KM/H)']) || 0;
        const result = shot.Result;
        if (shot.Stroke && shot.Stroke.toLowerCase() === 'serve') {
          totalServeShots++;
          if (speed > 0) {
            totalServeSpeed += speed;
            serveCount++;
          }
          if (result === 'In') {
            serveInCount++;
          }
        }
        if (shot.Stroke && shot.Stroke.toLowerCase() === 'forehand') {
          totalForehandShots++;
          if (speed > 0) {
            totalForehandSpeed += speed;
            forehandCount++;
          }
          if (result === 'In') {
            forehandInCount++;
          }
        }
        if (shot.Stroke && shot.Stroke.toLowerCase() === 'backhand') {
          totalBackhandShots++;
          if (speed > 0) {
            totalBackhandSpeed += speed;
            backhandCount++;
          }
          if (result === 'In') {
            backhandInCount++;
          }
        }
      }
    });
  });

  const averageServeSpeed = serveCount > 0 ? (totalServeSpeed / serveCount) : 0;
  const serveAccuracy = totalServeShots > 0 ? (serveInCount / totalServeShots) * 100 : 0;
  const averageForehandSpeed = forehandCount > 0 ? (totalForehandSpeed / forehandCount) : 0;
  const forehandAccuracy = totalForehandShots > 0 ? (forehandInCount / totalForehandShots) * 100 : 0;
  const averageBackhandSpeed = backhandCount > 0 ? (totalBackhandSpeed / backhandCount) : 0;
  const backhandAccuracy = totalBackhandShots > 0 ? (backhandInCount / totalBackhandShots) * 100 : 0;

  return {
    averageServeSpeed,
    serveAccuracy,
    averageForehandSpeed,
    forehandAccuracy,
    averageBackhandSpeed,
    backhandAccuracy,
  };
}
