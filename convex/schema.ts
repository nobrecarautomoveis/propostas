import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    passwordHash: v.string(),
    role: v.union(v.literal("ADMIN"), v.literal("USER")),
  })
  .index("by_email", ["email"])
  .index("by_role", ["role"]), // Adicionar esta linha

  proposals: defineTable({
    // Campos básicos
    proposalNumber: v.string(),
    dateAdded: v.string(),
    salespersonId: v.id("users"),

    // Tipo de proposta e veículo
    proposalType: v.string(),
    vehicleType: v.string(),
    isFinanced: v.boolean(),
    vehicleCondition: v.string(),

    // Informações do veículo
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

    // Informações financeiras e status
    value: v.number(),
    valorFinanciar: v.optional(v.string()), // Valor a financiar
    licensingLocation: v.string(),
    status: v.string(),



    // Dados pessoais - Pessoa Física (campos específicos + comuns separados)
    cpfPF: v.optional(v.string()),
    emailPF: v.optional(v.string()),
    telefonePessoalPF: v.optional(v.string()),
    telefoneReferenciaPF: v.optional(v.string()),
    cepPF: v.optional(v.string()),
    enderecoPF: v.optional(v.string()),
    observacoesPF: v.optional(v.string()), // Observações específicas - Pessoa Física

    nome: v.optional(v.string()), // Nome completo
    dataNascimento: v.optional(v.string()), // Data de nascimento
    sexo: v.optional(v.string()), // Sexo
    nomeMae: v.optional(v.string()), // Nome da mãe
    nomePai: v.optional(v.string()), // Nome do pai
    rg: v.optional(v.string()), // RG
    dataEmissaoRg: v.optional(v.string()), // Data de emissão do RG
    orgaoExpedidor: v.optional(v.string()), // Órgão expedidor do RG
    naturalidade: v.optional(v.string()), // Naturalidade
    estadoCivil: v.optional(v.string()), // Estado civil
    possuiCnh: v.optional(v.boolean()), // Possui CNH

    // Dados profissionais - Pessoa Física
    empresa: v.optional(v.string()), // Empresa onde trabalha
    cargo: v.optional(v.string()), // Cargo/função
    naturezaOcupacao: v.optional(v.string()), // assalariado, autonomo, empresario

    // Dados pessoais - Pessoa Jurídica (campos específicos + comuns separados)
    cnpjPJ: v.optional(v.string()),
    emailPJ: v.optional(v.string()),
    telefonePessoalPJ: v.optional(v.string()),
    telefoneReferenciaPJ: v.optional(v.string()),
    cepPJ: v.optional(v.string()),
    enderecoPJ: v.optional(v.string()),
    observacoesPJ: v.optional(v.string()), // Observações específicas - Pessoa Jurídica

    razaoSocial: v.optional(v.string()), // Razão social
    nomeFantasia: v.optional(v.string()), // Nome fantasia

    // Tipo de pessoa
    tipoPessoa: v.optional(v.string()), // 'fisica' ou 'juridica'
    
    // Análise Bancária - Aprovação/Recusa por banco
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
  })
  .index("by_salesperson", ["salespersonId"])
  .index("by_proposalNumber", ["proposalNumber"]),
});