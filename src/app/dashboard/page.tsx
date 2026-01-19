'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import StatsCard from '@/components/ui/StatsCard';
import DataTable from '@/components/ui/DataTable';
import { Users, Key, Box, Activity, TrendingUp, Clock, UserCheck, ShieldCheck } from 'lucide-react';

// Chart component with animation
function MiniChart({ data, color }: { data: number[], color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  return (
    <div className="mini-chart">
      <svg viewBox="0 0 100 40" preserveAspectRatio="none">
        <defs>
          <linearGradient id={`chartGrad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>

        <motion.path
          d={`M 0 40 ${data.map((d, i) =>
            `L ${(i / (data.length - 1)) * 100} ${40 - ((d - min) / range) * 35}`
          ).join(' ')} L 100 40 Z`}
          fill={`url(#chartGrad-${color})`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        />

        <motion.path
          d={`M 0 ${40 - ((data[0] - min) / range) * 35} ${data.map((d, i) =>
            `L ${(i / (data.length - 1)) * 100} ${40 - ((d - min) / range) * 35}`
          ).join(' ')}`}
          stroke={color}
          strokeWidth="2"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: 0.3 }}
        />
      </svg>

      <style jsx>{`
        .mini-chart {
          height: 60px;
          width: 100%;
        }

        svg {
          width: 100%;
          height: 100%;
        }
      `}</style>
    </div>
  );
}

// Activity item component
function ActivityItem({ icon: Icon, title, description, time, color }: any) {
  return (
    <motion.div
      className="activity-item"
      whileHover={{ x: 4 }}
    >
      <div className="activity-icon" style={{ background: color }}>
        <Icon size={16} />
      </div>
      <div className="activity-content">
        <p className="activity-title">{title}</p>
        <p className="activity-desc">{description}</p>
      </div>
      <span className="activity-time">{time}</span>

      <style jsx>{`
        .activity-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: var(--radius-md);
          transition: background var(--transition-fast);
        }

        .activity-item:hover {
          background: var(--color-bg-hover);
        }

        .activity-icon {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: white;
          flex-shrink: 0;
        }

        .activity-content {
          flex: 1;
          min-width: 0;
        }

        .activity-title {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .activity-desc {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .activity-time {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          flex-shrink: 0;
        }
      `}</style>
    </motion.div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState({
    users: 0,
    keys: 0,
    apps: 0,
    online: 0
  });
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, usersRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/users?limit=5')
        ]);

        const statsData = await statsRes.json();
        const usersData = await usersRes.json();

        if (statsData.success) {
          setStats({
            users: statsData.data.stats.users,
            keys: statsData.data.stats.keys,
            apps: statsData.data.stats.apps,
            online: statsData.data.stats.activeSessions
          });

          // Map activities from login logs
          const mappedActivities = statsData.data.recentActivity.map((log: any) => ({
            icon: log.success ? ShieldCheck : Activity,
            title: log.success ? 'Login bem-sucedido' : 'Tentativa de login',
            description: `${log.user} fez login via IP ${log.ip}`,
            time: new Date(log.time).toLocaleTimeString(), // Simplified time
            color: log.success ? 'linear-gradient(135deg, #3B82F6, #2563EB)' : 'linear-gradient(135deg, #EF4444, #DC2626)'
          }));
          setActivities(mappedActivities);
        }

        if (usersData.success) {
          setRecentUsers(usersData.data.users);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const chartData = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // Keeping static for now or can be derived from logs

  return (
    <>
      <Header title="Dashboard" subtitle="Bem-vindo de volta, Admin" />

      <div className="dashboard-content">
        {/* Stats Grid */}
        <div className="stats-grid">
          <StatsCard
            icon={Users}
            label="Total de Usuários"
            value={stats.users}
            trend={{ value: 12, isPositive: true }}
            color="purple"
            index={0}
          />
          <StatsCard
            icon={Key}
            label="Keys Ativas"
            value={stats.keys}
            trend={{ value: 8, isPositive: true }}
            color="blue"
            index={1}
          />
          <StatsCard
            icon={Box}
            label="Apps Ativos"
            value={stats.apps}
            color="green"
            index={2}
          />
          <StatsCard
            icon={Activity}
            label="Usuários Online"
            value={stats.online}
            trend={{ value: 5, isPositive: false }}
            color="pink"
            index={3}
          />
        </div>

        {/* Charts Row */}
        <div className="charts-row">
          <motion.div
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="chart-header">
              <h3>Logins por Dia</h3>
              <div className="chart-badge">
                <TrendingUp size={14} />
                <span>+23% esta semana</span>
              </div>
            </div>
            <MiniChart data={chartData} color="#8B5CF6" />
          </motion.div>

          <motion.div
            className="chart-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="chart-header">
              <h3>Keys Ativadas</h3>
              <div className="chart-badge green">
                <TrendingUp size={14} />
                <span>+15% esta semana</span>
              </div>
            </div>
            <MiniChart data={[5, 8, 12, 10, 15, 20, 18, 25, 22, 30, 28, 35]} color="#10B981" />
          </motion.div>
        </div>

        {/* Content Row */}
        <div className="content-row">
          {/* Recent Users */}
          <motion.div
            className="content-card users-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="card-header">
              <h3>Usuários Recentes</h3>
              <a href="/dashboard/users" className="view-all">Ver todos →</a>
            </div>
            <DataTable
              columns={[
                { key: 'username', header: 'Usuário' },
                { key: 'email', header: 'Email' },
                {
                  key: 'status',
                  header: 'Status',
                  render: (item: any) => (
                    <span className={`badge badge-${item.status === 'active' ? 'success' : item.status === 'banned' ? 'danger' : 'warning'}`}>
                      {item.status === 'active' ? 'Ativo' : item.status === 'banned' ? 'Banido' : 'Expirado'}
                    </span>
                  )
                },
                { key: 'createdAt', header: 'Criado em' }
              ]}
              data={recentUsers}
              keyExtractor={(item) => item.id}
            />
          </motion.div>

          {/* Activity Feed */}
          <motion.div
            className="content-card activity-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <div className="card-header">
              <h3>Atividade Recente</h3>
              <Clock size={16} className="header-icon" />
            </div>
            <div className="activity-list">
              {activities.map((activity, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                >
                  <ActivityItem {...activity} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      <style jsx>{`
        .dashboard-content {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
        }

        .charts-row {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }

        .chart-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: 20px;
        }

        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .chart-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .chart-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #A78BFA;
          background: rgba(139, 92, 246, 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .chart-badge.green {
          color: #34D399;
          background: rgba(16, 185, 129, 0.1);
        }

        .content-row {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
        }

        .content-card {
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .card-header h3 {
          font-size: 1rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .view-all {
          font-size: 0.813rem;
          color: var(--color-primary);
          text-decoration: none;
          transition: color var(--transition-fast);
        }

        .view-all:hover {
          color: var(--color-primary-light);
        }

        .header-icon {
          color: var(--color-text-muted);
        }

        .activity-list {
          padding: 8px;
        }

        @media (max-width: 1200px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .content-row {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .dashboard-content {
            padding: 16px;
          }

          .stats-grid,
          .charts-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
