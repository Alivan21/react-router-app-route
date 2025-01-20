import { useRouteError } from "react-router";

export default function NotFoundPage() {
  const error = useRouteError();
  console.log("Notfound:", error);
  return <div>NotFoundPage</div>;
}
