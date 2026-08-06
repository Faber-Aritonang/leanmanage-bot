import { Telegraf, Markup } from "telegraf";
import dotenv from "dotenv";
import { parseTaskFromNaturalLanguage } from "./services/ai.js";
import Anthropic from "@anthropic-ai/sdk";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pkg from "pg";

dotenv.config();

const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });
const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const bot = new Telegraf(process.env.TELEGRAM_BOT_TOKEN || "");

// Daftarkan menu perintah otomatis agar muncul di tombol biru Telegram (Bot Menu)
bot.telegram.setMyCommands([
  { command: "start", description: "Informasi sistem & panduan bot" },
  { command: "list", description: "Menampilkan daftar task aktif di Kanban" },
  { command: "board", description: "Menampilkan task berdasarkan departemen" },
  { command: "due", description: "Menetapkan target SLA (Contoh: /due 1 3)" },
  { command: "assign", description: "Menugaskan task ke anggota tim" },
  { command: "review", description: "Laporan eksekutif harian & analitik AI" },
  { command: "delete", description: "Menghapus task dari sistem (Contoh: /delete 1)" }
]);

// Salam & Informasi Sistem yang Rinci dan Fungsional
bot.start((ctx) => {
  const welcomeText = 
    `🤖 *LeanManage Bot - Sistem Operasional Kanban* 📊\n\n` +
    `*Apa itu bot ini?* \n` +
    `Asisten manajemen tugas berbasis kecerdasan buatan (AI) yang mengadopsi prinsip _Lean System & Toyota Way_ untuk mengotomatisasi alur kerja tim langsung dari Telegram.\n\n` +
    `🎯 *Kegunaan Utama:*\n` +
    `• Mengubah teks percakapan bebas menjadi tiket Kanban terstruktur secara otomatis.\n` +
    `• Mengelola kepemilikan tugas (*Assignee*) dan filter berdasarkan departemen.\n\n` +
    `📈 *Pencapaian & Metrik yang Dihasilkan:*\n` +
    `• **Poka-Yoke:** Mencegah pemborosan akibat duplikasi data tugas yang sama.\n` +
    `• **SLA & Overdue Tracking:** Mengontrol target tenggat waktu penyelesaian tugas.\n` +
    `• **Lead Time Measurement:** Menghitung durasi aktual penyelesaian tugas secara real-time.\n` +
    `• **AI Executive Review:** Menganalisis bottleneck dan memberikan rekomendasi Kaizen harian.\n\n` +
    `💡 *Cara Pakai Cepat:*\n` +
    `Ketik langsung tugas Anda di sini (Contoh: _"Buat laporan bulanan (Priority: High) - Finance"_)\n` +
    `Atau klik tombol menu \`/\` di sebelah kolom ketik untuk melihat daftar perintah.`;

  ctx.reply(welcomeText, { parse_mode: "Markdown" });
});

// Fitur SLA / Due Date
bot.command("due", async (ctx) => {
  try {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 2) return ctx.reply("⚠️ Format salah. Contoh untuk target 3 hari: `/due 1 3`", { parse_mode: "Markdown" });

    const taskId = parseInt(args[0], 10);
    const days = parseInt(args[1], 10);
    if (isNaN(taskId) || isNaN(days)) return ctx.reply("❌ ID Task dan jumlah hari harus berupa angka.");

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + days);

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { dueDate }
    });

    await ctx.reply(`🗓️ *SLA Berhasil Ditetapkan!*\n\n📌 *${updatedTask.title}*\n🎯 Target Selesai: *${dueDate.toLocaleDateString("id-ID")}*`, { parse_mode: "Markdown" });
  } catch (error: any) {
    console.error("Gagal menetapkan due date:", error);
    await ctx.reply(`❌ *Gagal menetapkan tenggat waktu!*\n\n*Pesan Sistem:*\n\`${error.message}\``, { parse_mode: "Markdown" });
  }
});

// Fitur Hapus Task Manual
bot.command("delete", async (ctx) => {
  try {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length === 0) return ctx.reply("⚠️ Format salah. Contoh: `/delete 2`", { parse_mode: "Markdown" });

    const taskId = parseInt(args[0], 10);
    if (isNaN(taskId)) return ctx.reply("❌ ID Task harus berupa angka.");

    await prisma.task.delete({ where: { id: taskId } });
    await ctx.reply(`🗑️ *Task ID ${taskId} berhasil dihapus dari sistem.*`, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply("❌ Gagal menghapus task. Pastikan ID tersebut benar.");
  }
});

