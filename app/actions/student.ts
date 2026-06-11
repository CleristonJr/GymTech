"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function finishWorkoutSession(routineId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return { error: "Usuário não autenticado." };
    const userId = session.userId;

    // Registra a sessão de treino no banco
    await prisma.workoutSession.create({
      data: {
        studentId: userId,
        routineId: routineId,
        startedAt: new Date(Date.now() - 45 * 60000), // Simula que começou há 45 min
        finishedAt: new Date(),
        status: "COMPLETED"
      }
    });

    // Atualiza gamificação: +50 pontos, aumenta a ofensiva
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: user.points + 50,
          streak: user.streak + 1
        }
      });
    }

    revalidatePath("/student");
    return { success: true };
  } catch (error) {
    console.error("Erro ao finalizar treino:", error);
    return { error: "Erro ao salvar a sessão." };
  }
}
