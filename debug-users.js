// Script temporário para diagnosticar usuários e criar usuário de produção
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function createProductionUser() {
  try {
    console.log("🔧 Criando usuário de produção...");
    const userResult = await client.action("userActions:createUser", {
      name: "Nobre Car Admin",
      email: "contato@nobrecarautomoveis.com.br",
      password: "@Nbr102030",
      role: "ADMIN",
      currentUserId: "j97e5hp9p10mgzav05wa8erwxs7m4ndw" // ID do admin que já existe
    });
    console.log("✅ Usuário criado:", userResult);

    console.log("\n🔍 Verificando usuários no sistema...");
    const debugResult = await client.action("userActions:debugUsers", {});
    console.log("📊 Usuários:", debugResult);
  } catch (error) {
    console.error("❌ Erro:", error);

    // Se der erro, só lista os usuários existentes
    console.log("\n🔍 Verificando usuários existentes...");
    try {
      const debugResult = await client.action("userActions:debugUsers", {});
      console.log("📊 Usuários:", debugResult);
    } catch (debugError) {
      console.error("❌ Erro no debug:", debugError);
    }
  }
}

createProductionUser();
