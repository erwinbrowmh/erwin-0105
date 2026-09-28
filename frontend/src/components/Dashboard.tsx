import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DonutChart from './DonutChart';
import RaceBarChart from './RaceBarChart';
import SnailPayModal from './SnailPayModal';
import type { BetStats, SnailRaceStats } from '../types';

// ─── Simulated data — coherent with 6 snails, 6 races ────────────────────────
const BET_STATS: BetStats = { won: 14, lost: 9 };

const RACE_STATS: SnailRaceStats[] = [
  { name: 'Turbo', wins: 2 },
  { name: 'Baba', wins: 1 },
  { name: 'Relámpago', wins: 1 },
  { name: 'Viscoso', wins: 1 },
  { name: 'Lentilla', wins: 0 },
  { name: 'Max', wins: 1 },
];

const Dashboard: React.FC = () => {
  const { session, balance, logout } = useAuth();
  const [showPay, setShowPay] = useState(false);

  if (!session) return null;

  const firstName = session.fullName.split(' ')[0];

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dashboard-header">
        <div className="header-brand">
          <span className="snail-logo">🐌</span>
          <span className="brand-text">SnailRace</span>
        </div>
        <div className="header-right">
          <div className="balance-pill">
            <span className="balance-label">Saldo</span>
            <span className="balance-amount">${balance.toFixed(2)}</span>
          </div>
          <button id="btn-logout" className="btn-outline" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="dashboard-main">
        {/* Welcome */}
        <section className="welcome-section">
          <div>
            <h1 className="welcome-title">¡Hola, {firstName}! 👋</h1>
            <p className="welcome-sub">Bienvenido a tu panel de SnailRace</p>
          </div>
          <button
            id="btn-deposit"
            className="btn-primary btn-deposit"
            onClick={() => setShowPay(true)}
          >
            💳 Cargar saldo
          </button>
        </section>

        {/* Stats cards */}
        <section className="stats-row">
          <div className="stat-card">
            <span className="stat-icon">🏆</span>
            <div>
              <p className="stat-label">Apuestas ganadas</p>
              <p className="stat-value">{BET_STATS.won}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">💸</span>
            <div>
              <p className="stat-label">Apuestas perdidas</p>
              <p className="stat-value">{BET_STATS.lost}</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🐌</span>
            <div>
              <p className="stat-label">Caracol favorito</p>
              <p className="stat-value">Turbo</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🏁</span>
            <div>
              <p className="stat-label">Carreras del día</p>
              <p className="stat-value">6</p>
            </div>
          </div>
        </section>

        {/* Charts */}
        <section className="charts-grid">
          <DonutChart stats={BET_STATS} />
          <RaceBarChart stats={RACE_STATS} />
        </section>
      </main>

      {/* ── SnailPay modal ── */}
      {showPay && <SnailPayModal onClose={() => setShowPay(false)} />}
    </div>
  );
};

export default Dashboard;
