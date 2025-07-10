import { config } from 'dotenv';
config();

import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/extract-topics-from-conversation.ts';
import '@/ai/flows/summarize-conversation.ts';