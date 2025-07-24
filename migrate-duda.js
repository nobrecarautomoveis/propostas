// Script para migrar usuário Duda e PROP-001 para DEV
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function migrateDuda() {
  try {
    console.log("🔄 MIGRANDO USUÁRIO DUDA PARA DEV...");
    console.log("=" * 50);
    
    // 1. Verifica se Duda já existe
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários atuais:", users.length);
    
    const existingDuda = users.find(u => u.name.toLowerCase().includes('duda'));
    if (existingDuda) {
      console.log(`✅ Usuário Duda já existe: ${existingDuda.name} - ${existingDuda.id}`);
    } else {
      console.log("🆕 Criando usuário Duda...");
      
      try {
        const dudaId = await client.mutation("users:createUser", {
          name: "Duda",
          email: "duda@nobrecar.com",
          role: "USER"
        });
        console.log(`✅ Usuário Duda criado: ${dudaId}`);
      } catch (error) {
        console.error(`❌ Erro ao criar Duda: ${error.message}`);
        return;
      }
    }
    
    // 2. Busca Duda novamente para ter o ID correto
    const updatedUsers = await client.action("userActions:debugUsers", {});
    const duda = updatedUsers.find(u => u.name.toLowerCase().includes('duda'));
    
    if (!duda) {
      console.error("❌ Usuário Duda não encontrado após criação!");
      return;
    }
    
    console.log(`👤 Usando Duda: ${duda.name} - ${duda.id}`);
    
    // 3. Verifica se PROP-001 já existe
    const proposals = await client.query("proposals:getAllProposalsRaw", {});
    const existingProp001 = proposals.find(p => p.proposalNumber === "PROP-001");
    
    if (existingProp001) {
      console.log(`✅ PROP-001 já existe: ${existingProp001._id}`);
      
      // Atualiza para usar Duda como criador
      console.log("🔧 Atualizando PROP-001 para usar Duda...");
      try {
        await client.mutation("proposals:updateProposalUser", {
          proposalId: existingProp001._id,
          newUserId: duda.id
        });
        console.log("✅ PROP-001 atualizada!");
      } catch (error) {
        console.error(`❌ Erro ao atualizar: ${error.message}`);
      }
    } else {
      console.log("🆕 Criando PROP-001 com Duda...");
      
      try {
        const prop001Id = await client.mutation("proposals:createProposal", {
          proposalNumber: "PROP-001",
          salespersonId: duda.id,
          vehicle: {
            brand: "Volkswagen",
            model: "Gol",
            year: 2023,
            fipeCode: "005340-1"
          },
          customer: {
            name: "Cliente Teste Duda",
            email: "cliente@teste.com",
            phone: "(11) 99999-9999",
            cpf: "123.456.789-00"
          },
          financingDetails: {
            vehicleValue: 50000,
            downPayment: 10000,
            financedAmount: 40000,
            installments: 48,
            installmentValue: 950
          }
        });
        console.log(`✅ PROP-001 criada: ${prop001Id}`);
      } catch (error) {
        console.error(`❌ Erro ao criar PROP-001: ${error.message}`);
      }
    }
    
    // 4. Testa o resultado final
    console.log("\n🧪 TESTANDO RESULTADO FINAL...");
    const finalProposals = await client.query("proposals:getProposals", {
      userId: duda.id
    });
    
    console.log("📊 Propostas de Duda:", finalProposals.length);
    finalProposals.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.proposalNumber} - Criado por: ${p.createdBy?.name || 'ERRO'}`);
    });
    
    console.log("\n" + "=" * 50);
    console.log("🎉 MIGRAÇÃO CONCLUÍDA!");
    console.log("🔄 Agora o frontend deve mostrar dados corretos!");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

migrateDuda();
