/**
 * telegram-notify.js — send one message to the user via Telegram Bot API
 *
 * Usage: node scripts/telegram-notify.js "Message text"
 * Requires: TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in .env.local
 *
 * Loads .env.local from script dir's parent (tumbo-subframe root).
 */

const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env.local") });

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const text = process.argv[2] || "No message provided.";

if (!token || !chatId) {
  process.exit(0); // silent skip so pipelines don't fail
}

const url = `https://api.telegram.org/bot${token}/sendMessage`;

(async () => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, disable_web_page_preview: true }),
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) {
      console.error("Telegram notify failed:", res.status, await res.text());
    }
  } catch (err) {
    console.error("Telegram notify error:", err.message);
  }
})();
