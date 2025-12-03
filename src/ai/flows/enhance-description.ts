// This file should be renamed to enhance-disease-information.ts
// The XML change operation will handle the rename if possible,
// otherwise this content will go into the new filename.
'use server';

/**
 * @fileOverview Flow to enhance the disease prediction with details, remedies, and prevention.
 *
 * - enhanceDiseaseInformation - A function that provides comprehensive information about a lemon leaf disease.
 * - EnhanceDiseaseInformationInput - The input type for the enhanceDiseaseInformation function.
 * - EnhanceDiseaseInformationOutput - The return type for the enhanceDiseaseInformation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const EnhanceDiseaseInformationInputSchema = z.object({
  diseaseName: z.string().describe('The name of the predicted disease or condition (e.g., "spider_mites", "Healthy").'),
  confidence: z.number().optional().describe('The confidence score of the prediction (0.0 to 1.0).'),
});

export type EnhanceDiseaseInformationInput = z.infer<typeof EnhanceDiseaseInformationInputSchema>;

const EnhanceDiseaseInformationOutputSchema = z.object({
  comprehensiveGuide: z.string().describe('A comprehensive guide including disease details, remedies, and prevention advice, formatted for display.'),
});

export type EnhanceDiseaseInformationOutput = z.infer<typeof EnhanceDiseaseInformationOutputSchema>;

export async function enhanceDiseaseInformation(input: EnhanceDiseaseInformationInput): Promise<EnhanceDiseaseInformationOutput> {
  return enhanceDiseaseInformationFlow(input);
}

const enhanceDiseaseInformationPrompt = ai.definePrompt({
  name: 'enhanceDiseaseInformationPrompt',
  input: {schema: EnhanceDiseaseInformationInputSchema},
  output: {schema: EnhanceDiseaseInformationOutputSchema},
  prompt: `You are an expert botanist and agricultural advisor specializing in lemon tree diseases.
Your task is to provide a comprehensive guide for the user based on the predicted lemon leaf condition.

Predicted Condition: {{{diseaseName}}}
{{#if confidence}}
Confidence Score: {{confidence}}%
{{/if}}

If the "Predicted Condition" is "Healthy", provide detailed advice on "Maintaining a Healthy Lemon Tree", covering watering, sunlight, fertilization, pruning, and pest/disease monitoring. Use Markdown for headings and lists.

If the "Predicted Condition" is "Undetermined" or if the confidence (if provided) is very low (e.g., below 25%), provide "General Lemon Tree Care & Observation" advice. This should include key symptoms of common problems to watch for, general care best practices, and when to seek professional advice. Use Markdown for headings and lists.

For all other disease conditions:
Provide the following information in a clear, user-friendly, and well-structured format. Use Markdown for headings and lists where appropriate.

1.  **Understanding {{diseaseName}}**:
    *   Description of the disease/condition.
    *   Common symptoms on lemon leaves and other parts of the plant.
    *   Typical causes or contributing factors (e.g., environmental conditions, pests).

2.  **Treatment Options for {{diseaseName}}**:
    *   **Organic/Cultural Controls**: Detail non-chemical methods first (e.g., pruning, introducing beneficial insects, adjusting watering, homemade sprays).
    *   **Chemical Controls**: If applicable, mention chemical treatments as a last resort or for severe cases. Specify active ingredients if possible and advise caution and adherence to label instructions. (Suggest generic products like "neem oil spray", "copper-based fungicide", not brand names).

3.  **Preventative Measures for {{diseaseName}}**:
    *   Proactive steps: proper sanitation, choosing resistant varieties, appropriate fertilization, watering schedules, companion planting if relevant.

Ensure the language is accessible to a home gardener or small-scale farmer.
The output should be a single string containing the comprehensive guide.
Structure the output with clear headings (e.g., using ### for H3 Markdown headings).
`,
});

const enhanceDiseaseInformationFlow = ai.defineFlow(
  {
    name: 'enhanceDiseaseInformationFlow',
    inputSchema: EnhanceDiseaseInformationInputSchema,
    outputSchema: EnhanceDiseaseInformationOutputSchema,
  },
  async input => {
    const promptInput = {
      ...input,
      confidence: input.confidence ? Math.round(input.confidence * 100) : undefined,
    };
    const {output} = await enhanceDiseaseInformationPrompt(promptInput);
    if (!output) {
      throw new Error('Failed to generate enhanced disease information.');
    }
    return output;
  }
);
