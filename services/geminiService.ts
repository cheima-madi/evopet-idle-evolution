
import { GoogleGenAI } from "@google/genai";
import { GameState } from "../types";

export const getPetWhispererMessage = async (gameState: GameState): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = `
    You are a cute pet of type ${gameState.petType} currently at the ${gameState.stage} evolution stage. 
    Your current stats are: 
    - Hunger: ${gameState.stats.hunger}%
    - Happiness: ${gameState.stats.happiness}%
    - Energy: ${gameState.stats.energy}%
    - Level: ${gameState.level}
    
    Write a short, adorable, one-sentence message to your owner from your perspective. 
    Keep it sweet and expressive of your current state. Do not use quotes or headers.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-latest',
      contents: prompt,
      config: {
        temperature: 0.9,
        topP: 0.95,
      }
    });

    return response.text || "I wuv you, owner! *wag wag*";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Mew! (I'm too sleepy to talk right now, but I love you!)";
  }
};
