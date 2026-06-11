import { prisma } from "@/lib/prisma";
import AdminGymClient from "./AdminGymClient";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function SuperAdminDashboard() {
  const session = await getSession();
  if (!session || session.role !== "SUPER_ADMIN") {
    redirect("/login");
  }
  // Busca as academias no banco de dados e conta os usuários de cada uma
  const gyms = await prisma.gym.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { users: true }
      },
      users: {
        where: { role: "GYM_ADMIN" },
        select: { id: true, name: true, email: true }
      }
    }
  });

  return <AdminGymClient gyms={gyms} />;
}
