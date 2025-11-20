import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

// Initialize the client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates an image using Imagen 3.
 */
export const generateImageService = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-4.0-generate-001',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    const base64ImageBytes = response.generatedImages[0]?.image?.imageBytes;
    if (!base64ImageBytes) {
      throw new Error("No image generated");
    }
    return `data:image/jpeg;base64,${base64ImageBytes}`;
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};

/**
 * Fast Chat using Gemini Flash Lite.
 */
export const chatService = async (message: string): Promise<string> => {
  try {
    // Using the mapped name for Flash Lite as per instructions
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-flash-lite-latest', 
      contents: message,
    });
    
    return response.text || "No response from model.";
  } catch (error) {
    console.error("Chat failed:", error);
    throw error;
  }
};

/**
 * Generates a 3D OBJ representation from an image using Vision capabilities.
 * Note: Standard Gemini models output text. We prompt it to generate a valid OBJ file text.
 */
export const generate3DFromImageService = async (imageBase64: string): Promise<string> => {
  try {
    // Clean the base64 string if it has headers
    const cleanBase64 = imageBase64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');

    const prompt = `
      Analyze the provided image. 
      Create a valid Wavefront .OBJ 3D model file representation of the main object in the image.
      
      Requirements:
      1. Output ONLY the raw OBJ content. Do not use markdown code blocks. Do not add explanations.
      2. Start directly with vertices (v x y z).
      3. Define faces (f v1 v2 v3).
      4. Keep the geometry simple (low poly) but recognizable.
      5. Ensure the object is centered at 0,0,0.
      6. If the image is complex, simplify it to its basic geometric shapes.
      
      Example format:
      v 0.0 0.0 0.0
      v 1.0 0.0 0.0
      ...
      f 1 2 3
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Using Flash for Multimodal Vision + Reasoning
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg', // Assuming converted or compatible type
              data: cleanBase64,
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    let text = response.text || "";
    
    // Clean up markdown if the model accidentally adds it despite instructions
    text = text.replace(/```obj/g, '').replace(/```/g, '').trim();
    
    return text;
  } catch (error) {
    console.error("3D generation failed:", error);
    throw error;
  }
};
