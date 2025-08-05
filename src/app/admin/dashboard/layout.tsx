import { ReactNode } from 'react';

interface AdminDashboardLayoutProps {
  children: ReactNode;
  products?: ReactNode; // Parallel route slot - optional로 변경
}

export default function AdminDashboardLayout({ 
  children, 
  products 
}: AdminDashboardLayoutProps) {
  return (
    <div className="admin-dashboard-layout">
      <div className="dashboard-main">
        {children}
      </div>
      {products && products}
    </div>
  );
}
