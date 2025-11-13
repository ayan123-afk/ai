// api/ai.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  const prompt =
    req.method === "POST"
      ? req.body.prompt
      : req.query.prompt || "Hello world";

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // ✅ Your PHP backend call
    const phpUrl = `https://zappymods.ct.ws/api/ai.php?prompt=${encodeURIComponent(
      prompt
    )}`;

    const resp = await fetch(phpUrl);
    const data = await resp.json();

    // Adjust according to your PHP response
    const text = data.reply || data.output || JSON.stringify(data);

    res.status(200).json({ ok: true, output: text });
  } catch (err) {
    console.error("Proxy API error:", err);
    res.status(500).json({ error: err.message });
  }
}
