// Script para forçar sincronização completa
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function forceSync() {
  try {
    console.log("🔄 FORÇANDO SINCRONIZAÇÃO COMPLETA...");
    console.log("=" * 50);
    
    // 1. Busca usuários
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    const nobreCarAdmin = users.find(u => u.email === "contato@nobrecarautomoveis.com.br");
    if (!nobreCarAdmin) {
      console.error("❌ Usuário Nobre Car Admin não encontrado!");
      return;
    }
    
    // 2. Testa query que o frontend usa
    console.log("\n🧪 TESTANDO QUERY DO FRONTEND...");
    const frontendProposals = await client.query("proposals:getProposals", {
      userId: nobreCarAdmin.id
    });
    
    console.log("📊 Propostas via frontend query:", frontendProposals.length);
    frontendProposals.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.proposalNumber} - Criado por: ${p.createdBy?.name || 'UNDEFINED'}`);
    });
    
    // 3. Compara com dados RAW
    console.log("\n🔍 COMPARANDO COM DADOS RAW...");
    const rawProposals = await client.query("proposals:getAllProposalsRaw", {});
    console.log("📊 Propostas RAW:", rawProposals.length);
    
    // 4. Se há diferença, identifica o problema
    if (frontendProposals.length !== rawProposals.length) {
      console.log("⚠️ DIFERENÇA DETECTADA!");
      console.log(`   Frontend: ${frontendProposals.length} propostas`);
      console.log(`   Backend: ${rawProposals.length} propostas`);
      
      // Mostra propostas que estão no backend mas não no frontend
      const frontendIds = new Set(frontendProposals.map(p => p._id));
      const missingInFrontend = rawProposals.filter(p => !frontendIds.has(p._id));
      
      if (missingInFrontend.length > 0) {
        console.log("\n📝 PROPOSTAS FALTANDO NO FRONTEND:");
        missingInFrontend.forEach(p => {
          console.log(`   - ${p.proposalNumber} (ID: ${p._id})`);
          console.log(`     SalespersonId: ${p.salespersonId}`);
        });
      }
    } else {
      console.log("✅ Mesmo número de propostas - problema pode ser no join");
    }
    
    // 5. Testa usuários específicos
    console.log("\n🔍 TESTANDO USUÁRIOS DAS PROPOSTAS...");
    const uniqueUserIds = [...new Set(rawProposals.map(p => p.salespersonId).filter(Boolean))];
    
    for (const userId of uniqueUserIds) {
      try {
        const user = await client.query("users:getCurrentUser", { userId });
        console.log(`   ${userId}: ${user ? `✅ ${user.name}` : '❌ NÃO ENCONTRADO'}`);
      } catch (error) {
        console.log(`   ${userId}: 💥 ERRO - ${error.message}`);
      }
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 DIAGNÓSTICO CONCLUÍDO");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

forceSync();
