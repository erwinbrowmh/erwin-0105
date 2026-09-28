import React from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import type { BetStats } from '../types';

interface Props {
  stats: BetStats;
}

const COLORS = ['#7c5cfc', '#f97316'];

const DonutChart: React.FC<Props> = ({ stats }) => {
  const data = [
    { name: 'Ganadas', value: stats.won },
    { name: 'Perdidas', value: stats.lost },
  ];

  return (
    <div className="chart-card">
      <h3 className="chart-title">Apuestas</h3>
      <p className="chart-subtitle">Resultados simulados del día</p>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={95}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: '#1e1b2e', border: '1px solid #3d3a5c', borderRadius: 8 }}
            labelStyle={{ color: '#e2e0f0' }}
            itemStyle={{ color: '#a89fe8' }}
          />
          <Legend wrapperStyle={{ color: '#a89fe8', fontSize: 13 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="chart-stats-row">
        <span className="stat-badge won">✓ {stats.won} Ganadas</span>
        <span className="stat-badge lost">✗ {stats.lost} Perdidas</span>
      </div>
    </div>
  );
};

export default DonutChart;
