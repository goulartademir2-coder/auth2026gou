'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import DataTable from '@/components/ui/DataTable';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { Search, Plus, Copy, Check, Power, RotateCcw, Trash2, Filter, Download, Clock, Infinity, Hash } from 'lucide-react';

export default function KeysPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);
    const [generatingKeys, setGeneratingKeys] = useState(false);

    const keys = [
        { id: '1', keyValue: 'GOU-A1B2-C3D4-E5F6', type: 'TIME', duration: '30 dias', status: 'active', user: 'usuario123', activatedAt: '2026-01-10' },
        { id: '2', keyValue: 'GOU-G7H8-I9J0-K1L2', type: 'LIFETIME', duration: 'Lifetime', status: 'active', user: 'player456', activatedAt: '2026-01-08' },
        { id: '3', keyValue: 'GOU-M3N4-O5P6-Q7R8', type: 'TIME', duration: '7 dias', status: 'expired', user: 'gamer789', activatedAt: '2026-01-01' },
        { id: '4', keyValue: 'GOU-S9T0-U1V2-W3X4', type: 'USES', duration: '10 usos', status: 'unused', user: null, activatedAt: null },
        { id: '5', keyValue: 'GOU-Y5Z6-A7B8-C9D0', type: 'TIME', duration: '30 dias', status: 'disabled', user: null, activatedAt: null },
    ];

    const copyKey = async (key: string) => {
        await navigator.clipboard.writeText(key);
        setCopiedKey(key);
        setTimeout(() => setCopiedKey(null), 2000);
    };

    const handleGenerateKeys = async () => {
        setGeneratingKeys(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setGeneratingKeys(false);
        setShowGenerateModal(false);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'TIME': return <Clock size={14} />;
            case 'LIFETIME': return <Infinity size={14} />;
            case 'USES': return <Hash size={14} />;
            default: return null;
        }
    };

    const columns = [
        {
            key: 'keyValue',
            header: 'Chave',
            render: (item: any) => (
                <div className="key-cell">
                    <code className="key-code">{item.keyValue}</code>
                    <motion.button
                        className="copy-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            copyKey(item.keyValue);
                        }}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        {copiedKey === item.keyValue ? <Check size={14} /> : <Copy size={14} />}
                    </motion.button>
                </div>
            )
        },
        {
            key: 'type',
            header: 'Tipo',
            render: (item: any) => (
                <div className="type-badge">
                    {getTypeIcon(item.type)}
                    <span>{item.type}</span>
                </div>
            )
        },
        { key: 'duration', header: 'Duração' },
        {
            key: 'status',
            header: 'Status',
            render: (item: any) => {
                const statusMap: Record<string, { label: string, class: string }> = {
                    active: { label: 'Ativo', class: 'success' },
                    unused: { label: 'Não usado', class: 'info' },
                    expired: { label: 'Expirado', class: 'warning' },
                    disabled: { label: 'Desativado', class: 'danger' }
                };
                const status = statusMap[item.status];
                return <span className={`badge badge-${status.class}`}>{status.label}</span>;
            }
        },
        {
            key: 'user',
            header: 'Usuário',
            render: (item: any) => (
                <span className={item.user ? '' : 'text-muted'}>
                    {item.user || '—'}
                </span>
            )
        },
        {
            key: 'activatedAt',
            header: 'Ativado em',
            render: (item: any) => (
                <span className={item.activatedAt ? '' : 'text-muted'}>
                    {item.activatedAt || '—'}
                </span>
            )
        },
        {
            key: 'actions',
            header: 'Ações',
            render: (item: any) => (
                <div className="actions-cell">
                    {item.user && (
                        <motion.button
                            className="action-btn"
                            title="Resetar HWID"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <RotateCcw size={16} />
                        </motion.button>
                    )}
                    <motion.button
                        className="action-btn"
                        title={item.status === 'disabled' ? 'Ativar' : 'Desativar'}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                    >
                        <Power size={16} />
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
            <Header title="Licenças" subtitle="Gerencie as chaves de licença" />

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
                                placeholder="Buscar chaves..."
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
                        <Button
                            variant="primary"
                            icon={<Plus size={16} />}
                            onClick={() => setShowGenerateModal(true)}
                        >
                            Gerar Keys
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
                        <span className="stat-value">856</span>
                        <span className="stat-label">Total</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value info">324</span>
                        <span className="stat-label">Disponíveis</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value success">489</span>
                        <span className="stat-label">Ativadas</span>
                    </div>
                    <div className="stat-divider" />
                    <div className="stat-item">
                        <span className="stat-value warning">43</span>
                        <span className="stat-label">Expiradas</span>
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
                        data={keys}
                        keyExtractor={(item) => item.id}
                    />
                </motion.div>

                {/* Pagination */}
                <motion.div
                    className="pagination"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <span className="pagination-info">Mostrando 1-5 de 856</span>
                    <div className="pagination-buttons">
                        <button className="page-btn">←</button>
                        <button className="page-btn active">1</button>
                        <button className="page-btn">2</button>
                        <button className="page-btn">3</button>
                        <span className="page-dots">...</span>
                        <button className="page-btn">172</button>
                        <button className="page-btn">→</button>
                    </div>
                </motion.div>
            </div>

            {/* Generate Keys Modal */}
            <Modal
                isOpen={showGenerateModal}
                onClose={() => setShowGenerateModal(false)}
                title="Gerar Novas Keys"
                size="md"
            >
                <div className="generate-form">
                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Quantidade</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="10"
                                min="1"
                                max="100"
                                defaultValue="10"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Tipo</label>
                            <select className="input">
                                <option value="TIME">Tempo Limitado</option>
                                <option value="LIFETIME">Lifetime</option>
                                <option value="USES">Por Usos</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="input-group">
                            <label className="input-label">Duração (dias)</label>
                            <input
                                type="number"
                                className="input"
                                placeholder="30"
                                min="1"
                                defaultValue="30"
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Max. Ativações</label>
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
                        <label className="input-label">Nota (opcional)</label>
                        <input
                            type="text"
                            className="input"
                            placeholder="Descrição para identificar este lote"
                        />
                    </div>

                    <div className="modal-actions">
                        <Button variant="secondary" onClick={() => setShowGenerateModal(false)}>
                            Cancelar
                        </Button>
                        <Button
                            variant="primary"
                            loading={generatingKeys}
                            onClick={handleGenerateKeys}
                        >
                            Gerar Keys
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

        .stat-value.info { color: #60A5FA; }
        .stat-value.success { color: #34D399; }
        .stat-value.warning { color: #FBBF24; }

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

        .key-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .key-code {
          font-family: 'JetBrains Mono', monospace;
          font-size: 0.813rem;
          background: var(--color-bg-tertiary);
          padding: 4px 8px;
          border-radius: var(--radius-sm);
          color: var(--color-primary);
        }

        .copy-btn {
          width: 28px;
          height: 28px;
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

        .copy-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: rgba(139, 92, 246, 0.1);
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 500;
          color: #A78BFA;
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

        .text-muted {
          color: var(--color-text-muted);
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

        .generate-form {
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

        select.input {
          cursor: pointer;
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

          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
        </>
    );
}
