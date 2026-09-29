import type { Route } from "./+types/not-found";

export default function AdminNotFound({ params }: Route.ComponentProps) {
  return (
    <p data-testid="admin-not-found">
      الصفحة غير موجودة: <bdi>/admin/{params["*"]}</bdi>
    </p>
  );
}
