import * as React from "react";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate } from "react-router";

interface ProtectedProviderProps {
  children: React.ReactNode;
  fallbackPath: string;
}

const ProtectedProvider: React.FC<ProtectedProviderProps> = ({ children, fallbackPath }) => {
  const isAuthenticated = useIsAuthenticated();

  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they
    // were trying to go to when they were redirected. This allows us to
    // send them along to that page after they login, which is a nicer
    // user experience than dropping them off on the home page.

    return <Navigate replace to={fallbackPath} />;
  }

  return children;
};

export default ProtectedProvider;
