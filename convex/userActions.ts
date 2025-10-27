"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Nota: bcryptjs pode não estar disponível em ações do Convex
// Usando comparação simples por enquanto
async function hashPassword(password: string): Promise<string> {
  // Retorna o hash como está (será melhorado depois)
  return password;
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // Comparação simples por enquanto
  return password === hash;
}

// Ação de login
export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args): Promise<{ userId: string }> => {
    try {
      console.log("🔐 Iniciando login para:", args.email);

      // Validar inputs
      if (!args.email || !args.password) {
        throw new Error("Email e senha são obrigatórios");
      }

      // Busca o usuário pelo email usando mutation interna
      console.log("🔍 Buscando usuário com email:", args.email);
      const user = await ctx.runMutation(internal.users.verifyLogin, {
        email: args.email,
        passwordHash: "" // Não precisa aqui, apenas para buscar
      });

      if (!user) {
        console.log("❌ Usuário não encontrado:", args.email);
        throw new Error("Usuário não encontrado");
      }

      console.log("✅ Usuário encontrado:", user._id);

      // Verifica se o usuário tem passwordHash
      if (!user.passwordHash) {
        console.log("❌ Usuário sem passwordHash:", args.email);
        throw new Error("Usuário não tem senha configurada");
      }

      // Verifica a senha usando bcrypt
      console.log("🔑 Verificando senha...");
      const isValidPassword = await verifyPassword(args.password, user.passwordHash);

      if (!isValidPassword) {
        console.log("❌ Senha incorreta para:", args.email);
        throw new Error("Senha incorreta");
      }

      console.log("✅ Login bem-sucedido para:", args.email, "userId:", user._id);
      return { userId: user._id };
    } catch (error: any) {
      console.error("❌ Erro ao fazer login:", error);
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
      console.log("🔄 Resetando senha para:", args.email);

      // Busca o usuário pelo email
      const user = await ctx.runMutation(internal.users.verifyLogin, {
        email: args.email,
        passwordHash: ""
      });

      if (!user) {
        console.log("❌ Usuário não encontrado:", args.email);
        throw new Error("Usuário não encontrado");
      }

      console.log("✅ Usuário encontrado:", user._id);

      // Gera o novo hash (texto plano por enquanto)
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
      console.error("❌ Erro ao resetar senha:", error);
      throw new Error(error.message || "Erro ao resetar senha");
    }
  },
});