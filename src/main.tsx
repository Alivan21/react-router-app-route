import { StrictMode } from "react";
import AuthProvider from "react-auth-kit";
import { createRoot } from "react-dom/client";
import { RouteObject, RouterProvider, createBrowserRouter } from "react-router";
import { authStore } from "./libs/react-auth/auth-store";
import ReactQueryProvider from "./libs/react-query/query-client-provider";
import {
  add404PageToRoutesChildren,
  addErrorElementToRoutes,
  convertPagesToRoute,
} from "@/libs/react-router/file-router";
import "./index.css";

const files = import.meta.glob("./pages/**/*(page|layout).tsx");
const errorFiles = import.meta.glob("./pages/**/*error.tsx");
const notFoundFiles = import.meta.glob("./pages/**/*404.tsx");
const loadingFiles = import.meta.glob("./pages/**/*loading.tsx");

const routes = convertPagesToRoute(files, loadingFiles) as RouteObject;
addErrorElementToRoutes(errorFiles, routes);
add404PageToRoutesChildren(notFoundFiles, routes);

const router = createBrowserRouter([routes]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ReactQueryProvider>
      <AuthProvider store={authStore}>
        <RouterProvider router={router} />
      </AuthProvider>
    </ReactQueryProvider>
  </StrictMode>
);
