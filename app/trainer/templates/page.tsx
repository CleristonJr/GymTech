import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import TemplatesClient from "./TemplatesClient";

export default async function TemplatesPage() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (!userId || (role !== "TRAINER" && role !== "GYM_ADMIN")) {
    redirect("/login");
  }

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

  return <TemplatesClient initialTemplates={templates} exercises={exercises} />;
}
