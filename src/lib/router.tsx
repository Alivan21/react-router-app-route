import { lazy, LazyExoticComponent } from "react";
import { ActionFunction, LoaderFunction, RouteObject } from "react-router";

interface PageModuleExports {
  default: () => JSX.Element;
  loader?: LoaderFunction;
  action?: ActionFunction;
}

interface LoadingModuleExports {
  default: () => JSX.Element;
}

type PageModule = () => Promise<PageModuleExports>;

const separator = "\\";

export function convertPagesToRoute(
  files: Record<string, () => Promise<unknown>>,
  loadingFiles: Record<string, () => Promise<unknown>> = {}
): RouteObject {
  let routes: RouteObject = { path: "/" };
  Object.entries(files).forEach(([filePath, importer]) => {
    const segments = getRouteSegmentsFromFilePath(filePath);
    const page = lazy(importer as PageModule);
    // Find matching loading component for this route
    const loadingComponent = findMatchingLoadingComponent(filePath, loadingFiles);

    const route = createRoute({
      PageComponent: page,
      LoadingComponent: loadingComponent,
      segments,
      async action(args) {
        const result = (await importer()) as PageModuleExports;
        return "action" in result ? result.action?.(args) : null;
      },
      async loader(args) {
        const result = (await importer()) as PageModuleExports;
        return "loader" in result ? result.loader?.(args) : null;
      },
    });
    routes = mergeRoutes(routes, route);
  });
  return routes;
}

