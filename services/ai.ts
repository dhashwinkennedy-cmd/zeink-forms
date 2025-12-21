
import { GoogleGenAI, Type } from "@google/genai";

// Use process.env.API_KEY exclusively and directly in the constructor as per guidelines.
// Always create a new instance before making an API call to ensure the latest configuration.

export const evaluateShortAnswer = async (question: string, userAnswer: string, correctAnswer: string) => {
  // Initialize the AI client directly with the environment variable as per hard requirement
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Evaluate this answer for accuracy.
      Question: ${question}
      User Answer: ${userAnswer}
      Expected Answer: ${correctAnswer}
      
      Return a score from 0 to 1 and a brief reason.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mark: { type: Type.NUMBER, description: "Score between 0 and 1" },
          reason: { type: Type.STRING, description: "Justification for the score" }
        },
        required: ["mark", "reason"]
      }
    }
  });

  // Extract text property directly as per guidelines (not a method call)
  return JSON.parse(response.text.trim());
};

export const evaluateLongAnswer = async (
  question: string, 
  userAnswer: string, 
  mode: 'context' | 'prompt' | 'tagging',
  gradingRubric?: string
) => {
  // Initialize the AI client directly with the environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = mode === 'prompt' 
    ? `Evaluate against this rubric: ${gradingRubric}\nAnswer: ${userAnswer}`
    : `Evaluate this comprehensive answer against the context of the question: ${question}\nAnswer: ${userAnswer}`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: prompt,
    config: {
      // Use thinking configuration for complex reasoning/grading tasks with Gemini 3 Pro
      thinkingConfig: { thinkingBudget: 32768 },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          mark: { type: Type.NUMBER },
          reason: { type: Type.STRING },
          tags: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Include tags like 'Plagiarism Detected', 'Highly Relevant' if applicable."
          }
        },
        required: ["mark", "reason", "tags"]
      }
    }
  });

  // Extract text property directly as per guidelines (not a method call)
  return JSON.parse(response.text.trim());
};
