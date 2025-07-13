import bcrypt from "bcryptjs";
import { v } from "convex/values";
import { internalMutation, mutation, query, action, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

// Helper function to check for ADMIN role
const ensureAdmin = async (ctx: any, userId: string) => {
  const currentUser = await ctx.db.get(userId);
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Apenas administradores podem executar esta ação.");
  }
};

export const createUser = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
    currentUserId: v.id("users"), // ID of the user performing the action
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário atual é admin usando uma query interna
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    // Verificar se o email já existe
    const existingUser = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });
    if (existingUser) {
      throw new Error("Este e-mail já está em uso.");
    }

    // Hash da senha usando bcrypt (agora permitido em actions)
    const passwordHash = await bcrypt.hash(args.password, 10);

    // Inserir o usuário usando uma mutation interna
    const userId = await ctx.runMutation(internal.users.insertUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      role: args.role,
    });

    return { userId };
  },
});

// Queries internas necessárias para a action
export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return ctx.db.get(args.userId);
  },
});

// Query interna para buscar todos os admins
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

export const updateUser = action({
  args: {
    userIdToUpdate: v.id("users"),
    name: v.optional(v.string()),
    email: v.optional(v.string()), // Adicionar para evitar erro de validação
    role: v.optional(v.union(v.literal("ADMIN"), v.literal("USER"))),
    password: v.optional(v.string()),
    currentUserId: v.id("users"), // ID of the user performing the action
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário atual é admin usando uma query interna
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    // Lógica para impedir a alteração do último ADMIN
    if (args.role && args.role !== "ADMIN") {
      const userToUpdate = await ctx.runQuery(internal.users.getUserById, { userId: args.userIdToUpdate });
      if (userToUpdate?.role === "ADMIN") {
        const allAdmins = await ctx.runQuery(internal.users.getAllAdmins);
        if (allAdmins.length === 1 && allAdmins[0]._id === args.userIdToUpdate) {
          throw new Error("Não é possível alterar a função do único administrador do sistema.");
        }
      }
    }

    const { userIdToUpdate, currentUserId, email, ...updates } = args; // Remover email das atualizações

    if (updates.password) {
      updates.passwordHash = await bcrypt.hash(updates.password, 10);
      delete updates.password;
    }

    await ctx.runMutation(internal.users.updateUserById, {
      userIdToUpdate,
      updates
    });
  },
});

// Mutation interna para atualizar usuário
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

export const deleteUser = action({
  args: { 
    userIdToDelete: v.id("users"),
    currentUserId: v.id("users"), // ID of the user performing the action
  },
  handler: async (ctx, args) => {
    // Verificar se o usuário atual é admin usando uma query interna
    const currentUser = await ctx.runQuery(internal.users.getUserById, { userId: args.currentUserId });
    if (!currentUser || currentUser.role !== "ADMIN") {
      throw new Error("Apenas administradores podem executar esta ação.");
    }

    if (args.userIdToDelete === args.currentUserId) {
        throw new Error("Você não pode excluir sua própria conta.");
    }

    // Lógica para impedir a exclusão do último ADMIN
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

// Mutation interna para excluir usuário
export const deleteUserById = internalMutation({
  args: { 
    userIdToDelete: v.id("users"),
  },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userIdToDelete);
  },
});

export const login = action({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Buscar usuário pelo email
    const user = await ctx.runQuery(internal.users.getUserByEmail, { email: args.email });

    if (!user) {
      throw new Error("Utilizador não encontrado.");
    }

    // Verificar senha
    const isPasswordCorrect = await bcrypt.compare(args.password, user.passwordHash);

    if (!isPasswordCorrect) {
      throw new Error("Palavra-passe incorreta.");
    }

    return { userId: user._id };
  },
});

// Mutação interna para criar o primeiro usuário ADMIN
export const createFirstAdmin = action({
  args: {
    name: v.string(),
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Verificar se já existem usuários
    const users = await ctx.runQuery(internal.users.getAllUsers, {});
    if (users.length > 0) {
      throw new Error("Já existem usuários no banco de dados. O primeiro ADMIN não pode ser criado.");
    }

    // Hash da senha
    const passwordHash = await bcrypt.hash(args.password, 10);

    // Inserir o usuário
    await ctx.runMutation(internal.users.insertUser, {
      name: args.name,
      email: args.email,
      passwordHash,
      role: "ADMIN",
    });
  },
});

// Query interna para obter todos os usuários
export const getAllUsers = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("users").collect();
  },
});
export const getCurrentUser = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      return null;
    }
    return ctx.db.get(args.userId);
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