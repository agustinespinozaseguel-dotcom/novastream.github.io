
import { GoogleGenAI, Type } from "@google/genai";

// SDK initialization remains available for other potential AI features
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// The manual title/description logic has replaced analyzeVideoContent in UploadModal.tsx.
// We keep the file for future GenAI enhancements (e.g., chat, commentary analysis).
