import fetch from "node-fetch";

export default async function handler(req, res) {
  try {
    // Get user input from query param
    const prompt = req.query.prompt;

    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // Your Cohere API key (never put this in frontend!)
    const COHERE_API_KEY = process.env.COHERE_API_KEY;

    // Make a request to Cohere API
    const response = await fetch("https://api.cohere.ai/v2/chat", {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${COHERE_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    model: "command-a-03-2025",      // ya jis model ka aap use kar rahe hain
    messages: [
      { role: "user", content: prompt }
    ],
    max_tokens: 100
  }),
});


    const data = await response.json();

    // Send the AI output back to the front-end
    res.status(200).json({ result: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
