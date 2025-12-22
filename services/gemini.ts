import { GoogleGenAI, Type } from "@google/genai";

/**
 * Evaluates a long text response using Gemini AI based on a provided rubric.
 * Returns a structured object with marks, reasoning, and a quality tag.
 */
export const evaluateLongText = async (question: string, answer: string, rubric: string = "Be fair and constructive.") => {
  if (!process.env.API_KEY) return { marks: 5, reason: "AI disabled (No API Key)", tag: "NEUTRAL" };

  // Create a new instance right before making an API call to ensure it always uses the most up-to-date API key.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Question: ${question}\nUser Answer: ${answer}\nGrading Rubric: ${rubric}`,
      config: {
        systemInstruction: "You are a professional grader. Evaluate the user's answer based on the provided question and grading rubric. Provide an objective score and constructive feedback. Return JSON only.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marks: { type: Type.NUMBER, description: "Score out of 10" },
            reason: { type: Type.STRING, description: "Constructive feedback for the student" },
            tag: { type: Type.STRING, description: "One word tag describing the quality: EXCELLENT, GOOD, POOR, or INCOMPLETE." }
          },
          required: ["marks", "reason", "tag"]
        },
        thinkingConfig: { thinkingBudget: 4096 }
      }
    });
    
    // Using the .text property directly instead of text()
    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (e) {
    console.error("Gemini Evaluation Engine Error:", e);
    return { marks: 0, reason: "The AI engine encountered an error while evaluating this response.", tag: "ERROR" };
  }
};