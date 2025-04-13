// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import DashboardHeader from '../components/DashboardHeader';
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import AccuracyOverTimeChart from '../components/AccuracyOverTimeChart';
import UnforcedErrorChart from '../components/UnforcedErrorChart';
import { loadCSV, calculateKPIsForPlayer, loadManifest } from '../utils/dataHelpers';
import { usePlayer } from '../context/PlayerContext';
import PointsWonChart from '../components/PointsWonChart';
import PointsByScoreStanceChart from '../components/PointsByScoreStanceChart';
import ShotSpeedLineChart from '../components/ShotSpeedLineChart';

function Dashboard() {
  const { playerNames, setPlayerNames } = usePlayer();
  const [playerOptions, setPlayerOptions] = useState([]);
  const [selectedPlayer, setSelectedPlayer] = useState('Rasmus Kopperud Riis');
  const [kpis, setKpis] = useState(null);
  const [accuracyData, setAccuracyData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [pointsWonData, setPointsWonData] = useState([]);
  const [stanceWinData, setStanceWinData] = useState({});
  const [shotSpeedData, setShotSpeedData] = useState([]);

  useEffect(() => {
    const url = `${process.env.PUBLIC_URL}/data/2025-02-26/Shots-Table 1.csv`;

    loadCSV(url)
      .then((shotsData) => {
        const options = Array.from(new Set(shotsData.map(row => row.Player).filter(Boolean)));
        setPlayerOptions(options);
      })
      .catch((err) => console.error('Error loading CSV for options:', err));
  }, []);

  const handleChange = (e) => {
    setSelectedPlayer(e.target.value);
    if (e.target.value && playerOptions.length === 2) {
      const [playerA, playerB] = playerOptions;
      const otherName = e.target.value === "Rasmus Kopperud Riis" ? "Rikard Rykkvin" : "Rasmus Kopperud Riis";
      setPlayerNames({ host: e.target.value === "Rasmus Kopperud Riis" ? e.target.value : otherName, guest: e.target.value === "Rikard Rykkvin" ? e.target.value : otherName });
    }
  };

  useEffect(() => {
    if (!selectedPlayer) return;

    const loadAllSessions = async () => {
      try {
        const manifest = await loadManifest();
        const sessionFolders = manifest.sessions || [];
        const allSessionsShotsData = [];
        const computedAccuracyData = [];
        const computedErrorData = [];
        const computedPointsWonData = [];
        const computedShotSpeeds = [];
        const stanceMap = {};

        for (const session of sessionFolders) {
          let sessionShots = [];
          try {
            const shotsUrl = `${process.env.PUBLIC_URL}/data/${session}/Shots-Table 1.csv`;            
            sessionShots = await loadCSV(shotsUrl);
            allSessionsShotsData.push(sessionShots);
            let serveShots = 0, serveIn = 0, serveSpeed = 0;
            let forehandShots = 0, forehandIn = 0, forehandSpeed = 0;
            let backhandShots = 0, backhandIn = 0, backhandSpeed = 0;
            sessionShots.forEach((shot) => {
              if ((shot.Player && shot.Player.trim()) === selectedPlayer.trim()) {
                const speed = parseFloat(shot['Speed (KM/H)']) || 0;
                if (shot.Stroke && shot.Stroke.toLowerCase() === 'serve') {
                  serveShots++;
                  serveSpeed += speed;
                  if (shot.Result && shot.Result.toLowerCase() === 'in') serveIn++;
                }
                if (shot.Stroke && shot.Stroke.toLowerCase() === 'forehand') {
                  forehandShots++;
                  forehandSpeed += speed;
                  if (shot.Result && shot.Result.toLowerCase() === 'in') forehandIn++;
                }
                if (shot.Stroke && shot.Stroke.toLowerCase() === 'backhand') {
                  backhandShots++;
                  backhandSpeed += speed;
                  if (shot.Result && shot.Result.toLowerCase() === 'in') backhandIn++;
                }
              }
            });
            const serveAccuracy = serveShots > 0 ? (serveIn / serveShots) * 100 : 0;
            const forehandAccuracy = forehandShots > 0 ? (forehandIn / forehandShots) * 100 : 0;
            const backhandAccuracy = backhandShots > 0 ? (backhandIn / backhandShots) * 100 : 0;
            computedAccuracyData.push({ date: session, serveAccuracy, forehandAccuracy, backhandAccuracy });
            computedShotSpeeds.push({
              date: session,
              serveSpeed: serveShots > 0 ? serveSpeed / serveShots : 0,
              forehandSpeed: forehandShots > 0 ? forehandSpeed / forehandShots : 0,
              backhandSpeed: backhandShots > 0 ? backhandSpeed / backhandShots : 0,
            });
          } catch (err) {
            console.error(`Error loading Shots-Table for session ${session}:`, err);
          }

          try {
            const pointsUrl = `${process.env.PUBLIC_URL}/data/${session}/Points-Table 1.csv`;
            const sessionPoints = await loadCSV(pointsUrl);
            sessionPoints.forEach(row => {
              const hostScoreRaw = row["Host Game Score"]?.trim();
              const guestScoreRaw = row["Guest Game Score"]?.trim();
              const matchServer = row["Match Server"]?.trim()?.toLowerCase();
              const winner = row["Point Winner"]?.trim()?.toLowerCase();
              if (!hostScoreRaw || !guestScoreRaw || !winner || !matchServer) return;
              let stanceKey;
              if (matchServer === 'host') {
                stanceKey = `${hostScoreRaw}-${guestScoreRaw}`;
              } else if (matchServer === 'guest') {
                stanceKey = `${guestScoreRaw}-${hostScoreRaw}`;
              } else {
                return;
              }
              if (!stanceMap[stanceKey]) {
                stanceMap[stanceKey] = { host: 0, guest: 0 };
              }
              if (winner === 'host') {
                stanceMap[stanceKey].host += 1;
              } else if (winner === 'guest') {
                stanceMap[stanceKey].guest += 1;
              }
            });

            const HOST_NAME = "Rasmus Kopperud Riis";
            const GUEST_NAME = "Rikard Rykkvin";
            const totalHostShots = sessionShots.filter(row => row.Player === HOST_NAME && row.Stroke?.toLowerCase() !== 'serve').length;
            const totalGuestShots = sessionShots.filter(row => row.Player === GUEST_NAME && row.Stroke?.toLowerCase() !== 'serve').length;
            const totalPoints = sessionPoints.length;
            let pointsWon = 0;
            const isHost = selectedPlayer === HOST_NAME;
            sessionPoints.forEach(row => {
              const winner = row["Point Winner"]?.toLowerCase();
              if ((isHost && winner === "host") || (!isHost && winner === "guest")) {
                pointsWon++;
              }
            });
            const pointsWonRate = totalPoints > 0 ? pointsWon / totalPoints : 0;
            computedPointsWonData.push({ date: session, rate: pointsWonRate });

            let hostErrors = 0, guestErrors = 0;
            sessionPoints.forEach(row => {
              const detail = row.Detail?.toLowerCase() || '';
              const winner = row["Point Winner"]?.toLowerCase();
              if (detail.includes("error")) {
                if (winner === "guest") hostErrors++;
                if (winner === "host") guestErrors++;
              }
            });
            computedErrorData.push({ date: session, hostRate: totalHostShots > 0 ? hostErrors / totalHostShots : 0, guestRate: totalGuestShots > 0 ? guestErrors / totalGuestShots : 0 });
          } catch (err) {
            console.error(`Error loading Points-Table for session ${session}:`, err);
          }
        }

        const calculatedKpis = await calculateKPIsForPlayer(selectedPlayer, allSessionsShotsData);
        setKpis(calculatedKpis);
        setAccuracyData(computedAccuracyData);
        setErrorData(computedErrorData);
        setPointsWonData(computedPointsWonData);
        setShotSpeedData(computedShotSpeeds);

        const stanceData = {};
        Object.entries(stanceMap).forEach(([key, counts]) => {
          const total = counts.host + counts.guest;
          if (total > 0) {
            stanceData[key] = {
              hostPct: counts.host / total,
              guestPct: counts.guest / total
            };
          }
        });
        setStanceWinData(stanceData);

      } catch (err) {
        console.error('Error loading sessions:', err);
      }
    };

    loadAllSessions();
  }, [selectedPlayer]);

  if (!kpis) {
    return <div className="p-4 text-black">Loading Dashboard...</div>;
  }

  return (
    <div style={{ backgroundColor: '#fdf0d5', minHeight: '100vh' }}>
      <div className="p-4 flex justify-center" style={{ backgroundColor: '#fdf0d5', borderBottom: '2px solid #000' }}>
        <select className="p-2 rounded" style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #000' }} value={selectedPlayer} onChange={handleChange}>
          <option value="">Who are you?</option>
          {playerOptions.map((name) => (
            <option key={name} value={name}>{name}</option>
          ))}
        </select>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <KPICard title="Avg Serve Speed" value={`${kpis.averageServeSpeed.toFixed(2)} km/h`} />
          <KPICard title="Serve Accuracy" value={`${kpis.serveAccuracy.toFixed(2)}%`} />
          <KPICard title="Avg Forehand Speed" value={`${kpis.averageForehandSpeed.toFixed(2)} km/h`} />
          <KPICard title="Avg Backhand Speed" value={`${kpis.averageBackhandSpeed.toFixed(2)} km/h`} />
          <KPICard title="Forehand Accuracy" value={`${kpis.forehandAccuracy.toFixed(2)}%`} />
          <KPICard title="Backhand Accuracy" value={`${kpis.backhandAccuracy.toFixed(2)}%`} />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ChartCard description="Accuracy over sessions. Calculating the ratio of strokes in over the total shots made">
            <AccuracyOverTimeChart chartData={accuracyData} />
          </ChartCard>
          <ChartCard description="Unforced error rate (forehand & backhand) per session">
            <UnforcedErrorChart errorData={errorData} />
          </ChartCard>
          <ChartCard description="Percentage of points won per session">
            <PointsWonChart data={pointsWonData} />
          </ChartCard>
          <ChartCard description="Win % by score stance. The % is alwasy calculated from the standpoint of Rasmus in regard of the score">
            <PointsByScoreStanceChart stanceData={stanceWinData} />
          </ChartCard>
          <ChartCard description="Shot speed over time">
            <ShotSpeedLineChart speedData={shotSpeedData} />
          </ChartCard>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