function findMatchingLoadingComponent(
  filePath: string,
  loadingFiles: Record<string, () => Promise<unknown>>
) {
  // First try local loading file
  const loadingPath = filePath.replace(/(page|layout)\.tsx$/, "loading.tsx");

  // Then try group folder loading file (e.g., (auth/loading.tsx))
  const groupMatch = filePath.match(/\([^/]+\//);
  const groupLoadingPath = groupMatch ? `/${groupMatch[0]}loading.tsx` : null;

  // Finally try global loading file
  const globalLoadingPath = "./pages/loading.tsx";

  // Try to find loader in order: local -> group -> global
  const loader =
    loadingFiles[loadingPath] ||
    (groupLoadingPath && loadingFiles[groupLoadingPath]) ||
    loadingFiles[globalLoadingPath];

  if (!loader) return undefined;

  return lazy(loader as () => Promise<LoadingModuleExports>);
}

function mergeRoutes(target: RouteObject, source: RouteObject) {
  if (target.path !== source.path)
    throw new Error(`Paths do not match: "${target.path}" and "${source.path}"`);

  // Prioritize layouts by handling them first
  if (source.handle?.pageType === "layout") {
    if (!target.element) {
      // If target doesn't have an element, apply the layout
      target.element = source.element;
      target.HydrateFallback = source.HydrateFallback;
      target.action = source.action;
      target.loader = source.loader;
      target.handle = source.handle;
      target.errorElement = source.errorElement;
      target.children = target.children ?? [];
    } else if (target.handle?.pageType === "page") {
      // If target is a page, make it an index route under the layout
      target = swapTargetRouteAsIndexRouteAndUpdateWithRoute(target, source);
    }
    return target;
  }

  // Handle other cases...
  if (target.handle?.pageType === "layout" && source.handle?.pageType === "page") {
    target = addRouteAsIndexRouteForTargetRoute(target, source);
    return target;
  }

  // Rest of the existing mergeRoutes logic...
  if (source.children) {
    target.children = target.children ?? [];
    source.children.forEach((sourceChild) => {
      const matchingChild = target.children?.find(
        (targetChild) => targetChild.path === sourceChild.path
      );
      if (matchingChild) mergeRoutes(matchingChild, sourceChild);
      else target.children?.push(sourceChild);
    });
  }

  return target;
}

function swapTargetRouteAsIndexRouteAndUpdateWithRoute(target: RouteObject, route: RouteObject) {
  target.children = target.children ?? [];
  target.children.push({
    index: true,
    element: target.element,
    HydrateFallback: target.HydrateFallback,
    action: target.action,
    loader: target.loader,
    handle: target.handle,
    errorElement: target.errorElement,
  });

  target.element = route.element;
  target.HydrateFallback = route.HydrateFallback;
  target.action = route.action;
  target.loader = route.loader;
  target.handle = route.handle;
  target.errorElement = route.errorElement;

  return target;
}

function addRouteAsIndexRouteForTargetRoute(target: RouteObject, route: RouteObject) {
  target.children = target.children ?? [];
  target.children.push({
    index: true,
    element: route.element,
    HydrateFallback: route.HydrateFallback,
    action: route.action,
    loader: route.loader,
    handle: route.handle,
    errorElement: route.errorElement,
  });
  return target;
}

function createRoute(args: {
  segments: string[];
  PageComponent: LazyExoticComponent<() => JSX.Element>;
  LoadingComponent?: LazyExoticComponent<() => JSX.Element>;
  loader?: LoaderFunction;
  action?: ActionFunction;
}): RouteObject {
  const [current, ...rest] = args.segments;
  const [cleanPath, pageType] = current.split(separator);
  const route: RouteObject = { path: cleanPath };

  // Always attach loading state for layouts
  if (current.includes(separator) || pageType === "layout") {
    route.element = <args.PageComponent />;
    route.HydrateFallback = args.LoadingComponent ?? (() => <div>Loading...</div>);
    route.action = args.action;
    route.loader = args.loader;
    route.handle = { pageType };
  }

  if (pageType === "layout") route.children = [];
  if (rest.length > 0) route.children = [createRoute({ ...args, segments: rest })];

  return route;
}

export function getRouteSegmentsFromFilePath(
  filePath: string,
  transformer = (segment: string, prevSegment: string) =>
    `${prevSegment}${separator}${getFileNameWithoutExtension(segment)}`
): string[] {
  const segments = filePath
    .replace("/pages", "")
    .split("/")
    .filter((segment) => !segment.startsWith("(index)") && !segment.startsWith("_"))
    .map((segment) => {
      if (segment.startsWith(".")) return "/";
      if (segment.startsWith("("))
        return getParamFromSegment(segment).replace("(", "").replace(")", "") + "?";
      if (segment.startsWith("[")) return getParamFromSegment(segment);
      return segment;
    });

  return getRouteSegments(segments[0], segments, transformer);
}

function getFileNameWithoutExtension(file: string) {
  return file.split(".")[0];
}

function getRouteSegments(
  segment: string,
  segments: string[],
  transformer: (seg: string, prev: string) => string,
  entries: string[] = [],
  index = 0
): string[] {
  if (index > segments.length) throw new Error("Cannot exceed total number of segments");
  if (index === segments.length - 1) {
    entries.push(transformer(segment, String(entries.pop())));
    return entries;
  }
  const nextIndex = index + 1;
  if (!segment.startsWith(":")) entries.push(segment);
  else entries.push(`${entries.pop()}/${segment}`);
  return getRouteSegments(segments[nextIndex], segments, transformer, entries, nextIndex);
}

function getParamFromSegment(segment: string) {
  if (segment.includes("...")) return "*";
  return segment.replace("[", ":").replace("]", "");
}

export function addErrorElementToRoutes(
  errorFiles: Record<string, () => Promise<unknown>>,
  routes: RouteObject
) {
  Object.entries(errorFiles).forEach(([filePath, importer]) => {
    const segments = getRouteSegmentsFromFilePath(filePath, (_, prevSegment) => prevSegment);
    const ErrorBoundary = lazy(importer as () => Promise<{ default: () => JSX.Element }>);
    setRoute(segments, routes, (route) => {
      route.errorElement = <ErrorBoundary />;
      return route;
    });
  });
}

export function add404PageToRoutesChildren(
  notFoundFiles: Record<string, () => Promise<unknown>>,
  routes: RouteObject
) {
  Object.entries(notFoundFiles).forEach(([filePath, importer]) => {
    const segments = getRouteSegmentsFromFilePath(filePath, (_, prevSegment) => prevSegment);
    const NotFound = lazy(importer as () => Promise<{ default: () => JSX.Element }>);
    setRoute(segments, routes, (route) => {
      // add not found route if there is are children
      if (route.children) route.children.push({ path: "*", element: <NotFound /> });
      else {
        // if there are no children, then add children to the route and move the current route to the
        // children as the index route and add the not found page
        const tempRoute = Object.assign({}, route);
        route.children = route.children ?? [];
        route.children.push({
          index: true,
          element: tempRoute.element,
          action: tempRoute.action,
          loader: tempRoute.loader,
        });
        route.children.push({ path: "*", element: <NotFound /> });

        // delete or remove the matched route element, action & loader to make it a pathless route
        delete route.element;
        delete route.action;
        delete route.loader;
      }
      return route;
    });
  });
}

function setRoute(
  segments: string[],
  route: RouteObject,
  updater: (route: RouteObject) => RouteObject
): void {
  let temp = route;
  segments.forEach((_segment, i) => {
    const isLastSegment = i === segments.length - 1;
    if (isLastSegment) return (temp = updater(temp));

    if (!isLastSegment) {
      const nextSegment = segments[i + 1];
      const index = temp.children?.findIndex((child) => child.path === nextSegment);
      if (typeof index !== "number" || index === -1) {
        const msg = `Segment ${nextSegment} does not exist among the children of route with path ${temp.path}`;
        throw new Error(msg);
      }

      temp = temp.children?.[index] as RouteObject;
    }
  });
}
