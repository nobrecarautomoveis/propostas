'use server';

import { transcribeAudio, TranscribeAudioInput } from "@/ai/flows/transcribe-audio";
import { summarizeConversation } from "@/ai/flows/summarize-conversation";
import { extractTopicsFromConversation } from "@/ai/flows/extract-topics-from-conversation";

type AnalysisResult = {
  transcription: string;
  summary: string;
  topics: string[];
  keywords: string[];
};

export async function transcribeAndAnalyze(input: TranscribeAudioInput): Promise<AnalysisResult | null> {
    try {
        // Step 1: Transcribe Audio
        const transcriptionResult = await transcribeAudio(input);
        if (!transcriptionResult || !transcriptionResult.transcription) {
            throw new Error("Falha na transcrição do áudio.");
        }
        const { transcription } = transcriptionResult;

        // Step 2: Summarize Conversation
        const summaryResult = await summarizeConversation({ transcript: transcription });
        if (!summaryResult || !summaryResult.summary) {
            throw new Error("Falha ao resumir a conversa.");
        }
        const { summary } = summaryResult;

        // Step 3: Extract Topics
        const topicsResult = await extractTopicsFromConversation({ transcription: transcription });
         if (!topicsResult || !topicsResult.topics || !topicsResult.keywords) {
            throw new Error("Falha ao extrair tópicos.");
        }
        const { topics, keywords } = topicsResult;

        return {
            transcription,
            summary,
            topics,
            keywords,
        };

    } catch (error) {
        console.error("Erro no processo de análise:", error);
        if (error instanceof Error) {
            throw new Error(`Erro no servidor: ${error.message}`);
        }
        throw new Error("Ocorreu um erro desconhecido no servidor.");
    }
}
