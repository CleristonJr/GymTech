import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TemplatesClient from "./TemplatesClient";
import { getSession } from "@/lib/session";

export default async function TemplatesPage() {
  const session = await getSession();
  if (!session || (session.role !== "TRAINER" && session.role !== "GYM_ADMIN")) {
    redirect("/login");
  }
  const userId = session.userId;

  const templates = await prisma.workoutPlan.findMany({
    where: {
      trainerId: userId,
      studentId: null
    },
    include: {
      routines: {
        orderBy: { orderIndex: 'asc' },
        include: {
          exercises: {
            orderBy: { orderIndex: 'asc' },
            include: {
              exercise: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  });

  return <TemplatesClient initialTemplates={templates} exercises={exercises} userRole={session.role as string} />;
}
