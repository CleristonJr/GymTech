import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import StudentDetailClient from "./StudentDetailClient";
import { getSession } from "@/lib/session";

export default async function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  const gymId = session?.gymId;
  const role = session?.role;

  const rawStudent = await prisma.user.findUnique({
    where: { id },
    include: {
      measurements: {
        orderBy: { createdAt: 'desc' }
      },
      studentPlans: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          routines: {
            orderBy: { orderIndex: 'asc' },
            include: {
              exercises: {
                orderBy: { orderIndex: 'asc' },
                include: { exercise: true }
              }
            }
          }
        }
      }
    }
  });

  if (!rawStudent || rawStudent.gymId !== gymId || (role !== "TRAINER" && role !== "GYM_ADMIN")) {
    if (role === "GYM_ADMIN") redirect("/manager");
    redirect("/trainer");
  }

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  });

  // Actually we need the logged in user's ID
  const userId = session?.userId;
  // Pegar os IDs dos gestores da academia para exibir os modelos deles também
  const gymAdmins = await prisma.user.findMany({
    where: { gymId, role: "GYM_ADMIN" },
    select: { id: true }
  });
  const adminIds = gymAdmins.map(a => a.id);
  const allowedTrainerIds = userId ? [userId, ...adminIds] : adminIds;

  const trainerTemplates = await prisma.workoutPlan.findMany({
    where: { trainerId: { in: allowedTrainerIds }, studentId: null },
    include: {
      routines: {
        orderBy: { orderIndex: 'asc' },
        include: {
          exercises: { orderBy: { orderIndex: 'asc' } }
        }
      }
    }
  });

  const studentData = {
    id: rawStudent.id,
    name: rawStudent.name,
    email: rawStudent.email,
    shortId: rawStudent.shortId,
    currentPlan: rawStudent.studentPlans.length > 0 ? rawStudent.studentPlans[0] : null,
    measurements: rawStudent.measurements.map(m => ({
      id: m.id,
      date: m.createdAt,
      weight: m.weight,
      bodyFat: m.bodyFat,
      note: m.note
    }))
  };

  return <StudentDetailClient student={studentData} exercises={exercises} templates={trainerTemplates} userRole={role as string} />;
}
