// Script temporário para diagnosticar usuários e criar usuário de produção
const { ConvexHttpClient } = require("convex/browser");

// AMBIENTE DE PRODUÇÃO
const client = new ConvexHttpClient("https://focused-walrus-736.convex.cloud");

async function setupProductionEnvironment() {
  try {
    console.log("🚀 CONFIGURANDO AMBIENTE DE PRODUÇÃO");
    console.log("🔗 URL:", "https://focused-walrus-736.convex.cloud");

    // Primeiro, verifica usuários existentes
    console.log("\n🔍 Verificando usuários existentes...");
    try {
      const debugResult = await client.action("userActions:debugUsers", {});
      console.log("📊 Usuários existentes:", debugResult);

      if (debugResult.length > 0) {
        console.log("✅ Já existem usuários no ambiente de produção!");
        return;
      }
    } catch (debugError) {
      console.log("⚠️ Nenhum usuário encontrado, criando admin...");
    }

    // Cria o admin padrão
    console.log("\n🔧 Criando admin padrão...");
    const adminResult = await client.action("userActions:ensureAdminUser", {});
    console.log("✅ Admin:", adminResult);

    // Aguarda um pouco para garantir que o admin foi criado
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Busca o ID do admin criado
    const users = await client.action("userActions:debugUsers", {});
    const adminUser = users.find(u => u.email === "admin@nobrecar.com");

    if (adminUser) {
      console.log("\n🔧 Criando usuário de produção...");
      const userResult = await client.action("userActions:createUser", {
        name: "Nobre Car Admin",
        email: "contato@nobrecarautomoveis.com.br",
        password: "@Nbr102030",
        role: "ADMIN",
        currentUserId: adminUser.id
      });
      console.log("✅ Usuário de produção criado:", userResult);
    }

    console.log("\n🔍 Verificando usuários finais...");
    const finalUsers = await client.action("userActions:debugUsers", {});
    console.log("📊 Usuários finais:", finalUsers);

  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

setupProductionEnvironment();
