'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
    icon: LucideIcon;
    label: string;
    value: string | number;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color?: 'purple' | 'blue' | 'green' | 'pink';
    index?: number;
}

const colorMap = {
    purple: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    blue: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
    green: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    pink: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)'
};

export default function StatsCard({ icon: Icon, label, value, trend, color = 'purple', index = 0 }: StatsCardProps) {
    return (
        <motion.div
            className="stats-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
        >
            <div className="stats-header">
                <motion.div
                    className="stats-icon"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    style={{ background: colorMap[color] }}
                >
                    <Icon size={22} />
                </motion.div>
                {trend && (
                    <div className={`trend ${trend.isPositive ? 'positive' : 'negative'}`}>
                        {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                    </div>
                )}
            </div>

            <motion.div
                className="stats-value"
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ delay: index * 0.1 + 0.2, type: 'spring', stiffness: 200 }}
            >
                {typeof value === 'number' ? value.toLocaleString() : value}
            </motion.div>

            <div className="stats-label">{label}</div>

            <div className="stats-glow" style={{ background: colorMap[color] }} />

            <style jsx>{`
        .stats-card {
          position: relative;
          padding: 24px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          overflow: hidden;
          transition: border-color var(--transition-fast);
        }

        .stats-card:hover {
          border-color: var(--color-border-hover);
        }

        .stats-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .stats-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: var(--radius-md);
          color: white;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }

        .trend {
          font-size: 0.75rem;
          font-weight: 600;
          padding: 4px 8px;
          border-radius: var(--radius-full);
        }

        .trend.positive {
          background: rgba(16, 185, 129, 0.15);
          color: #34D399;
        }

        .trend.negative {
          background: rgba(239, 68, 68, 0.15);
          color: #F87171;
        }

        .stats-value {
          font-size: 2.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          line-height: 1.2;
        }

        .stats-label {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-top: 4px;
        }

        .stats-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          opacity: 0.8;
        }
      `}</style>
        </motion.div>
    );
}
