import * as React from "react";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate } from "react-router";

interface UnprotectedProviderProps {
  children: React.ReactNode;
  fallbackPath: string;
}

const UnprotectedProvider: React.FC<UnprotectedProviderProps> = ({ children, fallbackPath }) => {
  const isAuthenticated = useIsAuthenticated();

  if (isAuthenticated) {
    // If user is already authenticated, redirect them to the fallback path
    // (usually the dashboard or home page)

    return <Navigate replace to={fallbackPath} />;
  }

  return children;
};

export default UnprotectedProvider;
