import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { add404PageToRoutesChildren } from "./lib/router.tsx";
import { addErrorElementToRoutes } from "./lib/router.tsx";
import { convertPagesToRoute } from "./lib/router.tsx";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./index.css";

const files = import.meta.glob("./pages/**/*(page|layout).tsx");
const errorFiles = import.meta.glob("./pages/**/*error.tsx");
const notFoundFiles = import.meta.glob("./pages/**/*404.tsx");

const routes = convertPagesToRoute(files);
addErrorElementToRoutes(errorFiles, routes);
add404PageToRoutesChildren(notFoundFiles, routes);

const router = createBrowserRouter([routes]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
