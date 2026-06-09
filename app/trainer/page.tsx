import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TrainerClient from "./TrainerClient";

export default async function TrainerDashboard() {
  const cookieStore = await cookies();
  const gymId = cookieStore.get("gymId")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (!gymId || role !== "TRAINER") {
    redirect("/login");
  }

  // Busca todos os alunos desta academia
  const rawStudents = await prisma.user.findMany({
    where: { gymId, role: "STUDENT" },
    include: {
      studentPlans: {
        orderBy: { createdAt: 'desc' },
        take: 1
      },
      sessions: {
        orderBy: { startedAt: 'desc' },
        take: 1
      }
    },
    orderBy: { name: "asc" }
  });

  const formattedStudents = rawStudents.map(s => ({
    id: s.id,
    name: s.name,
    lastPlanName: s.studentPlans.length > 0 ? s.studentPlans[0].name : null,
    lastSessionDate: s.sessions.length > 0 ? s.sessions[0].startedAt : null
  }));

  return <TrainerClient students={formattedStudents} />;
}
