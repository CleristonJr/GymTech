import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import StudentDetailClient from "./StudentDetailClient";

export default async function StudentDetails({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const rawStudent = await prisma.user.findUnique({
    where: { id },
    include: {
      measurements: {
        orderBy: { createdAt: 'desc' }
      },
      studentPlans: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!rawStudent) {
    redirect("/trainer");
  }

  const exercises = await prisma.exercise.findMany({
    orderBy: { name: 'asc' }
  });

  const studentData = {
    id: rawStudent.id,
    name: rawStudent.name,
    email: rawStudent.email,
    currentPlan: rawStudent.studentPlans.length > 0 ? rawStudent.studentPlans[0].name : null,
    measurements: rawStudent.measurements.map(m => ({
      id: m.id,
      date: m.createdAt,
      weight: m.weight,
      bodyFat: m.bodyFat,
      note: m.note
    }))
  };

  return <StudentDetailClient student={studentData} exercises={exercises} />;
}
