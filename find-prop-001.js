// Script para encontrar a PROP-001
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function findProp001() {
  try {
    console.log("🔍 PROCURANDO PROP-001...");
    console.log("=" * 50);
    
    // 1. Busca usuários para identificar "Duda"
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    users.forEach(user => {
      console.log(`   - ${user.name} (${user.email}) - ID: ${user.id}`);
    });
    
    const duda = users.find(u => u.name.toLowerCase().includes('duda'));
    if (duda) {
      console.log(`\n👤 Usuário "Duda" encontrado: ${duda.name} - ${duda.id}`);
    } else {
      console.log("\n❌ Usuário 'Duda' não encontrado nos usuários listados");
    }
    
    // 2. Busca propostas RAW
    console.log("\n📋 BUSCANDO TODAS AS PROPOSTAS RAW...");
    const rawProposals = await client.query("proposals:getAllProposalsRaw", {});
    console.log("📊 Total de propostas RAW:", rawProposals.length);
    
    const prop001 = rawProposals.find(p => p.proposalNumber === "PROP-001");
    if (prop001) {
      console.log("\n✅ PROP-001 ENCONTRADA NO BACKEND:");
      console.log(`   ID: ${prop001._id}`);
      console.log(`   SalespersonId: ${prop001.salespersonId}`);
      console.log(`   Data: ${new Date(prop001._creationTime).toLocaleString()}`);
      
      // Verifica se o usuário da PROP-001 existe
      if (prop001.salespersonId) {
        try {
          const user = await client.query("users:getCurrentUser", {
            userId: prop001.salespersonId
          });
          if (user) {
            console.log(`   ✅ Usuário válido: ${user.name} (${user.email})`);
          } else {
            console.log(`   ❌ Usuário não encontrado: ${prop001.salespersonId}`);
          }
        } catch (error) {
          console.log(`   💥 Erro ao buscar usuário: ${error.message}`);
        }
      }
    } else {
      console.log("\n❌ PROP-001 NÃO ENCONTRADA NO BACKEND");
    }
    
    // 3. Testa query do frontend com diferentes usuários
    console.log("\n🧪 TESTANDO QUERY DO FRONTEND COM CADA USUÁRIO...");
    
    for (const user of users) {
      console.log(`\n👤 Testando com ${user.name}:`);
      try {
        const proposals = await client.query("proposals:getProposals", {
          userId: user.id
        });
        console.log(`   📊 Propostas encontradas: ${proposals.length}`);
        proposals.forEach((p, i) => {
          console.log(`      ${i+1}. ${p.proposalNumber} - Criado por: ${p.createdBy?.name || 'UNDEFINED'}`);
        });
      } catch (error) {
        console.log(`   ❌ Erro: ${error.message}`);
      }
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 BUSCA CONCLUÍDA");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

findProp001();
