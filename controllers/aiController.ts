import { GoogleGenAI, Type } from "@google/genai";
import { Request, Response } from "express";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function proxyGenerateMetadata(req: Request, res: Response) {
  try {
    const { description } = req.body;
    if (!description) return res.status(400).json({ error: "Description is required" });

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
    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Metadata error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function proxyGenerateSocialPosts(req: Request, res: Response) {
  try {
    const { title, artist, releaseDate } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Create high-converting social media posts for a music release:
      Title: ${title}
      Artist: ${artist}
      Release Date: ${releaseDate}
      
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
    res.json(JSON.parse(response.text || "{}"));
  } catch (error: any) {
    console.error("AI Social posts error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function proxyGenerateBio(req: Request, res: Response) {
  try {
    const { details } = req.body;
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Write a professional, compelling artist biography (200-300 words) for Spotify/Apple Music based on these details: "${details}". The tone should be inspired by modern independent music stars.`,
    });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Bio error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function proxyChat(req: Request, res: Response) {
  try {
    const { message, history } = req.body;
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: "You are the AI Music Expert for 'Music Distribution India'. You help independent artists with music distribution, royalties, copyright, and marketing in India. Be professional, encouraging, and highly knowledgeable about platforms like JioSaavn, Wynk, Gaana, and Spotify. Keep responses concise and practical.",
      },
      history: history || [],
    });

    const response = await chat.sendMessage({ message: message });
    res.json({ text: response.text });
  } catch (error: any) {
    console.error("AI Chat error:", error);
    res.status(500).json({ error: error.message });
  }
}

export async function proxyAnalyzeMetadata(req: Request, res: Response) {
  try {
    const { metadata } = req.body;
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
    res.json(JSON.parse(response.text || '{"isValid": true, "issues": [], "suggestions": {}}'));
  } catch (error: any) {
    console.error("AI Audit error:", error);
    res.status(500).json({ error: error.message });
  }
}
