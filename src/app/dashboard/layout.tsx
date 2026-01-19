'use client';

import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="dashboard-layout">
            <Sidebar />
            <main className="main-content">
                {children}
            </main>

            <style jsx>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          min-width: 0;
          transition: margin-left 0.3s ease;
        }

        @media (max-width: 1023px) {
          .main-content {
            margin-left: 0;
          }
        }
      `}</style>
        </div>
    );
}