// Fitur Penugasan Manual
bot.command("assign", async (ctx) => {
  try {
    const args = ctx.message.text.split(" ").slice(1);
    if (args.length < 2) return ctx.reply("⚠️ Format salah. Contoh: `/assign 1 Budi`", { parse_mode: "Markdown" });

    const taskId = parseInt(args[0], 10);
    const assigneeName = args.slice(1).join(" ").trim();
    if (isNaN(taskId)) return ctx.reply("❌ ID Task harus berupa angka.");

    let targetUser = await prisma.user.findFirst({ where: { name: { contains: assigneeName, mode: "insensitive" } } });
    if (!targetUser) return ctx.reply(`❌ Pengguna *${assigneeName}* tidak ditemukan.`, { parse_mode: "Markdown" });

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { assigneeId: targetUser.id },
      include: { reporter: true, assignee: true }
    });

    await ctx.reply(`✅ *Task Berhasil Ditugaskan!*\n\n📌 *${updatedTask.title}*\n👤 Penanggung Jawab: *${updatedTask.assignee?.name}*`, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply("❌ Terjadi kesalahan saat menugaskan task.");
  }
});

// Fitur Laporan Eksekutif
bot.command("review", async (ctx) => {
  try {
    await ctx.reply("📊 Menganalisis kondisi Kanban, beban kerja, dan SLA...");
    const tasks = await prisma.task.findMany({ include: { reporter: true, assignee: true }, orderBy: { createdAt: "desc" } });
    
    if (tasks.length === 0) return ctx.reply("📭 Belum ada task yang tercatat di database.");

    const today = new Date();
    const taskSummary = tasks.map((t, i) => {
      let dueStatus = "Tidak ada SLA";
      if (t.dueDate) {
        const isOverdue = t.status !== "DONE" && today > t.dueDate;
        dueStatus = isOverdue ? `⚠️ OVERDUE (${t.dueDate.toISOString().split('T')[0]})` : t.dueDate.toISOString().split('T')[0];
      }
      return `${i + 1}. [ID: ${t.id}] "${t.title}" | Status: ${t.status} | Assignee: ${t.assignee?.name || "None"} | Tenggat: ${dueStatus}`;
    }).join("\n");

    const prompt = `Anda adalah Product Manager (Lean System). Berikut task di Kanban:\n${taskSummary}\nBuatkan laporan ringkas: 1. Ringkasan Status 2. Identifikasi Bottleneck & Pelanggaran SLA (Overdue) 3. Rekomendasi Kaizen.`;

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1000,
      messages: [{ role: "user", content: prompt }]
    });

    const reportText = response.content[0].type === 'text' ? response.content[0].text : "Gagal memproses laporan.";
    await ctx.reply(`📋 *Laporan Eksekutif Harian*\n\n${reportText}`, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply("❌ Terjadi kesalahan saat menghasilkan laporan.");
  }
});

const renderTasks = async (ctx: any, tasks: any[], title: string = "") => {
  if (tasks.length === 0) return ctx.reply("📭 Belum ada task yang tercatat.");
  if (title) await ctx.reply(title, { parse_mode: "Markdown" });

  for (const task of tasks) {
    const dueText = task.dueDate ? `\n🎯 SLA: *${task.dueDate.toLocaleDateString("id-ID")}*` : "";
    const message = `🆔 ID: \`${task.id}\` | 📌 *${task.title}*\n⚡ Prioritas: \`${task.priority}\` | 🏷️ Status: \`${task.status}\`\n👤 Pelapor: ${task.reporter?.name || "Unknown"}\n👷 Assignee: *${task.assignee?.name || "Belum ada"}*${dueText}`;
    
    const keyboard = Markup.inlineKeyboard([[
      Markup.button.callback("🙋 Ambil", `assign.${task.id}`),
      Markup.button.callback("⏳ WIP", `st.${task.id}.WIP`),
      Markup.button.callback("✅ Done", `st.${task.id}.DONE`)
    ]]);
    await ctx.reply(message, { parse_mode: "Markdown", ...keyboard });
  }
};

bot.command("board", async (ctx) => {
  const deptName = ctx.message.text.split(" ").slice(1).join(" ").trim();
  if (!deptName) return ctx.reply("⚠️ Sebutkan nama departemen.");
  const tasks = await prisma.task.findMany({
    where: { status: { in: ["BACKLOG", "WIP"] }, reporter: { department: { contains: deptName, mode: "insensitive" } } },
    include: { reporter: true, assignee: true }, orderBy: { createdAt: "desc" }, take: 5
  });
  await renderTasks(ctx, tasks, `🏢 *Papan Kanban: ${deptName.toUpperCase()}*`);
});

bot.command("list", async (ctx) => {
  const tasks = await prisma.task.findMany({ include: { reporter: true, assignee: true }, orderBy: { createdAt: "desc" }, take: 5 });
  await renderTasks(ctx, tasks);
});

