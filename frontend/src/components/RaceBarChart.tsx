import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import type { SnailRaceStats } from '../types';

interface Props {
  stats: SnailRaceStats[];
}

const BAR_COLORS = ['#7c5cfc', '#a78bfa', '#818cf8', '#6366f1', '#c4b5fd', '#ddd6fe'];

const RaceBarChart: React.FC<Props> = ({ stats }) => {
  return (
    <div className="chart-card">
      <h3 className="chart-title">Victorias por Caracol</h3>
      <p className="chart-subtitle">6 carreras simuladas hoy</p>
      <ResponsiveContainer width="100%" height={240}>
        <BarChart data={stats} margin={{ top: 10, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#2d2b45" />
          <XAxis dataKey="name" tick={{ fill: '#a89fe8', fontSize: 12 }} />
          <YAxis tick={{ fill: '#a89fe8', fontSize: 12 }} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: '#1e1b2e', border: '1px solid #3d3a5c', borderRadius: 8 }}
            labelStyle={{ color: '#e2e0f0' }}
            itemStyle={{ color: '#a89fe8' }}
          />
          <Bar dataKey="wins" name="Victorias" radius={[6, 6, 0, 0]}>
            {stats.map((_, index) => (
              <Cell key={`bar-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RaceBarChart;
