
import { GoogleGenerativeAI } from "@google/generative-ai";

// Assuming you're using an environment variable or a config file for the API key
const API_KEY = "AIzaSyAE9ZtBRnv5k8egNi6ZWLx6O_4N71qDUdU";

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export async function geminiInference(prompt, imageData = null) {
  try {
    if (imageData) {
      const result = await model.generateContent([prompt, imageData]);
      return result.response.text();
    } else {
      const result = await model.generateContent(prompt);
      return result.response.text();
    }
  } catch (error) {
    console.error("Error in Gemini inference:", error);
    throw error;
  }
}

