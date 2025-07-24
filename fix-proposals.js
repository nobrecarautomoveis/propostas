// Script para corrigir propostas com usuários inexistentes
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function fixProposals() {
  try {
    console.log("🔧 INICIANDO CORREÇÃO DE PROPOSTAS...");
    console.log("=" * 50);
    
    // Primeiro, busca os usuários disponíveis
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    // Usa o usuário "Nobre Car Admin" como substituto
    const nobreCarAdmin = users.find(u => u.email === "contato@nobrecarautomoveis.com.br");
    
    if (!nobreCarAdmin) {
      console.error("❌ Usuário 'Nobre Car Admin' não encontrado!");
      return;
    }
    
    console.log("🎯 Usando como substituto:", nobreCarAdmin.name, nobreCarAdmin.id);
    
    // Executa a correção
    console.log("\n🔧 EXECUTANDO CORREÇÃO...");
    const result = await client.action("proposals:fixProposalsWithInvalidUsers", {
      newUserId: nobreCarAdmin.id
    });
    
    console.log("\n📊 RESULTADO:");
    console.log(`✅ Propostas corrigidas: ${result.fixed}`);
    console.log(`📋 Total de propostas: ${result.total}`);
    
    if (result.fixed > 0) {
      console.log("\n🎉 CORREÇÃO REALIZADA COM SUCESSO!");
      console.log("🔄 Agora teste o sistema novamente.");
    } else {
      console.log("\n⚠️ Nenhuma proposta precisou ser corrigida.");
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 CORREÇÃO CONCLUÍDA");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

fixProposals();
