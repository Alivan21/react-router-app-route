import { Suspense } from "react";
import { Outlet } from "react-router";

export default function LoginLayout() {
  return (
    <div>
      <span>Testing Layout</span>
      <Suspense>
        <Outlet />
      </Suspense>
    </div>
  );
}
