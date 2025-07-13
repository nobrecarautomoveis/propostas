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
    version: v.string(),
    fuel: v.string(),
    transmission: v.string(),
    color: v.string(),
    
    // Informações financeiras e status
    value: v.number(),
    licensingLocation: v.string(),
    status: v.string(),
    state: v.optional(v.string()),
  })
  .index("by_salesperson", ["salespersonId"])
  .index("by_proposalNumber", ["proposalNumber"]),
});