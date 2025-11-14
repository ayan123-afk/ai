import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // ✅ Add CORS headers
    res.setHeader("Access-Control-Allow-Origin", "*"); // allow all origins
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

    // Handle preflight OPTIONS request
    if (req.method === "OPTIONS") {
      return res.status(200).end();
    }

    const prompt = req.query.prompt;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    const COHERE_API_KEY = process.env.COHERE_API_KEY;

    // Chat API request
    const response = await fetch("https://api.cohere.ai/v2/chat", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${COHERE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-a-03-2025",
        messages: [
          { role: "user", content: prompt }
        ],
        max_tokens: 150
      }),
    });

    const data = await response.json();

    // Sirf assistant ka text extract karo
    const aiText = data?.message?.content?.[0]?.text || "API Key Not Respoding";

    // ✅ Return JSON
    res.status(200).json({ result: aiText });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
