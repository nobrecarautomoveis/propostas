import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { mutation, query, internalQuery } from "./_generated/server";

// Query para obter todas as propostas
export const getProposals = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.userId) return [];

    const proposals = await ctx.db.query("proposals").order("desc").collect();

    const proposalsWithUser = await Promise.all(
      proposals.map(async (p) => {
        let createdBy = null;
        if (p.salespersonId) {
          const user = await ctx.db.get(p.salespersonId as Id<"users">).catch(() => null);
          if (user && "name" in user && "email" in user) {
            createdBy = { _id: user._id, name: user.name, email: user.email };
          }
        }
        return { ...p, createdBy };
      })
    );

    return proposalsWithUser;
  },
});

// Query para obter uma proposta específica
export const getProposalById = query({
  args: { proposalId: v.id("proposals"), userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    if (!args.userId) throw new Error("Usuário não autenticado.");

    let createdBy = null;
    const proposal = await ctx.db.get(args.proposalId);
    if (proposal && "salespersonId" in proposal) {
      const user = await ctx.db.get(proposal.salespersonId as Id<"users">).catch(() => null);
      if (user && "name" in user && "email" in user) {
        createdBy = { _id: user._id, name: user.name, email: user.email };
      }
    }

    return { ...proposal, createdBy };
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
    modelYear: v.string(),
    manufactureYear: v.number(),
    version: v.optional(v.string()),
    fuel: v.string(),
    transmission: v.string(),
    color: v.string(),
    value: v.number(),
    valorFinanciar: v.optional(v.string()),
    licensingLocation: v.string(),
    status: v.string(),
    state: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    email: v.optional(v.string()),
    telefonePessoal: v.optional(v.string()),
    telefoneReferencia: v.optional(v.string()),
    endereco: v.optional(v.string()),
    // Pessoa Física
    cpfPF: v.optional(v.string()),
    emailPF: v.optional(v.string()),
    telefonePessoalPF: v.optional(v.string()),
    telefoneReferenciaPF: v.optional(v.string()),
    cepPF: v.optional(v.string()),
    enderecoPF: v.optional(v.string()),
    numeroPF: v.optional(v.string()),
    referenciaPF: v.optional(v.string()),
    observacoesPF: v.optional(v.string()),
    comentariosPF: v.optional(v.string()),
    nome: v.optional(v.string()),
    dataNascimento: v.optional(v.string()),
    sexo: v.optional(v.string()),
    nomeMae: v.optional(v.string()),
    nomePai: v.optional(v.string()),
    rg: v.optional(v.string()),
    dataEmissaoRg: v.optional(v.string()),
    orgaoExpedidor: v.optional(v.string()),
    naturalidade: v.optional(v.string()),
    estadoCivil: v.optional(v.string()),
    possuiCnh: v.optional(v.boolean()),
    empresa: v.optional(v.string()),
    cargo: v.optional(v.string()),
    naturezaOcupacao: v.optional(v.string()),
    // Pessoa Jurídica
    cnpjPJ: v.optional(v.string()),
    emailPJ: v.optional(v.string()),
    telefonePessoalPJ: v.optional(v.string()),
    telefoneReferenciaPJ: v.optional(v.string()),
    cepPJ: v.optional(v.string()),
    enderecoPJ: v.optional(v.string()),
    numeroPJ: v.optional(v.string()),
    referenciaPJ: v.optional(v.string()),
    observacoesPJ: v.optional(v.string()),
    comentariosPJ: v.optional(v.string()),
    razaoSocial: v.optional(v.string()),
    nomeFantasia: v.optional(v.string()),
    tipoPessoa: v.optional(v.string()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    try {
      const { userId, ...proposalData } = args;

      // Validar userId
      if (!userId) {
        throw new Error("userId é obrigatório");
      }

      const user = await ctx.db.get(userId);
      if (!user) {
        throw new Error(`Usuário não encontrado com ID: ${userId}`);
      }

      // Validar campos obrigatórios
      const requiredFields = ['proposalType', 'vehicleType', 'isFinanced', 'vehicleCondition', 'brand', 'brandName', 'model', 'modelName', 'modelYear', 'manufactureYear', 'fuel', 'transmission', 'color', 'value', 'licensingLocation', 'status'];
      const missingFields = requiredFields.filter(field => !(field in proposalData) || proposalData[field as keyof typeof proposalData] === undefined || proposalData[field as keyof typeof proposalData] === null || proposalData[field as keyof typeof proposalData] === '');

      if (missingFields.length > 0) {
        throw new Error(`Campos obrigatórios faltando: ${missingFields.join(', ')}`);
      }

      const all = await ctx.db.query("proposals").collect();
      const proposalNumber = `PROP-${String(all.length + 1).padStart(3, '0')}`;

      const id = await ctx.db.insert("proposals", {
        ...proposalData,
        proposalNumber,
        dateAdded: new Date().toISOString(),
        salespersonId: userId,
      });

      return { proposalId: id, proposalNumber };
    } catch (error) {
      console.error("❌ Erro ao criar proposta:", error);
      throw error;
    }
  },
});

// Mutation para atualizar uma proposta existente
export const updateProposal = mutation({
  args: {
    proposalId: v.id("proposals"),
    userId: v.optional(v.id("users")),
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
    valorFinanciar: v.optional(v.string()),
    licensingLocation: v.optional(v.string()),
    status: v.optional(v.string()),
    state: v.optional(v.string()),
    cpfCnpj: v.optional(v.string()),
    email: v.optional(v.string()),
    telefonePessoal: v.optional(v.string()),
    telefoneReferencia: v.optional(v.string()),
    endereco: v.optional(v.string()),
    // Pessoa Física
    cpfPF: v.optional(v.string()),
    emailPF: v.optional(v.string()),
    telefonePessoalPF: v.optional(v.string()),
    telefoneReferenciaPF: v.optional(v.string()),
    cepPF: v.optional(v.string()),
    enderecoPF: v.optional(v.string()),
    numeroPF: v.optional(v.string()),
    referenciaPF: v.optional(v.string()),
    observacoesPF: v.optional(v.string()),
    comentariosPF: v.optional(v.string()),
    nome: v.optional(v.string()),
    dataNascimento: v.optional(v.string()),
    sexo: v.optional(v.string()),
    nomeMae: v.optional(v.string()),
    nomePai: v.optional(v.string()),
    rg: v.optional(v.string()),
    dataEmissaoRg: v.optional(v.string()),
    orgaoExpedidor: v.optional(v.string()),
    naturalidade: v.optional(v.string()),
    estadoCivil: v.optional(v.string()),
    possuiCnh: v.optional(v.boolean()),
    empresa: v.optional(v.string()),
    cargo: v.optional(v.string()),
    naturezaOcupacao: v.optional(v.string()),
    // Pessoa Jurídica
    cnpjPJ: v.optional(v.string()),
    emailPJ: v.optional(v.string()),
    telefonePessoalPJ: v.optional(v.string()),
    telefoneReferenciaPJ: v.optional(v.string()),
    cepPJ: v.optional(v.string()),
    enderecoPJ: v.optional(v.string()),
    numeroPJ: v.optional(v.string()),
    referenciaPJ: v.optional(v.string()),
    observacoesPJ: v.optional(v.string()),
    comentariosPJ: v.optional(v.string()),
    razaoSocial: v.optional(v.string()),
    nomeFantasia: v.optional(v.string()),
    tipoPessoa: v.optional(v.string()),
    // Análise Bancária
    bancoBv: v.optional(v.boolean()),
    bancoSantander: v.optional(v.boolean()),
    bancoPan: v.optional(v.boolean()),
    bancoBradesco: v.optional(v.boolean()),
    bancoC6: v.optional(v.boolean()),
    bancoItau: v.optional(v.boolean()),
    bancoCash: v.optional(v.boolean()),
    bancoKunna: v.optional(v.boolean()),
    bancoViaCerta: v.optional(v.boolean()),
    bancoOmni: v.optional(v.boolean()),
    bancoDaycoval: v.optional(v.boolean()),
    bancoSim: v.optional(v.boolean()),
    bancoCreditas: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { proposalId, userId, ...updateData } = args;
    const proposal = await ctx.db.get(proposalId);
    if (!proposal) throw new Error("Proposta não encontrada.");

    await ctx.db.patch(proposalId, updateData);
    return { success: true };
  },
});

export const getAllProposalsInternal = internalQuery({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("proposals").collect();
  },
});

// Mutation para atualizar apenas os campos de análise bancária
export const updateBankAnalysis = mutation({
  args: {
    proposalId: v.id("proposals"),
    bancoBv: v.optional(v.boolean()),
    bancoSantander: v.optional(v.boolean()),
    bancoPan: v.optional(v.boolean()),
    bancoBradesco: v.optional(v.boolean()),
    bancoC6: v.optional(v.boolean()),
    bancoItau: v.optional(v.boolean()),
    bancoCash: v.optional(v.boolean()),
    bancoKunna: v.optional(v.boolean()),
    bancoViaCerta: v.optional(v.boolean()),
    bancoOmni: v.optional(v.boolean()),
    bancoDaycoval: v.optional(v.boolean()),
    bancoSim: v.optional(v.boolean()),
    bancoCreditas: v.optional(v.boolean()),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const { proposalId, userId, ...updates } = args;

    const proposal = await ctx.db.get(proposalId);
    if (!proposal) {
      throw new Error("Proposta não encontrada.");
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error("Usuário não encontrado.");
    }

    await ctx.db.patch(proposalId, updates);
    return { success: true };
  },
});

