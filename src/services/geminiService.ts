import { GoogleGenAI, Type } from "@google/genai";

// Use import.meta.env for Vite client-side or fallback to process.env if in SSR/Node
const GEMINI_API_KEY = (typeof process !== 'undefined' && process.env?.GEMINI_API_KEY) || (import.meta as any).env?.VITE_GEMINI_API_KEY;

let ai: GoogleGenAI | null = null;

if (GEMINI_API_KEY) {
  ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
} else {
  console.warn("GEMINI_API_KEY is not defined. AI features will be disabled.");
}

export interface MetadataCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: {
    title?: string;
    artist?: string;
    genre?: string;
    description?: string;
  };
}

export const analyzeReleaseMetadata = async (metadata: any): Promise<MetadataCheckResult> => {
  if (!ai) {
    return { isValid: true, issues: ["AI service not configured"], suggestions: {} };
  }
  try {
    const prompt = `Analyze the following music release metadata for quality, consistency, and compliance with streaming platform standards (Spotify, Apple Music). 
    Check for:
    - Typos in title or artist name.
    - Consistency between Title and Description.
    - Appropriateness of the selected genre.
    - Any potentially infringing or blacklisted keywords.
    
    Metadata: ${JSON.stringify(metadata)}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN },
            issues: { type: Type.ARRAY, items: { type: Type.STRING } },
            suggestions: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                artist: { type: Type.STRING },
                genre: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          },
          required: ["isValid", "issues", "suggestions"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const generateBio = async (artistName: string, genre: string): Promise<string> => {
  if (!ai) return "";
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional, compelling 2-paragraph artist bio for "${artistName}", a ${genre} artist. Focus on their impact and style.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Gemini Bio Generation Error:", error);
    return "";
  }
};
