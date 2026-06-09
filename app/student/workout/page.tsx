import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import WorkoutClient from "./WorkoutClient";

export default async function WorkoutExecution({ searchParams }: { searchParams: Promise<{ planId?: string }> }) {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  const { planId } = await searchParams;

  if (!userId || !planId) {
    redirect("/student");
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  
  if (!user) {
    redirect("/login");
  }

  const plan = await prisma.workoutPlan.findUnique({
    where: { id: planId },
    include: {
      exercises: {
        orderBy: { orderIndex: 'asc' },
        include: { exercise: true }
      }
    }
  });

  if (!plan) {
    redirect("/student");
  }

  const formattedExercises = plan.exercises.map(pe => ({
    name: pe.exercise.name,
    sets: pe.sets,
    reps: pe.reps
  }));

  return <WorkoutClient planId={plan.id} exercises={formattedExercises} currentStreak={user.streak} currentCrystals={user.crystals} />;
}
