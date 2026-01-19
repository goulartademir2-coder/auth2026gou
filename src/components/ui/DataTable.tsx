'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface DataTableProps<T> {
    columns: {
        key: string;
        header: string;
        render?: (item: T) => ReactNode;
        width?: string;
    }[];
    data: T[];
    onRowClick?: (item: T) => void;
    keyExtractor: (item: T) => string;
    loading?: boolean;
}

export default function DataTable<T>({
    columns,
    data,
    onRowClick,
    keyExtractor,
    loading = false
}: DataTableProps<T>) {
    if (loading) {
        return (
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            {columns.map((col) => (
                                <th key={col.key} style={{ width: col.width }}>{col.header}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(5)].map((_, i) => (
                            <tr key={i}>
                                {columns.map((col) => (
                                    <td key={col.key}>
                                        <div className="skeleton" style={{ height: '20px', width: '80%' }} />
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
                <style jsx>{`
          .table-container {
            overflow-x: auto;
            border-radius: var(--radius-lg);
            background: var(--color-bg-card);
            border: 1px solid var(--color-border);
          }

          .table {
            width: 100%;
            border-collapse: collapse;
          }

          .table th {
            padding: 16px;
            text-align: left;
            font-size: 0.75rem;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            color: var(--color-text-muted);
            border-bottom: 1px solid var(--color-border);
          }

          .table td {
            padding: 16px;
            font-size: 0.875rem;
            border-bottom: 1px solid var(--color-border);
          }

          .skeleton {
            background: linear-gradient(90deg, var(--color-bg-tertiary) 0%, var(--color-bg-hover) 50%, var(--color-bg-tertiary) 100%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite;
            border-radius: 4px;
          }

          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
        `}</style>
            </div>
        );
    }

    return (
        <div className="table-container">
            <table className="table">
                <thead>
                    <tr>
                        {columns.map((col) => (
                            <th key={col.key} style={{ width: col.width }}>{col.header}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((item, index) => (
                        <motion.tr
                            key={keyExtractor(item)}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => onRowClick?.(item)}
                            className={onRowClick ? 'clickable' : ''}
                        >
                            {columns.map((col) => (
                                <td key={col.key}>
                                    {col.render
                                        ? col.render(item)
                                        : (item as any)[col.key]
                                    }
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>

            {data.length === 0 && (
                <div className="empty-state">
                    <p>Nenhum registro encontrado</p>
                </div>
            )}

            <style jsx>{`
        .table-container {
          overflow-x: auto;
          border-radius: var(--radius-lg);
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
        }

        .table {
          width: 100%;
          border-collapse: collapse;
        }

        .table th {
          padding: 16px;
          text-align: left;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--color-text-muted);
          border-bottom: 1px solid var(--color-border);
          white-space: nowrap;
        }

        .table td {
          padding: 16px;
          font-size: 0.875rem;
          border-bottom: 1px solid var(--color-border);
          color: var(--color-text-secondary);
        }

        .table tr:last-child td {
          border-bottom: none;
        }

        .table tbody tr {
          transition: background var(--transition-fast);
        }

        .table tbody tr:hover {
          background: var(--color-bg-hover);
        }

        .table tbody tr.clickable {
          cursor: pointer;
        }

        .empty-state {
          padding: 48px;
          text-align: center;
          color: var(--color-text-muted);
        }
      `}</style>
        </div>
    );
}
