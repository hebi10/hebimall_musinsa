import { ReactNode } from 'react';

interface AdminDashboardLayoutProps {
  children: ReactNode;
  products: ReactNode;
}

export default function AdminDashboardLayout({ 
  children,
  products
}: AdminDashboardLayoutProps) {
  return (
    <div className="admin-dashboard-layout">
      <div className="dashboard-main">
        {children}
        {products}
      </div>
    </div>
  );
}
