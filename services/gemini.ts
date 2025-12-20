
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const evaluateLongText = async (question: string, answer: string, prompt?: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview', // High quality for grading
      contents: `
        Evaluate the following answer for the question: "${question}".
        ${prompt ? `Context/Rubric: ${prompt}` : ''}
        Answer: "${answer}"
        
        Provide a structured evaluation:
        1. marks: A number from 0 to 10.
        2. reason: A concise, constructive critique of the answer.
        3. tag: Exactly one of ["Highly Relevant", "Partially Relevant", "Plagiarism Warning", "Lacks Detail", "Off Topic"].
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            marks: { type: Type.NUMBER, description: "Numeric score from 0-10" },
            reason: { type: Type.STRING, description: "Short justification" },
            tag: { type: Type.STRING, description: "Category tag" }
          },
          required: ["marks", "reason", "tag"]
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      marks: result.marks ?? 0,
      reason: result.reason ?? "Automated evaluation completed.",
      tag: result.tag ?? "Analyzed"
    };
  } catch (error) {
    console.error("Gemini Evaluation Failed:", error);
    return {
      marks: 0,
      reason: "Could not complete AI evaluation at this time.",
      tag: "Error"
    };
  }
};

export const evaluateSemanticMatch = async (expected: string[], actual: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `
        Compare the user's answer: "${actual}" with these target answers: ${expected.join(', ')}.
        Is it a semantic match?
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { type: Type.BOOLEAN },
            reason: { type: Type.STRING }
          },
          required: ["isMatch", "reason"]
        }
      }
    });

    return JSON.parse(response.text || '{"isMatch": false, "reason": "Error"}');
  } catch (error) {
    return { isMatch: false, reason: "API Error" };
  }
};
