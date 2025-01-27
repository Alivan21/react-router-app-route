import { Outlet } from "react-router";
import UnprotectedProvider from "@/libs/react-auth/unprotected-provider";

export default function AuthLayout() {
  return (
    <UnprotectedProvider fallbackPath="/dashboard">
      <Outlet />
    </UnprotectedProvider>
  );
}
