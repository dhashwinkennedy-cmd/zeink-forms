
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Evaluates a long text response using Gemini AI based on a provided rubric.
 * Returns a structured object with marks, reasoning, and a quality tag.
 */
export const evaluateLongText = async (question: string, answer: string, rubric: string = "Be fair and constructive.") => {
  if (!process.env.API_KEY) return { marks: 5, reason: "AI disabled (No API Key)", tag: "NEUTRAL" };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Question: ${question}\nUser Answer: ${answer}\nGrading Rubric: ${rubric}`,
      config: {
        systemInstruction: "You are a professional grader. Evaluate the answer based on the rubric. Return JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marks: { type: Type.NUMBER, description: "Score out of 10" },
            reason: { type: Type.STRING, description: "Constructive feedback" },
            tag: { type: Type.STRING, description: "One word tag describing the quality: EXCELLENT, GOOD, POOR, etc." }
          },
          required: ["marks", "reason", "tag"]
        }
      }
    });
    // Extracting generated text directly from response.text property
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error(e);
    return { marks: 0, reason: "Evaluation failed.", tag: "ERROR" };
  }
};
