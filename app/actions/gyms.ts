"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createGym(name: string) {
  try {
    if (!name) return { error: "Nome da academia é obrigatório." };

    await prisma.gym.create({
      data: { name },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar academia:", error);
    return { error: "Erro ao criar academia no banco de dados." };
  }
}

export async function updateGym(id: string, name: string) {
  try {
    await prisma.gym.update({
      where: { id },
      data: { name },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar academia:", error);
    return { error: "Erro ao atualizar a academia." };
  }
}

export async function toggleGymStatus(id: string, currentStatus: string) {
  try {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    
    await prisma.gym.update({
      where: { id },
      data: { status: newStatus },
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar status:", error);
    return { error: "Erro ao alterar o status da academia." };
  }
}
