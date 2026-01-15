import { describe, it, expect } from "vitest";
import OpenAI from "openai";

describe("OpenAI API Key Validation", () => {
  it("should have a valid OPENAI_API_KEY environment variable", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    // Check that the key exists and has the right format
    expect(apiKey).toBeDefined();
    expect(apiKey).not.toBe("");
    expect(apiKey?.startsWith("sk-")).toBe(true);
  });

  it("should be able to connect to OpenAI API", async () => {
    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      console.log("Skipping API test - no API key provided");
      return;
    }

    // Must use explicit baseURL to avoid SDK routing issues
    const openai = new OpenAI({
      apiKey: apiKey,
      baseURL: 'https://api.openai.com/v1',
    });

    // Make a minimal chat completion call to validate the key
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: "Say 'test' and nothing else." }],
        max_tokens: 5,
      });
      
      expect(response.choices).toBeDefined();
      expect(response.choices.length).toBeGreaterThan(0);
      console.log("OpenAI API key validated successfully!");
    } catch (error: any) {
      if (error?.code === "invalid_api_key" || error?.status === 401) {
        throw new Error("Invalid OpenAI API key - please check your key and try again");
      }
      if (error?.status === 429) {
        // Rate limit or quota exceeded - key is valid but account has issues
        console.log("API key is valid but rate limited or quota exceeded");
        return;
      }
      throw error;
    }
  });
});
