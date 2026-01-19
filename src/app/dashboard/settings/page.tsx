'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Button from '@/components/ui/Button';
import { Save, Shield, Key, Globe, Bell, Server, Database, Lock, User, Terminal } from 'lucide-react';

export default function SettingsPage() {
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('general');

    const handleSave = async () => {
        setSaving(true);
        // Simulate save
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
    };

    const tabs = [
        { id: 'general', label: 'Geral', icon: Globe },
        { id: 'security', label: 'Segurança', icon: Shield },
        { id: 'api', label: 'API & Integração', icon: Key },
        { id: 'notifications', label: 'Notificações', icon: Bell },
        { id: 'system', label: 'Sistema', icon: Server },
    ];

    return (
        <>
            <Header title="Configurações" subtitle="Gerencie as preferências do sistema" />

            <div className="page-content">
                <div className="settings-layout">
                    {/* Sidebar Tabs */}
                    <div className="settings-sidebar">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                className={`sidebar-tab ${activeTab === tab.id ? 'active' : ''}`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <tab.icon size={18} />
                                <span>{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Content Area */}
                    <div className="settings-main">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            className="settings-card"
                        >
                            {activeTab === 'general' && (
                                <div className="settings-section">
                                    <h3>Informações do Painel</h3>
                                    <div className="form-group">
                                        <label>Nome do Projeto</label>
                                        <input type="text" className="input" defaultValue="GOU Auth Admin" />
                                    </div>
                                    <div className="form-group">
                                        <label>URL do Painel</label>
                                        <input type="text" className="input" defaultValue="https://auth.gou.com" />
                                    </div>
                                    <div className="form-group">
                                        <label>Idioma Padrão</label>
                                        <select className="input">
                                            <option value="pt-BR">Português (Brasil)</option>
                                            <option value="en-US">English (US)</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="settings-section">
                                    <h3>Segurança & Autenticação</h3>
                                    <div className="form-group checkbox-group">
                                        <div className="checkbox-item">
                                            <input type="checkbox" id="hwid-lock" defaultChecked />
                                            <label htmlFor="hwid-lock">Bloqueio de HWID Obrigatório</label>
                                        </div>
                                        <p className="help-text">Impede que usuários compartilhem a mesma conta em máquinas diferentes.</p>
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <div className="checkbox-item">
                                            <input type="checkbox" id="two-factor" />
                                            <label htmlFor="two-factor">Forçar Autenticação de Dois Fatores (Admin)</label>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Expiração da Sessão (horas)</label>
                                        <input type="number" className="input" defaultValue="24" />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'api' && (
                                <div className="settings-section">
                                    <h3>Chaves de API</h3>
                                    <div className="form-group">
                                        <label>Master API Key</label>
                                        <div className="input-with-button">
                                            <input type="password" readonly className="input" defaultValue="••••••••••••••••" />
                                            <Button variant="secondary">Revelar</Button>
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Webhook URL (Logs)</label>
                                        <input type="text" className="input" placeholder="https://discord.com/api/webhooks/..." />
                                    </div>
                                </div>
                            )}

                            <div className="settings-footer">
                                <Button
                                    variant="primary"
                                    icon={<Save size={18} />}
                                    loading={saving}
                                    onClick={handleSave}
                                >
                                    Salvar Alterações
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            <style jsx>{`
                .page-content {
                    padding: 24px 32px;
                }

                .settings-layout {
                    display: grid;
                    grid-template-columns: 240px 1fr;
                    gap: 32px;
                    max-width: 1000px;
                }

                .settings-sidebar {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }

                .sidebar-tab {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px 16px;
                    background: transparent;
                    border: none;
                    border-radius: var(--radius-md);
                    color: var(--color-text-secondary);
                    font-size: 0.875rem;
                    font-weight: 500;
                    cursor: pointer;
                    text-align: left;
                    transition: all var(--transition-fast);
                }

                .sidebar-tab:hover {
                    background: var(--color-bg-hover);
                    color: var(--color-text-primary);
                }

                .sidebar-tab.active {
                    background: var(--color-bg-tertiary);
                    color: var(--color-primary);
                }

                .settings-main {
                    min-height: 500px;
                }

                .settings-card {
                    background: var(--color-bg-card);
                    border: 1px solid var(--color-border);
                    border-radius: var(--radius-lg);
                    padding: 32px;
                    display: flex;
                    flex-direction: column;
                    gap: 32px;
                }

                .settings-section h3 {
                    font-size: 1.125rem;
                    font-weight: 600;
                    margin-bottom: 24px;
                    color: var(--color-text-primary);
                }

                .form-group {
                    margin-bottom: 20px;
                    display: flex;
                    flex-direction: column;
                    gap: 8px;
                }

                .form-group label {
                    font-size: 0.813rem;
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

                .input-with-button {
                    display: flex;
                    gap: 8px;
                }

                .input-with-button .input {
                    flex: 1;
                }

                .checkbox-group {
                    gap: 4px;
                }

                .checkbox-item {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .checkbox-item input[type="checkbox"] {
                    width: 16px;
                    height: 16px;
                    accent-color: var(--color-primary);
                }

                .checkbox-item label {
                    color: var(--color-text-primary);
                    font-size: 0.875rem;
                    cursor: pointer;
                }

                .help-text {
                    font-size: 0.75rem;
                    color: var(--color-text-muted);
                    margin-left: 26px;
                }

                .settings-footer {
                    margin-top: auto;
                    padding-top: 32px;
                    border-top: 1px solid var(--color-border);
                    display: flex;
                    justify-content: flex-end;
                }

                @media (max-width: 900px) {
                    .settings-layout {
                        grid-template-columns: 1fr;
                    }

                    .settings-sidebar {
                        flex-direction: row;
                        overflow-x: auto;
                        padding-bottom: 8px;
                    }

                    .sidebar-tab span {
                        white-space: nowrap;
                    }
                }
            `}</style>
        </>
    );
}
