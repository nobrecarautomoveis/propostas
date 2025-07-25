import { v } from "convex/values";
import { mutation, query, action, internalQuery, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { api } from "./_generated/api";

// Consulta para obter todas as propostas com dados do usuário criador
export const getProposals = query({
  args: { userId: v.union(v.id("users"), v.null()) },
  handler: async (ctx, args) => {
    console.log("🔄 getProposals chamada:", {
      userId: args.userId,
      timestamp: new Date().toISOString()
    });

    if (!args.userId) {
      // Retorna array vazio em vez de erro para evitar logs de erro
      console.log("getProposals: Sem userId, retornando array vazio");
      return [];
    }

    // Busca todas as propostas
    const proposals = await ctx.db.query("proposals").order("desc").collect();

    // Para cada proposta, busca os dados básicos do usuário criador
    const proposalsWithUser = await Promise.all(
      proposals.map(async (proposal) => {
        let createdBy = null;

        // Busca dados do usuário criador (se existir)
        if (proposal.salespersonId) {
          try {
            const user = await ctx.db.get(proposal.salespersonId);
            if (user) {
              createdBy = {
                _id: user._id,
                name: user.name,
                email: user.email
              };
            } else {
              console.log("Usuário não encontrado para ID:", proposal.salespersonId);
            }
          } catch (error) {
            console.error("Erro ao buscar usuário:", proposal.salespersonId, error);
          }
        } else {
          console.log("Proposta sem salespersonId:", proposal._id);
        }

        // Se não encontrou o usuário, usa dados do usuário atual como fallback
        if (!createdBy && args.userId) {
          try {
            const currentUser = await ctx.db.get(args.userId);
            if (currentUser) {
              createdBy = {
                _id: currentUser._id,
                name: currentUser.name,
                email: currentUser.email
              };
              console.log(`Usando fallback do usuário atual para proposta ${proposal.proposalNumber}: ${currentUser.name}`);
            }
          } catch (error) {
            console.error("Erro ao buscar usuário atual:", args.userId, error);
          }
        }

        // ÚLTIMO FALLBACK: Se ainda não tem createdBy, cria um genérico
        if (!createdBy) {
          console.log(`Criando fallback genérico para proposta ${proposal.proposalNumber}`);
          createdBy = {
            _id: "unknown",
            name: "Usuário Desconhecido",
            email: "unknown@unknown.com"
          };
        }

        return {
          ...proposal,
          createdBy // Adiciona dados do usuário criador
        };
      })
    );

    return proposalsWithUser;
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

    // Busca dados do usuário criador (se existir)
    let createdBy = null;
    if (proposal.salespersonId) {
      const user = await ctx.db.get(proposal.salespersonId);
      if (user) {
        createdBy = {
          _id: user._id,
          name: user.name,
          email: user.email
        };
      }
    }

    // Qualquer usuário autenticado pode ver propostas
    // (Transparência total no sistema)

    return {
      ...proposal,
      createdBy // Adiciona dados do usuário criador
    };
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
    version: v.optional(v.string()),
    fuel: v.string(),
    transmission: v.string(),
    color: v.string(),
    value: v.number(),
    valorFinanciar: v.optional(v.string()),
    licensingLocation: v.string(),
    status: v.string(),
    state: v.optional(v.string()),

    // Dados pessoais - Campos comuns (antigos - mantidos para compatibilidade)
    cpfCnpj: v.optional(v.string()),
    email: v.optional(v.string()),
    telefonePessoal: v.optional(v.string()),
    telefoneReferencia: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),

    // Dados pessoais - Pessoa Física (campos específicos + comuns separados)
    cpfPF: v.optional(v.string()),
    emailPF: v.optional(v.string()),
    telefonePessoalPF: v.optional(v.string()),
    telefoneReferenciaPF: v.optional(v.string()),
    cepPF: v.optional(v.string()),
    enderecoPF: v.optional(v.string()),
    observacoesPF: v.optional(v.string()),

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

    // Dados profissionais - Pessoa Física
    empresa: v.optional(v.string()),
    cargo: v.optional(v.string()),
    naturezaOcupacao: v.optional(v.string()),

    // Dados pessoais - Pessoa Jurídica (campos específicos + comuns separados)
    cnpjPJ: v.optional(v.string()),
    emailPJ: v.optional(v.string()),
    telefonePessoalPJ: v.optional(v.string()),
    telefoneReferenciaPJ: v.optional(v.string()),
    cepPJ: v.optional(v.string()),
    enderecoPJ: v.optional(v.string()),
    observacoesPJ: v.optional(v.string()),

    razaoSocial: v.optional(v.string()),
    nomeFantasia: v.optional(v.string()),

    // Tipo de pessoa
    tipoPessoa: v.optional(v.string()),

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
    valorFinanciar: v.optional(v.string()),
    licensingLocation: v.optional(v.string()),
    status: v.optional(v.string()),
    state: v.optional(v.string()),

    // Dados pessoais - Campos comuns (antigos - mantidos para compatibilidade)
    cpfCnpj: v.optional(v.string()),
    email: v.optional(v.string()),
    telefonePessoal: v.optional(v.string()),
    telefoneReferencia: v.optional(v.string()),
    cep: v.optional(v.string()),
    endereco: v.optional(v.string()),

    // Dados pessoais - Pessoa Física (campos específicos + comuns separados)
    cpfPF: v.optional(v.string()),
    emailPF: v.optional(v.string()),
    telefonePessoalPF: v.optional(v.string()),
    telefoneReferenciaPF: v.optional(v.string()),
    cepPF: v.optional(v.string()),
    enderecoPF: v.optional(v.string()),
    observacoesPF: v.optional(v.string()),

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

    // Dados profissionais - Pessoa Física
    empresa: v.optional(v.string()),
    cargo: v.optional(v.string()),
    naturezaOcupacao: v.optional(v.string()),

    // Dados pessoais - Pessoa Jurídica (campos específicos + comuns separados)
    cnpjPJ: v.optional(v.string()),
    emailPJ: v.optional(v.string()),
    telefonePessoalPJ: v.optional(v.string()),
    telefoneReferenciaPJ: v.optional(v.string()),
    cepPJ: v.optional(v.string()),
    enderecoPJ: v.optional(v.string()),
    observacoesPJ: v.optional(v.string()),

    razaoSocial: v.optional(v.string()),
    nomeFantasia: v.optional(v.string()),

    // Tipo de pessoa
    tipoPessoa: v.optional(v.string()),

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

    // Qualquer usuário autenticado pode editar propostas
    // (Apenas criação/exclusão de usuários é restrita a ADMINs)

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

    // Qualquer usuário autenticado pode excluir propostas
    // (Ajuste conforme regras de negócio se necessário)

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

// Query para buscar todas as propostas sem join (para debug)
export const getAllProposalsRaw = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("proposals").collect();
  },
});

