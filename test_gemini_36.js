const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
async function run() {
  try {
    console.log("Starting...");
    const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: "Hello, world",
        config: {
            responseMimeType: "application/json",
            systemInstruction: "Return { \"message\": \"hi\" }"
        }
    });
    console.log("Response:", response.text);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
