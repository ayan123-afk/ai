// api/ai.js
import fetch from 'node-fetch'; // (Vercel supports ESM by default)

export default async function handler(req, res) {
  // Allow CORS for your frontend
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight (OPTIONS) handling
  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // Get prompt from query or body
  const prompt =
    req.method === "POST"
      ? req.body.prompt
      : req.query.prompt || "Hello world";

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    // ===== OPTION 1: Use your PHP backend as middle layer =====
    // const resp = await fetch(`https://zappymods.ct.ws/api/ai.php?prompt=${encodeURIComponent(prompt)}`);
    // const data = await resp.json();

    // ===== OPTION 2: Direct call to Cohere API (recommended if you own key) =====
    const COHERE_KEY = process.env.COHERE_API_KEY;
const resp = await fetch("https://api.cohere.ai/v1/generate", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${COHERE_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "command-r-plus",
    prompt: prompt,
    max_tokens: 100,
  }),
});
const data = await resp.json();
const text = data.generations?.[0]?.text?.trim() || "No response";
res.status(200).json({ ok: true, output: text });

  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
}
