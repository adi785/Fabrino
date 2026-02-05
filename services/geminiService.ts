
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const getGiftMuseSuggestions = async (prompt: string) => {
  if (!process.env.API_KEY) return null;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are 'The Artifact Muse', an expert in generative design and personalized 3D printing. 
      Based on this user's story: "${prompt}", suggest 3 creative, emotional 3D-printable gift concepts. 
      Focus on items that use data (sound waves, maps, dates, coordinates) to drive their physical form. 
      Keep descriptions brief, evocative, and focused on the 3D-printed nature of the object.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              sentiment: { type: Type.STRING }
            },
            required: ["title", "description", "sentiment"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error:", error);
    return null;
  }
};
