import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkoutClient from "./WorkoutClient";

export default async function WorkoutExecution({ searchParams }: { searchParams: Promise<{ routineId?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const { routineId } = await searchParams;

  if (!userId || !routineId) {
    redirect("/student");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    redirect("/login");
  }

  const routine = await prisma.routine.findUnique({
    where: { id: routineId },
    include: {
      workoutPlan: true,
      exercises: {
        orderBy: { orderIndex: 'asc' },
        include: { exercise: true }
      }
    }
  });

  if (!routine) {
    redirect("/student");
  }

  const formattedExercises = routine.exercises.map(pe => ({
    name: pe.exercise.name,
    sets: pe.sets,
    reps: pe.reps,
    duration: pe.duration,
    restTimeSecs: pe.restTimeSecs,
    observation: pe.observation
  }));

  return <WorkoutClient routineId={routine.id} routineName={`${routine.workoutPlan.name} - ${routine.name}`} exercises={formattedExercises} currentStreak={user.streak} currentCrystals={user.crystals} />;
}
