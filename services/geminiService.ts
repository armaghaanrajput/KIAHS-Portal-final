
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the Gemini client using the recommended approach.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAnnouncement = async (topic: string): Promise<string> => {
  try {
    // Basic Text Task: Using gemini-3-flash-preview.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Write a professional, formal announcement for a medical college (Kasur Institute of Allied Health Sciences) regarding: "${topic}". Keep it concise, polite, and authoritative. Use clear formatting.`
    });
    // Property access .text as per guidelines.
    return response.text || "Failed to generate announcement.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating content. Please try again.";
  }
};

export const analyzeComplaint = async (description: string): Promise<{ priority: 'Low' | 'Medium' | 'High', category: string, summary: string }> => {
  try {
    const prompt = `
      Analyze the following complaint from a medical student/staff member:
      "${description}"
    `;

    // Complex Text Task: Using gemini-3-flash-preview with responseSchema for reliability.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              description: 'Urgency level: Low, Medium, or High',
            },
            category: {
              type: Type.STRING,
              description: 'A brief 1-2 word category for the complaint',
            },
            summary: {
              type: Type.STRING,
              description: 'A 5-10 word summary of the core issue',
            },
          },
          required: ['priority', 'category', 'summary'],
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    return JSON.parse(text);

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return { priority: 'Medium', category: 'General', summary: 'AI Analysis Failed' };
  }
};
