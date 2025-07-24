import { v } from "convex/values";
import { internalMutation, query, internalQuery } from "./_generated/server";

// Apenas queries e mutations (sem "use node")
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

// Query para buscar todos os usuários (para filtros e listagens)
export const getAllUsers = query({
  args: { requesterId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    try {
      if (!args.requesterId) {
        return [];
      }

      // Verifica se o usuário solicitante existe
      const requester = await ctx.db.get(args.requesterId);
      if (!requester) {
        return [];
      }

      // Retorna apenas id, name e email (dados básicos para listagem)
      const users = await ctx.db.query("users").collect();
      return users.map(user => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }));
    } catch (error) {
      console.error("Erro em getAllUsers:", error);
      return [];
    }
  },
});

export const getAllAdmins = internalQuery({
  handler: async (ctx) => {
    return ctx.db
      .query("users")
      .withIndex("by_role", (q) => q.eq("role", "ADMIN"))
      .collect();
  },
});

export const getUserByEmail = internalQuery({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const insertUser = internalMutation({
  args: {
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      passwordHash: args.passwordHash,
      role: args.role,
    });
  },
});

export const updateUserById = internalMutation({
  args: {
    userIdToUpdate: v.id("users"),
    updates: v.object({
      name: v.optional(v.string()),
      role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
      passwordHash: v.optional(v.string())
    })
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.userIdToUpdate, args.updates);
  },
});

export const deleteUserById = internalMutation({
  args: { 
    userIdToDelete: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userIdToDelete);
  },
});

export const getAllUsersInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").collect();
  },
});

export const getCurrentUser = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    try {
      if (!args.userId) {
        return null;
      }
      const user = await ctx.db.get(args.userId);
      return user || null;
    } catch (error) {
      console.error("Erro em getCurrentUser:", error);
      return null;
    }
  },
});

export const getUsers = query({
  args: { userId: v.optional(v.union(v.id("users"), v.null())) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new Error("Usuário não autenticado.");
    }

    const currentUser = await ctx.db.get(args.userId);

    if (!currentUser) {
      throw new Error("Usuário não encontrado no banco de dados.");
    }

    if (currentUser.role !== "ADMIN") {
      throw new Error(`O usuário '${currentUser.name}' não tem permissão de ADMIN.`);
    }

    return ctx.db.query("users").collect();
  },
});