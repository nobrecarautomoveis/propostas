// Script para debugar o banco de produção real
const { ConvexHttpClient } = require("convex/browser");

// Vamos tentar as possíveis URLs de produção
const possibleUrls = [
  "https://knowing-chickadee-162.convex.cloud", // DEV atual
  "https://focused-walrus-736.convex.cloud",    // PROD mencionado antes
  "https://propostas.nobrecarautomoveis.com.br/.netlify/functions/convex", // Netlify
  "https://propostas-nobrecar.convex.cloud",    // Possível nome
  "https://nobrecar-propostas.convex.cloud",    // Possível nome
];

async function debugProductionDB() {
  try {
    console.log("🔍 PROCURANDO O BANCO DE PRODUÇÃO REAL...");
    console.log("=" * 50);
    
    for (const url of possibleUrls) {
      console.log(`\n🧪 Testando: ${url}`);
      
      try {
        const client = new ConvexHttpClient(url);
        
        // Tenta buscar usuários
        const users = await client.action("userActions:debugUsers", {});
        console.log(`   ✅ CONECTOU! Usuários encontrados: ${users.length}`);
        
        // Lista usuários
        users.forEach(user => {
          console.log(`      - ${user.name} (${user.email})`);
        });
        
        // Busca propostas
        const proposals = await client.query("proposals:getAllProposalsRaw", {});
        console.log(`   📊 Propostas encontradas: ${proposals.length}`);
        
        proposals.forEach(p => {
          console.log(`      - ${p.proposalNumber} (${new Date(p._creationTime).toLocaleString()})`);
        });
        
        // Se encontrou a PROP-001, este é o banco correto!
        const prop001 = proposals.find(p => p.proposalNumber === "PROP-001");
        if (prop001) {
          console.log(`\n🎯 BANCO CORRETO ENCONTRADO! ${url}`);
          console.log(`   ✅ PROP-001 encontrada: ${prop001._id}`);
          console.log(`   👤 SalespersonId: ${prop001.salespersonId}`);
          
          // Testa o usuário da PROP-001
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
          
          return; // Para aqui se encontrou o banco correto
        }
        
      } catch (error) {
        console.log(`   ❌ Falhou: ${error.message}`);
      }
    }
    
    console.log("\n" + "=" * 50);
    console.log("🤔 NENHUM BANCO COM PROP-001 ENCONTRADO");
    console.log("💡 O frontend pode estar usando uma URL diferente ou há cache local");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

debugProductionDB();
