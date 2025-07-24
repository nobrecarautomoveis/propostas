// Script para sincronizar bases de dados
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function syncDatabases() {
  try {
    console.log("🔄 INICIANDO SINCRONIZAÇÃO DE BASES...");
    console.log("=" * 50);
    
    // 1. Busca usuários disponíveis
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    const nobreCarAdmin = users.find(u => u.email === "contato@nobrecarautomoveis.com.br");
    const admin = users.find(u => u.email === "admin@nobrecar.com");
    const fabricius = users.find(u => u.email === "fabriciusgaspareti@gmail.com");
    
    if (!nobreCarAdmin || !admin || !fabricius) {
      console.error("❌ Usuários necessários não encontrados!");
      return;
    }
    
    console.log("✅ Usuários encontrados:");
    console.log(`   - Nobre Car Admin: ${nobreCarAdmin.id}`);
    console.log(`   - Admin: ${admin.id}`);
    console.log(`   - Fabricius: ${fabricius.id}`);
    
    // 2. Busca propostas RAW
    console.log("\n📋 VERIFICANDO PROPOSTAS ATUAIS...");
    const rawProposals = await client.query("proposals:getAllProposalsRaw", {});
    console.log("📊 Propostas encontradas:", rawProposals.length);
    
    // 3. Corrige propostas com usuários inválidos
    console.log("\n🔧 CORRIGINDO PROPOSTAS...");
    let fixedCount = 0;
    
    for (const proposal of rawProposals) {
      if (proposal.salespersonId) {
        // Verifica se o usuário existe
        const userExists = users.find(u => u.id === proposal.salespersonId);
        
        if (!userExists) {
          console.log(`🔧 Corrigindo proposta ${proposal.proposalNumber}:`);
          console.log(`   ID inválido: ${proposal.salespersonId}`);
          console.log(`   Novo ID: ${nobreCarAdmin.id} (Nobre Car Admin)`);
          
          try {
            await client.mutation("proposals:updateProposalUser", {
              proposalId: proposal._id,
              newUserId: nobreCarAdmin.id
            });
            fixedCount++;
            console.log(`   ✅ Corrigido!`);
          } catch (error) {
            console.error(`   ❌ Erro: ${error.message}`);
          }
        } else {
          console.log(`✅ Proposta ${proposal.proposalNumber} - usuário OK: ${userExists.name}`);
        }
      }
    }
    
    console.log(`\n🎯 CORREÇÃO CONCLUÍDA: ${fixedCount} propostas corrigidas`);
    
    // 4. Testa a query final
    console.log("\n🧪 TESTANDO QUERY FINAL...");
    const finalProposals = await client.query("proposals:getProposals", {
      userId: nobreCarAdmin.id
    });
    
    console.log("📊 Propostas com join:", finalProposals.length);
    finalProposals.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.proposalNumber} - Criado por: ${p.createdBy?.name || 'ERRO'}`);
    });
    
    console.log("\n" + "=" * 50);
    console.log("🎉 SINCRONIZAÇÃO CONCLUÍDA!");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

syncDatabases();
