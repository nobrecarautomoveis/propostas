// Script temporário para diagnosticar usuários
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function debugUsers() {
  try {
    console.log("🔍 Verificando usuários no sistema...");
    const result = await client.action("userActions:debugUsers", {});
    console.log("📊 Resultado:", result);
  } catch (error) {
    console.error("❌ Erro:", error);
  }
}

debugUsers();
