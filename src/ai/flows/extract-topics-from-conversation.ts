'use server';
/**
 * @fileOverview This file defines a Genkit flow for extracting topics and keywords from a transcribed conversation.
 *
 * - extractTopicsFromConversation - A function that handles the topic extraction process.
 * - ExtractTopicsFromConversationInput - The input type for the extractTopicsFromConversation function.
 * - ExtractTopicsFromConversationOutput - The return type for the extractTopicsFromConversation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTopicsFromConversationInputSchema = z.object({
  transcription: z
    .string()
    .describe('The transcribed text of the conversation.'),
});
export type ExtractTopicsFromConversationInput =
  z.infer<typeof ExtractTopicsFromConversationInputSchema>;

const ExtractTopicsFromConversationOutputSchema = z.object({
  topics: z
    .array(z.string())
    .describe('A list of topics extracted from the conversation.'),
  keywords: z
    .array(z.string())
    .describe('A list of keywords extracted from the conversation.'),
});
export type ExtractTopicsFromConversationOutput =
  z.infer<typeof ExtractTopicsFromConversationOutputSchema>;

export async function extractTopicsFromConversation(
  input: ExtractTopicsFromConversationInput
): Promise<ExtractTopicsFromConversationOutput> {
  return extractTopicsFromConversationFlow(input);
}

const extractTopicsFromConversationPrompt = ai.definePrompt({
  name: 'extractTopicsFromConversationPrompt',
  input: {schema: ExtractTopicsFromConversationInputSchema},
  output: {schema: ExtractTopicsFromConversationOutputSchema},
  prompt: `You are an AI expert in natural language processing. Your task is to analyze a given conversation transcript and extract the key topics and keywords discussed.

  Conversation Transcript: {{{transcription}}}

  Identify the main topics discussed in the conversation and list them as a bulleted list under "Topics". Then, identify the most relevant keywords from the conversation and list them as a bulleted list under "Keywords". Return the topics and keywords as a JSON object.

  Ensure that the topics and keywords are relevant to the main content of the conversation and are not overly broad or generic.
`,
});

const extractTopicsFromConversationFlow = ai.defineFlow(
  {
    name: 'extractTopicsFromConversationFlow',
    inputSchema: ExtractTopicsFromConversationInputSchema,
    outputSchema: ExtractTopicsFromConversationOutputSchema,
  },
  async input => {
    const {output} = await extractTopicsFromConversationPrompt(input);
    return output!;
  }
);
