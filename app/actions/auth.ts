"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function setupSuperAdmin(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "E-mail e senha são obrigatórios." };
  }

  try {
    // Verifica se já existe um usuário com esse email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { error: "Este e-mail já está em uso." };
    }

    // Criptografa a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Cria o Super Admin
    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: "Admin Principal",
        role: "SUPER_ADMIN",
      },
    });

    return { success: true };
  } catch (error) {
    console.error("Erro ao criar admin:", error);
    return { error: "Ocorreu um erro ao tentar criar o usuário." };
  }
}
