"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { createHash, randomBytes, pbkdf2Sync } from "crypto";

// Helper functions para crypto
const hashPassword = (password: string): string => {
  const salt = randomBytes(16).toString('hex');
  const hash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
};

const verifyPassword = (password: string, hashedPassword: string): boolean => {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
};

// Actions que precisam do Node.js
export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    const existingUser = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });
    if (existingUser) {
      throw new Error("Este e-mail já está em uso.");
    }

    const passwordHash = hashPassword(args.password);

    const userId = await ctx.runMutation(internal.users.insertUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      role: args.role,
    });

    return { userId };
  },
});

export const updateUser = action({
  args: {
    userIdToUpdate: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
    password: v.optional(v.string()),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    if (args.role && args.role !== "ADMIN") {
      const userToUpdate = await ctx.runQuery(internal.users.getUserById, { userId: args.userIdToUpdate });
      if (userToUpdate?.role === "ADMIN") {
        const allAdmins = await ctx.runQuery(internal.users.getAllAdmins);
        if (allAdmins.length === 1 && allAdmins[0]._id === args.userIdToUpdate) {
          throw new Error("Não é possível alterar a função do único administrador do sistema.");
        }
      }
    }

    const { userIdToUpdate, currentUserId, email, ...updates } = args;

    if (updates.password) {
      updates.passwordHash = hashPassword(updates.password);
      delete updates.password;
    }

    await ctx.runMutation(internal.users.updateUserById, {
      userIdToUpdate,
      updates
    });
  },
});

export const deleteUser = action({
  args: { 
    userIdToDelete: v.id("users"),
    currentUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    if (args.userIdToDelete === args.currentUserId) {
        throw new Error("Você não pode excluir sua própria conta.");
    }

    const userToDelete = await ctx.runQuery(internal.users.getUserById, { userId: args.userIdToDelete });
    if (userToDelete?.role === "ADMIN") {
      const allAdmins = await ctx.runQuery(internal.users.getAllAdmins);
      if (allAdmins.length === 1) {
        throw new Error("Não é possível excluir o único administrador do sistema.");
      }
    }

    await ctx.runMutation(internal.users.deleteUserById, {
      userIdToDelete: args.userIdToDelete
    });
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });

      if (!user) {
        throw new Error("Utilizador não encontrado.");
      }

      const isPasswordCorrect = verifyPassword(args.password, user.passwordHash);

      if (!isPasswordCorrect) {
        throw new Error("Palavra-passe incorreta.");
      }

      return { 
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      };
    } catch (error) {
      console.error("Login error:", error);
      throw new Error(`Erro no login: ${error.message}`);
    }
  },
});

// Função temporária para diagnóstico de usuários
export const debugUsers = action({
  args: {},
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(internal.users.getAllUsersInternal, {});
    console.log("Total de usuários:", users.length);
    users.forEach((user, index) => {
      console.log(`Usuário ${index + 1}:`, {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        hasPassword: !!user.passwordHash,
        passwordLength: user.passwordHash?.length || 0
      });
    });
    return users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      hasPassword: !!u.passwordHash
    }));
  },
});

export const createFirstAdmin = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    const users = await ctx.runQuery(internal.users.getAllUsersInternal, {});
    if (users.length > 0) {
      throw new Error("Já existem usuários no banco de dados. O primeiro ADMIN não pode ser criado.");
    }

    const passwordHash = hashPassword(args.password);

    await ctx.runMutation(internal.users.insertUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      role: "ADMIN",
    });
  },
});