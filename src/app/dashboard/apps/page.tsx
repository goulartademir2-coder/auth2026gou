'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Plus, Settings, MoreVertical, Users, Key, Activity, Power, RefreshCw, Trash2, Copy, Check, Eye, EyeOff } from 'lucide-react';

export default function AppsPage() {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [newAppName, setNewAppName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchApps = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/apps');
      const data = await res.json();
      if (data.success) {
        setApps(data.data.apps);
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreateApp = async () => {
    if (!newAppName.trim()) return;
    setIsCreating(true);
    try {
      const res = await fetch('/api/apps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newAppName })
      });
      const data = await res.json();
      if (data.success) {
        setShowCreateModal(false);
        setNewAppName('');
        fetchApps();
      }
    } catch (error) {
      console.error('Error creating app:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'success';
      case 'OFFLINE': return 'danger';
      case 'MAINTENANCE': return 'warning';
      default: return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ONLINE': return 'Online';
      case 'OFFLINE': return 'Offline';
      case 'MAINTENANCE': return 'Manutenção';
      default: return status;
    }
  };

  return (
    <>
      <Header title="Apps" subtitle="Gerencie suas aplicações" />

      <div className="page-content">
        {/* Toolbar */}
        <motion.div
          className="toolbar"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="toolbar-left">
            <h2 className="section-title">Suas Aplicações</h2>
          </div>
          <div className="toolbar-right">
            <Button
              variant="primary"
              icon={<Plus size={16} />}
              onClick={() => setShowCreateModal(true)}
            >
              Novo App
            </Button>
          </div>
        </motion.div>

        {/* Apps Grid */}
        <div className="apps-grid">
          {loading ? (
            <div className="loading-state">Carregando apps...</div>
          ) : apps.length === 0 ? (
            <div className="empty-state">Nenhuma aplicação encontrada.</div>
          ) : (
            apps.map((app, index) => (
              <motion.div
                key={app.id}
                className="app-card"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
              >
                <div className="app-header">
                  <div className="app-info">
                    <motion.div
                      className="app-icon"
                      whileHover={{ scale: 1.05, rotate: 5 }}
                    >
                      {app.name.charAt(0)}
                    </motion.div>
                    <div className="app-details">
                      <h3 className="app-name">{app.name}</h3>
                      <span className={`app-status ${getStatusClass(app.status)}`}>
                        <span className="status-dot" />
                        {getStatusLabel(app.status)}
                      </span>
                    </div>
                  </div>
                  <button className="menu-btn">
                    <MoreVertical size={18} />
                  </button>
                </div>

                <div className="app-stats">
                  <div className="stat">
                    <Users size={16} />
                    <span className="stat-value">{app.users}</span>
                    <span className="stat-label">Usuários</span>
                  </div>
                  <div className="stat">
                    <Key size={16} />
                    <span className="stat-value">{app.keys}</span>
                    <span className="stat-label">Keys</span>
                  </div>
                  <div className="stat">
                    <Activity size={16} />
                    <span className="stat-value">0</span>
                    <span className="stat-label">Online</span>
                  </div>
                </div>

                <div className="app-footer">
                  <div className="app-id">
                    <span className="id-label">App ID:</span>
                    <code className="id-value">{app.id}</code>
                    <motion.button
                      className="copy-btn"
                      onClick={() => copyToClipboard(app.id, app.id)}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {copiedId === app.id ? <Check size={14} /> : <Copy size={14} />}
                    </motion.button>
                  </div>
                  <div className="app-actions">
                    <Button variant="ghost" size="sm" icon={<Settings size={16} />}>
                      Config
                    </Button>
                  </div>
                </div>

                <div className="app-glow" />
              </motion.div>
            ))
          )}
        </div>
      </div>

      {/* Create App Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Criar Novo App"
        size="md"
      >
        <div className="create-form">
          <div className="input-group">
            <label className="input-label">Nome do App</label>
            <input
              type="text"
              className="input"
              placeholder="Ex: Meu App"
              value={newAppName}
              onChange={(e) => setNewAppName(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="input-group">
              <label className="input-label">HWID Lock</label>
              <select className="input">
                <option value="true">Ativado</option>
                <option value="false">Desativado</option>
              </select>
            </div>

            <div className="input-group">
              <label className="input-label">Max. Sessões</label>
              <input
                type="number"
                className="input"
                placeholder="1"
                min="1"
                defaultValue="1"
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Versão Mínima (opcional)</label>
            <input
              type="text"
              className="input"
              placeholder="1.0.0"
            />
          </div>

          <div className="modal-actions">
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleCreateApp}
              loading={isCreating}
              disabled={!newAppName.trim() || isCreating}
            >
              Criar App
            </Button>
          </div>
        </div>
      </Modal>

      <style jsx>{`
        .page-content {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .section-title {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .apps-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }

        .app-card {
          position: relative;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 24px;
          overflow: hidden;
          transition: all var(--transition-base);
        }

        .app-card:hover {
          border-color: var(--color-border-hover);
        }

        .app-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .app-info {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .app-icon {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: var(--radius-md);
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
        }

        .app-details {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .app-name {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--color-text-primary);
        }

        .app-status {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .app-status.success { color: #34D399; }
        .app-status.warning { color: #FBBF24; }
        .app-status.danger { color: #F87171; }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: currentColor;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .menu-btn {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-sm);
          color: var(--color-text-muted);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .menu-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .app-stats {
          display: flex;
          gap: 16px;
          padding: 16px 0;
          border-top: 1px solid var(--color-border);
          border-bottom: 1px solid var(--color-border);
          margin-bottom: 16px;
        }

        .stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          color: var(--color-text-muted);
        }

        .stat-value {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-text-primary);
          margin-top: 4px;
        }

        .stat-label {
          font-size: 0.75rem;
          margin-top: 2px;
        }

        .app-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .app-id {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .id-label {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .id-value {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.75rem;
          background: var(--color-bg-tertiary);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          color: var(--color-primary);
        }

        .copy-btn {
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          color: var(--color-text-muted);
          cursor: pointer;
          transition: color var(--transition-fast);
        }

        .copy-btn:hover {
          color: var(--color-text-primary);
        }

        .app-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: var(--gradient-primary);
          opacity: 0;
          transition: opacity var(--transition-base);
        }

        .app-card:hover .app-glow {
          opacity: 1;
        }

        .create-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-secondary);
        }

        .input {
          padding: 10px 14px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          font-size: 0.875rem;
        }

        .input:focus {
          outline: none;
          border-color: var(--color-primary);
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

          .apps-grid {
            grid-template-columns: 1fr;
          }

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}
