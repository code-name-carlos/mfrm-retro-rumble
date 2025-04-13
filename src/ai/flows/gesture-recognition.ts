'use server';
/**
 * @fileOverview Recognizes hand gestures from the camera and translates them into gameplay actions.
 *
 * - recognizeGesture - A function that handles the gesture recognition process.
 * - RecognizeGestureInput - The input type for the recognizeGesture function.
 * - RecognizeGestureOutput - The return type for the recognizeGesture function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const RecognizeGestureInputSchema = z.object({
  photoUrl: z.string().describe('The URL of the hand gesture photo taken by the camera.'),
});
export type RecognizeGestureInput = z.infer<typeof RecognizeGestureInputSchema>;

const RecognizeGestureOutputSchema = z.object({
  move: z.enum(['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']).describe('The recognized move.'),
  success: z.boolean().describe('Whether the gesture recognition was successful.'),
  errorMessage: z.string().optional().describe('Error message if gesture recognition fails.'),
});
export type RecognizeGestureOutput = z.infer<typeof RecognizeGestureOutputSchema>;

export async function recognizeGesture(input: RecognizeGestureInput): Promise<RecognizeGestureOutput> {
  return recognizeGestureFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recognizeGesturePrompt',
  input: {
    schema: z.object({
      photoUrl: z.string().describe('The URL of the hand gesture photo taken by the camera.'),
    }),
  },
  output: {
    schema: z.object({
      move: z.enum(['Rock', 'Paper', 'Scissors', 'Lizard', 'Spock']).describe('The recognized move.'),
      success: z.boolean().describe('Whether the gesture recognition was successful.'),
      errorMessage: z.string().optional().describe('Error message if gesture recognition fails.'),
    }),
  },
  prompt: `You are an AI that recognizes hand gestures for the game Rock, Paper, Scissors, Lizard, Spock.

  Analyze the image at the provided URL and determine the hand gesture being made.
  Return the corresponding move for the gesture. If you are unable to identify the gesture, return an appropriate error message, and set success to false.

  Photo: {{media url=photoUrl}}
  `,
});

const recognizeGestureFlow = ai.defineFlow<
  typeof RecognizeGestureInputSchema,
  typeof RecognizeGestureOutputSchema
>({
  name: 'recognizeGestureFlow',
  inputSchema: RecognizeGestureInputSchema,
  outputSchema: RecognizeGestureOutputSchema,
}, async input => {
  try {
    const {output} = await prompt(input);
    return output!;
  } catch (error: any) {
    console.error('Error during gesture recognition:', error);
    return {
      move: 'Rock',
      success: false,
      errorMessage: 'Failed to recognize gesture. Please try again.',
    };
  }
});
