import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import ManagerClient from "./ManagerClient";

export default async function GymManagerDashboard() {
  const session = await getSession();
  if (!session || !session.gymId || session.role !== "GYM_ADMIN") {
    redirect("/login");
  }
  const gymId = session.gymId;

  // Busca o nome da academia
  const gym = await prisma.gym.findUnique({
    where: { id: gymId },
    select: { name: true }
  });

  // Busca os Personais
  const trainers = await prisma.user.findMany({
    where: { gymId, role: "TRAINER" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      _count: {
        select: { trainerPlans: true } // Quantos planos eles criaram
      }
    },
    orderBy: { name: "asc" }
  });

  // Busca os Alunos
  const students = await prisma.user.findMany({
    where: { gymId, role: "STUDENT" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true
    },
    orderBy: { name: "asc" }
  });

  return <ManagerClient gymName={gym?.name || "Desconhecida"} trainers={trainers as any} students={students as any} />;
}
