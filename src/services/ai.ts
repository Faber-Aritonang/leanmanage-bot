import Anthropic from "@anthropic-ai/sdk";
import dotenv from "dotenv";

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function parseTaskFromNaturalLanguage(userMessage: string) {
  try {
    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: `Anda adalah AI asisten Product Management yang bertugas mengubah perintah natural dari tim menjadi format JSON terstruktur.
Format JSON harus memiliki struktur berikut:
{
  "title": "Judul task yang ringkas dan jelas",
  "priority": "LOW" atau "MEDIUM" atau "HIGH",
  "department": "Nama departemen atau tim (misal: UI/UX, Data Team, Content Creation, Developer)",
  "assigneeName": "Nama PIC jika disebutkan, atau null"
}
Kembalikan HANYA format JSON murni tanpa teks tambahan di luar JSON.`,
      messages: [{ role: "user", content: userMessage }],
    });

    const contentText = response.content[0].type === "text" ? response.content[0].text : "{}";
    const cleanedJson = contentText.replace(/```json/g, "").replace(/```/g, "").trim();
    
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error("Gagal memproses AI:", error);
    throw new Error("Tidak dapat memproses pesan dengan Claude Haiku.");
  }
}
