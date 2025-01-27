import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouteObject, RouterProvider, createBrowserRouter } from "react-router";
import ReactQueryProvider from "./lib/react-query/query-client-provider";
import {
  add404PageToRoutesChildren,
  addErrorElementToRoutes,
  convertPagesToRoute,
} from "@/lib/react-router/router";
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
      <RouterProvider router={router} />
    </ReactQueryProvider>
  </StrictMode>
);
