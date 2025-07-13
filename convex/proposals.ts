import { v } from "convex/values";
import { mutation, query, action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Consulta para obter todas as propostas
export const getProposals = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.userId) {
      // Retorna array vazio em vez de erro para evitar logs de erro
      return [];
    }

    // Retorna todas as propostas para qualquer usuário autenticado.
    return ctx.db.query("proposals").order("desc").collect();
  },
});

// Consulta para obter uma proposta específica
export const getProposalById = query({
  args: { 
    proposalId: v.id("proposals"),
    userId: v.union(v.id("users"), v.null())
  },
  handler: async (ctx, args) => {
    if (!args.userId) {
      throw new Error("Usuário não autenticado.");
    }

    const proposal = await ctx.db.get(args.proposalId);
    
    if (!proposal) {
      throw new Error("Proposta não encontrada.");
    }

    const currentUser = await ctx.db.get(args.userId);

    // Verifica se o usuário tem permissão para ver esta proposta
    if (currentUser.role !== "ADMIN" && proposal.salespersonId !== args.userId) {
      throw new Error("Você não tem permissão para ver esta proposta.");
    }

    return proposal;
  },
});

// Mutation para criar uma nova proposta
export const createProposal = mutation({
  args: {
    proposalType: v.string(),
    vehicleType: v.string(),
    isFinanced: v.boolean(),
    vehicleCondition: v.string(),
    plate: v.optional(v.string()),
    brand: v.string(),
    brandName: v.string(),
    model: v.string(),
    modelName: v.string(),
    bodywork: v.optional(v.string()),
    modelYear: v.string(), // Alterado de v.number() para v.string()
    manufactureYear: v.number(),
    version: v.string(),
    fuel: v.string(),
    transmission: v.string(),
    color: v.string(),
    value: v.number(),
    licensingLocation: v.string(),
    status: v.string(),
    state: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { userId, ...proposalData } = args;
    
    // Verifica se o usuário existe
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    // Gera o número da proposta
    const allProposals = await ctx.db.query("proposals").collect();
    const proposalNumber = `PROP-${String(allProposals.length + 1).padStart(3, '0')}`;
    
    // Cria a proposta
    const proposalId = await ctx.db.insert("proposals", {
      ...proposalData,
      proposalNumber,
      dateAdded: new Date().toISOString(),
      salespersonId: userId,
    });

    return { proposalId, proposalNumber };
  },
});

// Mutation para atualizar uma proposta
export const updateProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
    proposalType: v.optional(v.string()),
    vehicleType: v.optional(v.string()),
    isFinanced: v.optional(v.boolean()),
    vehicleCondition: v.optional(v.string()),
    plate: v.optional(v.string()),
    brand: v.optional(v.string()),
    brandName: v.optional(v.string()),
    model: v.optional(v.string()),
    modelName: v.optional(v.string()),
    bodywork: v.optional(v.string()),
    modelYear: v.optional(v.string()),
    manufactureYear: v.optional(v.number()),
    version: v.optional(v.string()),
    fuel: v.optional(v.string()),
    transmission: v.optional(v.string()),
    color: v.optional(v.string()),
    value: v.optional(v.number()),
    licensingLocation: v.optional(v.string()),
    status: v.optional(v.string()),
    state: v.optional(v.string()), // Adicionar esta linha
    userId: v.id("users"), // ID do usuário que está atualizando a proposta
  },
  handler: async (ctx, args) => {
    const { proposalId, userId, ...updates } = args;
    
    // Verifica se a proposta existe
    const proposal = await ctx.db.get(proposalId);
    if (!proposal) {
      throw new Error("Proposta não encontrada.");
    }

    // Verifica se o usuário tem permissão para atualizar esta proposta
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.role !== "ADMIN" && proposal.salespersonId !== userId) {
      throw new Error("Você não tem permissão para atualizar esta proposta.");
    }

    // Atualiza a proposta
    await ctx.db.patch(proposalId, updates);

    return { success: true };
  },
});

// Mutation para excluir uma proposta
export const deleteProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
    userId: v.id("users"), // ID do usuário que está excluindo a proposta
  },
  handler: async (ctx, args) => {
    // Verifica se a proposta existe
    const proposal = await ctx.db.get(args.proposalId);
    if (!proposal) {
      throw new Error("Proposta não encontrada.");
    }

    // Verifica se o usuário tem permissão para excluir esta proposta
    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    if (user.role !== "ADMIN" && proposal.salespersonId !== args.userId) {
      throw new Error("Você não tem permissão para excluir esta proposta.");
    }

    // Exclui a proposta
    await ctx.db.delete(args.proposalId);

    return { success: true };
  },
});

// Função interna para buscar todas as propostas (para migração)
export const getAllProposalsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("proposals").collect();
  },
});

// Função interna para atualizar propostas (para migração)
export const updateProposalInternal = internalMutation({
  args: {
    proposalId: v.id("proposals"),
    updates: v.object({
      modelName: v.optional(v.string()),
      brandName: v.optional(v.string()),
    }),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.proposalId, args.updates);
  },
});