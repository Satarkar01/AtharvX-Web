import { GoogleGenAI, Type } from "@google/genai";
import { AIResult } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export async function checkSymptoms(symptoms: string): Promise<AIResult> {
  // Rule-based pre-check for emergencies
  const lowerSymptoms = symptoms.toLowerCase();
  if (lowerSymptoms.includes('chest pain') || lowerSymptoms.includes('difficulty breathing') || lowerSymptoms.includes('stroke')) {
    return {
      symptoms: [symptoms],
      possibleConditions: ['Emergency Condition'],
      urgency: 'high',
      recommendation: 'Please use the EMERGENCY button immediately and call for an ambulance (108).'
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze these symptoms and provide a structured health assessment: "${symptoms}"`,
      config: {
        systemInstruction: "You are a medical assistant. Provide helpful but non-diagnostic information. Always advise seeing a doctor.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            symptoms: { type: Type.ARRAY, items: { type: Type.STRING } },
            possibleConditions: { type: Type.ARRAY, items: { type: Type.STRING } },
            urgency: { type: Type.STRING, enum: ['low', 'medium', 'high'] },
            recommendation: { type: Type.STRING }
          },
          required: ["symptoms", "possibleConditions", "urgency", "recommendation"]
        }
      }
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("AI Error:", error);
    return {
      symptoms: [symptoms],
      possibleConditions: ['Analysis Failed'],
      urgency: 'medium',
      recommendation: 'Unable to process AI analysis. Please consult a professional.'
    };
  }
}

export async function chatCompanion(message: string, history: { role: 'user' | 'model', parts: [{ text: string }] }[]) {
  const lowerMessage = message.toLowerCase();
  const isEmergency = lowerMessage.includes('chest pain') || 
                    lowerMessage.includes('difficulty breathing') || 
                    lowerMessage.includes('unconscious') || 
                    lowerMessage.includes('heavy bleeding') || 
                    lowerMessage.includes('stroke');

  if (isEmergency) {
    return {
      text: "EMERGENCY_DETECTED: I've detected symptoms that may require immediate medical attention. Please use the EMERGENCY button or call 108 immediately.",
      isEmergency: true
    };
  }

  try {
    const chat = ai.chats.create({
      model: "gemini-3-flash-preview",
      config: {
        systemInstruction: `You are the AtharvX Health Companion. 
        Speak in a calm, empathetic, and comforting tone. 
        Explain symptoms in simple storytelling format. 
        Provide a short summary of what symptoms usually mean. 
        Offer only widely known safe home remedies (Hydration, Rest, Steam inhalation, Warm salt water gargle, Balanced diet). 
        Mention OTC guidance generally without specific dosages. 
        NEVER provide prescription medication advice or specific dosages. 
        Always encourage professional consultation.
        Keep responses concise and friendly.`,
      },
    });

    const response = await chat.sendMessage({ message });
    return {
      text: response.text || "I'm here to help, but I couldn't process that request. How else can I assist you?",
      isEmergency: false
    };
  } catch (error) {
    console.error("Chat Error:", error);
    return {
      text: "I'm having a little trouble connecting right now. Please remember to rest and stay hydrated, and consult a doctor if you're feeling unwell.",
      isEmergency: false
    };
  }
}
