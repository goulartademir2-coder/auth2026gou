'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Key,
    Box,
    FileText,
    Settings,
    LogOut,
    Menu,
    X,
    ChevronLeft
} from 'lucide-react';

const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
    { icon: Users, label: 'Usuários', href: '/dashboard/users' },
    { icon: Key, label: 'Licenças', href: '/dashboard/keys' },
    { icon: Box, label: 'Apps', href: '/dashboard/apps' },
    { icon: FileText, label: 'Logs', href: '/dashboard/logs' },
    { icon: Settings, label: 'Configurações', href: '/dashboard/settings' },
];

export default function Sidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1024);
            if (window.innerWidth >= 1024) {
                setMobileOpen(false);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const sidebarWidth = collapsed ? '80px' : '260px';

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="sidebar-logo">
                <motion.div
                    className="logo-icon"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <svg viewBox="0 0 40 40" fill="none">
                        <defs>
                            <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#3B82F6" />
                            </linearGradient>
                        </defs>
                        <circle cx="20" cy="20" r="18" stroke="url(#logoGradient)" strokeWidth="3" fill="none" />
                        <path d="M14 20L18 24L26 16" stroke="url(#logoGradient)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </motion.div>
                {!collapsed && (
                    <motion.div
                        className="logo-text"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                    >
                        <span className="logo-name">GOU</span>
                        <span className="logo-sub">Auth</span>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="sidebar-nav">
                {menuItems.map((item, index) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/dashboard' && pathname.startsWith(item.href));

                    return (
                        <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={item.href}
                                className={`nav-item ${isActive ? 'active' : ''}`}
                                onClick={() => isMobile && setMobileOpen(false)}
                            >
                                <span className="nav-icon">
                                    <item.icon size={20} />
                                </span>
                                {!collapsed && (
                                    <span className="nav-label">{item.label}</span>
                                )}
                                {isActive && (
                                    <motion.div
                                        className="nav-indicator"
                                        layoutId="activeIndicator"
                                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </Link>
                        </motion.div>
                    );
                })}
            </nav>

            {/* Collapse Button (Desktop) */}
            {!isMobile && (
                <button
                    className="sidebar-collapse-btn"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    <ChevronLeft
                        size={18}
                        style={{
                            transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.3s ease'
                        }}
                    />
                </button>
            )}

            {/* Logout */}
            <div className="sidebar-footer">
                <button className="logout-btn">
                    <LogOut size={20} />
                    {!collapsed && <span>Sair</span>}
                </button>
            </div>

            <style jsx>{`
        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 20px;
          border-bottom: 1px solid var(--color-border);
        }

        .logo-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
        }

        .logo-icon svg {
          width: 100%;
          height: 100%;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .logo-name {
          font-size: 1.25rem;
          font-weight: 700;
          background: var(--gradient-primary);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1.2;
        }

        .logo-sub {
          font-size: 0.75rem;
          color: var(--color-text-muted);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .sidebar-nav {
          flex: 1;
          padding: 16px 12px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          text-decoration: none;
          transition: all var(--transition-fast);
          position: relative;
          overflow: hidden;
        }

        .nav-item:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .nav-item.active {
          color: var(--color-text-primary);
          background: rgba(139, 92, 246, 0.15);
        }

        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .nav-label {
          font-size: 0.9rem;
          font-weight: 500;
          white-space: nowrap;
        }

        .nav-indicator {
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 24px;
          background: var(--gradient-primary);
          border-radius: 0 3px 3px 0;
        }

        .sidebar-collapse-btn {
          position: absolute;
          right: -12px;
          top: 50%;
          transform: translateY(-50%);
          width: 24px;
          height: 24px;
          background: var(--color-bg-tertiary);
          border: 1px solid var(--color-border);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: var(--color-text-secondary);
          transition: all var(--transition-fast);
        }

        .sidebar-collapse-btn:hover {
          background: var(--color-bg-hover);
          color: var(--color-text-primary);
        }

        .sidebar-footer {
          padding: 16px;
          border-top: 1px solid var(--color-border);
        }

        .logout-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: ${collapsed ? 'center' : 'flex-start'};
          gap: 12px;
          padding: 12px 16px;
          background: transparent;
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-secondary);
          font-size: 0.9rem;
          cursor: pointer;
          transition: all var(--transition-fast);
        }

        .logout-btn:hover {
          background: rgba(239, 68, 68, 0.1);
          border-color: rgba(239, 68, 68, 0.3);
          color: #EF4444;
        }
      `}</style>
        </>
    );

    return (
        <>
            {/* Mobile Toggle */}
            {isMobile && (
                <button
                    className="mobile-toggle"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            )}

            {/* Mobile Overlay */}
            {isMobile && mobileOpen && (
                <motion.div
                    className="mobile-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Sidebar */}
            <motion.aside
                className={`sidebar ${isMobile ? 'mobile' : ''} ${mobileOpen ? 'open' : ''}`}
                animate={{
                    width: isMobile ? '260px' : sidebarWidth,
                    x: isMobile && !mobileOpen ? '-100%' : '0%'
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
                <SidebarContent />
            </motion.aside>

            <style jsx global>{`
        .mobile-toggle {
          position: fixed;
          top: 16px;
          left: 16px;
          z-index: 150;
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--color-bg-card);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          color: var(--color-text-primary);
          cursor: pointer;
        }

        .mobile-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          z-index: 140;
        }

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          height: 100vh;
          background: var(--color-bg-secondary);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          z-index: 145;
          overflow: hidden;
        }

        .sidebar.mobile {
          box-shadow: var(--shadow-lg);
        }
      `}</style>
        </>
    );
}
