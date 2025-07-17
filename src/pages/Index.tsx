import { useState } from 'react';
import { HRDashboard } from '@/components/HRDashboard';
import { LoginPage } from '@/components/LoginPage';

export default function Index() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return <LoginPage onLogin={handleLogin} />;
  }

  return <HRDashboard />;
}
