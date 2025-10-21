import React, { useEffect } from 'react';
import { setupInterceptors } from '@/api/api';
import { useAuth } from '@/context/Authcontext';

const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { logout } = useAuth();

  useEffect(() => {
    setupInterceptors(logout);
  }, [logout]);

  return <>{children}</>;
};

export default AppWrapper;
