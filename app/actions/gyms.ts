"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/session";

async function isSuperAdmin() {
  const session = await getSession();
  return session?.role === "SUPER_ADMIN";
}

export async function createGym(name: string, managerEmail?: string, managerPassword?: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };
    if (!name) return { error: "Nome da academia é obrigatório." };

    if (managerEmail && managerPassword) {
      // Verifica se o e-mail já existe
      const existingUser = await prisma.user.findUnique({ where: { email: managerEmail } });
      if (existingUser) return { error: "Este e-mail já está em uso por outro usuário." };

      const hashedPassword = await bcrypt.hash(managerPassword, 10);

      // Cria a academia e o usuário na mesma transação
      await prisma.$transaction(async (tx) => {
        const gym = await tx.gym.create({ data: { name } });
        await tx.user.create({
          data: {
            email: managerEmail,
            password: hashedPassword,
            name: "Gestor",
            role: "GYM_ADMIN",
            gymId: gym.id,
            mustChangePassword: true
          }
        });
      });
    } else {
      await prisma.gym.create({ data: { name } });
    }

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar academia:", error);
    return { error: "Erro ao criar academia no banco de dados." };
  }
}

export async function updateGym(id: string, name: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };
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
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };
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

export async function deleteGym(id: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };
    // Exclui usuários atrelados primeiro ou usa onDelete Cascade no schema.
    // Como não temos Cascade, deletamos manualmente os usuários vinculados (ou impede a deleção).
    // Simplificação: Deletar usuários vinculados à academia.
    await prisma.$transaction([
      prisma.user.deleteMany({ where: { gymId: id } }),
      prisma.gym.delete({ where: { id } })
    ]);

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir academia:", error);
    return { error: "Erro ao excluir a academia." };
  }
}
