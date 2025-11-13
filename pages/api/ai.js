// pages/api/ai.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Get prompt safely
  let prompt = req.method === "POST" ? req.body.prompt : req.query.prompt;

  // ✅ Fallback to default if empty or whitespace
  if (!prompt || !prompt.trim()) {
    prompt = "Hello world";
  } else {
    prompt = prompt.trim();
  }

  try {
    const COHERE_KEY = process.env.COHERE_API_KEY;
    if (!COHERE_KEY) {
      return res
        .status(500)
        .json({ ok: false, output: "Cohere API key not set in environment" });
    }

    // Call Cohere Chat API
    const response = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus-08-2024",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    // ✅ Extract safe response
    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      JSON.stringify(data, null, 2);

    res.status(200).json({ ok: true, output: text });
  } catch (err) {
    console.error("Cohere API error:", err);
    res.status(500).json({ ok: false, output: err.message });
  }
}
