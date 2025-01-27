import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouteObject, RouterProvider, createBrowserRouter } from "react-router";
import {
  add404PageToRoutesChildren,
  addErrorElementToRoutes,
  convertPagesToRoute,
} from "@/lib/router.tsx";
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
    <RouterProvider router={router} />
  </StrictMode>
);
