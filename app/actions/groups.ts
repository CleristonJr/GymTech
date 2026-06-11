"use server";

import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/session";

export async function createGroup(name: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return { error: "Usuário não autenticado." };
    const userId = session.userId;

    const inviteCode = `G-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await prisma.$transaction(async (tx) => {
      const group = await tx.group.create({
        data: {
          name,
          ownerId: userId,
          inviteCode
        }
      });

      await tx.groupMember.create({
        data: {
          groupId: group.id,
          userId
        }
      });
    });

    revalidatePath("/student/groups");
    return { success: true, inviteCode };
  } catch (error) {
    console.error("Erro ao criar grupo:", error);
    return { error: "Erro ao criar a liga." };
  }
}

export async function joinGroup(inviteCode: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return { error: "Usuário não autenticado." };
    const userId = session.userId;

    const group = await prisma.group.findUnique({
      where: { inviteCode }
    });

    if (!group) return { error: "Grupo não encontrado. Verifique o código." };

    const existingMember = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: {
          groupId: group.id,
          userId
        }
      }
    });

    if (existingMember) return { error: "Você já está neste grupo." };

    await prisma.groupMember.create({
      data: {
        groupId: group.id,
        userId
      }
    });

    revalidatePath("/student/groups");
    return { success: true };
  } catch (error) {
    console.error("Erro ao entrar no grupo:", error);
    return { error: "Erro ao entrar no grupo." };
  }
}

export async function leaveGroup(groupId: string) {
  try {
    const session = await getSession();
    if (!session || session.role !== "STUDENT") return { error: "Usuário não autenticado." };
    const userId = session.userId;

    await prisma.groupMember.delete({
      where: {
        groupId_userId: {
          groupId,
          userId
        }
      }
    });

    revalidatePath("/student/groups");
    return { success: true };
  } catch (error) {
    console.error("Erro ao sair do grupo:", error);
    return { error: "Erro ao sair do grupo." };
  }
}
