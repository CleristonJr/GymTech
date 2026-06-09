"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

// Helper para pegar o gymId do gestor logado
async function getManagerGymId() {
  const cookieStore = await cookies();
  return cookieStore.get('gymId')?.value;
}

export async function createStaffMember(name: string, email: string, role: "TRAINER" | "STUDENT", temporaryPassword?: string) {
  try {
    const gymId = await getManagerGymId();
    if (!gymId) return { error: "Acesso negado. Você não está vinculado a uma academia." };

    if (!name || !email) return { error: "Nome e e-mail são obrigatórios." };

    // Verifica se e-mail existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "Este e-mail já está em uso." };

    // Senha padrão ou fornecida
    const passToHash = temporaryPassword || "123456";
    const hashedPassword = await bcrypt.hash(passToHash, 10);

    await prisma.user.create({
      data: {
        name,
        email,
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
