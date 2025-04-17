// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';

// ---------------------------
// 1) IMPORT YOUR NEW CHART
// ---------------------------
// import MyNewChart from '../components/MyNewChart';
// (Add any additional imports for new charts here)
import KPICard from '../components/KPICard';
import ChartCard from '../components/ChartCard';
import AccuracyOverTimeChart from '../components/AccuracyOverTimeChart';
import UnforcedErrorChart from '../components/UnforcedErrorChart';
import PointsWonChart from '../components/PointsWonChart';
import PointsByScoreStanceChart from '../components/PointsByScoreStanceChart';
import ShotSpeedLineChart from '../components/ShotSpeedLineChart';
import StackedPointsWonChart from '../components/StackedPointsWonChart';
import PressureChart from '../components/PressureChart';

// Importing helper functions that load CSV data, calculate KPIs and load manifest information
import { loadCSV, calculateKPIsForPlayer, loadManifest } from '../utils/dataHelpers';
// Importing player context to manage state for selected players
import { usePlayer } from '../context/PlayerContext';

function Dashboard() {
  // Using the PlayerContext to access and set player names
  const { playerNames, setPlayerNames } = usePlayer();
  
  // Local state: list of players available based on CSV data
  const [playerOptions, setPlayerOptions] = useState([]);
  // Local state: currently selected player (default value given)
  const [selectedPlayer, setSelectedPlayer] = useState('Rasmus Kopperud Riis');
  // Local state: Key Performance Indicators for the selected player
  const [kpis, setKpis] = useState(null);

  // ---------------------------
  // 2) STATE FOR YOUR NEW CHART
  // ---------------------------
  // const [myNewChartData, setMyNewChartData] = useState([]);
  // (Add additional useState calls here for new charts)

  // Local states for various data points required for charts
  const [accuracyData, setAccuracyData] = useState([]);
  const [errorData, setErrorData] = useState([]);
  const [pointsWonData, setPointsWonData] = useState([]);
  const [stanceWinData, setStanceWinData] = useState({});
  const [shotSpeedData, setShotSpeedData] = useState([]);
  const [stackedPointsData, setStackedPointsData] = useState([]);
  const [pressureBySession, setPressureBySession] = useState([]);

  // --------
  // (Additional state variables go here)
  // --------

  // useEffect to load CSV file containing Shots-Table data on initial render.
  useEffect(() => {
    const url = `${process.env.PUBLIC_URL}/data/2025-02-26/Shots-Table 1.csv`;
    loadCSV(url)
      .then((shotsData) => {
        const options = Array.from(new Set(shotsData.map(row => row.Player).filter(Boolean)));
        setPlayerOptions(options);
      })
      .catch((err) => console.error('Error loading CSV for options:', err));
  }, []);

  // Handler for when the player is changed via the dropdown
  const handleChange = (e) => {
    setSelectedPlayer(e.target.value);
    if (e.target.value && playerOptions.length === 2) {
      const [playerA, playerB] = playerOptions;
      const otherName = e.target.value === "Rasmus Kopperud Riis" ? "Rikard Rykkvin" : "Rasmus Kopperud Riis";
      setPlayerNames({
        host: e.target.value === "Rasmus Kopperud Riis" ? e.target.value : otherName,
        guest: e.target.value === "Rikard Rykkvin" ? e.target.value : otherName
      });
    }
  };

  // useEffect to load session data every time the selected player changes.
  useEffect(() => {
    if (!selectedPlayer) return;

    const loadAllSessions = async () => {
      try {
        // Load manifest containing session folders.
        const manifest = await loadManifest();
        const sessionFolders = manifest.sessions || [];

        // We'll accumulate data for both existing and new charts here.
        const gameStatsBoth = {};
        const allSessionsShotsData = [];
        const computedAccuracyData = [];
        const computedErrorData = [];
        const computedPointsWonData = [];
        const computedShotSpeeds = [];
        const stanceMap = {};
        const computedBySession = []


        // ---------------------------
        // 3) LOAD & PROCESS NEW CHART DATA
        // ---------------------------
        // Example: if you need another CSV or table
        // const myOtherTableData = [];
        // const computedMyNewChartData = [];

        for (const session of sessionFolders) {
          let sessionShots = [];
          try {
            // Load Shots data.
            const shotsUrl = `${process.env.PUBLIC_URL}/data/${session}/Shots-Table 1.csv`;
            sessionShots = await loadCSV(shotsUrl);
            allSessionsShotsData.push(sessionShots);

            // Process shots for accuracy and speed KPIs.
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
            const serveAccuracy   = serveShots > 0 ? (serveIn / serveShots) * 100 : 0;
            const forehandAccuracy= forehandShots > 0 ? (forehandIn / forehandShots) * 100 : 0;
            const backhandAccuracy= backhandShots > 0 ? (backhandIn / backhandShots) * 100 : 0;
            computedAccuracyData.push({ date: session, serveAccuracy, forehandAccuracy, backhandAccuracy });
            computedShotSpeeds .push({
              date: session,
              serveSpeed: serveShots > 0 ? serveSpeed / serveShots : 0,
              forehandSpeed: forehandShots > 0 ? forehandSpeed / forehandShots : 0,
              backhandSpeed: backhandShots > 0 ? backhandSpeed / backhandShots : 0,
            });

            // ---------------------------
            // Example new-chart computation:
            // const someValue = computeSomething(sessionShots);
            // computedMyNewChartData.push({ date: session, value: someValue });

          } catch (err) {
            console.error(`Error loading Shots-Table for session ${session}:`, err);
          }

          try {
            // Load Points data.
            const pointsUrl = `${process.env.PUBLIC_URL}/data/${session}/Points-Table 1.csv`;
            const sessionPoints = await loadCSV(pointsUrl);

            // Existing stance data logic…
            sessionPoints.forEach(row => {
              const hostScoreRaw    = row["Host Game Score"]?.trim();
              const guestScoreRaw   = row["Guest Game Score"]?.trim();
              const matchServer     = row["Match Server"]?.trim()?.toLowerCase();
              const winner          = row["Point Winner"]?.trim()?.toLowerCase();
              if (!hostScoreRaw || !guestScoreRaw || !winner || !matchServer) return;
              let stanceKey;
              if (matchServer === 'host')   stanceKey = `${hostScoreRaw}-${guestScoreRaw}`;
              else if (matchServer === 'guest') stanceKey = `${guestScoreRaw}-${hostScoreRaw}`;
              if (!stanceMap[stanceKey]) stanceMap[stanceKey] = { host: 0, guest: 0 };
              if (winner === 'host')   stanceMap[stanceKey].host++;
              else if (winner === 'guest') stanceMap[stanceKey].guest++;
            });

            // Points won & error rate logic…
            const HOST_NAME = "Rasmus Kopperud Riis";
            const GUEST_NAME= "Rikard Rykkvin";
            const totalHostShots  = sessionShots.filter(r => r.Player === HOST_NAME && r.Stroke?.toLowerCase() !== 'serve').length;
            const totalGuestShots = sessionShots.filter(r => r.Player === GUEST_NAME && r.Stroke?.toLowerCase() !== 'serve').length;
            let pointsWon = 0;
            const isHost = selectedPlayer === HOST_NAME;
            sessionPoints.forEach(row => {
              const w = row["Point Winner"]?.trim()?.toLowerCase();
              if ((isHost && w === 'host') || (!isHost && w === 'guest')) pointsWon++;
            });
            const rate = sessionPoints.length > 0 ? pointsWon / sessionPoints.length : 0;
            computedPointsWonData.push({ date: session, rate });

            // Game stats both…
            sessionPoints.forEach(row => {
              const game = row.Game;
              if (!game) return;
              if (!gameStatsBoth[game]) gameStatsBoth[game] = { total: 0, rasmus: 0, rikard: 0 };
              gameStatsBoth[game].total++;
              const w = row["Point Winner"]?.trim()?.toLowerCase();
              if (w === 'host')   gameStatsBoth[game].rasmus++;
              else if (w === 'guest') gameStatsBoth[game].rikard++;
            });

            // Unforced error calculation…
            let hostErrors = 0, guestErrors = 0;
            sessionPoints.forEach(row => {
              const detail = row.Detail?.toLowerCase() || '';
              const w = row["Point Winner"]?.trim()?.toLowerCase();
              if (detail.includes('error')) {
                if (w === 'guest') hostErrors++;
                if (w === 'host') guestErrors++;
              }
            });
            computedErrorData.push({
              date: session,
              hostRate : totalHostShots > 0 ? hostErrors / totalHostShots : 0,
              guestRate: totalGuestShots> 0 ? guestErrors / totalGuestShots: 0
            });

            // Compute clutch per point
            let sessionCum = 0;
            const sessionPointsArray = [];
            sessionPoints.forEach(row => {
              const winner = row["Point Winner"]?.trim()?.toLowerCase();
              const HOST_NAME = "Rasmus Kopperud Riis";
              // didWin = true if selectedPlayer wins this point
              const didWin = (selectedPlayer === HOST_NAME && winner === "host")
                           || (selectedPlayer !== HOST_NAME && winner === "guest");
              sessionCum += didWin ? 1 : -1;
              sessionPointsArray.push({ x: Number(row.Point), y: sessionCum });
            });
            computedBySession.push({
              session,
              points: sessionPointsArray
            });

          } catch (err) {
            console.error(`Error loading Points-Table for session ${session}:`, err);
          }
        } // end sessions loop

        // Convert gameStatsBoth for stacked chart…
        const computedStackedData=
          Object.entries(gameStatsBoth)
            .map(([game, stats]) => ({
              game: parseInt(game, 10),
              rasmus: stats.total>0? (stats.rasmus/ stats.total)*100:0,
              rikard: stats.total>0? (stats.rikard/ stats.total)*100:0
            }))
            .sort((a,b)=> a.game- b.game);

        // ----------------------------------------
        // 4) SET STATE FOR YOUR NEW CHART BELOW
        // ----------------------------------------
        // setMyNewChartData(computedMyNewChartData);

        // existing chart state updates
        setAccuracyData(computedAccuracyData);
        setErrorData(computedErrorData);
        setPointsWonData(computedPointsWonData);
        setShotSpeedData(computedShotSpeeds);
        setStackedPointsData(computedStackedData);
        setPressureBySession(computedBySession);


        // Calculate overall KPIs
        const calculatedKpis = await calculateKPIsForPlayer(selectedPlayer, allSessionsShotsData);
        setKpis(calculatedKpis);

        // Set stance win data
        const stanceData = {};
        Object.entries(stanceMap).forEach(([key, counts]) => {
          const total = counts.host + counts.guest;
          if (total > 0) stanceData[key] = { hostPct: counts.host/ total, guestPct: counts.guest / total };
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
      {/* Top section with player selection dropdown */}
      <div className="p-4 flex justify-center" style={{ backgroundColor: '#fdf0d5', borderBottom: '2px solid #000' }}>
        <select
          className="p-2 rounded"
          style={{ backgroundColor: '#fff', color: '#000', border: '1px solid #000' }}
          value={selectedPlayer}
          onChange={handleChange}
        >
          <option value="">Who are you?</option>
          {playerOptions.map(name => (<option key={name} value={name}>{name}</option>))}
        </select>
      </div>

      {/* Main Dashboard Content */}
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
          <ChartCard description="Win % by score stance. Calculated from Rasmus' perspective">
            <PointsByScoreStanceChart stanceData={stanceWinData} />
          </ChartCard>
          <ChartCard description="Shot speed over time">
            <ShotSpeedLineChart speedData={shotSpeedData} />
          </ChartCard>
          <ChartCard description="Stacked Points Won Per Game (Percentage). Shows how Rasmus and Rikard performed in each game">
            <StackedPointsWonChart data={stackedPointsData} />
          </ChartCard>
          <ChartCard description="X axis: Point Index, Y axis: Cumulative Clutch Score (+1 for win, –1 for loss).
                                  Colored lines show your running clutch score over your three most recent sessions; the bold dashed line is a LOESS‑smoothed trend of your average performance across all sessions. Rising slopes mean you’re gaining score momentum, while dips shows lost momentum. Click any date to show or hide that session.">
          <PressureChart dataBySession={pressureBySession} />
        </ChartCard>

          {/* --------------------------------------------------- */}
          {/* 5) ADD YOUR NEW CHARTCARD HERE IN THE GRID BELOW: */}
          {/* --------------------------------------------------- */}
          {/*
          <ChartCard description="Describe what your new chart shows">
            <MyNewChart data={myNewChartData} />
          </ChartCard>
          */}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
