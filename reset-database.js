// Script para resetar completamente a base de dados
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://knowing-chickadee-162.convex.cloud");

async function resetDatabase() {
  try {
    console.log("🔥 INICIANDO RESET COMPLETO DA BASE...");
    console.log("=" * 50);
    
    // 1. Busca usuários válidos
    const users = await client.action("userActions:debugUsers", {});
    console.log("👥 Usuários disponíveis:", users.length);
    
    const admin = users.find(u => u.email === "admin@nobrecar.com");
    const fabricius = users.find(u => u.email === "fabriciusgaspareti@gmail.com");
    const nobrecar = users.find(u => u.email === "contato@nobrecarautomoveis.com.br");
    
    if (!admin || !fabricius || !nobrecar) {
      console.error("❌ Usuários necessários não encontrados!");
      return;
    }
    
    console.log("✅ Usuários encontrados:");
    console.log(`   - Admin: ${admin.id}`);
    console.log(`   - Fabricius: ${fabricius.id}`);
    console.log(`   - Nobre Car: ${nobrecar.id}`);
    
    // 2. Lista todas as propostas atuais
    console.log("\n📋 LISTANDO PROPOSTAS ATUAIS...");
    const allProposals = await client.query("proposals:getAllProposalsRaw", {});
    console.log("📊 Total de propostas encontradas:", allProposals.length);
    
    allProposals.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.proposalNumber} (ID: ${p._id})`);
      console.log(`      SalespersonId: ${p.salespersonId}`);
      console.log(`      Data: ${new Date(p._creationTime).toLocaleString()}`);
    });
    
    // 3. ATENÇÃO: Vamos deletar TODAS as propostas
    console.log("\n🔥 DELETANDO TODAS AS PROPOSTAS...");
    console.log("⚠️ ATENÇÃO: Esta operação é IRREVERSÍVEL!");
    
    let deletedCount = 0;
    for (const proposal of allProposals) {
      try {
        console.log(`🗑️ Deletando ${proposal.proposalNumber}...`);
        await client.mutation("proposals:deleteProposal", {
          proposalId: proposal._id
        });
        deletedCount++;
        console.log(`   ✅ Deletado!`);
      } catch (error) {
        console.error(`   ❌ Erro ao deletar: ${error.message}`);
      }
    }
    
    console.log(`\n🔥 DELEÇÃO CONCLUÍDA: ${deletedCount} propostas deletadas`);
    
    // 4. Criar propostas novas com dados corretos
    console.log("\n🆕 CRIANDO PROPOSTAS NOVAS...");
    
    const newProposals = [
      {
        proposalNumber: "PROP-001",
        salespersonId: admin.id,
        vehicle: {
          brand: "Volkswagen",
          model: "Gol",
          year: 2020,
          fipeCode: "005340-1"
        },
        customer: {
          name: "João Silva",
          email: "joao@email.com",
          phone: "(11) 99999-9999",
          cpf: "123.456.789-00"
        },
        financingDetails: {
          vehicleValue: 45000,
          downPayment: 10000,
          financedAmount: 35000,
          installments: 48,
          installmentValue: 850
        }
      },
      {
        proposalNumber: "PROP-002",
        salespersonId: fabricius.id,
        vehicle: {
          brand: "Chevrolet",
          model: "Onix",
          year: 2021,
          fipeCode: "005341-2"
        },
        customer: {
          name: "Maria Santos",
          email: "maria@email.com",
          phone: "(11) 88888-8888",
          cpf: "987.654.321-00"
        },
        financingDetails: {
          vehicleValue: 52000,
          downPayment: 15000,
          financedAmount: 37000,
          installments: 60,
          installmentValue: 750
        }
      },
      {
        proposalNumber: "PROP-003",
        salespersonId: nobrecar.id,
        vehicle: {
          brand: "Ford",
          model: "Ka",
          year: 2019,
          fipeCode: "005342-3"
        },
        customer: {
          name: "Pedro Costa",
          email: "pedro@email.com",
          phone: "(11) 77777-7777",
          cpf: "456.789.123-00"
        },
        financingDetails: {
          vehicleValue: 38000,
          downPayment: 8000,
          financedAmount: 30000,
          installments: 36,
          installmentValue: 950
        }
      }
    ];
    
    let createdCount = 0;
    for (const proposalData of newProposals) {
      try {
        console.log(`🆕 Criando ${proposalData.proposalNumber}...`);
        const result = await client.mutation("proposals:createProposal", proposalData);
        createdCount++;
        console.log(`   ✅ Criado com ID: ${result}`);
      } catch (error) {
        console.error(`   ❌ Erro ao criar: ${error.message}`);
      }
    }
    
    console.log(`\n🆕 CRIAÇÃO CONCLUÍDA: ${createdCount} propostas criadas`);
    
    // 5. Testa o resultado final
    console.log("\n🧪 TESTANDO RESULTADO FINAL...");
    const finalProposals = await client.query("proposals:getProposals", {
      userId: nobrecar.id
    });
    
    console.log("📊 Propostas finais:", finalProposals.length);
    finalProposals.forEach((p, i) => {
      console.log(`   ${i+1}. ${p.proposalNumber} - Criado por: ${p.createdBy?.name || 'ERRO'}`);
    });
    
    console.log("\n" + "=" * 50);
    console.log("🎉 RESET COMPLETO CONCLUÍDO!");
    console.log("🔄 Agora teste o frontend - deve mostrar dados corretos!");
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
}

resetDatabase();
