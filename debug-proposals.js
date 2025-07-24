// Script para investigar dados das propostas
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://focused-walrus-736.convex.cloud");

async function debugProposals() {
  try {
    console.log("🔍 INVESTIGANDO DADOS DAS PROPOSTAS");
    console.log("=" * 50);
    
    // Primeiro, pega um usuário válido
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    if (users.length === 0) {
      console.log("❌ Nenhum usuário encontrado!");
      return;
    }
    
    const testUser = users[0]; // Usa o primeiro usuário
    console.log("🧪 Testando com usuário:", testUser.name, testUser.id);
    
    // Busca as propostas
    console.log("\n📋 BUSCANDO PROPOSTAS...");
    const proposals = await client.query("proposals:getProposals", {
      userId: testUser.id
    });
    
    console.log("📊 Propostas encontradas:", proposals.length);
    
    // Analisa cada proposta
    proposals.forEach((proposal, index) => {
      console.log(`\n📝 PROPOSTA ${index + 1}:`);
      console.log(`   ID: ${proposal._id}`);
      console.log(`   Número: ${proposal.proposalNumber}`);
      console.log(`   SalespersonId: ${proposal.salespersonId || 'VAZIO'}`);
      console.log(`   CreatedBy: ${proposal.createdBy ? proposal.createdBy.name : 'NULL'}`);
      
      if (proposal.createdBy) {
        console.log(`   ✅ Criador encontrado: ${proposal.createdBy.name} (${proposal.createdBy.email})`);
      } else {
        console.log(`   ❌ Criador NÃO encontrado`);
        if (proposal.salespersonId) {
          console.log(`   🔍 Tentando buscar usuário ID: ${proposal.salespersonId}`);
        } else {
          console.log(`   ⚠️ Proposta sem salespersonId`);
        }
      }
    });
    
    // Testa buscar usuários individualmente
    console.log("\n🔍 TESTANDO BUSCA INDIVIDUAL DE USUÁRIOS:");
    for (const user of users) {
      try {
        const foundUser = await client.query("users:getCurrentUser", {
          userId: user.id
        });
        console.log(`✅ ${user.name}: ${foundUser ? 'ENCONTRADO' : 'NÃO ENCONTRADO'}`);
      } catch (error) {
        console.log(`❌ ${user.name}: ERRO - ${error.message}`);
      }
    }

    // Busca as propostas RAW (sem join) para ver os dados reais
    console.log("\n🔍 BUSCANDO PROPOSTAS RAW (SEM JOIN):");
    try {
      const rawProposals = await client.query("proposals:getAllProposalsRaw", {});
      console.log("📊 Propostas RAW encontradas:", rawProposals.length);

      rawProposals.forEach((proposal, index) => {
        console.log(`\n📝 PROPOSTA RAW ${index + 1}:`);
        console.log(`   ID: ${proposal._id}`);
        console.log(`   Número: ${proposal.proposalNumber}`);
        console.log(`   SalespersonId: ${proposal.salespersonId || 'VAZIO'}`);
        console.log(`   Data criação: ${new Date(proposal._creationTime).toLocaleString()}`);
      });
    } catch (error) {
      console.error("❌ Erro ao buscar propostas RAW:", error);
    }

    // Testa buscar usuários específicos das propostas
    console.log("\n🔍 TESTANDO USUÁRIOS ESPECÍFICOS DAS PROPOSTAS:");
    const userIdsToTest = [
      "j973zgpsywtr5hxsjvcyqkexbn7kqmr8", // ID das propostas de produção
      "j97dcjhmecxf03n4wv3pvwsx297mawsa", // Nobre Car Admin
      "j97e5hp9p10mgzav05wa8erwxs7m4ndw", // Admin
      "j97d5nrp2vsgkat2zy19b2gam57m8z77"  // fabricius
    ];

    for (const userId of userIdsToTest) {
      console.log(`\n🧪 Testando usuário ID: ${userId}`);
      try {
        const foundUser = await client.query("users:getCurrentUser", {
          userId: userId
        });
        if (foundUser) {
          console.log(`✅ ENCONTRADO: ${foundUser.name} (${foundUser.email})`);
        } else {
          console.log(`❌ NÃO ENCONTRADO`);
        }
      } catch (error) {
        console.log(`💥 ERRO: ${error.message}`);
      }
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 INVESTIGAÇÃO CONCLUÍDA");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

debugProposals();
