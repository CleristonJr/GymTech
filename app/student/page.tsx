import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./StudentDashboardClient";

export default async function StudentDashboard() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const role = cookieStore.get("userRole")?.value;

  if (!userId || role !== "STUDENT") {
    redirect("/login");
  }

  const rawStudent = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gym: true,
      measurements: {
        orderBy: { createdAt: 'asc' } // Para o gráfico evoluir na ordem certa
      },
      studentPlans: {
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!rawStudent) {
    redirect("/login");
  }

  const activePlan = rawStudent.studentPlans.length > 0 ? {
    id: rawStudent.studentPlans[0].id,
    name: rawStudent.studentPlans[0].name
  } : null;

  const measurements = rawStudent.measurements.map(m => {
    const d = new Date(m.createdAt);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      peso: m.weight,
      bf: m.bodyFat
    };
  });

  const studentData = {
    name: rawStudent.name,
    points: rawStudent.points,
    streak: rawStudent.streak,
    crystals: rawStudent.crystals,
    gymName: rawStudent.gym?.name || "GymTech",
    activePlan,
    measurements
  };

  return <StudentDashboardClient student={studentData} />;
}
