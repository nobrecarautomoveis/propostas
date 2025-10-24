"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import bcrypt from "bcryptjs";

// Implementar funções ausentes diretamente no arquivo
async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Ação de login
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: string }> => {
    try {
      // Busca o usuário pelo email
      const user = await ctx.runQuery(internal.users.getUserByEmail, {
        email: args.email,
      });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Verifica a senha usando bcrypt
      const isValidPassword = await verifyPassword(args.password, user.passwordHash);

      if (!isValidPassword) {
        console.log("❌ Senha incorreta para:", args.email);
        throw new Error("Senha incorreta");
      }

      console.log("✅ Login bem-sucedido para:", args.email);
      return { userId: user._id };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao fazer login");
    }
  },
});

// Corrigir tipos explícitos e propriedades ausentes
export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
  },
  handler: async (
    ctx,
    args: { name: string; email: string; password: string; role: "ADMIN" | "USER" }
  ): Promise<{ userId: string }> => {
    try {
      const passwordHash: string = await hashPassword(args.password);

      // Usa a mutation interna para criar o usuário
      const userId = await ctx.runMutation(internal.users.insertUser, {
        name: args.name,
        email: args.email,
        passwordHash: passwordHash,
        role: args.role,
      });

      return { userId };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao criar usuário");
    }
  },
});

// Ação para deletar usuário
export const deleteUser = action({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.users.deleteUserById, {
      userIdToDelete: args.userId,
    });
  },
});

// Ação para atualizar usuário
export const updateUser = action({
  args: {
    userId: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
      passwordHash: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args): Promise<void> => {
    await ctx.runMutation(internal.users.updateUserById, {
      userIdToUpdate: args.userId,
      updates: args.updates,
    });
  },
});

// Ação para resetar senha de um usuário (admin only)
export const resetUserPassword = action({
  args: {
    email: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    try {
      // Busca o usuário pelo email
      const user = await ctx.runQuery(internal.users.getUserByEmail, {
        email: args.email,
      });

      if (!user) {
        throw new Error("Usuário não encontrado");
      }

      // Gera o novo hash com bcrypt
      const newPasswordHash: string = await hashPassword(args.newPassword);

      // Atualiza a senha
      await ctx.runMutation(internal.users.updateUserById, {
        userIdToUpdate: user._id,
        updates: {
          passwordHash: newPasswordHash,
        },
      });

      console.log(`✅ Senha resetada para ${args.email}`);
      return { success: true };
    } catch (error: any) {
      throw new Error(error.message || "Erro ao resetar senha");
    }
  },
});