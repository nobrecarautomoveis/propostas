import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";

// Action para migrar propostas existentes e popular brandName e modelName
export const migrateProposalsWithNames = action({
  args: {},
  handler: async (ctx) => {
    // Busca todas as propostas
    const proposals = await ctx.runQuery(internal.proposals.getAllProposalsInternal);
    
    let updatedCount = 0;
    
    for (const proposal of proposals) {
      // Verifica se já tem modelName preenchido
      if (proposal.modelName && proposal.modelName.trim() !== '') {
        continue; // Pula se já tem o nome
      }
      
      try {
        // Determina o tipo de veículo para a API FIPE
        let vehicleTypeApi = 'carros';
        if (proposal.vehicleType === 'motorcycle') vehicleTypeApi = 'motos';
        else if (proposal.vehicleType === 'truck' || proposal.vehicleType === 'bus') vehicleTypeApi = 'caminhoes';
        
        // Busca os modelos da marca na API FIPE
        const modelsResponse = await fetch(
          `https://parallelum.com.br/fipe/api/v1/${vehicleTypeApi}/marcas/${proposal.brand}/modelos`
        );
        
        if (modelsResponse.ok) {
          const modelsData = await modelsResponse.json();
          const models = modelsData.modelos || [];
          
          // Encontra o modelo correspondente
          const foundModel = models.find((model: any) => 
            String(model.codigo) === String(proposal.model)
          );
          
          if (foundModel) {
            // Atualiza a proposta com o nome do modelo
            await ctx.db.patch(proposal._id, {
              vehicleBrand: foundModel.nome,
              vehicleModel: foundModel.nome
            });
            updatedCount++;
            console.log(`Atualizada proposta ${proposal.proposalNumber}: ${foundModel.nome}`);
          }
        }
        
        // Pequena pausa para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        console.error(`Erro ao processar proposta ${proposal.proposalNumber}:`, error);
      }
    }
    
    return { message: `Migração concluída. ${updatedCount} propostas atualizadas.` };
  },
});

// Action para remover campos antigos obsoletos do banco de dados
export const removeOldFields = action({
  args: {},
  handler: async (ctx) => {
    // Busca todas as propostas
    const proposals = await ctx.runQuery(internal.proposals.getAllProposalsInternal);

    let updatedCount = 0;
    const fieldsToRemove = ['cpfCnpj', 'email', 'telefonePessoal', 'telefoneReferencia', 'cep', 'endereco', 'state'];

    for (const proposal of proposals) {
      try {
        // Verifica se a proposta tem algum dos campos antigos
        const hasOldFields = fieldsToRemove.some(field =>
          proposal.hasOwnProperty(field) && proposal[field as keyof typeof proposal] !== undefined
        );

        if (hasOldFields) {
          // Remove os campos antigos usando patch com undefined
          const updateData: any = {};
          fieldsToRemove.forEach(field => {
            if (proposal.hasOwnProperty(field)) {
              updateData[field] = undefined;
            }
          });

          await ctx.db.patch(proposal._id, updateData);
          updatedCount++;
          console.log(`Removidos campos antigos da proposta ${proposal.proposalNumber}`);
        }

      } catch (error) {
        console.error(`Erro ao processar proposta ${proposal.proposalNumber}:`, error);
      }
    }

    return {
      message: `Limpeza concluída. ${updatedCount} propostas tiveram campos antigos removidos.`,
      fieldsRemoved: fieldsToRemove,
      totalProposals: proposals.length
    };
  },
});