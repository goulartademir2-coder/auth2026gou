'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Ban, Unlock, RotateCcw, Trash2, Filter, Download } from 'lucide-react';

export default function UsersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBanModal, setShowBanModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);

  const fetchUsers = async (page = 1, search = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users?page=${page}&limit=10&search=${search}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.data.users);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(1, searchQuery);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      fetchUsers(newPage, searchQuery);
    }
  };

  const columns = [
    {
      key: 'username',
      header: 'Usuário',
      render: (item: any) => (
        <div className="user-cell">
          <div className="user-avatar">
            {item.username.charAt(0).toUpperCase()}
          </div>
          <div className="user-info">
            <span className="user-name">{item.username}</span>
            <span className="user-email">{item.email}</span>
          </div>
        </div>
      )
    },
    {
      key: 'hwid',
      header: 'HWID',
      render: (item: any) => (
        <span className="hwid-cell">{item.hwid || '—'}</span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      render: (item: any) => (
        <span className={`badge badge-${item.status === 'active' ? 'success' : item.status === 'banned' ? 'danger' : 'warning'}`}>
          {item.status === 'active' ? 'Ativo' : item.status === 'banned' ? 'Banido' : 'Expirado'}
        </span>
      )
    },
    { key: 'expiresAt', header: 'Expira em' },
    {
      key: 'loginCount',
      header: 'Logins',
      render: (item: any) => (
        <span className="login-count">{item.loginCount}</span>
      )
    },
    {
      key: 'actions',
      header: 'Ações',
      render: (item: any) => (
        <div className="actions-cell">
          <motion.button
            className="action-btn"
            title="Resetar HWID"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <RotateCcw size={16} />
          </motion.button>
          <motion.button
            className="action-btn"
            title={item.status === 'banned' ? 'Desbanir' : 'Banir'}
            onClick={() => {
              setSelectedUser(item);
              setShowBanModal(true);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {item.status === 'banned' ? <Unlock size={16} /> : <Ban size={16} />}
          </motion.button>
          <motion.button
            className="action-btn danger"
            title="Excluir"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Trash2 size={16} />
          </motion.button>
        </div>
      )
    }
  ];

  return (
    <>
      <Header title="Usuários" subtitle="Gerencie os usuários do sistema" />

      <div className="page-content">
        {/* Toolbar */}
        <motion.div
          className="toolbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="toolbar-left">
            <div className="search-box">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                placeholder="Buscar usuários..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>

            <Button variant="secondary" icon={<Filter size={16} />}>
              Filtros
            </Button>
          </div>

          <div className="toolbar-right">
            <Button variant="secondary" icon={<Download size={16} />}>
              Exportar
            </Button>
            <Button variant="primary" icon={<Plus size={16} />}>
              Novo Usuário
            </Button>
          </div>
        </motion.div>

        {/* Stats Bar */}
        <motion.div
          className="stats-bar"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-item">
            <span className="stat-value">{pagination.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-value success">{users.length}</span>
            <span className="stat-label">Nesta Página</span>
          </div>
        </motion.div>

        {/* Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DataTable
            columns={columns}
            data={users}
            loading={loading}
            keyExtractor={(item) => item.id}
            onRowClick={(item) => console.log('Clicked:', item)}
          />
        </motion.div>

        {/* Pagination */}
        <motion.div
          className="pagination"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className="pagination-info">
            Mostrando {((pagination.page - 1) * 10) + 1}-{Math.min(pagination.page * 10, pagination.total)} de {pagination.total}
          </span>
          <div className="pagination-buttons">
            <button
              className="page-btn"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
            >
              ←
            </button>
            {Array.from({ length: pagination.pages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                className={`page-btn ${pagination.page === p ? 'active' : ''}`}
                onClick={() => handlePageChange(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="page-btn"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.pages}
            >
              →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Ban Modal */}
      <Modal
        isOpen={showBanModal}
        onClose={() => setShowBanModal(false)}
        title={selectedUser?.status === 'banned' ? 'Desbanir Usuário' : 'Banir Usuário'}
        size="sm"
      >
        <div className="modal-body">
          <p className="modal-text">
            {selectedUser?.status === 'banned'
              ? `Tem certeza que deseja desbanir o usuário ${selectedUser?.username}?`
              : `Tem certeza que deseja banir o usuário ${selectedUser?.username}?`
            }
          </p>

          {selectedUser?.status !== 'banned' && (
            <div className="input-group">
              <label className="input-label">Motivo do ban</label>
              <input
                type="text"
                className="input"
                placeholder="Ex: Uso de cheat detectado"
              />
            </div>
          )}

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowBanModal(false)}>
              Cancelar
            </Button>
            <Button
              variant={selectedUser?.status === 'banned' ? 'success' : 'danger'}
              onClick={() => setShowBanModal(false)}
            >
              {selectedUser?.status === 'banned' ? 'Desbanir' : 'Banir'}
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .page-content {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .toolbar-left,
        .toolbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .search-box {
          position: relative;
          width: 300px;
        }

        .search-icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: var(--color-text-muted);
        }

        .search-input {
          width: 100%;
          padding: 10px 12px 10px 40px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
        }

        .stats-bar {
          display: flex;
          align-items: center;
          gap: 24px;
          padding: 16px 24px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
        }

        .stat-item {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--color-text-primary);
        }

        .stat-value.success { color: #34D399; }
        .stat-value.warning { color: #FBBF24; }
        .stat-value.danger { color: #F87171; }

        .stat-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          text-transform: uppercase;
        }

        .stat-divider {
          width: 1px;
          height: 40px;
          background: var(--color-border);
        }

        .user-cell {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 50%;
          font-weight: 600;
          font-size: 0.875rem;
          color: white;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .user-email {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .hwid-cell {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.813rem;
          color: var(--color-text-muted);
        }

        .login-count {
          font-weight: 500;
          color: var(--color-primary);
        }

        .actions-cell {
          display: flex;
          gap: 8px;
        }

        .action-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .action-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .action-btn.danger:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }

        .pagination {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .pagination-info {
          font-size: 0.875rem;
          color: var(--color-text-muted);
        }

        .pagination-buttons {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .page-btn {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-secondary);
          font-size: 0.875rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .page-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .page-btn.active {
          background: var(--gradient-primary);
          border-color: transparent;
          color: white;
        }

        .page-dots {
          color: var(--color-text-muted);
          padding: 0 4px;
        }

        .modal-body {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .modal-text {
          font-size: 0.9rem;
          color: var(--color-text-secondary);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          margin-top: 8px;
        }

        @media (max-width: 768px) {
          .page-content {
            padding: 16px;
          }

          .toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .toolbar-left,
          .toolbar-right {
            justify-content: space-between;
          }

          .search-box {
            width: 100%;
          }

          .stats-bar {
            flex-wrap: wrap;
            justify-content: center;
          }
        }
      `}</style>
    </>
  );
}
