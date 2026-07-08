import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { AdminDashboard } from "@/components/admin/admin-dashboard";

export const metadata = {
  title: "Administración — Venezuela Te Ayuda",
};

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");
  if (session.user.role !== "ADMIN") redirect("/admin/login");

  return <AdminDashboard />;
}
