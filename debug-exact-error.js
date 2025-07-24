// Script para debugar o erro exato que está acontecendo
const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://focused-walrus-736.convex.cloud");

async function debugExactError() {
  try {
    console.log("🔍 DEBUGANDO ERRO EXATO...");
    console.log("=" * 50);
    
    // Vamos testar com dados mínimos primeiro
    console.log("🧪 TESTE 1: Dados mínimos obrigatórios");
    
    const minimalData = {
      // Campos básicos obrigatórios
      proposalType: 'financing',
      vehicleType: 'car',
      tipoPessoa: 'fisica',
      
      // Veículo básico
      brand: '7',
      brandName: 'CHEVROLET',
      model: '202',
      modelName: 'CELTA',
      modelYear: '2010',
      manufactureYear: 2010,
      value: 15000,
      
      // Pessoa física básica
      nome: 'Teste Debug',
      cpfPF: '123.456.789-00',
      emailPF: 'teste@debug.com',
      
      // Campos que podem estar causando problema
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
      
      // NOVOS CAMPOS - podem estar causando o erro
      empresa: 'Empresa Teste',
      naturezaOcupacao: 'assalariado',
      cargo: 'Desenvolvedor',
      
      // Outros campos
      telefonePessoalPF: '(48) 9 9999-9999',
      telefoneReferenciaPF: '(48) 9 8888-8888',
      cepPF: '88000-000',
      enderecoPF: 'Rua Teste, 123',
      observacoesPF: 'Teste debug',
      
      // Veículo completo
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
      
      // UserID correto
      userId: 'j976wzktg2n7hvjsq3ch90p1hn7mae5c' // fabricius
    };
    
    try {
      const result = await client.mutation("proposals:createProposal", minimalData);
      console.log("✅ SUCESSO com dados completos!");
      console.log("   ID:", result.proposalId);
      console.log("   Número:", result.proposalNumber);
      return;
    } catch (error) {
      console.log("❌ ERRO com dados completos:", error.message);
    }
    
    // Se falhou, vamos testar sem os novos campos
    console.log("\n🧪 TESTE 2: Sem campos profissionais");
    
    const dataWithoutProfessional = { ...minimalData };
    delete dataWithoutProfessional.empresa;
    delete dataWithoutProfessional.naturezaOcupacao;
    delete dataWithoutProfessional.cargo;
    
    try {
      const result = await client.mutation("proposals:createProposal", dataWithoutProfessional);
      console.log("✅ SUCESSO sem campos profissionais!");
      console.log("   ID:", result.proposalId);
      console.log("   Número:", result.proposalNumber);
      console.log("🎯 PROBLEMA: Os novos campos profissionais estão causando erro!");
      return;
    } catch (error) {
      console.log("❌ ERRO mesmo sem campos profissionais:", error.message);
    }
    
    // Vamos testar cada campo profissional individualmente
    console.log("\n🧪 TESTE 3: Só campo EMPRESA");

    const dataWithEmpresa = { ...dataWithoutProfessional, empresa: 'Empresa Teste' };
    try {
      const result = await client.mutation("proposals:createProposal", dataWithEmpresa);
      console.log("✅ SUCESSO com campo empresa!");
    } catch (error) {
      console.log("❌ ERRO com campo empresa:", error.message);
    }

    console.log("\n🧪 TESTE 4: Só campo NATUREZA OCUPAÇÃO");

    const dataWithNatureza = { ...dataWithoutProfessional, naturezaOcupacao: 'assalariado' };
    try {
      const result = await client.mutation("proposals:createProposal", dataWithNatureza);
      console.log("✅ SUCESSO com campo natureza ocupação!");
    } catch (error) {
      console.log("❌ ERRO com campo natureza ocupação:", error.message);
    }

    console.log("\n🧪 TESTE 5: Só campo CARGO");

    const dataWithCargo = { ...dataWithoutProfessional, cargo: 'Desenvolvedor' };
    try {
      const result = await client.mutation("proposals:createProposal", dataWithCargo);
      console.log("✅ SUCESSO com campo cargo!");
    } catch (error) {
      console.log("❌ ERRO com campo cargo:", error.message);
    }

    // Se ainda falhou, vamos testar com dados super mínimos
    console.log("\n🧪 TESTE 6: Dados super mínimos");
    
    const superMinimal = {
      proposalType: 'financing',
      vehicleType: 'car',
      tipoPessoa: 'fisica',
      brand: '7',
      model: '202',
      modelYear: '2010',
      value: 15000,
      nome: 'Teste',
      cpfPF: '123.456.789-00',
      userId: 'j976wzktg2n7hvjsq3ch90p1hn7mae5c'
    };
    
    try {
      const result = await client.mutation("proposals:createProposal", superMinimal);
      console.log("✅ SUCESSO com dados super mínimos!");
      console.log("   ID:", result.proposalId);
      console.log("   Número:", result.proposalNumber);
      console.log("🎯 PROBLEMA: Algum campo específico está causando erro!");
    } catch (error) {
      console.log("❌ ERRO mesmo com dados super mínimos:", error.message);
      console.log("🎯 PROBLEMA: Erro fundamental na mutation ou schema!");
    }
    
  } catch (error) {
    console.error("💥 ERRO CRÍTICO:", error);
  }
  
  console.log("\n" + "=" * 50);
  console.log("🎯 DEBUG CONCLUÍDO");
}

debugExactError();
