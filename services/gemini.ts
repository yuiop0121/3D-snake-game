import { GoogleGenAI, Type, Schema } from "@google/genai";
import { GameTheme } from '../types';
import { DEFAULT_THEME } from '../constants';

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    return null;
  }
  return new GoogleGenAI({ apiKey });
};

const themeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    name: { type: Type.STRING, description: "A creative name for the theme" },
    backgroundColor: { type: Type.STRING, description: "Hex color code for the board background (e.g., #000000)" },
    gridColor: { type: Type.STRING, description: "Hex color code for the grid lines (should be subtle)" },
    snakeColor: { type: Type.STRING, description: "Hex color code for the snake body" },
    snakeHeadEmoji: { type: Type.STRING, description: "A single emoji to represent the snake's head" },
    foodEmoji: { type: Type.STRING, description: "A single emoji to represent the food" },
    borderColor: { type: Type.STRING, description: "Hex color code for the board border" },
    textColor: { type: Type.STRING, description: "Hex color code for UI text (should contrast with background)" },
    description: { type: Type.STRING, description: "A short, witty description of the theme" },
  },
  required: ["name", "backgroundColor", "gridColor", "snakeColor", "snakeHeadEmoji", "foodEmoji", "borderColor", "textColor", "description"],
};

export const generateTheme = async (prompt: string): Promise<GameTheme> => {
  const ai = getAiClient();
  if (!ai) return DEFAULT_THEME;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a unique, visually cohesive Snake Game theme based on this concept: "${prompt}".
      Ensure high contrast between background, snake, and food. Return JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: themeSchema,
        systemInstruction: "You are a UI/UX expert designer for retro games. You generate stylish, accessible color palettes."
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);
    
    // Add missing properties if necessary (though schema enforces them)
    return {
      ...DEFAULT_THEME,
      ...data,
      snakeBodyChar: 'sq', // keeping this static for now as it's handled by CSS
    };
  } catch (error) {
    console.error("Failed to generate theme:", error);
    return DEFAULT_THEME;
  }
};
