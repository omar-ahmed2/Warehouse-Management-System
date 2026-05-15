import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import { ProductsPage } from '../pages/ProductsPage';
import { CustomersPage } from '../pages/CustomersPage';
import { SuppliersPage } from '../pages/SuppliersPage';
import { InventoryPage } from '../pages/InventoryPage';
import { IncomingPage } from '../pages/IncomingPage';
import { OutgoingPage } from '../pages/OutgoingPage';
import { CollectionsPage } from '../pages/CollectionsPage';
import { FinancePage } from '../pages/FinancePage';
import { ReportsPage } from '../pages/ReportsPage';
import { UsersPage } from '../pages/UsersPage';
import { SettingsPage } from '../pages/SettingsPage';
import { Loader } from '../components/ui/Loader';
import { DashboardLayout } from '../layouts/DashboardLayout';

export const AppRouter: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [currentPath, setCurrentPath] = React.useState(window.location.pathname);

  React.useEffect(() => {
    const handleLocationChange = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
  };

  if (isLoading) {
    return <Loader fullScreen />;
  }

  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={() => navigate('/dashboard')} />;
  }

  // Simple Router Switch
  const getPageConfig = () => {
    switch (currentPath) {
      case '/':
      case '/dashboard':
        return { component: <DashboardPage />, title: 'لوحة التحكم' };
      case '/products':
        return { component: <ProductsPage />, title: 'إدارة المنتجات' };
      case '/inventory':
        return { component: <InventoryPage />, title: 'المخزون الحالي' };
      case '/incoming':
        return { component: <IncomingPage />, title: 'أوامر الوارد' };
      case '/outgoing':
        return { component: <OutgoingPage />, title: 'أوامر الصادر' };
      case '/customers':
        if (user?.role === 'warehouse_keeper') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <CustomersPage />, title: 'العملاء' };
      case '/suppliers':
        if (user?.role === 'warehouse_keeper') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <SuppliersPage />, title: 'الموردين' };
      case '/collections':
        if (user?.role === 'warehouse_keeper') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <CollectionsPage />, title: 'التحصيلات والمدفوعات' };
      case '/finance':
        if (user?.role === 'warehouse_keeper') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <FinancePage />, title: 'القيود المالية' };
      case '/reports':
        if (user?.role === 'warehouse_keeper') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <ReportsPage />, title: 'التقارير' };
      case '/users':
        if (user?.role !== 'manager') return { component: <DashboardPage />, title: 'لوحة التحكم' };
        return { component: <UsersPage />, title: 'إدارة المستخدمين' };
      case '/settings':
        return { component: <SettingsPage />, title: 'الإعدادات' };
      default:
        return { component: <DashboardPage />, title: 'لوحة التحكم' };
    }
  };

  const { component, title } = getPageConfig();

  return (
    <DashboardLayout title={title}>
      {component}
    </DashboardLayout>
  );
};
