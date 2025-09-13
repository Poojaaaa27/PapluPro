import {genkit} from 'genkit';
import {next} from '@genkit-ai/next';

export const ai = genkit({
  plugins: [next()],
  model: 'googleai/gemini-2.5-flash',
});
