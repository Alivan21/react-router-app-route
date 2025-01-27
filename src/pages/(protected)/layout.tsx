import { Outlet } from "react-router";
import ProtectedProvider from "@/libs/react-auth/protected-provider";

export default function ProtectedLayout() {
  return (
    <ProtectedProvider fallbackPath="/login">
      <h1>Testing Layout</h1>
      <Outlet />
    </ProtectedProvider>
  );
}
