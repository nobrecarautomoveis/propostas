// Script para testar se o schema está correto na produção
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://focused-walrus-736.convex.cloud");

async function testSchemaProd() {
  try {
    console.log("🔍 TESTANDO SCHEMA NA PRODUÇÃO...");
    console.log("=" * 50);
    
    // Vamos tentar criar uma proposta com APENAS um campo novo por vez
    const baseData = {
      proposalType: 'financing',
      vehicleType: 'car',
      tipoPessoa: 'fisica',
      brand: '7',
      brandName: 'CHEVROLET',
      model: '202',
      modelName: 'CELTA',
      modelYear: '2010',
      manufactureYear: 2010,
      value: 15000,
      nome: 'Teste Schema',
      cpfPF: '123.456.789-00',
      emailPF: 'teste@schema.com',
      dataNascimento: '1990-01-01',
      sexo: 'masculino',
      nomeMae: 'Mae Teste',
      nomePai: 'Pai Teste',
      rg: '1234567',
      dataEmissaoRg: '2010-01-01',
      orgaoExpedidor: 'SSP/SC',
      naturalidade: 'Florianópolis - SC',
      estadoCivil: 'solteiro',
      possuiCnh: true,
      telefonePessoalPF: '(48) 9 9999-9999',
      telefoneReferenciaPF: '(48) 9 8888-8888',
      cepPF: '88000-000',
      enderecoPF: 'Rua Teste, 123',
      observacoesPF: 'Teste schema',
      plate: 'ABC-1234',
      isFinanced: false,
      vehicleCondition: 'used',
      bodywork: '',
      version: '',
      fuel: 'Gasolina',
      transmission: 'Manual',
      color: 'Branco',
      valorFinanciar: '',
      licensingLocation: 'SC',
      status: 'pending',
      userId: 'j976wzktg2n7hvjsq3ch90p1hn7mae5c'
    };
    
    // TESTE 1: Só campo EMPRESA
    console.log("🧪 TESTE 1: Só campo EMPRESA");
    try {
      const dataWithEmpresa = { ...baseData, empresa: 'Empresa Teste Ltda' };
      const result1 = await client.mutation("proposals:createProposal", dataWithEmpresa);
      console.log("✅ SUCESSO com campo EMPRESA!");
      console.log("   ID:", result1.proposalId);
    } catch (error) {
      console.log("❌ ERRO com campo EMPRESA:", error.message);
      if (error.message.includes("validation")) {
        console.log("   🔍 Erro de validação - campo não reconhecido no schema");
      }
    }
    
    // TESTE 2: Só campo CARGO
    console.log("\n🧪 TESTE 2: Só campo CARGO");
    try {
      const dataWithCargo = { ...baseData, cargo: 'Desenvolvedor' };
      const result2 = await client.mutation("proposals:createProposal", dataWithCargo);
      console.log("✅ SUCESSO com campo CARGO!");
      console.log("   ID:", result2.proposalId);
    } catch (error) {
      console.log("❌ ERRO com campo CARGO:", error.message);
      if (error.message.includes("validation")) {
        console.log("   🔍 Erro de validação - campo não reconhecido no schema");
      }
    }
    
    // TESTE 3: Só campo NATUREZA OCUPAÇÃO
    console.log("\n🧪 TESTE 3: Só campo NATUREZA OCUPAÇÃO");
    try {
      const dataWithNatureza = { ...baseData, naturezaOcupacao: 'assalariado' };
      const result3 = await client.mutation("proposals:createProposal", dataWithNatureza);
      console.log("✅ SUCESSO com campo NATUREZA OCUPAÇÃO!");
      console.log("   ID:", result3.proposalId);
    } catch (error) {
      console.log("❌ ERRO com campo NATUREZA OCUPAÇÃO:", error.message);
      if (error.message.includes("validation")) {
        console.log("   🔍 Erro de validação - campo não reconhecido no schema");
      }
    }
    
    // TESTE 4: Todos os campos juntos
    console.log("\n🧪 TESTE 4: TODOS OS CAMPOS PROFISSIONAIS");
    try {
      const dataWithAll = { 
        ...baseData, 
        empresa: 'Empresa Teste Ltda',
        cargo: 'Desenvolvedor',
        naturezaOcupacao: 'assalariado'
      };
      const result4 = await client.mutation("proposals:createProposal", dataWithAll);
      console.log("✅ SUCESSO com TODOS os campos profissionais!");
      console.log("   ID:", result4.proposalId);
      console.log("🎉 SCHEMA ESTÁ CORRETO NA PRODUÇÃO!");
    } catch (error) {
      console.log("❌ ERRO com TODOS os campos:", error.message);
      console.log("🔍 Problema na combinação dos campos ou schema incompleto");
    }
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
  
  console.log("\n" + "=" * 50);
  console.log("🎯 TESTE DE SCHEMA CONCLUÍDO");
}

testSchemaProd();
