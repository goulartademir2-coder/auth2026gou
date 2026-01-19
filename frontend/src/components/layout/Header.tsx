'use client';

import { motion } from 'framer-motion';
import { Bell, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
    title: string;
    subtitle?: string;
}

export default function Header({ title, subtitle }: HeaderProps) {
    const [showProfile, setShowProfile] = useState(false);

    return (
        <motion.header
            className="header"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
        >
            <div className="header-left">
                <div className="header-title-container">
                    <h1 className="header-title">{title}</h1>
                    {subtitle && <p className="header-subtitle">{subtitle}</p>}
                </div>
            </div>

            <div className="header-right">
                {/* Search */}
                <div className="search-container">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Buscar..."
                        className="search-input"
                    />
                </div>

                {/* Notifications */}
                <motion.button
                    className="icon-btn"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Bell size={20} />
                    <span className="notification-dot" />
                </motion.button>

                {/* Profile */}
                <div className="profile-container">
                    <motion.button
                        className="profile-btn"
                        onClick={() => setShowProfile(!showProfile)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <div className="avatar">
                            <User size={18} />
                        </div>
                        <div className="profile-info">
                            <span className="profile-name">Admin</span>
                            <span className="profile-role">Super Admin</span>
                        </div>
                        <ChevronDown
                            size={16}
                            style={{
                                transform: showProfile ? 'rotate(180deg)' : 'rotate(0)',
                                transition: 'transform 0.2s ease'
                            }}
                        />
                    </motion.button>

                    {showProfile && (
                        <motion.div
                            className="profile-dropdown"
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        >
                            <a href="#" className="dropdown-item">Meu Perfil</a>
                            <a href="#" className="dropdown-item">Alterar Senha</a>
                            <div className="dropdown-divider" />
                            <a href="#" className="dropdown-item danger">Sair</a>
                        </motion.div>
                    )}
                </div>
            </div>

            <style jsx>{`
        .header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 20px 32px;
          background: var(--color-bg-secondary);
          border-bottom: 1px solid var(--color-border);
          position: sticky;
          top: 0;
          z-index: 100;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 24px;
        }

        .header-title {
          font-size: 1.5rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .header-subtitle {
          font-size: 0.875rem;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .header-right {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .search-container {
          position: relative;
          width: 280px;
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
          transition: all var(--transition-fast);
        }

        .search-input:focus {
          outline: none;
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1);
        }

        .search-input::placeholder {
          color: var(--color-text-muted);
        }

        .icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .icon-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .notification-dot {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 8px;
          height: 8px;
          background: var(--color-danger);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .profile-container {
          position: relative;
        }

        .profile-btn {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 8px 12px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .profile-btn:hover {
          background: var(--color-bg-hover);
        }

        .avatar {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--gradient-primary);
          border-radius: 50%;
          color: white;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
        }

        .profile-name {
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--color-text-primary);
        }

        .profile-role {
          font-size: 0.75rem;
          color: var(--color-text-muted);
        }

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 180px;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-lg);
          overflow: hidden;
          z-index: 200;
        }

        .dropdown-item {
          display: block;
          padding: 12px 16px;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
        }

        .dropdown-item:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .dropdown-item.danger {
          color: var(--color-danger);
        }

        .dropdown-divider {
          height: 1px;
          background: var(--color-border);
          margin: 4px 0;
        }

        @media (max-width: 768px) {
          .header {
            padding: 16px;
            padding-left: 70px;
          }

          .search-container {
            display: none;
          }

          .profile-info {
            display: none;
          }
        }
      `}</style>
        </motion.header>
    );
}
