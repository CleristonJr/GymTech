"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

async function getTrainerContext() {
  const session = await getSession();
  if (!session || (session.role !== "TRAINER" && session.role !== "GYM_ADMIN")) {
    return { userId: null, gymId: null };
  }
  return { userId: session.userId, gymId: session.gymId };
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

type RoutineData = {
  name: string;
  exercises: { exerciseId: string, sets: number, reps: number | null, duration: string | null, restTimeSecs: number, observation: string | null }[];
};

export async function createWorkoutPlan(studentId: string, planName: string, routines: RoutineData[]) {
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

      for (let r = 0; r < routines.length; r++) {
        const routine = await tx.routine.create({
          data: {
            workoutPlanId: plan.id,
            name: routines[r].name || `Treino ${String.fromCharCode(65 + r)}`,
            orderIndex: r
          }
        });

        const exercises = routines[r].exercises;
        for (let i = 0; i < exercises.length; i++) {
          await tx.workoutExercise.create({
            data: {
              routineId: routine.id,
              exerciseId: exercises[i].exerciseId,
              sets: exercises[i].sets,
              reps: exercises[i].reps,
              duration: exercises[i].duration,
              restTimeSecs: exercises[i].restTimeSecs,
              observation: exercises[i].observation,
              orderIndex: i
            }
          });
        }
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

export async function updateWorkoutPlan(planId: string, planName: string, routines: RoutineData[]) {
  try {
    const { userId } = await getTrainerContext();
    if (!userId) return { error: "Não autorizado." };

    await prisma.$transaction(async (tx) => {
      // 1. Atualizar o nome da ficha
      await tx.workoutPlan.update({
        where: { id: planId },
        data: { name: planName }
      });

      // 2. Deletar as rotinas antigas (o Cascade irá deletar os exercícios e sessões)
      await tx.routine.deleteMany({
        where: { workoutPlanId: planId }
      });

      // 3. Recriar as rotinas com a nova estrutura
      for (let r = 0; r < routines.length; r++) {
        const routine = await tx.routine.create({
          data: {
            workoutPlanId: planId,
            name: routines[r].name || `Treino ${String.fromCharCode(65 + r)}`,
            orderIndex: r
          }
        });

        const exercises = routines[r].exercises;
        for (let i = 0; i < exercises.length; i++) {
          await tx.workoutExercise.create({
            data: {
              routineId: routine.id,
              exerciseId: exercises[i].exerciseId,
              sets: exercises[i].sets,
              reps: exercises[i].reps,
              duration: exercises[i].duration,
              restTimeSecs: exercises[i].restTimeSecs,
              observation: exercises[i].observation,
              orderIndex: i
            }
          });
        }
      }
    });

    // We don't know the exact studentId here unless we fetch it, so we can revalidate the entire trainer area
    revalidatePath(`/trainer`, 'layout');
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar plano:", error);
    return { error: "Erro ao atualizar a ficha de treino." };
  }
}

export async function createWorkoutTemplate(planName: string, routines: RoutineData[]) {
  try {
    const { userId } = await getTrainerContext();
    if (!userId) return { error: "Não autorizado." };

    await prisma.$transaction(async (tx) => {
      const plan = await tx.workoutPlan.create({
        data: {
          name: planName,
          trainerId: userId,
          // studentId is implicitly undefined/null here
        }
      });

      for (let r = 0; r < routines.length; r++) {
        const routine = await tx.routine.create({
          data: {
            workoutPlanId: plan.id,
            name: routines[r].name || `Treino ${String.fromCharCode(65 + r)}`,
            orderIndex: r
          }
        });

        const exercises = routines[r].exercises;
        for (let i = 0; i < exercises.length; i++) {
          await tx.workoutExercise.create({
            data: {
              routineId: routine.id,
              exerciseId: exercises[i].exerciseId,
              sets: exercises[i].sets,
              reps: exercises[i].reps,
              duration: exercises[i].duration,
              restTimeSecs: exercises[i].restTimeSecs,
              observation: exercises[i].observation,
              orderIndex: i
            }
          });
        }
      }
    });

    revalidatePath(`/trainer/templates`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar modelo:", error);
    return { error: "Erro ao criar o modelo de ficha." };
  }
}

export async function deleteWorkoutTemplate(planId: string) {
  try {
    const { userId } = await getTrainerContext();
    if (!userId) return { error: "Não autorizado." };

    // Deleta o WorkoutPlan (as rotinas e exercícios serão deletados em cascata)
    await prisma.workoutPlan.delete({
      where: { id: planId }
    });

    revalidatePath(`/trainer/templates`);
    return { success: true };
  } catch (error) {
    console.error("Erro ao deletar modelo:", error);
    return { error: "Erro ao excluir o modelo." };
  }
}

export async function getTrainerTemplates() {
  try {
    const { userId } = await getTrainerContext();
    if (!userId) return { error: "Não autorizado." };

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

    return { success: true, templates };
  } catch (error) {
    console.error("Erro ao buscar modelos:", error);
    return { error: "Erro ao buscar os modelos de ficha." };
  }
}