// Mutation para atualizar o usuário de uma proposta
export const updateProposalUser = mutation({
  args: {
    proposalId: v.id("proposals"),
    newUserId: v.id("users")
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.proposalId, {
      salespersonId: args.newUserId
    });
  },
});

// Action para corrigir propostas com usuários inexistentes
export const fixProposalsWithInvalidUsers = action({
  args: {
    newUserId: v.id("users") // ID do usuário válido para usar como substituto
  },
  handler: async (ctx, args) => {
    console.log("🔧 INICIANDO CORREÇÃO DE PROPOSTAS...");

    // Busca todas as propostas diretamente do banco
    const allProposals = await ctx.runQuery(api.proposals.getAllProposalsRaw, {});
    console.log("📊 Total de propostas encontradas:", allProposals.length);

    let fixedCount = 0;

    for (const proposal of allProposals) {
      if (proposal.salespersonId) {
        // Verifica se o usuário existe
        try {
          const user = await ctx.runQuery(api.users.getCurrentUser, {
            userId: proposal.salespersonId
          });

          if (!user) {
            console.log(`🔧 Corrigindo proposta ${proposal.proposalNumber} - usuário inexistente: ${proposal.salespersonId}`);

            // Atualiza a proposta com o novo usuário
            await ctx.runMutation(api.proposals.updateProposalUser, {
              proposalId: proposal._id,
              newUserId: args.newUserId
            });

            fixedCount++;
          } else {
            console.log(`✅ Proposta ${proposal.proposalNumber} - usuário OK: ${user.name}`);
          }
        } catch (error) {
          console.error(`❌ Erro ao verificar usuário da proposta ${proposal.proposalNumber}:`, error);
        }
      } else {
        console.log(`⚠️ Proposta ${proposal.proposalNumber} sem salespersonId`);
      }
    }

    console.log(`🎯 CORREÇÃO CONCLUÍDA: ${fixedCount} propostas corrigidas`);
    return { fixed: fixedCount, total: allProposals.length };
  },
});