"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

async function getTrainerContext() {
  const cookieStore = await cookies();
  const userId = cookieStore.get('userId')?.value;
  const gymId = cookieStore.get('gymId')?.value;
  return { userId, gymId };
}

export async function addMeasurement(studentId: string, weight: number, bodyFat: number | null, note: string | null) {
  try {
    const { gymId } = await getTrainerContext();
    if (!gymId) return { error: "Não autorizado." };

    await prisma.measurement.create({
      data: {
        studentId,
        weight,
        bodyFat,
        note
      }
    });

    revalidatePath(`/trainer/student/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao adicionar avaliação:", error);
    return { error: "Erro ao salvar avaliação." };
  }
}

export async function createExercise(name: string) {
  try {
    const exercise = await prisma.exercise.create({
      data: { name }
    });
    return { success: true, exercise };
  } catch (error) {
    return { error: "Erro ao criar exercício." };
  }
}

export async function createWorkoutPlan(studentId: string, planName: string, exercises: { exerciseId: string, sets: number, reps: number }[]) {
  try {
    const { userId } = await getTrainerContext();
    if (!userId) return { error: "Não autorizado." };

    await prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.create({
        data: {
          name: planName,
          studentId,
          trainerId: userId,
        }
      });

      for (let i = 0; i < exercises.length; i++) {
        await tx.workoutExercise.create({
          data: {
            workoutPlanId: plan.id,
            exerciseId: exercises[i].exerciseId,
            sets: exercises[i].sets,
            reps: exercises[i].reps,
            orderIndex: i
          }
        });
      }
    });

    revalidatePath(`/trainer`);
    revalidatePath(`/trainer/student/${studentId}`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar plano:", error);
    return { error: "Erro ao criar a ficha de treino." };
  }
}
