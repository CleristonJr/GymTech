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

import { cookies } from "next/headers";

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) return { error: "Preencha e-mail e senha." };

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return { error: "Credenciais inválidas." };

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return { error: "Credenciais inválidas." };

    // Define cookies de sessão simples para acesso nos Server Components
    const cookieStore = await cookies();
    cookieStore.set('userId', user.id, { path: '/' });
    cookieStore.set('userRole', user.role, { path: '/' });
    if (user.gymId) {
      cookieStore.set('gymId', user.gymId, { path: '/' });
    }

    return { 
      success: true, 
      role: user.role, 
      mustChangePassword: user.mustChangePassword,
      userId: user.id
    };
  } catch (error) {
    console.error("Erro no login:", error);
    return { error: "Erro no servidor ao tentar fazer login." };
  }
}

export async function changeInitialPassword(userId: string, newPassword: string) {
  try {
    if (!userId || !newPassword) return { error: "Dados inválidos." };
    if (newPassword.length < 6) return { error: "A senha deve ter no mínimo 6 caracteres." };

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false
      }
    });

    return { success: true, role: user.role };
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    return { error: "Não foi possível alterar a senha. Tente novamente." };
  }
}
