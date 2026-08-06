import { Telegraf } from "telegraf";
import dotenv from "dotenv";
import { parseTaskFromNaturalLanguage } from "./services/ai.js";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");
const prisma = new PrismaClient();

// Perintah /start untuk menyapa pengguna
bot.start((ctx) => {
  ctx.reply(
    "Halo! Saya LeanManage Bot. Kirimkan perintah atau tugas baru dengan bahasa sehari-hari, dan saya akan mencatatnya ke sistem Kanban kita."
  );
});

// Mendengarkan pesan teks biasa dari grup atau chat pribadi
bot.on("text", async (ctx) => {
  const text = ctx.message.text;

  // Abaikan jika pesan diawali dengan tanda '/'
  if (text.startsWith("/")) return;

  try {
    await ctx.reply("⏳ Memproses task melalui Claude Haiku...");

    // 1. Panggil AI untuk mengekstrak teks menjadi JSON terstruktur
    const parsedData = await parseTaskFromNaturalLanguage(text);

    // 2. Simpan atau pastikan User pengirim terdaftar di database
    const telegramId = BigInt(ctx.from.id);
    let user = await prisma.user.findUnique({
      where: { telegramId },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          telegramId,
          name: ctx.from.first_name || "Unknown User",
          role: "MEMBER",
          department: parsedData.department || "General",
        },
      });
    }

    // 3. Simpan Task ke Database PostgreSQL
    const newTask = await prisma.task.create({
      data: {
        title: parsedData.title,
        priority: parsedData.priority || "MEDIUM",
        status: "BACKLOG",
        reporterId: user.id,
      },
    });

    // 4. Balas ke pengguna dengan konfirmasi sukses
    await ctx.reply(
      `✅ Task Berhasil Ditambahkan!\n\n` +
      `📌 *Judul*: ${newTask.title}\n` +
      `⚡ *Prioritas*: ${newTask.priority}\n` +
      `🏷️ *Status*: ${newTask.status}\n` +
      `👤 *Pelapor*: ${user.name}`,
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    console.error("Gagal memproses pesan:", error);
    await ctx.reply("❌ Maaf, terjadi kesalahan saat memproses task Anda.");
  }
});

// Jalankan Bot
bot.launch().then(() => {
  console.log("🤖 LeanManage Bot Telegram sedang berjalan...");
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));