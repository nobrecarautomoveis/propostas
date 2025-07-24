// Script para testar a query getAllUsers
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function testGetAllUsers() {
  try {
    console.log("🔍 Testando query getAllUsers...");
    
    // Primeiro, vamos buscar um usuário válido
    const debugResult = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", debugResult.length);
    
    if (debugResult.length > 0) {
      const testUser = debugResult[0];
      console.log("🧪 Testando com usuário:", testUser.name, testUser.id);
      
      // Agora testa a query getAllUsers
      const usersResult = await client.query("users:getAllUsers", {
        requesterId: testUser.id
      });
      
      console.log("✅ Query getAllUsers funcionou!");
      console.log("📊 Resultado:", usersResult);
    } else {
      console.log("❌ Nenhum usuário encontrado para teste");
    }
    
  } catch (error) {
    console.error("❌ Erro na query getAllUsers:", error);
    console.error("📋 Detalhes:", error.message);
  }
}

testGetAllUsers();
