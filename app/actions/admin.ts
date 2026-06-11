"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { getSession } from "@/lib/session";

async function isSuperAdmin() {
  const session = await getSession();
  return session?.role === "SUPER_ADMIN";
}

export async function resetAdminPassword(userId: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };

    const hashedPassword = await bcrypt.hash("123456", 10);

    await prisma.user.update({
      where: { id: userId, role: "GYM_ADMIN" },
      data: {
        password: hashedPassword,
        mustChangePassword: true
      }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar senha de admin:", error);
    return { error: "Erro ao resetar a senha do gestor." };
  }
}

export async function changeAdminEmail(userId: string, newEmail: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };

    const cleanEmail = newEmail.trim();
    if (!cleanEmail) return { error: "E-mail inválido." };

    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser && existingUser.id !== userId) return { error: "Este e-mail já está em uso." };

    await prisma.user.update({
      where: { id: userId, role: "GYM_ADMIN" },
      data: { email: cleanEmail }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao alterar e-mail de admin:", error);
    return { error: "Erro ao alterar o e-mail." };
  }
}

export async function removeAdmin(userId: string) {
  try {
    if (!(await isSuperAdmin())) return { error: "Acesso negado." };

    await prisma.user.delete({
      where: { id: userId, role: "GYM_ADMIN" }
    });

    revalidatePath("/admin");
    return { success: true };
  } catch (error) {
    console.error("Erro ao remover admin:", error);
    return { error: "Erro ao remover o gestor." };
  }
}
