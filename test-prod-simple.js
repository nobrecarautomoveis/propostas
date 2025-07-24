// Script simples para testar base PROD
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://focused-walrus-736.convex.cloud");

async function testProdSimple() {
  try {
    console.log("🧪 TESTANDO BASE PROD SIMPLES...");
    console.log("=" * 50);
    
    // Testa query básica que deve existir
    console.log("📋 Testando query getProposals...");
    
    try {
      const proposals = await client.query("proposals:getProposals", {
        userId: null
      });
      
      console.log("✅ Query funcionou!");
      console.log("📊 Propostas encontradas:", proposals.length);
      
      if (proposals.length > 0) {
        console.log("\n📝 PROPOSTAS:");
        proposals.forEach((p, i) => {
          console.log(`   ${i+1}. ${p.proposalNumber}`);
          console.log(`      Criado por: ${p.createdBy?.name || 'UNDEFINED'}`);
          console.log(`      SalespersonId: ${p.salespersonId || 'VAZIO'}`);
        });
        
        // Se tem propostas mas createdBy é undefined, confirma o problema
        const withoutCreatedBy = proposals.filter(p => !p.createdBy);
        if (withoutCreatedBy.length > 0) {
          console.log(`\n⚠️ ${withoutCreatedBy.length} propostas sem createdBy - JOIN QUEBRADO`);
        } else {
          console.log("\n✅ Todas as propostas têm createdBy - JOIN FUNCIONANDO");
        }
      } else {
        console.log("📊 Nenhuma proposta encontrada (normal com userId: null)");
      }
      
    } catch (error) {
      console.log("❌ Query falhou:", error.message);
      
      if (error.message.includes("Could not find")) {
        console.log("💡 Função não existe - precisa fazer deploy");
      } else {
        console.log("💡 Função existe mas tem outro problema");
      }
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 TESTE CONCLUÍDO");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

testProdSimple();
