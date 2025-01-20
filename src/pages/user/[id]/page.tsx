import { useParams } from "react-router";

export default function UserDetailPage() {
  const { id } = useParams();
  return (
    <div>
      UserDetailPage
      <p>User ID: {id}</p>
    </div>
  );
}
