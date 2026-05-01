import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface MetadataCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: any;
}

/**
 * Analyzes release metadata for structural anomalies and store compliance.
 */
export async function analyzeReleaseMetadata(metadata: any): Promise<MetadataCheckResult> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Perform a structural audit on this music release metadata: ${JSON.stringify(metadata)}. 
    Check for:
    1. Proper casing for titles/artist names.
    2. Genre consistency.
    3. Potential licensing issues in titles.
    4. Missing critical fields.
    
    Return a JSON audit report with 'isValid' (boolean), 'issues' (array of strings), and 'suggestions' (object with corrected fields).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          isValid: { type: Type.BOOLEAN },
          issues: { type: Type.ARRAY, items: { type: Type.STRING } },
          suggestions: { type: Type.OBJECT, properties: {} },
        },
        required: ["isValid", "issues", "suggestions"],
      },
    },
  });
  return JSON.parse(response.text || '{"isValid": true, "issues": [], "suggestions": {}}');
}

/**
 * Generates track metadata (titles, tags, mood) based on a description.
 */
export async function generateMetadata(description: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate professional music metadata for a track with this description: "${description}". Provide 5 catchy titles, 10 relevant tags, a primary genre, and 3 mood keywords.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          titles: { type: Type.ARRAY, items: { type: Type.STRING } },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          genre: { type: Type.STRING },
          moods: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["titles", "tags", "genre", "moods"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
}

/**
 * Generates social media posts for marketing.
 */
export async function generateSocialPosts(trackInfo: { title: string; artist: string; releaseDate: string }) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Create high-converting social media posts for a music release:
    Title: ${trackInfo.title}
    Artist: ${trackInfo.artist}
    Release Date: ${trackInfo.releaseDate}
    
    Generate one post for Instagram (with emojis and hashtags), one for Twitter, and one for Facebook. Focus on "Music Distribution India" as the distribution partner.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          instagram: { type: Type.STRING },
          twitter: { type: Type.STRING },
          facebook: { type: Type.STRING },
        },
        required: ["instagram", "twitter", "facebook"],
      },
    },
  });
  return JSON.parse(response.text || "{}");
}

/**
 * Generates a professional artist biography.
 */
export async function generateArtistBio(details: string) {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Write a professional, compelling artist biography (200-300 words) for Spotify/Apple Music based on these details: "${details}". The tone should be inspired by modern independent music stars.`,
  });
  return response.text;
}

/**
 * Alias for Profile.tsx
 */
export async function generateBio(name: string, genre: string) {
  return generateArtistBio(`Artist Name: ${name}, Genre: ${genre}`);
}

/**
 * General purpose chat with the music distribution expert AI.
 */
export async function chatWithExpert(message: string, history: any[] = []) {
  const chat = ai.chats.create({
    model: "gemini-3-flash-preview",
    config: {
      systemInstruction: "You are the AI Music Expert for 'Music Distribution India'. You help independent artists with music distribution, royalties, copyright, and marketing in India. Be professional, encouraging, and highly knowledgeable about platforms like JioSaavn, Wynk, Gaana, and Spotify. Keep responses concise and practical.",
    },
    history: history,
  });

  const response = await chat.sendMessage({ message: message });
  return response.text;
}

export const geminiService = {
  analyzeReleaseMetadata,
  generateMetadata,
  generateSocialPosts,
  generateArtistBio,
  generateBio,
  chatWithExpert
};
