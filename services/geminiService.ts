
import { GoogleGenAI, Type } from "@google/genai";

export const evaluateWithAI = async (
  question: string,
  answer: string,
  prompt: string = "",
  type: 'short' | 'long' | 'other'
) => {
  // Always use the API key exclusively from the environment variable process.env.API_KEY.
  // Initialization follows strict guidelines to use a named parameter and direct process.env usage.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    You are an expert grading assistant for Zienk Forms.
    Evaluate the provided answer based on the question context.
    ${prompt ? `Additional grading instructions: ${prompt}` : ""}
    Type: ${type}
    Return a score between 0 and 1.0 (float).
    Provide a concise reason for the grade.
    Provide up to 3 descriptive tags (e.g., "Highly Relevant", "Grammar Error", "Excellent Reasoning").
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Question: ${question}\nUser Answer: ${answer}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Grade from 0 to 1" },
            reason: { type: Type.STRING, description: "Why this grade was given" },
            tags: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Evaluation tags" }
          },
          required: ["score", "reason", "tags"]
        }
      }
    });

    // The simplest way to get text content is by accessing the .text property on the GenerateContentResponse object.
    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score || 0,
      reason: result.reason || "No reason provided",
      tags: result.tags || []
    };
  } catch (error) {
    console.error("AI Evaluation Error:", error);
    return { score: 0, reason: "Evaluation failed", tags: [] };
  }
};
