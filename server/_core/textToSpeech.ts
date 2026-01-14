/**
 * Text-to-Speech Helper
 * Uses the Manus Forge API for speech synthesis
 */

import { ENV } from "./env";

export type TTSVoice = 
  | "alloy" 
  | "echo" 
  | "fable" 
  | "onyx" 
  | "nova" 
  | "shimmer";

export type TTSParams = {
  text: string;
  voice?: TTSVoice;
  speed?: number; // 0.25 to 4.0, default 1.0
};

export type TTSResult = {
  audioUrl: string;
  audioBase64: string;
  contentType: string;
};

const resolveApiUrl = () =>
  ENV.forgeApiUrl && ENV.forgeApiUrl.trim().length > 0
    ? `${ENV.forgeApiUrl.replace(/\/$/, "")}/v1/audio/speech`
    : "https://forge.manus.im/v1/audio/speech";

const assertApiKey = () => {
  if (!ENV.forgeApiKey) {
    throw new Error("FORGE_API_KEY is not configured");
  }
};

/**
 * Generate speech audio from text
 * 
 * @param params - TTS parameters
 * @param params.text - The text to convert to speech
 * @param params.voice - Voice to use: "alloy", "echo", "fable", "onyx", "nova", "shimmer"
 *                       For a deep, sage-like voice, use "onyx" (deepest male voice)
 * @param params.speed - Speed of speech (0.25 to 4.0, default 1.0)
 * @returns Audio as base64 encoded string and data URL
 * 
 * @example
 * const result = await generateSpeech({
 *   text: "Greetings, seeker of knowledge!",
 *   voice: "onyx", // Deep male voice
 *   speed: 0.9 // Slightly slower for gravitas
 * });
 */
export async function generateSpeech(params: TTSParams): Promise<TTSResult> {
  assertApiKey();

  const { text, voice = "onyx", speed = 0.9 } = params;

  const payload = {
    model: "tts-1",
    input: text,
    voice,
    speed,
    response_format: "mp3",
  };

  const response = await fetch(resolveApiUrl(), {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `TTS generation failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  // Get the audio as an ArrayBuffer
  const audioBuffer = await response.arrayBuffer();
  const audioBase64 = Buffer.from(audioBuffer).toString("base64");
  const contentType = response.headers.get("content-type") || "audio/mpeg";
  const audioUrl = `data:${contentType};base64,${audioBase64}`;

  return {
    audioUrl,
    audioBase64,
    contentType,
  };
}
