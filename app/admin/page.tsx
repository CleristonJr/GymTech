import { prisma } from "@/lib/prisma";
import AdminGymClient from "./AdminGymClient";

export default async function SuperAdminDashboard() {
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