bot.action(/^assign\.(.+)$/, async (ctx) => {
  try {
    const taskId = parseInt(ctx.match[1], 10);
    const telegramId = BigInt(ctx.from.id);
    let user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) user = await prisma.user.create({ data: { telegramId, name: ctx.from.first_name || "Unknown", role: "MEMBER", department: "General" }});

    const updatedTask = await prisma.task.update({ where: { id: taskId }, data: { assigneeId: user.id }, include: { reporter: true, assignee: true } });
    const dueText = updatedTask.dueDate ? `\n🎯 SLA: *${updatedTask.dueDate.toLocaleDateString("id-ID")}*` : "";
    await ctx.answerCbQuery(`Berhasil mengambil task!`);
    await ctx.editMessageText(`🆔 ID: \`${updatedTask.id}\` | 📌 *${updatedTask.title}*\n⚡ Prioritas: \`${updatedTask.priority}\` | 🏷️ Status: \`${updatedTask.status}\`\n👤 Pelapor: ${updatedTask.reporter?.name}\n👷 Assignee: *${updatedTask.assignee?.name}* ✅${dueText}`, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.answerCbQuery("❌ Gagal mengambil task.");
  }
});

bot.action(/^st\.(.+)\.(WIP|DONE)$/, async (ctx) => {
  try {
    const taskId = parseInt(ctx.match[1], 10);
    const newStatus = ctx.match[2] as "WIP" | "DONE"; 
    
    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: { status: newStatus },
      include: { reporter: true, assignee: true }
    });

    let leadTimeText = updatedTask.dueDate ? `\n🎯 SLA: *${updatedTask.dueDate.toLocaleDateString("id-ID")}*` : "";
    if (newStatus === "DONE") {
      const ms = Date.now() - updatedTask.createdAt.getTime();
      const minutes = Math.floor(ms / 60000);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);
      
      const remHours = hours % 24;
      const remMinutes = minutes % 60;
      
      if (days > 0) leadTimeText += `\n⏱️ *Lead Time*: ${days} Hari ${remHours} Jam ${remMinutes} Menit`;
      else if (hours > 0) leadTimeText += `\n⏱️ *Lead Time*: ${hours} Jam ${remMinutes} Menit`;
      else leadTimeText += `\n⏱️ *Lead Time*: ${remMinutes} Menit`;
    }

    await ctx.answerCbQuery(`Status diubah ke ${newStatus}!`);
    await ctx.editMessageText(
      `🆔 ID: \`${updatedTask.id}\` | 📌 *${updatedTask.title}*\n⚡ Prioritas: \`${updatedTask.priority}\` | 🏷️ Status: \`${updatedTask.status}\` *(Diperbarui)*\n👤 Pelapor: ${updatedTask.reporter?.name || "Unknown"}\n👷 Assignee: *${updatedTask.assignee?.name || "Belum ada"}*` + leadTimeText, 
      { parse_mode: "Markdown" }
    );
  } catch (error) {
    await ctx.answerCbQuery("❌ Gagal memperbarui status.");
  }
});

bot.on("text", async (ctx) => {
  const text = ctx.message.text;
  if (text.startsWith("/")) return;

  try {
    const loadingMsg = await ctx.reply("⏳ Memproses task...");
    const parsedData = await parseTaskFromNaturalLanguage(text);

    const existingTask = await prisma.task.findFirst({
      where: { title: { equals: parsedData.title, mode: "insensitive" }, status: { in: ["BACKLOG", "WIP", "REVIEW"] } }
    });

    if (existingTask) {
      return ctx.telegram.editMessageText(ctx.chat.id, loadingMsg.message_id, undefined, `⚠️ *Pencegahan Duplikasi*\n\nTask identik sudah ada (ID: \`${existingTask.id}\`). Sistem menolak duplikasi.`, { parse_mode: "Markdown" });
    }

    const telegramId = BigInt(ctx.from.id);
    let user = await prisma.user.findUnique({ where: { telegramId } });
    if (!user) user = await prisma.user.create({ data: { telegramId, name: ctx.from.first_name || "Unknown", role: "MEMBER", department: parsedData.department || "General" } });

    const newTask = await prisma.task.create({
      data: { title: parsedData.title, priority: parsedData.priority || "MEDIUM", status: "BACKLOG", reporterId: user.id },
    });

    await ctx.telegram.editMessageText(ctx.chat.id, loadingMsg.message_id, undefined, `✅ *Task Berhasil Ditambahkan!*\n\n🆔 ID: \`${newTask.id}\`\n📌 *Judul*: ${newTask.title}\n⚡ *Prioritas*: ${newTask.priority}`, { parse_mode: "Markdown" });
  } catch (error) {
    await ctx.reply("❌ Maaf, terjadi kesalahan saat memproses task Anda.");
  }
});

bot.launch().then(() => {
  console.log("🤖 LeanManage Bot: Pesan Sistem & Salam Informatif Aktif...");
});

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
