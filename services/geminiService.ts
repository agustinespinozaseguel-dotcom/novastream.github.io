
import { GoogleGenAI, Type } from "@google/genai";

// Fixed: Use named parameter and direct process.env.API_KEY access as required by SDK
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeVideoContent = async (fileName: string) => {
  // Use gemini-3-flash-preview for basic text tasks like title/description generation
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Suggest a catchy title and a professional description for a video named "${fileName}". Focus on engagement and SEO.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING }
        },
        required: ["title", "description", "category"]
      }
    }
  });

  try {
    // Fixed: response.text is a property, not a method
    const text = response.text;
    return text ? JSON.parse(text) : {
      title: fileName.split('.')[0],
      description: "A great video uploaded to NovaStream.",
      category: "General"
    };
  } catch (e) {
    return {
      title: fileName.split('.')[0],
      description: "A great video uploaded to NovaStream.",
      category: "General"
    };
  }
};
