import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TrainerClient from "./TrainerClient";

import { getSession } from "@/lib/session";

export default async function TrainerDashboard() {
  const session = await getSession();
  if (!session || !session.gymId || session.role !== "TRAINER") {
    redirect("/login");
  }
  const gymId = session.gymId;

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
    shortId: s.shortId,
    lastPlanName: s.studentPlans.length > 0 ? s.studentPlans[0].name : null,
    lastSessionDate: s.sessions.length > 0 ? s.sessions[0].startedAt : null
  }));

  return <TrainerClient students={formattedStudents} />;
}
