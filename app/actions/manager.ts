"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

import { getSession } from "@/lib/session";

// Helper para pegar o gymId do gestor logado e garantir que ele é gestor
async function getManagerGymId() {
  const session = await getSession();
  if (!session || session.role !== "GYM_ADMIN") return null;
  return session.gymId;
}

export async function createStaffMember(name: string, email: string, role: "TRAINER" | "STUDENT", temporaryPassword?: string) {
  try {
    const gymId = await getManagerGymId();
    if (!gymId) return { error: "Acesso negado. Você não está vinculado a uma academia." };

    const cleanEmail = email?.trim();
    if (!name || !cleanEmail) return { error: "Nome e e-mail são obrigatórios." };

    // Verifica se e-mail existe
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) return { error: "Este e-mail já está em uso." };

    // Senha padrão ou fornecida
    const passToHash = temporaryPassword || "123456";
    const hashedPassword = await bcrypt.hash(passToHash, 10);

    await prisma.user.create({
      data: {
        name,
        email: cleanEmail,
        password: hashedPassword,
        role,
        gymId,
        mustChangePassword: true, // Força a troca no primeiro acesso
        shortId: role === "STUDENT" ? `#ALUNO-${Math.floor(1000 + Math.random() * 9000)}` : null
      }
    });

    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar membro da equipe:", error);
    return { error: "Erro ao cadastrar usuário no banco de dados." };
  }
}

export async function removeUser(userId: string) {
  try {
    const gymId = await getManagerGymId();
    if (!gymId) return { error: "Acesso negado." };

    // Verifica se o usuário pertence à mesma academia do gestor
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.gymId !== gymId) {
      return { error: "Usuário não encontrado ou não pertence à sua academia." };
    }

    await prisma.user.delete({ where: { id: userId } });

    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return { error: "Erro ao remover o usuário. Ele pode estar vinculado a planos de treino." };
  }
}

export async function resetUserPassword(userId: string) {
  try {
    const gymId = await getManagerGymId();
    if (!gymId) return { error: "Acesso negado." };

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.gymId !== gymId) {
      return { error: "Usuário não encontrado ou não pertence à sua academia." };
    }

    const hashedPassword = await bcrypt.hash("123456", 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    revalidatePath("/manager");
    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar senha:", error);
    return { error: "Erro ao resetar a senha." };
  }
}
