// Script para comparar comportamento entre DEV e PROD
const { ConvexHttpClient } = require("convex/browser");

const devClient = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function compareProdVsDev() {
  try {
    console.log("🔍 COMPARANDO DEV vs PROD");
    console.log("=" * 50);
    
    // Teste 1: Debug users
    console.log("\n📊 TESTE 1: Debug Users");
    try {
      const users = await devClient.action("userActions:debugUsers", {});
      console.log("✅ DEV - Usuários encontrados:", users.length);
      users.forEach((user, i) => {
        console.log(`   ${i+1}. ${user.name} (${user.email}) - ID: ${user.id}`);
      });
    } catch (error) {
      console.error("❌ DEV - Erro no debugUsers:", error.message);
    }
    
    // Teste 2: Query getAllUsers com cada usuário
    console.log("\n📊 TESTE 2: Query getAllUsers");
    try {
      const users = await devClient.action("userActions:debugUsers", {});
      
      for (const user of users) {
        console.log(`\n🧪 Testando getAllUsers com ${user.name}:`);
        try {
          const result = await devClient.query("users:getAllUsers", {
            requesterId: user.id
          });
          console.log(`   ✅ Sucesso - ${result.length} usuários retornados`);
        } catch (queryError) {
          console.error(`   ❌ Erro - ${queryError.message}`);
        }
      }
    } catch (error) {
      console.error("❌ Erro geral no teste:", error.message);
    }
    
    // Teste 3: Query simples alternativa
    console.log("\n📊 TESTE 3: Query Simples Alternativa");
    try {
      const result = await devClient.query("users:getSimpleUsersList", {});
      console.log("✅ Query simples funcionou:", result.length, "usuários");
    } catch (error) {
      console.error("❌ Query simples falhou:", error.message);
    }
    
    console.log("\n" + "=" * 50);
    console.log("🎯 TESTE CONCLUÍDO");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

compareProdVsDev();
