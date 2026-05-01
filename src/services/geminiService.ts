export interface MetadataCheckResult {
  isValid: boolean;
  issues: string[];
  suggestions: any;
}

/**
 * Analyzes release metadata for structural anomalies and store compliance.
 */
export async function analyzeReleaseMetadata(metadata: any): Promise<MetadataCheckResult> {
  const response = await fetch('/api/ai/audit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ metadata })
  });
  if (!response.ok) throw new Error('AI Audit failed');
  return response.json();
}

/**
 * Generates track metadata (titles, tags, mood) based on a description.
 */
export async function generateMetadata(description: string) {
  const response = await fetch('/api/ai/metadata', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ description })
  });
  if (!response.ok) throw new Error('AI Metadata generation failed');
  return response.json();
}

/**
 * Generates social media posts for marketing.
 */
export async function generateSocialPosts(trackInfo: { title: string; artist: string; releaseDate: string }) {
  const response = await fetch('/api/ai/socials', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(trackInfo)
  });
  if (!response.ok) throw new Error('AI Social posts generation failed');
  return response.json();
}

/**
 * Generates a professional artist biography.
 */
export async function generateArtistBio(details: string) {
  const response = await fetch('/api/ai/bio', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ details })
  });
  if (!response.ok) throw new Error('AI Bio generation failed');
  const data = await response.json();
  return data.text;
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
  const response = await fetch('/api/ai/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, history })
  });
  if (!response.ok) throw new Error('AI Chat failed');
  const data = await response.json();
  return data.text;
}

export const geminiService = {
  analyzeReleaseMetadata,
  generateMetadata,
  generateSocialPosts,
  generateArtistBio,
  generateBio,
  chatWithExpert
};
