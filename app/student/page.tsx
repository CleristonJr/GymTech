import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import StudentDashboardClient from "./StudentDashboardClient";

import { getSession } from "@/lib/session";

export default async function StudentDashboard() {
  const session = await getSession();
  if (!session || session.role !== "STUDENT") {
    redirect("/login");
  }
  const userId = session.userId;

  const rawStudent = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      gym: true,
      measurements: {
        orderBy: { createdAt: 'asc' }
      },
      sessions: {
        where: { status: 'COMPLETED' },
        orderBy: { finishedAt: 'desc' },
        take: 1,
        include: { routine: true }
      },
      studentPlans: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
          routines: {
            orderBy: { orderIndex: 'asc' }
          }
        }
      }
    }
  });

  if (!rawStudent) {
    redirect("/login");
  }

  let activePlan = null;
  let activeRoutine = null;

  if (rawStudent.studentPlans.length > 0) {
    const plan = rawStudent.studentPlans[0];
    if (plan.routines.length > 0) {
      activePlan = { id: plan.id, name: plan.name };
      
      const lastSession = rawStudent.sessions.length > 0 ? rawStudent.sessions[0] : null;
      let nextIndex = 0;

      if (lastSession && lastSession.routine.workoutPlanId === plan.id) {
        const lastRoutineIndex = plan.routines.findIndex(r => r.id === lastSession.routineId);
        if (lastRoutineIndex !== -1) {
          nextIndex = (lastRoutineIndex + 1) % plan.routines.length;
        }
      }

      activeRoutine = {
        id: plan.routines[nextIndex].id,
        name: plan.routines[nextIndex].name
      };
    }
  }

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
    activeRoutine,
    measurements
  };

  return <StudentDashboardClient student={studentData} />;
}
