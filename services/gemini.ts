
import { GoogleGenAI, Type } from "@google/genai";

/**
 * Evaluates a long text response using Gemini AI based on a provided rubric.
 * Returns a structured object with marks, reasoning, and a quality tag.
 */
export const evaluateLongText = async (question: string, answer: string, rubric: string = "Be fair and constructive.") => {
  if (!process.env.API_KEY) return { marks: 0, reason: "AI Engine Offline: Contact Administrator", tag: "SYSTEM_OFFLINE" };

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `CONTEXTUAL DATA:\n- Question: ${question}\n- Respondent Answer: ${answer}\n- Internal Rubric: ${rubric}\n\nTASK:\nGrade the answer out of 10. Provide clear reasoning. Identify if it is EXCELLENT, GOOD, POOR, or INCOMPLETE.`,
      config: {
        systemInstruction: "You are a professional educational assessor. Your goal is to grade answers strictly but fairly based on provided rubrics. You MUST return ONLY a valid JSON object matching the provided schema. Do not include markdown formatting or prose around the JSON.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marks: { type: Type.NUMBER, description: "Numerical score strictly between 0 and 10." },
            reason: { type: Type.STRING, description: "Professional feedback regarding why this score was awarded." },
            tag: { type: Type.STRING, description: "A single classification: EXCELLENT, GOOD, POOR, or INCOMPLETE." }
          },
          required: ["marks", "reason", "tag"]
        },
        thinkingConfig: { thinkingBudget: 16384 }
      }
    });
    
    const text = response.text || "{}";
    // Sanitize in case model adds markers
    const sanitized = text.replace(/```json|```/g, "").trim();
    return JSON.parse(sanitized);
  } catch (e) {
    console.error("Gemini Evaluation Engine Fatal Error:", e);
    return { marks: 0, reason: "The AI assessment pipeline encountered an unexpected interruption.", tag: "ENGINE_ERROR" };
  }
};
